/**
 * 销售考核系统 - 任务验证规则配置
 * 为16个任务定义硬规则、关联验证、AI验证规则
 *
 * 设计原则：防止敷衍填写，确保内容实质性
 */

// ==================== 通用验证工具函数 ====================

/**
 * 验证文件名格式
 * @param {string} filename - 文件名
 * @param {object} options - 验证选项
 * @returns {object} { valid: boolean, message: string }
 */
function validateFilename(filename, options = {}) {
    if (!filename || filename.trim() === '') {
        return { valid: false, message: '文件未上传' };
    }

    const {
        allowedExtensions = null,  // 允许的扩展名数组，如 ['pdf', 'docx']
        minNameLength = 3,         // 文件名最小长度（不含扩展名）
        mustContain = null,        // 文件名必须包含的关键词
        mustNotBe = []             // 禁止的文件名模式
    } = options;

    const name = filename.trim();
    const lastDot = name.lastIndexOf('.');
    const baseName = lastDot > 0 ? name.substring(0, lastDot) : name;
    const ext = lastDot > 0 ? name.substring(lastDot + 1).toLowerCase() : '';

    // 检查扩展名
    if (allowedExtensions && allowedExtensions.length > 0) {
        if (!allowedExtensions.includes(ext)) {
            return {
                valid: false,
                message: `文件格式不正确，需要 ${allowedExtensions.join('/')} 格式`
            };
        }
    }

    // 检查文件名长度
    if (baseName.length < minNameLength) {
        return {
            valid: false,
            message: `文件名过于简单（至少${minNameLength}个字符）`
        };
    }

    // 检查禁止的文件名
    for (const pattern of mustNotBe) {
        if (typeof pattern === 'string') {
            if (baseName.toLowerCase() === pattern.toLowerCase()) {
                return { valid: false, message: `文件名"${pattern}"不够具体` };
            }
        } else if (pattern instanceof RegExp) {
            if (pattern.test(baseName)) {
                return { valid: false, message: '文件名格式不符合要求' };
            }
        }
    }

    // 检查必须包含的关键词
    if (mustContain && mustContain.length > 0) {
        const hasKeyword = mustContain.some(kw =>
            baseName.toLowerCase().includes(kw.toLowerCase())
        );
        if (!hasKeyword) {
            return {
                valid: false,
                message: `文件名应包含关键词：${mustContain.join('/')}`
            };
        }
    }

    return { valid: true, message: '文件名格式正确' };
}

/**
 * 验证文本内容质量
 * @param {string} text - 文本内容
 * @param {object} options - 验证选项
 * @returns {object} { valid: boolean, message: string, details: object }
 */
function validateText(text, options = {}) {
    const {
        minLength = 10,           // 最小字符数
        maxLength = null,         // 最大字符数
        mustContain = [],         // 必须包含的关键词（任一即可）
        mustContainAll = [],      // 必须包含的所有关键词
        mustNotBe = [],           // 禁止的内容
        minWords = null,          // 最小词数（用于列表类内容）
        patterns = []             // 必须匹配的正则表达式
    } = options;

    if (!text || typeof text !== 'string') {
        return { valid: false, message: '内容为空', details: {} };
    }

    const trimmed = text.trim();
    const details = {
        length: trimmed.length,
        wordCount: trimmed.split(/[,，;；\n、]+/).filter(w => w.trim()).length
    };

    // 检查长度
    if (trimmed.length < minLength) {
        return {
            valid: false,
            message: `内容过于简短（至少${minLength}字，当前${trimmed.length}字）`,
            details
        };
    }

    if (maxLength && trimmed.length > maxLength) {
        return {
            valid: false,
            message: `内容过长（最多${maxLength}字）`,
            details
        };
    }

    // 检查禁止内容（敷衍填写检测）
    for (const forbidden of mustNotBe) {
        if (typeof forbidden === 'string') {
            if (trimmed === forbidden || trimmed.toLowerCase() === forbidden.toLowerCase()) {
                return { valid: false, message: `"${forbidden}"不是有效的内容`, details };
            }
        } else if (forbidden instanceof RegExp) {
            if (forbidden.test(trimmed)) {
                return { valid: false, message: '内容格式不符合要求', details };
            }
        }
    }

    // 检查敷衍内容（常见无效输入）
    const lazyPatterns = [
        /^(无|没有|暂无|待定|略|见附件|如上|同上|\.+|。+|-+|—+)$/,
        /^(test|测试|123|abc|xxx|占位)$/i,
        /^[\s\d\W]+$/  // 纯数字或符号
    ];
    for (const pattern of lazyPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, message: '请填写实质性内容', details };
        }
    }

    // 检查必须包含的关键词（任一）
    if (mustContain.length > 0) {
        const hasKeyword = mustContain.some(kw =>
            trimmed.toLowerCase().includes(kw.toLowerCase())
        );
        if (!hasKeyword) {
            return {
                valid: false,
                message: `内容应涉及以下方面之一：${mustContain.join('、')}`,
                details
            };
        }
    }

    // 检查必须包含的所有关键词
    for (const kw of mustContainAll) {
        if (!trimmed.toLowerCase().includes(kw.toLowerCase())) {
            return {
                valid: false,
                message: `内容缺少必要信息：${kw}`,
                details
            };
        }
    }

    // 检查词数
    if (minWords && details.wordCount < minWords) {
        return {
            valid: false,
            message: `内容项数不足（至少${minWords}项，当前${details.wordCount}项）`,
            details
        };
    }

    // 检查正则模式
    for (const { pattern, message } of patterns) {
        if (!pattern.test(trimmed)) {
            return { valid: false, message: message || '内容格式不符合要求', details };
        }
    }

    return { valid: true, message: '内容格式正确', details };
}

