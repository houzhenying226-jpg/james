/**
 * 销售考核系统 - 验证引擎
 * 三层验证：硬规则 → 关联验证 → AI验证
 */

// ==================== 跨任务验证配置 ====================
const CROSS_VALIDATIONS = {
    // 价格链一致性验证：4.1投标价 → 6.1谈判价 → 7.1合同价
    priceChain: {
        id: 'price_chain',
        label: '价格链一致性',
        tasks: ['4.1', '6.1', '7.1'],
        validate: (projectId) => {
            const task41 = DataStorage.getTask(`${projectId}-4.1`);
            const task61 = DataStorage.getTask(`${projectId}-6.1`);
            const task71 = DataStorage.getTask(`${projectId}-7.1`);

            const results = { passed: true, checks: [] };

            // 获取各任务的价格数据
            const bidPrice = task41?.versions?.[0]?.fields?.bidPrice;
            const finalPrice = task61?.versions?.[0]?.fields?.finalPrice;
            const contractAmount = task71?.versions?.[0]?.fields?.contractAmount;

            // 检查4.1 → 6.1价格变化
            if (bidPrice && finalPrice) {
                const bid = parseFloat(bidPrice);
                const final = parseFloat(finalPrice);
                if (!isNaN(bid) && !isNaN(final) && bid > 0) {
                    const reduction = ((bid - final) / bid * 100).toFixed(1);
                    if (final > bid) {
                        results.checks.push({
                            id: 'bid_to_final',
                            passed: false,
                            message: `谈判价${final}万高于投标价${bid}万，异常`,
                            severity: 'error'
                        });
                        results.passed = false;
                    } else if (final < bid * 0.7) {
                        results.checks.push({
                            id: 'bid_to_final',
                            passed: false,
                            message: `降价幅度${reduction}%超过30%，需说明原因`,
                            severity: 'warning'
                        });
                    } else {
                        results.checks.push({
                            id: 'bid_to_final',
                            passed: true,
                            message: `投标价→谈判价：降${reduction}%`,
                            severity: 'info'
                        });
                    }
                }
            }

            // 检查6.1 → 7.1价格一致性
            if (finalPrice && contractAmount) {
                const final = parseFloat(finalPrice);
                const contract = parseFloat(contractAmount);
                if (!isNaN(final) && !isNaN(contract) && final > 0) {
                    const diff = Math.abs(contract - final) / final * 100;
                    if (diff > 5) {
                        results.checks.push({
                            id: 'final_to_contract',
                            passed: false,
                            message: `合同金额${contract}万与谈判价${final}万差异${diff.toFixed(1)}%（超过5%）`,
                            severity: 'warning'
                        });
                    } else {
                        results.checks.push({
                            id: 'final_to_contract',
                            passed: true,
                            message: `谈判价→合同价：一致（差异${diff.toFixed(1)}%）`,
                            severity: 'info'
                        });
                    }
                }
            }

            return results;
        }
    },

    // 需求链一致性验证：2.1需求 → 2.2方案 → 3.1深化
    requirementChain: {
        id: 'requirement_chain',
        label: '需求响应链',
        tasks: ['2.1', '2.2', '3.1'],
        validate: (projectId) => {
            const task21 = DataStorage.getTask(`${projectId}-2.1`);
            const task22 = DataStorage.getTask(`${projectId}-2.2`);
            const task31 = DataStorage.getTask(`${projectId}-3.1`);

            const results = { passed: true, checks: [] };

            // 获取需求数量
            const requirements = task21?.versions?.[0]?.fields?.requirementList ||
                task21?.versions?.[0]?.fields?.keyRequirements || '';
            const reqItems = requirements.split(/[,，;；\n、]+/).filter(i => i.trim()).length;

            // 获取方案是否响应需求
            const solutionFile = task22?.versions?.[0]?.fields?.solutionFile;
            const technicalPlan = task22?.versions?.[0]?.fields?.technicalPlan || '';

            if (reqItems > 0 && solutionFile) {
                results.checks.push({
                    id: 'req_to_solution',
                    passed: true,
                    message: `${reqItems}项需求已有对应方案`,
                    severity: 'info'
                });
            } else if (reqItems > 0 && !solutionFile) {
                results.checks.push({
                    id: 'req_to_solution',
                    passed: false,
                    message: `${reqItems}项需求待响应（方案未上传）`,
                    severity: 'warning'
                });
            }

            // 获取深化修改数量
            const modifications = task31?.versions?.[0]?.fields?.modifyList ||
                task31?.versions?.[0]?.fields?.changesDescription || '';
            const modItems = modifications.split(/[,，;；\n、]+/).filter(i => i.trim()).length;

            // 对比2.3的问题数和3.1的修改数
            const task23 = DataStorage.getTask(`${projectId}-2.3`);
            const feedbackList = task23?.versions?.[0]?.fields?.feedbackList ||
                task23?.versions?.[0]?.fields?.feedbackSummary || '';
            const feedbackItems = feedbackList.split(/[,，;；\n、]+/).filter(i => i.trim()).length;

            if (feedbackItems > 0 && modItems > 0) {
                if (modItems < feedbackItems) {
                    results.checks.push({
                        id: 'feedback_to_modify',
                        passed: false,
                        message: `收集${feedbackItems}个问题，仅修改${modItems}处，可能有遗漏`,
                        severity: 'warning'
                    });
                } else {
                    results.checks.push({
                        id: 'feedback_to_modify',
                        passed: true,
                        message: `${feedbackItems}个问题→${modItems}处修改，响应充分`,
                        severity: 'info'
                    });
                }
            }

            return results;
        }
    },

    // 决策链覆盖验证：1.2决策链 → 2.3/4.2/6.1参会人
    decisionChainCoverage: {
        id: 'decision_chain_coverage',
        label: '决策链覆盖',
        tasks: ['1.2', '2.3', '4.2', '6.1'],
        validate: (projectId) => {
            const task12 = DataStorage.getTask(`${projectId}-1.2`);
            const keyPersonList = task12?.versions?.[0]?.fields?.keyPersonList || '';

            const results = { passed: true, checks: [] };

            if (!keyPersonList) {
                results.checks.push({
                    id: 'no_decision_chain',
                    passed: false,
                    message: '决策链未定义，无法验证覆盖情况',
                    severity: 'warning'
                });
                return results;
            }

            // 提取决策链中的姓名
            const keyPersons = keyPersonList.split(/[,，;；\n、]+/).filter(i => i.trim());

            // 检查各任务的参会人
            const checkTasks = [
                { code: '2.3', label: '方案讲解', field: 'attendees' },
                { code: '4.2', label: '技术交流', field: 'customerAttendees' },
                { code: '6.1', label: '商务谈判', field: 'customerAttendees' }
            ];

            for (const checkTask of checkTasks) {
                const task = DataStorage.getTask(`${projectId}-${checkTask.code}`);
                const attendees = task?.versions?.[0]?.fields?.[checkTask.field] || '';

                if (attendees) {
                    // 简单检查是否有决策链中的人
                    const hasKeyPerson = keyPersons.some(person => {
                        // 提取姓名部分（去除职位）
                        const namePart = person.split(/[-（(]/)[0].trim();
                        return attendees.includes(namePart) ||
                            attendees.includes(person);
                    });

                    results.checks.push({
                        id: `decision_${checkTask.code}`,
                        passed: hasKeyPerson,
                        message: hasKeyPerson
                            ? `${checkTask.label}有决策链关键人参与`
                            : `${checkTask.label}参会人不在决策链中，建议核实`,
                        severity: hasKeyPerson ? 'info' : 'warning'
                    });
                }
            }

            return results;
        }
    }
};

const ValidationEngine = {
    /**
     * 执行完整验证
     * @param {string} taskCode - 任务编号
     * @param {object} fields - 当前表单数据
     * @param {object} options - 验证选项 { enableAI: boolean, projectId: string }
     * @returns {Promise<ValidationResult>}
     */
    async validate(taskCode, fields, options = {}) {
        const result = {
            taskCode,
            timestamp: new Date().toISOString(),
            hardRules: { passed: true, checks: [] },
            crossRef: { passed: true, checks: [] },
            aiValidation: { enabled: false, passed: true, checks: [] },
            overall: { passed: true, score: 100, recommendation: 'pass' }
        };

        // 第一层：硬规则验证
        result.hardRules = this.validateHardRules(taskCode, fields);

        // 第二层：关联验证
        if (options.projectId) {
            result.crossRef = this.validateCrossReference(taskCode, fields, options.projectId);
        }

        // 第三层：AI验证（可选）
        if (options.enableAI && this.isAIEnabled()) {
            result.aiValidation.enabled = true;
            try {
                result.aiValidation = await this.validateWithAI(taskCode, fields, options.projectId);
            } catch (error) {
                result.aiValidation.error = error.message;
                result.aiValidation.passed = true; // AI失败不阻塞
            }
        }

        // 计算总体结果
        result.overall = this.calculateOverall(result);

        return result;
    },

    /**
     * 第一层：硬规则验证
     */
    validateHardRules(taskCode, fields) {
        const rules = TASK_RULES[taskCode]?.hardRules || [];
        const checks = [];
        let allPassed = true;

        rules.forEach(rule => {
            const passed = rule.validate(fields);
            // 支持两种消息格式：getMessage函数 或 passMessage/failMessage静态字符串
            let message;
            if (typeof rule.getMessage === 'function') {
                message = rule.getMessage(fields, passed);
            } else {
                message = passed ? rule.passMessage : rule.failMessage;
            }
            checks.push({
                id: rule.id,
                label: rule.label,
                passed,
                message: message || (passed ? '✓ 验证通过' : '✗ 验证未通过'),
                severity: rule.severity || 'error' // error | warning
            });
            if (!passed && rule.severity !== 'warning') {
                allPassed = false;
            }
        });

        return { passed: allPassed, checks };
    },

    /**
     * 第二层：关联验证
     */
    validateCrossReference(taskCode, fields, projectId) {
        const crossRefs = TASK_RULES[taskCode]?.crossRefs || [];
        const checks = [];
        let allPassed = true;

        crossRefs.forEach(ref => {
            // 获取关联任务的数据
            const refTaskId = `${projectId}-${ref.refTaskCode}`;
            const refTask = DataStorage.getTask(refTaskId);

            // 关联任务未完成
            if (!refTask || refTask.versions.length === 0) {
                checks.push({
                    id: ref.id,
                    label: ref.label,
                    passed: null, // null表示待验证状态
                    message: ref.pendingMessage || `⚠️ 关联任务 ${ref.refTaskCode} 未完成，暂无法验证`,
                    refTaskCode: ref.refTaskCode,
                    severity: 'info',
                    pending: true
                });
                return;
            }

            // 获取最佳版本的数据
            const bestVersion = refTask.versions.find(v => v.versionId === refTask.bestVersionId);
            const refFields = bestVersion?.fields || {};

            // 执行关联验证
            const validationResult = ref.validate(fields, refFields);

            // 处理三种返回值：true(通过), false(失败), null(待验证)
            if (validationResult === null) {
                checks.push({
                    id: ref.id,
                    label: ref.label,
                    passed: null,
                    message: ref.pendingMessage || `⚠️ 关联数据不完整，暂无法验证`,
                    refTaskCode: ref.refTaskCode,
                    severity: 'info',
                    pending: true
                });
            } else {
                checks.push({
                    id: ref.id,
                    label: ref.label,
                    passed: validationResult,
                    message: validationResult ? ref.passMessage : ref.failMessage,
                    refTaskCode: ref.refTaskCode,
                    severity: ref.severity || 'warning'
                });

                if (!validationResult && ref.severity === 'error') {
                    allPassed = false;
                }
            }
        });

        return { passed: allPassed, checks };
    },

    /**
     * 第三层：AI验证（使用新版AI_PROMPTS）
     * @param {string} taskCode - 任务编号
     * @param {object} fields - 当前任务数据
     * @param {string} projectId - 项目ID（用于获取关联任务数据）
     */
    async validateWithAI(taskCode, fields, projectId) {
        console.log('=== AI验证开始 ===', { taskCode, projectId });

        // 优先使用新版AI_PROMPTS
        if (typeof AIValidator !== 'undefined' && AIValidator.hasTaskConfig(taskCode)) {
            console.log(`任务${taskCode}使用新版AI验证`);

            // 收集关联任务数据
            const relatedTasksData = {};
            if (projectId) {
                // 根据任务获取需要的关联数据
                const relatedTaskCodes = this.getRelatedTaskCodes(taskCode);
                console.log(`任务${taskCode}的关联任务:`, relatedTaskCodes);

                for (const refCode of relatedTaskCodes) {
                    const refTaskId = `${projectId}-${refCode}`;
                    const refTask = DataStorage.getTask(refTaskId);
                    if (refTask && refTask.versions.length > 0) {
                        const bestVersion = refTask.versions.find(v => v.versionId === refTask.bestVersionId);
                        relatedTasksData[refCode] = bestVersion?.fields || {};
                    }
                }
                console.log('收集到的关联数据:', Object.keys(relatedTasksData));
            }

            try {
                const result = await AIValidator.validateTask(taskCode, fields, relatedTasksData);
                console.log('AI验证结果:', result);

                if (result.error) {
                    return {
                        enabled: true,
                        passed: true,
                        checks: [{
                            id: 'ai_error',
                            label: 'AI验证',
                            passed: true,
                            message: result.message,
                            severity: 'info'
                        }]
                    };
                }

                return {
                    enabled: true,
                    passed: result.passed,
                    needReview: result.needReview,
                    checks: result.checks || [],
                    suggestion: result.suggestion,
                    confidence: result.confidence
                };
            } catch (error) {
                console.error('AI验证异常:', error);
                return {
                    enabled: true,
                    passed: true,
                    checks: [{
                        id: 'ai_error',
                        label: 'AI验证',
                        passed: true,
                        message: `AI验证跳过: ${error.message}`,
                        severity: 'info'
                    }]
                };
            }
        }

        // 回退：使用旧版aiRules（向后兼容）
        const aiRules = TASK_RULES[taskCode]?.aiRules || [];
        if (aiRules.length === 0) {
            console.log(`任务${taskCode}无AI验证配置`);
            return { enabled: true, passed: true, checks: [] };
        }

        console.log(`任务${taskCode}使用旧版AI验证规则`);
        const checks = [];
        let allPassed = true;

        for (const rule of aiRules) {
            try {
                const result = await AIValidator.validate(rule.prompt, fields, rule.targetFields);
                checks.push({
                    id: rule.id,
                    label: rule.label,
                    passed: result.passed,
                    message: result.message,
                    confidence: result.confidence,
                    suggestions: result.suggestions || [],
                    severity: 'info'
                });
            } catch (error) {
                checks.push({
                    id: rule.id,
                    label: rule.label,
                    passed: true,
                    message: `AI验证跳过: ${error.message}`,
                    severity: 'info'
                });
            }
        }

        return { enabled: true, passed: allPassed, checks };
    },

    /**
     * 获取任务的关联任务列表（用于AI验证）
     */
    getRelatedTaskCodes(taskCode) {
        const relatedMap = {
            '1.2': ['1.1'],
            '1.3': [],
            '1.4': [],
            '2.1': ['1.1'],
            '2.2': ['2.1'],
            '2.3': ['1.2'],
            '3.1': ['2.3'],
            '3.2': ['2.2'],
            '3.3': [],
            '4.1': ['1.4', '2.2'],
            '4.2': ['1.2'],
            '4.3': ['1.1', '4.1'],
            '5.1': ['1.3'],
            '6.1': ['4.1', '4.3'],
            '7.1': ['6.1']
        };
        return relatedMap[taskCode] || [];
    },

    /**
     * 计算总体结果
     */
    calculateOverall(result) {
        const hardPassed = result.hardRules.passed;
        const crossPassed = result.crossRef.passed;

        // 计算得分
        let score = 100;

        // 硬规则失败扣分
        const hardFails = result.hardRules.checks.filter(c => !c.passed && c.severity === 'error');
        score -= hardFails.length * 20;

        // 硬规则警告扣分
        const hardWarnings = result.hardRules.checks.filter(c => !c.passed && c.severity === 'warning');
        score -= hardWarnings.length * 5;

        // 关联验证失败扣分
        const crossFails = result.crossRef.checks.filter(c => !c.passed);
        score -= crossFails.length * 10;

        score = Math.max(0, Math.min(100, score));

        // 确定推荐
        let recommendation = 'pass';
        if (!hardPassed) {
            recommendation = 'fail';
        } else if (!crossPassed || score < 80) {
            recommendation = 'review';
        }

        return {
            passed: hardPassed,
            score,
            recommendation,
            summary: this.generateSummary(result)
        };
    },

    /**
     * 生成验证摘要
     */
    generateSummary(result) {
        const parts = [];

        const hardErrors = result.hardRules.checks.filter(c => !c.passed && c.severity === 'error');
        const hardWarnings = result.hardRules.checks.filter(c => !c.passed && c.severity === 'warning');
        const crossWarnings = result.crossRef.checks.filter(c => !c.passed);

        if (hardErrors.length > 0) {
            parts.push(`${hardErrors.length}项必填未通过`);
        }
        if (hardWarnings.length > 0) {
            parts.push(`${hardWarnings.length}项建议改进`);
        }
        if (crossWarnings.length > 0) {
            parts.push(`${crossWarnings.length}项关联待核实`);
        }

        if (parts.length === 0) {
            return '所有验证项已通过';
        }
        return parts.join('，');
    },

    /**
     * 检查AI是否可用
     */
    isAIEnabled() {
        const apiKey = localStorage.getItem('gemini_api_key');
        return !!apiKey && apiKey.length > 10;
    },

    /**
     * 渲染验证结果HTML
     */
    renderResult(result) {
        let html = '<div class="validation-result">';

        // 硬规则部分
        if (result.hardRules.checks.length > 0) {
            html += `
                <div class="validation-section">
                    <h4>📋 基础验证</h4>
                    <ul class="validation-list">
            `;
            result.hardRules.checks.forEach(check => {
                const cls = check.passed ? 'pass' : (check.severity === 'warning' ? 'warning' : 'fail');
                const icon = check.passed ? '✅' : (check.severity === 'warning' ? '⚠️' : '❌');
                html += `<li class="${cls}">${icon} ${check.label}: ${check.message}</li>`;
            });
            html += '</ul></div>';
        }

        // 关联验证部分
        if (result.crossRef.checks.length > 0) {
            html += `
                <div class="validation-section">
                    <h4>🔗 关联验证</h4>
                    <ul class="validation-list">
            `;
            result.crossRef.checks.forEach(check => {
                const cls = check.passed ? 'pass' : 'warning';
                const icon = check.passed ? '✅' : '⚠️';
                html += `<li class="${cls}">${icon} ${check.label}: ${check.message}</li>`;
            });
            html += '</ul></div>';
        }

        // AI验证部分
        if (result.aiValidation.enabled && result.aiValidation.checks.length > 0) {
            html += `
                <div class="validation-section">
                    <h4>🤖 AI智能验证</h4>
                    <ul class="validation-list">
            `;
            result.aiValidation.checks.forEach(check => {
                const cls = check.passed ? 'pass' : 'warning';
                const icon = check.passed ? '✅' : '💡';
                html += `<li class="${cls}">${icon} ${check.label}: ${check.message}</li>`;
                if (check.suggestions && check.suggestions.length > 0) {
                    html += `<li class="warning">💡 建议: ${check.suggestions.join('; ')}</li>`;
                }
            });
            html += '</ul></div>';
        }

        // 汇总部分
        const recClass = result.overall.recommendation;
        const recText = {
            'pass': '✅ 验证通过',
            'review': '⚠️ 建议复核',
            'fail': '❌ 需要修正'
        }[recClass];

        html += `
            <div class="validation-summary">
                <div class="summary-content">
                    <span class="recommendation ${recClass}">${recText}</span>
                    <span class="score">得分: ${result.overall.score}</span>
                </div>
                <p>${result.overall.summary}</p>
            </div>
        `;

        html += '</div>';
        return html;
    },

    /**
     * 执行跨任务验证
     * @param {string} projectId - 项目ID
     * @param {string} validationType - 验证类型 (priceChain, requirementChain, decisionChainCoverage, 或 'all')
     * @returns {Object} 验证结果
     */
    runCrossValidation(projectId, validationType = 'all') {
        const results = {
            projectId,
            timestamp: new Date().toISOString(),
            validations: []
        };

        if (validationType === 'all') {
            // 执行所有跨任务验证
            for (const [key, config] of Object.entries(CROSS_VALIDATIONS)) {
                try {
                    const validationResult = config.validate(projectId);
                    results.validations.push({
                        id: config.id,
                        label: config.label,
                        tasks: config.tasks,
                        ...validationResult
                    });
                } catch (error) {
                    results.validations.push({
                        id: config.id,
                        label: config.label,
                        tasks: config.tasks,
                        passed: true,
                        checks: [{
                            id: 'error',
                            passed: true,
                            message: `验证跳过: ${error.message}`,
                            severity: 'info'
                        }]
                    });
                }
            }
        } else if (CROSS_VALIDATIONS[validationType]) {
            // 执行指定的跨任务验证
            const config = CROSS_VALIDATIONS[validationType];
            try {
                const validationResult = config.validate(projectId);
                results.validations.push({
                    id: config.id,
                    label: config.label,
                    tasks: config.tasks,
                    ...validationResult
                });
            } catch (error) {
                results.validations.push({
                    id: config.id,
                    label: config.label,
                    tasks: config.tasks,
                    passed: true,
                    checks: [{
                        id: 'error',
                        passed: true,
                        message: `验证跳过: ${error.message}`,
                        severity: 'info'
                    }]
                });
            }
        }

        // 计算总体结果
        results.overall = {
            passed: results.validations.every(v => v.passed),
            totalChecks: results.validations.reduce((sum, v) => sum + v.checks.length, 0),
            passedChecks: results.validations.reduce((sum, v) =>
                sum + v.checks.filter(c => c.passed).length, 0
            ),
            warnings: results.validations.reduce((sum, v) =>
                sum + v.checks.filter(c => !c.passed && c.severity === 'warning').length, 0
            ),
            errors: results.validations.reduce((sum, v) =>
                sum + v.checks.filter(c => !c.passed && c.severity === 'error').length, 0
            )
        };

        return results;
    },

    /**
     * 渲染跨任务验证结果HTML
     */
    renderCrossValidationResult(result) {
        let html = '<div class="cross-validation-result">';
        html += '<h3>🔗 跨任务一致性验证</h3>';

        for (const validation of result.validations) {
            const statusIcon = validation.passed ? '✅' : '⚠️';
            html += `
                <div class="cross-validation-section">
                    <h4>${statusIcon} ${validation.label}</h4>
                    <p class="task-chain">涉及任务：${validation.tasks.join(' → ')}</p>
                    <ul class="validation-list">
            `;

            for (const check of validation.checks) {
                const icon = check.passed ? '✅' : (check.severity === 'error' ? '❌' : '⚠️');
                const cls = check.passed ? 'pass' : (check.severity === 'error' ? 'fail' : 'warning');
                html += `<li class="${cls}">${icon} ${check.message}</li>`;
            }

            html += '</ul></div>';
        }

        // 总结
        const { overall } = result;
        const statusText = overall.errors > 0 ? '发现问题' :
            (overall.warnings > 0 ? '有待改进' : '一致性良好');
        const statusClass = overall.errors > 0 ? 'fail' :
            (overall.warnings > 0 ? 'warning' : 'pass');

        html += `
            <div class="cross-validation-summary ${statusClass}">
                <span class="summary-status">${statusText}</span>
                <span class="summary-detail">
                    共${overall.totalChecks}项检查，
                    ${overall.passedChecks}项通过，
                    ${overall.warnings}项警告，
                    ${overall.errors}项错误
                </span>
            </div>
        `;

        html += '</div>';
        return html;
    },

    /**
     * 获取项目的跨任务验证摘要
     */
    getCrossValidationSummary(projectId) {
        const result = this.runCrossValidation(projectId, 'all');
        return {
            passed: result.overall.passed,
            passedCount: result.overall.passedChecks,
            totalCount: result.overall.totalChecks,
            warnings: result.overall.warnings,
            errors: result.overall.errors,
            details: result.validations.map(v => ({
                label: v.label,
                passed: v.passed,
                checkCount: v.checks.length
            }))
        };
    }
};

// 导出
window.ValidationEngine = ValidationEngine;
window.CROSS_VALIDATIONS = CROSS_VALIDATIONS;
