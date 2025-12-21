/**
 * 销售考核系统 - 版本演变验证器
 * 验证同一任务不同版本之间的数据变化是否合理
 *
 * 验证目标：
 * 1. 勾选项变化（是→否警告，反复变化异常）
 * 2. 金额变化（>20%警告，>50%异常）
 * 3. 人物变化（消失警告，核心人物变更警告）
 * 4. 振荡检测（A→B→A模式检测）
 */

// ==================== 变化规则配置 ====================

const CHECKBOX_CHANGE_RULES = {
    '否→是': {
        level: 'normal',
        message: '情况改善'
    },
    '是→否': {
        level: 'warning',
        message: '情况恶化，请说明原因',
        requireExplanation: true
    }
};

const AMOUNT_CHANGE_THRESHOLDS = {
    normal: 0.10,    // ±10%以内正常
    warning: 0.20,   // ±20%需警告
    error: 0.50      // ±50%异常
};

const PERSON_CHANGE_RULES = {
    '新增人物': {
        level: 'normal',
        message: '新增关键人，深入接触'
    },
    '人物消失': {
        level: 'warning',
        message: '关键人不再出现，请说明原因（离职/换人/其他）',
        requireExplanation: true
    },
    '核心人物变化': {
        level: 'warning',
        message: '核心决策人变更，请详细说明',
        requireExplanation: true
    }
};

// ==================== 字段类型识别配置 ====================

const FIELD_TYPE_PATTERNS = {
    checkbox: [
        '确认', 'confirmed', 'checkbox', '是否', '有无',
        'm_confirmed', 'a_confirmed', 'n_confirmed',
        'internalReview', 'approved'
    ],
    amount: [
        '金额', '预算', '价格', '报价', '费用', '成本',
        'amount', 'price', 'budget', 'cost', 'bidPrice',
        'finalPrice', 'contractAmount', 'a_budget_amount'
    ],
    person: [
        '人', '姓名', '决策', '联系', '负责', '经办',
        'person', 'name', 'contact', 'decision', 'attendees',
        'keyPersonList', 'signatoryCustomer', 'n_decision_maker'
    ],
    date: [
        '日期', '时间', 'date', 'time', 'Date'
    ]
};

// ==================== 版本验证器 ====================