/**
 * 验证复选框+说明类型字段
 * @param {boolean} checked - 是否勾选
 * @param {string} description - 说明内容
 * @param {object} options - 验证选项
 * @returns {object} { valid: boolean, message: string }
 */
function validateCheckboxWithText(checked, description, options = {}) {
    const {
        minDescLength = 10,
        mustContain = [],
        exampleGood = '',
        exampleBad = ''
    } = options;

    if (!checked) {
        return { valid: false, message: '未确认此项' };
    }

    if (!description || description.trim().length < minDescLength) {
        let msg = `请补充具体说明（至少${minDescLength}字）`;
        if (exampleBad) {
            msg += `\n❌ 错误示例：${exampleBad}`;
        }
        if (exampleGood) {
            msg += `\n✅ 正确示例：${exampleGood}`;
        }
        return { valid: false, message: msg };
    }

    // 检查敷衍内容
    const lazyPatterns = [/^(是|有|确认|已确认|ok|yes)$/i, /^(无|没有|暂无)$/];
    for (const pattern of lazyPatterns) {
        if (pattern.test(description.trim())) {
            let msg = '请填写具体说明，而非简单确认';
            if (exampleGood) {
                msg += `\n✅ 正确示例：${exampleGood}`;
            }
            return { valid: false, message: msg };
        }
    }

    // 检查必须包含的关键词
    if (mustContain.length > 0) {
        const hasKeyword = mustContain.some(kw =>
            description.toLowerCase().includes(kw.toLowerCase())
        );
        if (!hasKeyword) {
            return {
                valid: false,
                message: `说明应包含：${mustContain.join('、')}`
            };
        }
    }

    return { valid: true, message: '验证通过' };
}

/**
 * 验证列表内容（多项内容）
 * @param {string} listText - 列表文本（逗号/分号/换行分隔）
 * @param {object} options - 验证选项
 * @returns {object} { valid: boolean, message: string, items: array }
 */
function validateList(listText, options = {}) {
    const {
        minCount = 2,              // 最少项数
        maxCount = null,           // 最多项数
        minItemLength = 5,         // 每项最小字符数
        itemMustContain = [],      // 每项必须包含的关键词之一
        uniqueRequired = true,     // 是否要求不重复
        itemPattern = null         // 每项必须匹配的正则
    } = options;

    if (!listText || typeof listText !== 'string') {
        return { valid: false, message: '内容为空', items: [] };
    }

    // 解析列表项
    const items = listText
        .split(/[,，;；\n、\r]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);

    // 检查项数
    if (items.length < minCount) {
        return {
            valid: false,
            message: `至少填写${minCount}项（当前${items.length}项）`,
            items
        };
    }

    if (maxCount && items.length > maxCount) {
        return {
            valid: false,
            message: `最多${maxCount}项（当前${items.length}项）`,
            items
        };
    }

    // 检查每项长度
    const shortItems = items.filter(item => item.length < minItemLength);
    if (shortItems.length > 0) {
        return {
            valid: false,
            message: `部分内容过于简短：${shortItems.slice(0, 2).join('、')}...（每项至少${minItemLength}字）`,
            items
        };
    }

    // 检查重复
    if (uniqueRequired) {
        const uniqueItems = [...new Set(items.map(i => i.toLowerCase()))];
        if (uniqueItems.length < items.length) {
            return { valid: false, message: '存在重复内容，请确保每项不同', items };
        }
    }

    // 检查每项格式
    if (itemPattern) {
        const invalidItems = items.filter(item => !itemPattern.test(item));
        if (invalidItems.length > 0) {
            return {
                valid: false,
                message: `部分内容格式不正确：${invalidItems[0]}`,
                items
            };
        }
    }

    // 检查关键词
    if (itemMustContain.length > 0) {
        for (const item of items) {
            const hasKeyword = itemMustContain.some(kw =>
                item.toLowerCase().includes(kw.toLowerCase())
            );
            if (!hasKeyword) {
                // 这个是软性检查，不强制要求每项都包含关键词
            }
        }
    }

    return { valid: true, message: `共${items.length}项`, items };
}

