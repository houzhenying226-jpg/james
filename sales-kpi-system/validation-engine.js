/**
 * 销售考核系统 - 验证引擎
 * 三层验证：硬规则 → 关联验证 → AI验证
 */

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
                result.aiValidation = await this.validateWithAI(taskCode, fields);
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
            checks.push({
                id: rule.id,
                label: rule.label,
                passed,
                message: passed ? rule.passMessage : rule.failMessage,
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

            if (!refTask || refTask.versions.length === 0) {
                checks.push({
                    id: ref.id,
                    label: ref.label,
                    passed: false,
                    message: `前置任务 ${ref.refTaskCode} 尚未完成`,
                    severity: 'warning'
                });
                return;
            }

            // 获取最佳版本的数据
            const bestVersion = refTask.versions.find(v => v.versionId === refTask.bestVersionId);
            const refFields = bestVersion?.fields || {};

            // 执行关联验证
            const passed = ref.validate(fields, refFields);
            checks.push({
                id: ref.id,
                label: ref.label,
                passed,
                message: passed ? ref.passMessage : ref.failMessage,
                refTaskCode: ref.refTaskCode,
                severity: ref.severity || 'warning'
            });

            if (!passed && ref.severity === 'error') {
                allPassed = false;
            }
        });

        return { passed: allPassed, checks };
    },

    /**
     * 第三层：AI验证
     */
    async validateWithAI(taskCode, fields) {
        const aiRules = TASK_RULES[taskCode]?.aiRules || [];
        if (aiRules.length === 0) {
            return { enabled: true, passed: true, checks: [] };
        }

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
    }
};

// 导出
window.ValidationEngine = ValidationEngine;