const VersionValidator = {

    /**
     * 验证版本演变
     * @param {string} taskCode - 任务编号
     * @param {Array} versions - 版本数组 [{version, date, fields}, ...]
     * @returns {Object} 验证结果
     */
    validateVersionChanges(taskCode, versions) {
        console.log('=== 版本演变验证开始 ===', { taskCode, versionCount: versions.length });

        if (!versions || versions.length < 2) {
            return {
                hasChanges: false,
                message: '仅有一个版本，无需比对',
                versionCount: versions?.length || 0
            };
        }

        const results = [];

        // 按版本号排序（V1.0, V1.1, V2.0...）
        const sortedVersions = [...versions].sort((a, b) => {
            const vA = parseFloat((a.version || a.versionId || '0').replace(/[^0-9.]/g, '')) || 0;
            const vB = parseFloat((b.version || b.versionId || '0').replace(/[^0-9.]/g, '')) || 0;
            return vA - vB;
        });

        console.log('排序后版本:', sortedVersions.map(v => v.version || v.versionId));

        // 逐版本比对
        for (let i = 1; i < sortedVersions.length; i++) {
            const prevVersion = sortedVersions[i - 1];
            const currVersion = sortedVersions[i];

            const changes = this.compareVersions(prevVersion, currVersion);
            results.push({
                from: prevVersion.version || prevVersion.versionId,
                to: currVersion.version || currVersion.versionId,
                fromDate: prevVersion.date || prevVersion.createTime,
                toDate: currVersion.date || currVersion.createTime,
                changes
            });
        }

        // 检测反复变化模式
        const oscillations = this.detectOscillations(sortedVersions);

        // 生成总结
        const summary = this.generateSummary(results, oscillations);

        return {
            hasChanges: true,
            versionCount: versions.length,
            comparisons: results,
            oscillations,
            summary
        };
    },

    /**
     * 比对两个版本
     */
    compareVersions(prevVersion, currVersion) {
        const changes = [];
        const prevData = prevVersion.fields || prevVersion.data || {};
        const currData = currVersion.fields || currVersion.data || {};

        // 获取所有字段
        const allFields = new Set([...Object.keys(prevData), ...Object.keys(currData)]);

        allFields.forEach(field => {
            // 跳过系统字段
            if (field.startsWith('_') || field === 'version' || field === 'versionId') {
                return;
            }

            const prevValue = prevData[field];
            const currValue = currData[field];

            // 值相同则跳过
            if (this.valuesEqual(prevValue, currValue)) {
                return;
            }

            const change = this.analyzeChange(field, prevValue, currValue);
            if (change) {
                changes.push(change);
            }
        });

        return changes;
    },

    /**
     * 判断两个值是否相等
     */
    valuesEqual(a, b) {
        if (a === b) return true;
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;

        // 字符串比较（忽略首尾空白）
        if (typeof a === 'string' && typeof b === 'string') {
            return a.trim() === b.trim();
        }

        // 数字比较
        if (typeof a === 'number' && typeof b === 'number') {
            return Math.abs(a - b) < 0.001;
        }

        return JSON.stringify(a) === JSON.stringify(b);
    },

    /**
     * 分析单个字段变化
     */
    analyzeChange(field, prevValue, currValue) {
        const fieldType = this.getFieldType(field);

        switch (fieldType) {
            case 'checkbox':
                return this.analyzeCheckboxChange(field, prevValue, currValue);
            case 'amount':
                return this.analyzeAmountChange(field, prevValue, currValue);
            case 'person':
                return this.analyzePersonChange(field, prevValue, currValue);
            case 'date':
                return this.analyzeDateChange(field, prevValue, currValue);
            default:
                return this.analyzeTextChange(field, prevValue, currValue);
        }
    },

    /**
     * 获取字段类型
     */
    getFieldType(field) {
        const lowerField = field.toLowerCase();

        for (const [type, patterns] of Object.entries(FIELD_TYPE_PATTERNS)) {
            if (patterns.some(p => lowerField.includes(p.toLowerCase()))) {
                return type;
            }
        }

        return 'text';
    },

    /**
     * 勾选项变化分析
     */
    analyzeCheckboxChange(field, prevValue, currValue) {
        const prev = this.normalizeCheckbox(prevValue);
        const curr = this.normalizeCheckbox(currValue);

        if (prev === curr) return null;

        const changeKey = `${prev}→${curr}`;
        const rule = CHECKBOX_CHANGE_RULES[changeKey];

        if (rule) {
            return {
                field,
                type: 'checkbox',
                change: changeKey,
                prevValue: prev,
                currValue: curr,
                level: rule.level,
                message: `${this.getFieldLabel(field)}：从"${prev}"变为"${curr}"，${rule.message}`,
                requireExplanation: rule.requireExplanation || false
            };
        }

        return {
            field,
            type: 'checkbox',
            change: changeKey,
            prevValue: prev,
            currValue: curr,
            level: 'info',
            message: `${this.getFieldLabel(field)}：${prev} → ${curr}`
        };
    },

    /**
     * 金额变化分析
     */
    analyzeAmountChange(field, prevValue, currValue) {
        const prev = parseFloat(prevValue) || 0;
        const curr = parseFloat(currValue) || 0;

        if (prev === 0 && curr === 0) return null;

        // 新增金额
        if (prev === 0 && curr > 0) {
            return {
                field,
                type: 'amount',
                change: `0→${curr}`,
                prevValue: prev,
                currValue: curr,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：新增金额${curr}万`
            };
        }

        // 清除金额
        if (prev > 0 && curr === 0) {
            return {
                field,
                type: 'amount',
                change: `${prev}→0`,
                prevValue: prev,
                currValue: curr,
                level: 'warning',
                message: `⚠️ ${this.getFieldLabel(field)}：金额被清除（${prev}万→0），请说明原因`,
                requireExplanation: true
            };
        }

        const changeRate = (curr - prev) / prev;
        const changePercent = (changeRate * 100).toFixed(1);
        const direction = changeRate > 0 ? '上涨' : '下降';

        if (Math.abs(changeRate) <= AMOUNT_CHANGE_THRESHOLDS.normal) {
            return {
                field,
                type: 'amount',
                change: `${prev}→${curr}`,
                prevValue: prev,
                currValue: curr,
                changeRate,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：${prev}万→${curr}万（${direction}${Math.abs(changePercent)}%），正常波动`
            };
        }

        if (Math.abs(changeRate) <= AMOUNT_CHANGE_THRESHOLDS.warning) {
            return {
                field,
                type: 'amount',
                change: `${prev}→${curr}`,
                prevValue: prev,
                currValue: curr,
                changeRate,
                level: 'warning',
                message: `⚠️ ${this.getFieldLabel(field)}：${prev}万→${curr}万（${direction}${Math.abs(changePercent)}%），请说明变化原因`,
                requireExplanation: true
            };
        }

        return {
            field,
            type: 'amount',
            change: `${prev}→${curr}`,
            prevValue: prev,
            currValue: curr,
            changeRate,
            level: 'error',
            message: `❌ ${this.getFieldLabel(field)}：${prev}万→${curr}万（${direction}${Math.abs(changePercent)}%），异常波动，请核实`,
            requireExplanation: true
        };
    },

    /**
     * 人物变化分析
     */
    analyzePersonChange(field, prevValue, currValue) {
        const prevStr = String(prevValue || '');
        const currStr = String(currValue || '');

        // 提取人名（中文2-3字）
        const prevNames = prevStr.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
        const currNames = currStr.match(/[\u4e00-\u9fa5]{2,3}/g) || [];

        // 新增人物
        const addedNames = currNames.filter(n => !prevNames.includes(n));
        // 消失人物
        const removedNames = prevNames.filter(n => !currNames.includes(n));

        const changes = [];

        if (addedNames.length > 0) {
            changes.push({
                field,
                type: 'person',
                change: 'added',
                names: addedNames,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：新增人员（${addedNames.join('、')}）`
            });
        }

        if (removedNames.length > 0) {
            changes.push({
                field,
                type: 'person',
                change: 'removed',
                names: removedNames,
                level: 'warning',
                message: `⚠️ ${this.getFieldLabel(field)}：人员不再出现（${removedNames.join('、')}），请说明原因`,
                requireExplanation: true
            });
        }

        // 如果有变化，合并返回
        if (changes.length > 0) {
            return {
                field,
                type: 'person',
                change: `${prevNames.join('、')}→${currNames.join('、')}`,
                prevValue: prevNames,
                currValue: currNames,
                addedNames,
                removedNames,
                level: removedNames.length > 0 ? 'warning' : 'normal',
                message: changes.map(c => c.message).join('；'),
                requireExplanation: removedNames.length > 0
            };
        }

        // 无人名变化，按文本处理
        if (prevStr !== currStr) {
            return {
                field,
                type: 'person',
                change: 'text_change',
                prevValue: prevStr,
                currValue: currStr,
                level: 'info',
                message: `${this.getFieldLabel(field)}：内容有修改`
            };
        }

        return null;
    },

    /**
     * 日期变化分析
     */
    analyzeDateChange(field, prevValue, currValue) {
        const prevDate = prevValue ? new Date(prevValue) : null;
        const currDate = currValue ? new Date(currValue) : null;

        if (!prevDate && !currDate) return null;

        if (!prevDate && currDate) {
            return {
                field,
                type: 'date',
                change: `无→${currValue}`,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：设置日期 ${currValue}`
            };
        }

        if (prevDate && !currDate) {
            return {
                field,
                type: 'date',
                change: `${prevValue}→无`,
                level: 'warning',
                message: `⚠️ ${this.getFieldLabel(field)}：日期被清除`,
                requireExplanation: true
            };
        }

        // 日期变化
        const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) return null;

        const direction = daysDiff > 0 ? '推迟' : '提前';
        const absDays = Math.abs(daysDiff);

        if (absDays <= 7) {
            return {
                field,
                type: 'date',
                change: `${prevValue}→${currValue}`,
                daysDiff,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：${direction}${absDays}天`
            };
        }

        return {
            field,
            type: 'date',
            change: `${prevValue}→${currValue}`,
            daysDiff,
            level: 'warning',
            message: `⚠️ ${this.getFieldLabel(field)}：${direction}${absDays}天，请说明原因`,
            requireExplanation: true
        };
    },

    /**
     * 文本变化分析
     */
    analyzeTextChange(field, prevValue, currValue) {
        const prevStr = String(prevValue || '');
        const currStr = String(currValue || '');

        const prevLen = prevStr.length;
        const currLen = currStr.length;

        // 内容减少
        if (currLen < prevLen * 0.5 && prevLen > 20) {
            return {
                field,
                type: 'text',
                change: 'reduced',
                prevLength: prevLen,
                currLength: currLen,
                level: 'warning',
                message: `⚠️ ${this.getFieldLabel(field)}：内容大幅减少（${prevLen}字→${currLen}字），请核实`
            };
        }

        // 内容增加
        if (currLen > prevLen * 1.5 && prevLen > 10) {
            return {
                field,
                type: 'text',
                change: 'expanded',
                prevLength: prevLen,
                currLength: currLen,
                level: 'normal',
                message: `✅ ${this.getFieldLabel(field)}：信息更完善（${prevLen}字→${currLen}字）`
            };
        }

        // 普通修改
        return {
            field,
            type: 'text',
            change: 'modified',
            prevLength: prevLen,
            currLength: currLen,
            level: 'info',
            message: `${this.getFieldLabel(field)}：内容有修改`
        };
    },

    /**
     * 检测反复变化（振荡）
     */
    detectOscillations(versions) {
        const oscillations = [];
        const fieldHistory = {};

        // 收集每个字段的历史值
        versions.forEach((v, index) => {
            const data = v.fields || v.data || {};
            Object.keys(data).forEach(field => {
                if (field.startsWith('_')) return;

                if (!fieldHistory[field]) {
                    fieldHistory[field] = [];
                }
                fieldHistory[field].push({
                    version: v.version || v.versionId,
                    value: data[field],
                    index
                });
            });
        });

        // 检测振荡模式
        Object.keys(fieldHistory).forEach(field => {
            const history = fieldHistory[field];
            if (history.length < 3) return;

            const values = history.map(h => this.normalizeValue(h.value));

            // 检测 A→B→A 模式
            for (let i = 2; i < values.length; i++) {
                if (values[i] === values[i - 2] && values[i] !== values[i - 1]) {
                    oscillations.push({
                        field,
                        pattern: `${values[i - 2]}→${values[i - 1]}→${values[i]}`,
                        versions: [
                            history[i - 2].version,
                            history[i - 1].version,
                            history[i].version
                        ],
                        level: 'error',
                        message: `❌ ${this.getFieldLabel(field)}：出现反复变化（${this.truncate(values[i - 2], 10)}→${this.truncate(values[i - 1], 10)}→${this.truncate(values[i], 10)}），请核实数据准确性`
                    });
                }
            }
        });

        return oscillations;
    },

    /**
     * 生成验证总结
     */
    generateSummary(comparisons, oscillations) {
        let normalCount = 0;
        let warningCount = 0;
        let errorCount = 0;
        let requireExplanation = [];

        comparisons.forEach(comp => {
            comp.changes.forEach(change => {
                switch (change.level) {
                    case 'normal':
                        normalCount++;
                        break;
                    case 'warning':
                        warningCount++;
                        if (change.requireExplanation) {
                            requireExplanation.push(change.message);
                        }
                        break;
                    case 'error':
                        errorCount++;
                        if (change.requireExplanation) {
                            requireExplanation.push(change.message);
                        }
                        break;
                }
            });
        });

        errorCount += oscillations.length;
        oscillations.forEach(o => requireExplanation.push(o.message));

        let level, message;

        if (errorCount > 0) {
            level = 'error';
            message = `发现${errorCount}个异常，${warningCount}个警告，需要核实`;
        } else if (warningCount > 0) {
            level = 'warning';
            message = `发现${warningCount}个需关注的变化`;
        } else {
            level = 'normal';
            message = '版本演变正常';
        }

        return {
            level,
            message,
            counts: {
                normal: normalCount,
                warning: warningCount,
                error: errorCount
            },
            requireExplanation
        };
    },

    // ==================== 辅助函数 ====================

    normalizeCheckbox(value) {
        if (value === true || value === '是' || value === 'yes' || value === '1' || value === 1) {
            return '是';
        }
        if (value === false || value === '否' || value === 'no' || value === '0' || value === 0) {
            return '否';
        }
        return String(value || '');
    },

    normalizeValue(value) {
        if (typeof value === 'boolean') return value ? '是' : '否';
        if (value == null) return '';
        return String(value).trim();
    },

    getFieldLabel(field) {
        // 常用字段中文映射
        const labelMap = {
            'm_confirmed': 'M(需求)确认',
            'a_confirmed': 'A(资金)确认',
            'n_confirmed': 'N(决策人)确认',
            'a_budget_amount': '预算金额',
            'n_decision_maker_name': '决策人姓名',
            'bidPrice': '报价金额',
            'finalPrice': '最终价格',
            'contractAmount': '签约金额',
            'keyPersonList': '关键人列表',
            'mDescription': 'M描述',
            'aDescription': 'A描述',
            'nDescription': 'N描述'
        };

        return labelMap[field] || field;
    },

    truncate(str, maxLen) {
        const s = String(str || '');
        if (s.length <= maxLen) return s;
        return s.substring(0, maxLen) + '...';
    },

    /**
     * 渲染版本演变验证结果HTML
     */
    renderResult(result) {
        if (!result.hasChanges) {
            return '<div class="version-validation-empty">仅有一个版本，无需比对</div>';
        }

        let html = '<div class="version-validation-result">';

        // 总结
        const summaryClass = result.summary.level;
        const summaryIcon = {
            'normal': '✅',
            'warning': '⚠️',
            'error': '❌'
        }[summaryClass] || 'ℹ️';

        html += `
            <div class="version-summary ${summaryClass}">
                <span class="summary-icon">${summaryIcon}</span>
                <span class="summary-text">${result.summary.message}</span>
                <span class="summary-counts">
                    ${result.summary.counts.normal}正常 /
                    ${result.summary.counts.warning}警告 /
                    ${result.summary.counts.error}异常
                </span>
            </div>
        `;

        // 振荡警告
        if (result.oscillations.length > 0) {
            html += '<div class="oscillation-warnings">';
            html += '<h4>🔄 反复变化检测</h4>';
            html += '<ul>';
            result.oscillations.forEach(o => {
                html += `<li class="error">${o.message}</li>`;
            });
            html += '</ul></div>';
        }

        // 版本比对详情
        html += '<div class="version-comparisons">';
        result.comparisons.forEach(comp => {
            if (comp.changes.length === 0) return;

            html += `
                <div class="comparison-section">
                    <h4>${comp.from} → ${comp.to}</h4>
                    <ul class="change-list">
            `;

            comp.changes.forEach(change => {
                const icon = {
                    'normal': '✅',
                    'warning': '⚠️',
                    'error': '❌',
                    'info': 'ℹ️'
                }[change.level] || 'ℹ️';

                html += `<li class="${change.level}">${icon} ${change.message}</li>`;
            });

            html += '</ul></div>';
        });
        html += '</div>';

        // 需要说明的变化
        if (result.summary.requireExplanation.length > 0) {
            html += `
                <div class="explanation-required">
                    <h4>📝 需要说明的变化</h4>
                    <ul>
                        ${result.summary.requireExplanation.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }
};

// 导出
window.VersionValidator = VersionValidator;