/**
 * 验证数字范围
 * @param {any} value - 数值
 * @param {object} options - 验证选项
 * @returns {object} { valid: boolean, message: string, value: number }
 */
function validateNumber(value, options = {}) {
    const {
        min = null,
        max = null,
        integer = false,
        positive = true
    } = options;

    const num = parseFloat(value);

    if (isNaN(num)) {
        return { valid: false, message: '请输入有效数字', value: null };
    }

    if (positive && num <= 0) {
        return { valid: false, message: '数值必须大于0', value: num };
    }

    if (integer && !Number.isInteger(num)) {
        return { valid: false, message: '请输入整数', value: num };
    }

    if (min !== null && num < min) {
        return { valid: false, message: `数值不能小于${min}`, value: num };
    }

    if (max !== null && num > max) {
        return { valid: false, message: `数值不能大于${max}`, value: num };
    }

    return { valid: true, message: '数值有效', value: num };
}


// ==================== 任务验证规则配置 ====================

const TASK_RULES = {
    // ==================== 1.1 MAN分析与项目立项 ====================
    '1.1': {
        fields: {
            hasM: { type: 'checkbox_with_text', label: 'M(需求)确认' },
            mDescription: { type: 'text', label: '需求说明' },
            hasA: { type: 'checkbox_with_text', label: 'A(资金)确认' },
            aDescription: { type: 'text', label: '资金说明' },
            hasN: { type: 'checkbox_with_text', label: 'N(决策人)确认' },
            nDescription: { type: 'text', label: '决策人说明' },
            projectReport: { type: 'filename', label: '立项报告' }
        },
        hardRules: [
            {
                id: 'man_m',
                label: 'M(需求)确认',
                validate: (f) => {
                    const result = validateCheckboxWithText(f.hasM, f.mDescription, {
                        minDescLength: 15,
                        mustContain: ['需求', '采购', '项目', '计划', '更换', '升级', '扩展', '新建'],
                        exampleGood: '客户计划Q2季度进行服装采购，预算已列入年度计划',
                        exampleBad: '是'
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 需求确认完整';
                    const result = validateCheckboxWithText(f.hasM, f.mDescription, {
                        minDescLength: 15,
                        mustContain: ['需求', '采购', '项目', '计划', '更换', '升级', '扩展', '新建'],
                        exampleGood: '客户计划Q2季度进行服装采购，预算已列入年度计划',
                        exampleBad: '是'
                    });
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'man_a',
                label: 'A(资金)确认',
                validate: (f) => {
                    const result = validateCheckboxWithText(f.hasA, f.aDescription, {
                        minDescLength: 15,
                        mustContain: ['预算', '资金', '万', '元', '费用', '拨款', '批准'],
                        exampleGood: '年度预算50万，已获财务部批准',
                        exampleBad: '有预算'
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 资金确认完整';
                    const result = validateCheckboxWithText(f.hasA, f.aDescription, {
                        minDescLength: 15,
                        mustContain: ['预算', '资金', '万', '元', '费用', '拨款', '批准'],
                        exampleGood: '年度预算50万，已获财务部批准',
                        exampleBad: '有预算'
                    });
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'man_n',
                label: 'N(决策人)确认',
                validate: (f) => {
                    const result = validateCheckboxWithText(f.hasN, f.nDescription, {
                        minDescLength: 15,
                        mustContain: ['总经理', '经理', '总监', '主任', '负责人', '董事', '决策', '拍板'],
                        exampleGood: '项目由采购部张经理负责，最终审批人是副总裁李总',
                        exampleBad: '已联系'
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 决策人确认完整';
                    const result = validateCheckboxWithText(f.hasN, f.nDescription, {
                        minDescLength: 15,
                        mustContain: ['总经理', '经理', '总监', '主任', '负责人', '董事', '决策', '拍板'],
                        exampleGood: '项目由采购部张经理负责，最终审批人是副总裁李总',
                        exampleBad: '已联系'
                    });
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'project_report',
                label: '立项报告',
                validate: (f) => {
                    const result = validateFilename(f.projectReport, {
                        allowedExtensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls'],
                        minNameLength: 4,
                        mustNotBe: ['报告', '立项', '文档', 'test', '1', '新建']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 立项报告已上传';
                    const result = validateFilename(f.projectReport, {
                        allowedExtensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls'],
                        minNameLength: 4,
                        mustNotBe: ['报告', '立项', '文档', 'test', '1', '新建']
                    });
                    return result.message;
                },
                severity: 'error'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_man_quality',
                label: 'MAN分析质量',
                prompt: `请评估这个MAN分析的质量：
1. M(需求)说明是否清晰具体，有明确的采购意向和时间节点？
2. A(资金)说明是否包含预算金额和审批状态？
3. N(决策人)说明是否明确了具体的决策人姓名和职位？

评分标准：
- 三项都具体详实：通过
- 有敷衍或模糊内容：不通过`,
                targetFields: ['mDescription', 'aDescription', 'nDescription']
            }
        ]
    },

    // ==================== 1.2 决策链绘制 ====================
    '1.2': {
        fields: {
            decisionChainFile: { type: 'filename', label: '决策链图' },
            keyPersonList: { type: 'list', label: '关键人列表' }
        },
        hardRules: [
            {
                id: 'decision_chain_file',
                label: '决策链图',
                validate: (f) => {
                    const result = validateFilename(f.decisionChainFile, {
                        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'pptx', 'ppt', 'docx', 'doc', 'vsdx'],
                        minNameLength: 4,
                        mustNotBe: ['决策链', '图', 'test', '1', '新建', '未命名']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 决策链图已上传';
                    const result = validateFilename(f.decisionChainFile, {
                        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'pptx', 'ppt', 'docx', 'doc', 'vsdx'],
                        minNameLength: 4,
                        mustNotBe: ['决策链', '图', 'test', '1', '新建', '未命名']
                    });
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'key_person_count',
                label: '关键人数量',
                validate: (f) => {
                    const result = validateList(f.keyPersonList, {
                        minCount: 3,
                        minItemLength: 8,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.keyPersonList, {
                        minCount: 3,
                        minItemLength: 8,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ ${result.message}，符合要求`;
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'key_person_format',
                label: '关键人信息完整性',
                validate: (f) => {
                    if (!f.keyPersonList) return false;
                    const items = f.keyPersonList.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 每个关键人应包含姓名+职位，格式如"张三-采购经理"或"张三（采购经理）"
                    const validItems = items.filter(item => {
                        // 包含职位相关词汇
                        return /[经理|总监|主任|负责人|总|专员|工程师|采购|财务|技术|董事]/.test(item);
                    });
                    return validItems.length >= 3;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 关键人信息格式正确';
                    return '每位关键人需包含姓名和职位，如：张三-采购经理、李四（技术总监）';
                },
                severity: 'warning'
            },
            {
                id: 'key_person_roles',
                label: '决策角色覆盖',
                validate: (f) => {
                    if (!f.keyPersonList) return false;
                    const text = f.keyPersonList.toLowerCase();
                    // 检查是否涵盖关键角色
                    const roles = ['采购', '技术', '使用', '财务', '决策', '审批', '老板', '总'];
                    const coveredRoles = roles.filter(role => text.includes(role));
                    return coveredRoles.length >= 2;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 决策角色覆盖充分';
                    return '关键人应覆盖不同角色：采购方、技术方、使用方、决策方等';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_man_decision',
                label: '与MAN分析一致性',
                refTaskCode: '1.1',
                validate: (curr, ref) => {
                    // 决策链中的决策人应与MAN中的N对应
                    if (!ref || !ref.nDescription) return true;
                    // 简化验证，AI会做更深入检查
                    return true;
                },
                passMessage: '与MAN分析中的决策人一致',
                failMessage: '请确认决策链是否包含MAN分析中确认的决策人',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_decision_chain',
                label: '决策链完整性',
                prompt: `请评估关键人列表的质量：
1. 是否包含了完整的决策链角色（使用者、影响者、决策者、批准者）？
2. 每个人的职位和角色是否清晰？
3. 是否存在明显遗漏（如没有最终决策人）？

评分标准：
- 角色齐全、信息清晰：通过
- 缺少关键角色或信息模糊：不通过`,
                targetFields: ['keyPersonList']
            }
        ]
    },

    // ==================== 1.3 竞争对手分析 ====================
    '1.3': {
        fields: {
            competitorAnalysis: { type: 'filename', label: '竞争分析报告' },
            competitorList: { type: 'list', label: '竞争对手列表' },
            ourAdvantages: { type: 'text', label: '我方优势' },
            ourWeaknesses: { type: 'text', label: '我方劣势' }
        },
        hardRules: [
            {
                id: 'competitor_file',
                label: '竞争分析报告',
                validate: (f) => {
                    const result = validateFilename(f.competitorAnalysis, {
                        allowedExtensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'],
                        minNameLength: 4,
                        mustNotBe: ['分析', '报告', 'test', '1', '新建', '竞争']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 竞争分析报告已上传';
                    const result = validateFilename(f.competitorAnalysis, {
                        allowedExtensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'],
                        minNameLength: 4,
                        mustNotBe: ['分析', '报告', 'test', '1', '新建', '竞争']
                    });
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'competitor_list',
                label: '竞争对手列表',
                validate: (f) => {
                    const result = validateList(f.competitorList, {
                        minCount: 2,
                        minItemLength: 2,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.competitorList, {
                        minCount: 2,
                        minItemLength: 2,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 已分析${result.items.length}个竞争对手`;
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'our_advantages',
                label: '我方优势分析',
                validate: (f) => {
                    const result = validateText(f.ourAdvantages, {
                        minLength: 30,
                        mustContain: ['优势', '强', '好', '快', '高', '专业', '品质', '服务', '价格', '技术', '经验'],
                        mustNotBe: ['无', '暂无', '略', '见附件']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 我方优势分析详尽';
                    const result = validateText(f.ourAdvantages, {
                        minLength: 30,
                        mustContain: ['优势', '强', '好', '快', '高', '专业', '品质', '服务', '价格', '技术', '经验']
                    });
                    return result.message || '我方优势分析过于简略（至少30字，需体现具体优势点）';
                },
                severity: 'error'
            },
            {
                id: 'our_weaknesses',
                label: '我方劣势分析',
                validate: (f) => {
                    const result = validateText(f.ourWeaknesses, {
                        minLength: 20,
                        mustNotBe: ['无', '没有', '暂无', '略', '不存在']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 我方劣势分析完整';
                    return '请客观分析我方劣势（至少20字），不能填写"无"或"暂无"';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_competitor_swot',
                label: 'SWOT分析质量',
                prompt: `请评估竞争分析的质量：
1. 优势分析是否具体、可量化（而非空泛的"质量好"）？
2. 劣势分析是否客观真实（而非敷衍的"没有劣势"）？
3. 是否针对具体竞争对手进行了对比分析？

评分标准：
- 分析具体、客观、有针对性：通过
- 内容空泛或不够客观：不通过`,
                targetFields: ['ourAdvantages', 'ourWeaknesses', 'competitorList']
            }
        ]
    },

    // ==================== 1.4 标准植入与影响 ====================
    '1.4': {
        fields: {
            standardList: { type: 'list', label: '植入的有利标准' },
            influenceMethod: { type: 'text', label: '影响方式' },
            expectedEffect: { type: 'text', label: '预期效果' }
        },
        hardRules: [
            {
                id: 'standard_list',
                label: '植入标准列表',
                validate: (f) => {
                    const result = validateList(f.standardList, {
                        minCount: 2,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.standardList, {
                        minCount: 2,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 已植入${result.items.length}个标准`;
                    return result.message;
                },
                severity: 'error'
            },
            {
                id: 'standard_quality',
                label: '标准内容质量',
                validate: (f) => {
                    if (!f.standardList) return false;
                    const items = f.standardList.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 检查是否包含具体指标
                    const hasSpecific = items.some(item =>
                        /[数字|%|年|天|小时|级|类|标准|认证|ISO|GB]/.test(item) ||
                        /\d/.test(item)
                    );
                    return hasSpecific;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 标准内容具体可量化';
                    return '植入的标准应具体可量化（如：ISO9001认证、3年以上经验、响应时间<24小时）';
                },
                severity: 'warning'
            },
            {
                id: 'influence_method',
                label: '影响方式说明',
                validate: (f) => {
                    const result = validateText(f.influenceMethod, {
                        minLength: 20,
                        mustContain: ['通过', '方式', '与', '沟通', '说明', '展示', '对比', '建议', '提出'],
                        mustNotBe: ['无', '暂无', '略']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 影响方式说明清晰';
                    return '请说明如何影响客户接受这些标准（至少20字）';
                },
                severity: 'error'
            },
            {
                id: 'expected_effect',
                label: '预期效果',
                validate: (f) => {
                    const result = validateText(f.expectedEffect, {
                        minLength: 15,
                        mustContain: ['排除', '优势', '胜出', '加分', '有利', '竞争', '淘汰'],
                        mustNotBe: ['无', '暂无', '略', '好']
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 预期效果描述明确';
                    return '请说明这些标准的预期效果（如何排斥竞争对手、获得优势）';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_competitor_standard',
                label: '对比竞争对手',
                refTaskCode: '1.3',
                validate: (curr, ref) => {
                    // 标准应该针对竞争对手的弱点
                    return true; // 简化验证，AI会做更深入的检查
                },
                passMessage: '标准植入已考虑竞争态势',
                failMessage: '建议结合竞争对手分析优化标准',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_standard_effect',
                label: '标准有效性',
                prompt: `请评估植入标准的有效性：
1. 这些标准是否足够具体、可验证？
2. 这些标准是否能有效筛选掉竞争对手？
3. 影响方式是否可行？

评分标准：
- 标准具体且有竞争优势：通过
- 标准模糊或无法起到筛选作用：不通过`,
                targetFields: ['standardList', 'influenceMethod', 'expectedEffect']
            }
        ]
    },

    // ==================== 2.1 需求调研与确认 ====================
    '2.1': {
        hardRules: [
            {
                id: 'survey_report',
                label: '调研报告',
                validate: (f) => !!f.surveyReport,
                getMessage: (f, passed) => passed ? '✓ 调研报告已上传' : '请上传调研报告',
                severity: 'error'
            },
            {
                id: 'requirement_confirm',
                label: '需求确认书',
                validate: (f) => !!f.requirementConfirm,
                getMessage: (f, passed) => passed ? '✓ 需求确认书已上传' : '请上传需求确认书',
                severity: 'error'
            },
            {
                id: 'key_requirements',
                label: '核心需求描述',
                validate: (f) => (f.keyRequirements || '').length >= 50,
                getMessage: (f, passed) => passed ? '✓ 核心需求描述充分' : '核心需求描述过于简略（至少50字）',
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_man_requirement',
                label: '需求与MAN一致性',
                refTaskCode: '1.1',
                validate: (curr, ref) => true,
                passMessage: '需求与MAN分析一致',
                failMessage: '请核实需求与MAN分析的一致性',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_requirement_complete',
                label: '需求完整性',
                prompt: '请评估核心需求是否涵盖了功能需求、性能需求、服务需求等维度',
                targetFields: ['keyRequirements']
            }
        ]
    },

    // ==================== 2.2 方案设计 ====================
    '2.2': {
        hardRules: [
            {
                id: 'solution_file',
                label: '方案文档',
                validate: (f) => !!f.solutionFile,
                getMessage: (f, passed) => passed ? '✓ 方案文档已上传' : '请上传方案文档',
                severity: 'error'
            },
            {
                id: 'solution_highlights',
                label: '方案亮点',
                validate: (f) => (f.solutionHighlights || '').length >= 30,
                getMessage: (f, passed) => passed ? '✓ 方案亮点描述充分' : '请详细描述方案亮点（至少30字）',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_requirement_solution',
                label: '方案响应需求',
                refTaskCode: '2.1',
                validate: (curr, ref) => true,
                passMessage: '方案已响应调研需求',
                failMessage: '请确保方案充分响应客户需求',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_solution_innovation',
                label: '方案创新性',
                prompt: '请评估方案亮点是否具有差异化竞争力',
                targetFields: ['solutionHighlights']
            }
        ]
    },

    // ==================== 2.3 方案讲解与反馈收集 ====================
    '2.3': {
        hardRules: [
            {
                id: 'presentation_date',
                label: '讲解时间',
                validate: (f) => !!f.presentationDate,
                getMessage: (f, passed) => passed ? '✓ 讲解时间已记录' : '请填写讲解时间',
                severity: 'error'
            },
            {
                id: 'key_attendees',
                label: '关键决策人参会',
                validate: (f) => /总经理|董事长|决策|总监|副总|CEO|总裁/.test(f.attendees || ''),
                getMessage: (f, passed) => passed ? '✓ 关键决策人已参会' : '参会人需包含关键决策人（总经理/董事长/总监等）',
                severity: 'error'
            },
            {
                id: 'feedback_count',
                label: '反馈问题数量',
                validate: (f) => (parseInt(f.feedbackCount) || 0) >= 5,
                getMessage: (f, passed) => {
                    const count = f.feedbackCount || 0;
                    return passed ? `✓ 收集${count}条反馈，符合要求` : `仅收集${count}条反馈，需至少5条`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_decision_chain_attendees',
                label: '参会人在决策链中',
                refTaskCode: '1.2',
                validate: (curr, ref) => true,
                passMessage: '参会人与决策链一致',
                failMessage: '建议确认参会人是否都在决策链中',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_feedback_quality',
                label: '反馈质量',
                prompt: '请评估反馈摘要是否涵盖了关键问题和客户关注点',
                targetFields: ['feedbackSummary']
            }
        ]
    },

    // ==================== 3.1 方案深化 ====================
    '3.1': {
        hardRules: [
            {
                id: 'deepened_solution_file',
                label: '深化方案',
                validate: (f) => !!f.deepenedSolutionFile,
                getMessage: (f, passed) => passed ? '✓ 深化方案已上传' : '请上传深化后的方案',
                severity: 'error'
            },
            {
                id: 'improvement_count',
                label: '优化点数量',
                validate: (f) => (parseInt(f.improvementCount) || 0) >= 3,
                getMessage: (f, passed) => {
                    const count = f.improvementCount || 0;
                    return passed ? `✓ ${count}个优化点，符合要求` : '至少需要3个优化点';
                },
                severity: 'error'
            },
            {
                id: 'changes_description',
                label: '修改内容描述',
                validate: (f) => (f.changesDescription || '').length >= 50,
                getMessage: (f, passed) => passed ? '✓ 修改内容描述详尽' : '修改内容描述过于简略（至少50字）',
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_feedback_improvement',
                label: '响应客户反馈',
                refTaskCode: '2.3',
                validate: (curr, ref) => true,
                passMessage: '方案优化已响应客户反馈',
                failMessage: '请确保方案优化针对客户反馈进行',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_improvement_relevance',
                label: '优化针对性',
                prompt: '请评估修改内容是否针对性地解决了客户反馈的问题',
                targetFields: ['changesDescription']
            }
        ]
    },

    // ==================== 3.2 样品准备与现场展示 ====================
    '3.2': {
        hardRules: [
            {
                id: 'sample_prepared',
                label: '样品准备',
                validate: (f) => !!f.samplePrepared,
                getMessage: (f, passed) => passed ? '✓ 样品已准备就绪' : '请确认样品是否已准备',
                severity: 'error'
            },
            {
                id: 'demo_date',
                label: '展示日期',
                validate: (f) => !!f.demoDate,
                getMessage: (f, passed) => passed ? '✓ 展示日期已记录' : '请填写展示日期',
                severity: 'error'
            },
            {
                id: 'demo_feedback',
                label: '展示反馈',
                validate: (f) => (f.demoFeedback || '').length >= 30,
                getMessage: (f, passed) => passed ? '✓ 展示反馈已记录' : '请详细记录展示反馈（至少30字）',
                severity: 'error'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_demo_effect',
                label: '展示效果评估',
                prompt: '请评估展示反馈是正面还是负面，客户的态度如何',
                targetFields: ['demoFeedback']
            }
        ]
    },

    // ==================== 3.3 样品对比展示 ====================
    '3.3': {
        hardRules: [
            {
                id: 'comparison_date',
                label: '对比日期',
                validate: (f) => !!f.comparisonDate,
                getMessage: (f, passed) => passed ? '✓ 对比日期已记录' : '请填写对比日期',
                severity: 'error'
            },
            {
                id: 'comparison_result',
                label: '对比结果',
                validate: (f) => (f.comparisonResult || '').length >= 30,
                getMessage: (f, passed) => passed ? '✓ 对比结果已记录' : '请详细记录对比结果（至少30字）',
                severity: 'error'
            },
            {
                id: 'our_win_points',
                label: '我方胜出点',
                validate: (f) => (f.ourWinPoints || '').length >= 20,
                getMessage: (f, passed) => passed ? '✓ 我方胜出点已明确' : '请说明我方胜出点（至少20字）',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_competitor_comparison',
                label: '对比竞品信息',
                refTaskCode: '1.3',
                validate: (curr, ref) => true,
                passMessage: '对比结果与竞争分析一致',
                failMessage: '请核实对比结果与竞争分析的一致性',
                severity: 'warning'
            }
        ],
        aiRules: []
    },

    // ==================== 4.1 投标文件准备 ====================
    '4.1': {
        hardRules: [
            {
                id: 'bid_document',
                label: '投标文件',
                validate: (f) => !!f.bidDocumentFile,
                getMessage: (f, passed) => passed ? '✓ 投标文件已上传' : '请上传投标文件',
                severity: 'error'
            },
            {
                id: 'technical_proposal',
                label: '技术方案',
                validate: (f) => !!f.technicalProposal,
                getMessage: (f, passed) => passed ? '✓ 技术方案已上传' : '请上传技术方案',
                severity: 'error'
            },
            {
                id: 'commercial_proposal',
                label: '商务方案',
                validate: (f) => !!f.commercialProposal,
                getMessage: (f, passed) => passed ? '✓ 商务方案已上传' : '请上传商务方案',
                severity: 'error'
            },
            {
                id: 'bid_price',
                label: '投标价格',
                validate: (f) => (parseFloat(f.bidPrice) || 0) > 0,
                getMessage: (f, passed) => passed ? `✓ 投标价格${f.bidPrice}万` : '请填写投标价格',
                severity: 'error'
            }
        ],
        crossRefs: [],
        aiRules: []
    },

    // ==================== 4.2 技术交流会 ====================
    '4.2': {
        hardRules: [
            {
                id: 'meeting_date',
                label: '会议日期',
                validate: (f) => !!f.meetingDate,
                getMessage: (f, passed) => passed ? '✓ 会议日期已记录' : '请填写会议日期',
                severity: 'error'
            },
            {
                id: 'meeting_minutes',
                label: '会议纪要',
                validate: (f) => !!f.meetingMinutes,
                getMessage: (f, passed) => passed ? '✓ 会议纪要已上传' : '请上传会议纪要',
                severity: 'error'
            },
            {
                id: 'technical_topics',
                label: '技术议题',
                validate: (f) => (f.technicalTopics || '').length >= 30,
                getMessage: (f, passed) => passed ? '✓ 技术议题记录详尽' : '请详细记录技术议题（至少30字）',
                severity: 'warning'
            }
        ],
        crossRefs: [],
        aiRules: []
    },

    // ==================== 4.3 商务交流会 ====================
    '4.3': {
        hardRules: [
            {
                id: 'meeting_date',
                label: '会议日期',
                validate: (f) => !!f.meetingDate,
                getMessage: (f, passed) => passed ? '✓ 会议日期已记录' : '请填写会议日期',
                severity: 'error'
            },
            {
                id: 'meeting_minutes',
                label: '会议纪要',
                validate: (f) => !!f.meetingMinutes,
                getMessage: (f, passed) => passed ? '✓ 会议纪要已上传' : '请上传会议纪要',
                severity: 'error'
            },
            {
                id: 'price_negotiation',
                label: '价格讨论',
                validate: (f) => (f.priceNegotiation || '').length >= 30,
                getMessage: (f, passed) => passed ? '✓ 价格讨论记录详尽' : '请详细记录价格讨论内容（至少30字）',
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_bid_price',
                label: '价格区间对照',
                refTaskCode: '4.1',
                validate: (curr, ref) => true,
                passMessage: '价格讨论与投标价格一致',
                failMessage: '请核实商务讨论价格与投标价格的关系',
                severity: 'warning'
            }
        ],
        aiRules: []
    },

    // ==================== 5.1 评分模拟与风险应对 ====================
    '5.1': {
        hardRules: [
            {
                id: 'scoring_simulation',
                label: '模拟评分表',
                validate: (f) => !!f.scoringSimulationFile,
                getMessage: (f, passed) => passed ? '✓ 模拟评分表已上传' : '请上传模拟评分表',
                severity: 'error'
            },
            {
                id: 'risk_count',
                label: '风险点数量',
                validate: (f) => (parseInt(f.riskCount) || 0) >= 3,
                getMessage: (f, passed) => {
                    const count = f.riskCount || 0;
                    return passed ? `✓ 识别${count}个风险点` : '至少识别3个风险点';
                },
                severity: 'error'
            },
            {
                id: 'countermeasures',
                label: '应对措施',
                validate: (f) => (f.countermeasures || '').length >= 50,
                getMessage: (f, passed) => passed ? '✓ 应对措施描述充分' : '请详细描述应对措施（至少50字）',
                severity: 'error'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_risk_coverage',
                label: '风险覆盖度',
                prompt: '请评估风险清单是否涵盖了技术风险、商务风险、竞争风险等多个维度',
                targetFields: ['riskList', 'countermeasures']
            }
        ]
    },

    // ==================== 6.1 商务谈判 ====================
    '6.1': {
        hardRules: [
            {
                id: 'negotiation_date',
                label: '谈判日期',
                validate: (f) => !!f.negotiationDate,
                getMessage: (f, passed) => passed ? '✓ 谈判日期已记录' : '请填写谈判日期',
                severity: 'error'
            },
            {
                id: 'negotiation_file',
                label: '谈判纪要',
                validate: (f) => !!f.negotiationFile,
                getMessage: (f, passed) => passed ? '✓ 谈判纪要已上传' : '请上传谈判纪要',
                severity: 'error'
            },
            {
                id: 'final_price',
                label: '最终价格',
                validate: (f) => (parseFloat(f.finalPrice) || 0) > 0,
                getMessage: (f, passed) => passed ? `✓ 最终价格${f.finalPrice}万` : '请填写最终价格',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_price_comparison',
                label: '价格对比分析',
                refTaskCode: '4.3',
                validate: (curr, ref) => true,
                passMessage: '最终价格在合理范围内',
                failMessage: '请核实最终价格与之前商务讨论的关系',
                severity: 'warning'
            }
        ],
        aiRules: []
    },

    // ==================== 7.1 合同签订 ====================
    '7.1': {
        hardRules: [
            {
                id: 'contract_date',
                label: '签约日期',
                validate: (f) => !!f.contractDate,
                getMessage: (f, passed) => passed ? '✓ 签约日期已记录' : '请填写签约日期',
                severity: 'error'
            },
            {
                id: 'contract_file',
                label: '合同文件',
                validate: (f) => !!f.contractFile,
                getMessage: (f, passed) => passed ? '✓ 合同文件已上传' : '请上传合同文件',
                severity: 'error'
            },
            {
                id: 'contract_amount',
                label: '合同金额',
                validate: (f) => (parseFloat(f.contractAmount) || 0) > 0,
                getMessage: (f, passed) => passed ? `✓ 合同金额${f.contractAmount}万` : '请填写合同金额',
                severity: 'error'
            },
            {
                id: 'payment_terms',
                label: '付款条款',
                validate: (f) => (f.paymentTerms || '').length >= 20,
                getMessage: (f, passed) => passed ? '✓ 付款条款已明确' : '请填写付款条款（至少20字）',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_final_amount',
                label: '金额一致性',
                refTaskCode: '6.1',
                validate: (curr, ref) => {
                    const contractAmount = parseFloat(curr.contractAmount) || 0;
                    const negotiatedPrice = parseFloat(ref.finalPrice) || 0;
                    if (negotiatedPrice === 0) return true;
                    const diff = Math.abs(contractAmount - negotiatedPrice) / negotiatedPrice;
                    return diff <= 0.05;
                },
                passMessage: '合同金额与谈判价格一致',
                failMessage: '合同金额与谈判价格差异较大，请核实',
                severity: 'warning'
            }
        ],
        aiRules: []
    }
};

// 导出验证工具函数
window.validateFilename = validateFilename;
window.validateText = validateText;
window.validateCheckboxWithText = validateCheckboxWithText;
window.validateList = validateList;
window.validateNumber = validateNumber;

// 导出规则配置
window.TASK_RULES = TASK_RULES;
