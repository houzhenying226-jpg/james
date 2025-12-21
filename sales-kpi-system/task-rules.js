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
        crossRefs: [
            {
                id: 'cross_decision_chain_check',
                label: '决策人在决策链中',
                refTaskCode: '1.2',
                validate: (curr, ref) => {
                    console.log('=== 1.1关联验证: 决策人在决策链中 ===');
                    console.log('当前任务数据:', curr);
                    console.log('关联任务1.2数据:', ref);

                    // 1. 检查当前任务的决策人描述
                    const nDesc = curr.nDescription || curr.N_描述 || curr.N_决策人描述 || '';
                    console.log('N描述:', nDesc);

                    // 如果N描述为空或太短，返回待验证状态
                    if (!nDesc || nDesc.trim().length < 3) {
                        console.log('N描述为空或太短，返回待验证');
                        return null;  // 返回null表示待验证
                    }

                    // 2. 检查任务1.2是否已完成
                    if (!ref || !ref.keyPersonList) {
                        console.log('1.2未填写关键人列表，返回待验证');
                        return null;
                    }

                    // 3. 提取N描述中的人名（中文姓名通常2-4个字）
                    const namePattern = /[\u4e00-\u9fa5]{2,4}(?=[部长|总监|经理|主任|总|科长|处长|董事|老板|负责人]|$)/g;
                    const possibleNames = nDesc.match(namePattern) || [];

                    // 也尝试直接提取2-3字的连续中文
                    const simpleNames = nDesc.match(/[\u4e00-\u9fa5]{2,3}/g) || [];

                    // 合并去重
                    const allNames = [...new Set([...possibleNames, ...simpleNames])];
                    console.log('提取的可能姓名:', allNames);

                    if (allNames.length === 0) {
                        console.log('未能提取有效人名');
                        return null;
                    }

                    // 4. 获取1.2中的关键人名单
                    const keyPersons = ref.keyPersonList.toLowerCase();
                    console.log('关键人列表:', keyPersons);

                    // 5. 检查是否有匹配
                    const foundNames = allNames.filter(name =>
                        keyPersons.includes(name.toLowerCase())
                    );
                    console.log('匹配的姓名:', foundNames);

                    if (foundNames.length > 0) {
                        console.log('验证通过');
                        return true;
                    }

                    console.log('验证失败 - 决策人不在名单中');
                    return false;
                },
                passMessage: '✓ 决策人在决策链名单中',
                failMessage: '⚠️ N(决策人)描述中的人名不在1.2决策链名单中，请核实',
                pendingMessage: '⏳ 请先填写N(决策人)描述或完成1.2决策链，再验证关联性',
                severity: 'warning'
            }
        ],
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
                    console.log('=== 1.2关联验证: 与MAN分析一致性 ===');

                    // 检查当前任务的关键人列表
                    const keyPersonList = curr.keyPersonList || '';
                    if (!keyPersonList || keyPersonList.trim().length < 5) {
                        return null; // 待验证
                    }

                    // 检查1.1的N描述
                    const nDesc = ref?.nDescription || ref?.N_描述 || '';
                    if (!nDesc || nDesc.trim().length < 3) {
                        return null; // 1.1未填写，待验证
                    }

                    // 提取N描述中的人名
                    const nameMatches = nDesc.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
                    console.log('1.1中的人名:', nameMatches);

                    // 检查是否在关键人列表中
                    const foundNames = nameMatches.filter(name =>
                        keyPersonList.includes(name)
                    );

                    if (foundNames.length > 0) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 决策链包含MAN分析中的决策人',
                failMessage: '⚠️ 1.1中的决策人未在决策链中，请核实',
                pendingMessage: '⏳ 请先完成1.1的N描述，再验证一致性',
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
        fields: {
            requirementFile: { type: 'filename', label: '需求清单文件' },
            requirementList: { type: 'list', label: '需求项列表' },
            customerConfirm: { type: 'checkbox', label: '客户签字确认' }
        },
        hardRules: [
            {
                id: 'requirement_file',
                label: '需求清单文件',
                validate: (f) => {
                    const file = f.requirementFile || f.surveyReport || '';
                    return file.trim() && /\.(docx?|pdf|xlsx?)$/i.test(file);
                },
                getMessage: (f, passed) => {
                    const file = f.requirementFile || f.surveyReport || '';
                    if (!file.trim()) return '需求清单：未上传';
                    if (!/\.(docx?|pdf|xlsx?)$/i.test(file)) return '需求清单：请上传有效文件（docx/pdf/xlsx）';
                    return `✓ 需求清单：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'requirement_count',
                label: '需求项数量',
                validate: (f) => {
                    const result = validateList(f.requirementList || f.keyRequirements, {
                        minCount: 5,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.requirementList || f.keyRequirements, {
                        minCount: 5,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 需求项：${result.items.length}项`;
                    return result.message || `需求项不足5项`;
                },
                severity: 'error'
            },
            {
                id: 'requirement_quality',
                label: '需求项完整性',
                validate: (f) => {
                    const list = f.requirementList || f.keyRequirements || '';
                    if (!list) return false;
                    const items = list.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 每项需要包含数量或规格相关词汇
                    const hasSpec = items.filter(item =>
                        /\d/.test(item) || /件|套|批|规格|尺寸|颜色|材质/.test(item)
                    );
                    return hasSpec.length >= 3;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 需求项信息完整';
                    return '需求项应包含具体信息（数量/规格/尺寸等）';
                },
                severity: 'warning'
            },
            {
                id: 'customer_confirm',
                label: '客户签字确认',
                validate: (f) => f.customerConfirm === true || f.customerConfirm === '是' || !!f.requirementConfirm,
                getMessage: (f, passed) => {
                    return passed ? '✓ 客户已签字确认' : '⚠️ 客户未签字确认（建议获取签字）';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_man_requirement',
                label: '需求与MAN一致性',
                refTaskCode: '1.1',
                validate: (curr, ref) => {
                    console.log('=== 2.1关联验证: 需求与MAN一致性 ===');

                    // 获取当前任务的需求列表
                    const reqList = curr.requirementList || curr.keyRequirements || curr.需求列表 || '';
                    if (!reqList || reqList.trim().length < 10) {
                        return null; // 待验证
                    }

                    // 获取1.1的M描述
                    const mDesc = ref?.mDescription || ref?.M_描述 || '';
                    if (!mDesc || mDesc.trim().length < 5) {
                        return null; // 1.1未填写
                    }

                    // 提取关键词进行匹配
                    const keywords = ['西服', '衬衫', '工装', '套', '件', '条', '制服', '职业装'];
                    const mKeywords = keywords.filter(k => mDesc.includes(k));
                    const reqKeywords = keywords.filter(k => reqList.includes(k));

                    console.log('1.1关键词:', mKeywords);
                    console.log('2.1关键词:', reqKeywords);

                    // 检查是否有重叠
                    const overlap = mKeywords.some(k => reqKeywords.includes(k));

                    if (overlap || mKeywords.length === 0) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 需求调研与MAN分析中的需求一致',
                failMessage: '⚠️ 2.1需求内容与1.1中描述的需求不一致，请核实',
                pendingMessage: '⏳ 请先完成1.1的M描述，再验证一致性',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_requirement_complete',
                label: '需求完整性',
                prompt: `请验证任务2.1 需求调研的内容质量：

验证要点：
1. 5个需求项是否互相独立不重复（防止拆分凑数）
2. 每项需求是否具体（包含数量/时间/规格等）
3. 是否覆盖核心维度（款式/数量/交期/预算）

评分标准：
- 需求独立、具体、覆盖全面：通过
- 有重复、敷衍或遗漏：不通过`,
                targetFields: ['requirementList', 'keyRequirements']
            }
        ]
    },

    // ==================== 2.2 方案设计 ====================
    '2.2': {
        fields: {
            solutionFile: { type: 'filename', label: '方案文档' },
            technicalPlan: { type: 'text', label: '技术方案描述' },
            pricePlan: { type: 'text', label: '价格方案描述' }
        },
        hardRules: [
            {
                id: 'solution_file',
                label: '方案文档',
                validate: (f) => {
                    const file = f.solutionFile || '';
                    if (!file.trim()) return false;
                    if (!/\.(docx?|pdf|pptx?)$/i.test(file)) return false;
                    const name = file.replace(/\.[^.]+$/, '');
                    return name.length >= 6;
                },
                getMessage: (f, passed) => {
                    const file = f.solutionFile || '';
                    if (!file.trim()) return '方案文档：未上传';
                    if (!/\.(docx?|pdf|pptx?)$/i.test(file)) return '方案文档：请上传有效文件（docx/pdf/pptx）';
                    const name = file.replace(/\.[^.]+$/, '');
                    if (name.length < 6) return '方案文档：文件名太简单';
                    return `✓ 方案文档：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'technical_plan',
                label: '技术方案描述',
                validate: (f) => {
                    const text = f.technicalPlan || f.solutionHighlights || '';
                    if (text.length < 80) return false;
                    if (!/面料|材质|工艺|版型|设计|规格|款式/.test(text)) return false;
                    return true;
                },
                getMessage: (f, passed) => {
                    const text = f.technicalPlan || f.solutionHighlights || '';
                    if (text.length < 80) return `技术方案：${text.length}字（需≥80字）`;
                    if (!/面料|材质|工艺|版型|设计|规格|款式/.test(text)) {
                        return '技术方案：请包含技术内容（面料/工艺/版型等）';
                    }
                    return `✓ 技术方案：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'price_plan',
                label: '价格方案描述',
                validate: (f) => {
                    const text = f.pricePlan || '';
                    if (text.length < 50) return false;
                    if (!/\d/.test(text)) return false; // 必须有数字
                    return true;
                },
                getMessage: (f, passed) => {
                    const text = f.pricePlan || '';
                    if (text.length < 50) return `价格方案：${text.length}字（需≥50字）`;
                    if (!/\d/.test(text)) return '价格方案：请包含具体价格数字';
                    return `✓ 价格方案：${text.length}字`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_requirement_solution',
                label: '方案响应需求',
                refTaskCode: '2.1',
                validate: (curr, ref) => {
                    if (!ref) return true;
                    // 简化验证，AI会做更深入检查
                    return true;
                },
                passMessage: '方案已响应调研需求',
                failMessage: '请确保方案充分响应客户需求',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_solution_innovation',
                label: '方案创新性',
                prompt: `请验证任务2.2 方案设计的内容质量：

验证要点：
1. 技术方案是否包含具体参数（材质、克重、工艺等）
2. 价格是否在行业合理区间
3. 是否响应了2.1中的需求项

评分标准：
- 技术专业、价格合理、响应需求：通过
- 内容空洞或未响应需求：不通过`,
                targetFields: ['technicalPlan', 'solutionHighlights', 'pricePlan']
            }
        ]
    },

    // ==================== 2.3 方案讲解与反馈收集 ====================
    '2.3': {
        fields: {
            presentationDate: { type: 'date', label: '讲解时间' },
            attendees: { type: 'text', label: '参会关键人' },
            feedbackList: { type: 'list', label: '问题列表' }
        },
        hardRules: [
            {
                id: 'presentation_date',
                label: '讲解时间',
                validate: (f) => (f.presentationDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const time = f.presentationDate || '';
                    return time.trim() ? `✓ 讲解时间：${time}` : '讲解时间：未填写';
                },
                severity: 'error'
            },
            {
                id: 'key_attendees',
                label: '参会关键人',
                validate: (f) => {
                    const attendees = f.attendees || '';
                    if (attendees.trim().length < 2) return false;
                    // 应包含职位信息
                    return /经理|总监|主任|负责人|总|董事|决策/.test(attendees);
                },
                getMessage: (f, passed) => {
                    const attendees = f.attendees || '';
                    if (!attendees.trim()) return '参会人：未填写';
                    if (!/经理|总监|主任|负责人|总|董事|决策/.test(attendees)) {
                        return '参会人需包含关键决策人（经理/总监等职位）';
                    }
                    return `✓ 参会人：${attendees}`;
                },
                severity: 'error'
            },
            {
                id: 'feedback_count',
                label: '问题数量',
                validate: (f) => {
                    const result = validateList(f.feedbackList || f.feedbackSummary, {
                        minCount: 3,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.feedbackList || f.feedbackSummary, {
                        minCount: 3,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 收集问题：${result.items.length}个`;
                    return result.message || '收集问题不足3个';
                },
                severity: 'error'
            },
            {
                id: 'feedback_quality',
                label: '问题质量',
                validate: (f) => {
                    const list = f.feedbackList || f.feedbackSummary || '';
                    if (!list) return false;
                    const items = list.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 检查是否有敷衍回答
                    const lazyPatterns = [/^(没问题|挺好|可以|同意|好的|ok|是)$/i];
                    for (const item of items) {
                        for (const pattern of lazyPatterns) {
                            if (pattern.test(item.trim())) return false;
                        }
                        if (item.trim().length < 15) return false;
                    }
                    return items.length >= 3;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 问题内容合格';
                    return '问题应为实质性内容（每项≥15字，不能是"没问题""挺好"等敷衍回答）';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_decision_chain_attendees',
                label: '参会人在决策链中',
                refTaskCode: '1.2',
                validate: (curr, ref) => {
                    console.log('=== 2.3关联验证: 参会人在决策链中 ===');

                    // 获取参会人
                    const attendees = curr.attendees || curr.参会人员 || curr.客户参会人 || '';
                    if (!attendees || attendees.trim().length < 2) {
                        return null; // 待验证
                    }

                    // 获取1.2决策链
                    if (!ref || !ref.keyPersonList) {
                        return null; // 1.2未填写
                    }

                    // 提取参会人中的人名
                    const attendeeNames = attendees.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
                    console.log('参会人姓名:', attendeeNames);

                    // 检查是否在决策链中
                    const chainPersons = ref.keyPersonList.toLowerCase();
                    const foundNames = attendeeNames.filter(name =>
                        chainPersons.includes(name.toLowerCase())
                    );

                    console.log('匹配的姓名:', foundNames);

                    if (foundNames.length > 0) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 参会人在决策链名单中',
                failMessage: '⚠️ 参会人不在1.2决策链名单中，建议邀请关键决策人',
                pendingMessage: '⏳ 请先完成1.2决策链，再验证参会人',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_feedback_quality',
                label: '反馈质量',
                prompt: `请验证任务2.3 方案讲解的内容质量：

验证要点：
1. 参会人是否为决策链中的关键人
2. 收集的3个问题是否互不重复
3. 每个问题是否为实质性问题（不是敷衍的"挺好""没问题"）

评分标准：
- 参会人层级足够、问题独立且有价值：通过
- 参会人层级低或问题敷衍重复：不通过`,
                targetFields: ['attendees', 'feedbackList', 'feedbackSummary']
            }
        ]
    },

    // ==================== 3.1 方案深化 ====================
    '3.1': {
        fields: {
            deepenedSolutionFile: { type: 'filename', label: '深化方案文件' },
            modifyList: { type: 'list', label: '修改列表' },
            modifyReason: { type: 'text', label: '修改依据' }
        },
        hardRules: [
            {
                id: 'deepened_solution_file',
                label: '深化方案文件',
                validate: (f) => {
                    const file = f.deepenedSolutionFile || '';
                    return file.trim() && /\.(docx?|pdf|pptx?)$/i.test(file);
                },
                getMessage: (f, passed) => {
                    const file = f.deepenedSolutionFile || '';
                    if (!file.trim()) return '深化方案：未上传';
                    return `✓ 深化方案：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'modify_count',
                label: '修改点数量',
                validate: (f) => {
                    const result = validateList(f.modifyList || f.changesDescription, {
                        minCount: 3,
                        minItemLength: 25,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.modifyList || f.changesDescription, {
                        minCount: 3,
                        minItemLength: 25,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 修改点：${result.items.length}处`;
                    return result.message || '修改点不足3处';
                },
                severity: 'error'
            },
            {
                id: 'modify_quality',
                label: '修改内容质量',
                validate: (f) => {
                    const list = f.modifyList || f.changesDescription || '';
                    if (!list) return false;
                    const items = list.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 每项修改描述至少25字
                    return items.every(item => item.trim().length >= 25);
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 修改内容描述充分';
                    return '每处修改描述需≥25字，请详细说明修改内容';
                },
                severity: 'warning'
            },
            {
                id: 'modify_reason',
                label: '修改依据',
                validate: (f) => {
                    const text = f.modifyReason || '';
                    return text.length >= 30;
                },
                getMessage: (f, passed) => {
                    const text = f.modifyReason || '';
                    return text.length >= 30
                        ? `✓ 修改依据：${text.length}字`
                        : `修改依据：${text.length}字（需≥30字）`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_feedback_improvement',
                label: '修改响应问题',
                refTaskCode: '2.3',
                validate: (curr, ref) => {
                    console.log('=== 3.1关联验证: 修改响应问题 ===');

                    // 获取修改列表
                    const modifyList = curr.modifyList || curr.changesDescription || curr.修改列表 || '';
                    if (!modifyList || modifyList.trim().length < 5) {
                        return null; // 待验证
                    }

                    // 获取2.3的问题列表
                    const feedbackList = ref?.feedbackList || ref?.feedbackSummary || ref?.问题列表 || '';
                    if (!feedbackList || feedbackList.trim().length < 5) {
                        return null; // 2.3未填写
                    }

                    // 统计数量进行比较
                    const modifyItems = modifyList.split(/[,，;；\n、\d+\.]+/).filter(i => i.trim().length > 2);
                    const feedbackItems = feedbackList.split(/[,，;；\n、\d+\.]+/).filter(i => i.trim().length > 2);

                    console.log('修改项数:', modifyItems.length);
                    console.log('问题项数:', feedbackItems.length);

                    // 修改数应该≥问题数
                    if (modifyItems.length >= feedbackItems.length) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 方案修改已充分响应客户问题',
                failMessage: '⚠️ 修改数量少于2.3收集的问题数量，可能有遗漏',
                pendingMessage: '⏳ 请先完成2.3方案讲解，再验证响应情况',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_improvement_relevance',
                label: '优化针对性',
                prompt: `请验证任务3.1 方案深化的内容质量：

验证要点：
1. 每处修改是否对应2.3收集的问题
2. 修改是否为实质性改动（不是改标点、改措辞）
3. 是否完整响应了2.3的全部问题

评分标准：
- 修改对应问题、内容实质、响应完整：通过
- 修改敷衍或遗漏问题：不通过`,
                targetFields: ['modifyList', 'changesDescription', 'modifyReason']
            }
        ]
    },

    // ==================== 3.2 样品准备与现场展示 ====================
    '3.2': {
        fields: {
            sampleList: { type: 'list', label: '样品列表' },
            demoDate: { type: 'date', label: '展示时间' },
            demoLocation: { type: 'text', label: '展示地点' },
            demoFeedback: { type: 'text', label: '展示反馈' }
        },
        hardRules: [
            {
                id: 'sample_count',
                label: '样品款数',
                validate: (f) => {
                    const result = validateList(f.sampleList, {
                        minCount: 3,
                        minItemLength: 5,
                        uniqueRequired: true
                    });
                    return result.valid || !!f.samplePrepared;
                },
                getMessage: (f, passed) => {
                    if (f.samplePrepared && !f.sampleList) return '✓ 样品已准备';
                    const result = validateList(f.sampleList, {
                        minCount: 3,
                        minItemLength: 5,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 样品：${result.items?.length || 0}款`;
                    return result.message || '样品不足3款';
                },
                severity: 'error'
            },
            {
                id: 'sample_info',
                label: '样品信息完整',
                validate: (f) => {
                    if (!f.sampleList) return !!f.samplePrepared;
                    const items = f.sampleList.split(/[,，;；\n、]+/).filter(i => i.trim());
                    // 每个样品应包含款式名称和材质说明
                    return items.every(item =>
                        item.length >= 10 && /材质|面料|款式|规格/.test(item)
                    );
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 样品信息完整';
                    return '每款样品需包含款式名称和材质说明（如：西装外套-羊毛混纺）';
                },
                severity: 'warning'
            },
            {
                id: 'demo_date',
                label: '展示时间',
                validate: (f) => (f.demoDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const time = f.demoDate || '';
                    return time.trim() ? `✓ 展示时间：${time}` : '展示时间：未填写';
                },
                severity: 'error'
            },
            {
                id: 'demo_location',
                label: '展示地点',
                validate: (f) => (f.demoLocation || '').length >= 10,
                getMessage: (f, passed) => {
                    const place = f.demoLocation || '';
                    return place.length >= 10
                        ? `✓ 展示地点：${place}`
                        : `展示地点：${place.length}字（需≥10字，请填写具体地址）`;
                },
                severity: 'error'
            },
            {
                id: 'demo_feedback',
                label: '展示反馈',
                validate: (f) => (f.demoFeedback || '').length >= 30,
                getMessage: (f, passed) => {
                    const text = f.demoFeedback || '';
                    return text.length >= 30
                        ? `✓ 展示反馈：${text.length}字`
                        : `展示反馈：${text.length}字（需≥30字）`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_solution_sample',
                label: '样品与方案一致',
                refTaskCode: '2.2',
                validate: (curr, ref) => {
                    console.log('=== 3.2关联验证: 样品与方案一致 ===');

                    // 获取样品列表
                    const sampleList = curr.sampleList || curr.样品列表 || '';
                    if (!sampleList || sampleList.trim().length < 10) {
                        console.log('样品列表未填写或过短');
                        return null; // 待验证
                    }

                    // 获取2.2方案
                    const technicalPlan = ref?.technicalPlan || ref?.solutionDescription || ref?.技术方案 || '';
                    if (!technicalPlan || technicalPlan.trim().length < 10) {
                        console.log('2.2方案未填写');
                        return null; // 待验证
                    }

                    // 提取样品中的关键词（产品类型）
                    const productKeywords = ['西服', '西装', '衬衫', '裤', '工装', '制服', '外套', '大衣', '夹克'];
                    const sampleProducts = productKeywords.filter(kw => sampleList.includes(kw));
                    const planProducts = productKeywords.filter(kw => technicalPlan.includes(kw));

                    console.log('样品产品:', sampleProducts);
                    console.log('方案产品:', planProducts);

                    // 如果样品中的产品类型在方案中都有提及
                    if (sampleProducts.length > 0) {
                        const covered = sampleProducts.filter(p => planProducts.includes(p));
                        if (covered.length >= sampleProducts.length * 0.5) {
                            return true;
                        }
                        return false;
                    }

                    // 无法判断，返回通过（避免误报）
                    return true;
                },
                passMessage: '✓ 样品与方案推荐一致',
                failMessage: '⚠️ 样品品类与2.2方案不一致，请核实',
                pendingMessage: '⏳ 请先填写样品列表或完成2.2方案，再验证一致性',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_demo_effect',
                label: '展示效果评估',
                prompt: `请验证任务3.2 样品展示的内容质量：

验证要点：
1. 样品款式是否与2.2方案推荐一致
2. 是否覆盖客户主要需求品类
3. 材质说明是否专业准确

评分标准：
- 样品与方案一致、覆盖需求、材质专业：通过
- 样品不符或材质说明敷衍：不通过`,
                targetFields: ['sampleList', 'demoFeedback']
            }
        ]
    },

    // ==================== 3.3 样品对比展示 ====================
    '3.3': {
        fields: {
            comparisonReport: { type: 'filename', label: '对比报告' },
            comparisonDimensions: { type: 'list', label: '对比维度' },
            customerPreference: { type: 'text', label: '客户倾向结论' }
        },
        hardRules: [
            {
                id: 'comparison_report',
                label: '对比报告文件',
                validate: (f) => {
                    const file = f.comparisonReport || '';
                    return file.trim() && /\.(docx?|pdf|xlsx?|pptx?)$/i.test(file);
                },
                getMessage: (f, passed) => {
                    const file = f.comparisonReport || '';
                    if (!file.trim()) return '对比报告：未上传';
                    return `✓ 对比报告：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'comparison_dimensions',
                label: '对比维度数量',
                validate: (f) => {
                    const result = validateList(f.comparisonDimensions || f.comparisonResult, {
                        minCount: 3,
                        minItemLength: 5,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.comparisonDimensions || f.comparisonResult, {
                        minCount: 3,
                        minItemLength: 5,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 对比维度：${result.items?.length || 0}个`;
                    return result.message || '对比维度不足3个';
                },
                severity: 'error'
            },
            {
                id: 'dimension_quality',
                label: '对比维度专业性',
                validate: (f) => {
                    const dims = f.comparisonDimensions || f.comparisonResult || '';
                    if (!dims) return false;
                    // 对比维度应包含专业内容
                    return /材质|工艺|价格|交期|服务|品质|规格|尺寸/.test(dims);
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 对比维度专业';
                    return '对比维度应为专业内容（材质/工艺/价格等，而非"好不好"）';
                },
                severity: 'warning'
            },
            {
                id: 'customer_preference',
                label: '客户倾向结论',
                validate: (f) => {
                    const text = f.customerPreference || f.ourWinPoints || '';
                    return text.length >= 20;
                },
                getMessage: (f, passed) => {
                    const text = f.customerPreference || f.ourWinPoints || '';
                    return text.length >= 20
                        ? `✓ 客户倾向：${text.substring(0, 30)}...`
                        : `客户倾向：${text.length}字（需≥20字，请说明具体倾向）`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_competitor_comparison',
                label: '对比竞品信息',
                refTaskCode: '1.3',
                validate: (curr, ref) => {
                    console.log('=== 3.3关联验证: 对比竞品信息 ===');

                    // 获取对比维度/结果
                    const comparison = curr.comparisonDimensions || curr.comparisonResult || curr.对比维度 || '';
                    if (!comparison || comparison.trim().length < 10) {
                        console.log('对比信息未填写');
                        return null; // 待验证
                    }

                    // 获取1.3竞争对手信息
                    const competitorList = ref?.competitorList || ref?.competitorAnalysis || ref?.竞争对手列表 || '';
                    if (!competitorList || competitorList.trim().length < 10) {
                        console.log('1.3竞争对手未填写');
                        return null; // 待验证
                    }

                    // 提取竞争对手公司名（中文2-6字）
                    const companyNames = competitorList.match(/[\u4e00-\u9fa5]{2,6}(公司|集团|服装|制衣)/g) || [];
                    console.log('竞争对手公司:', companyNames);

                    // 检查对比中是否提到竞争对手
                    if (companyNames.length > 0) {
                        const mentioned = companyNames.some(name => {
                            const shortName = name.replace(/(公司|集团|服装|制衣)$/, '');
                            return comparison.includes(shortName) || comparison.includes(name);
                        });
                        if (mentioned) {
                            return true;
                        }
                        // 也可能用"竞品A""对手1"等代称
                        if (comparison.includes('竞品') || comparison.includes('对手') || comparison.includes('竞争')) {
                            return true;
                        }
                    }

                    // 如果1.3没有具体公司名，只要有对比内容就算通过
                    if (companyNames.length === 0 && comparison.length >= 20) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 对比结果与竞争分析一致',
                failMessage: '⚠️ 对比内容未体现1.3分析的竞争对手，请核实',
                pendingMessage: '⏳ 请先填写对比信息或完成1.3竞争分析，再验证一致性',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_comparison_quality',
                label: '对比质量评估',
                prompt: `请验证任务3.3 样品对比的内容质量：

验证要点：
1. 对比维度是否专业（材质/工艺/价格等，而非"好不好"）
2. 对比是否客观（有我方劣势说明，非一边倒）
3. 客户倾向结论与对比结果是否逻辑一致

评分标准：
- 维度专业、对比客观、结论一致：通过
- 维度敷衍或结论矛盾：不通过`,
                targetFields: ['comparisonDimensions', 'comparisonResult', 'customerPreference', 'ourWinPoints']
            }
        ]
    },

    // ==================== 4.0 招标情报与评委布局 ====================
    '4.0': {
        fields: {
            // 招标情报
            biddingMethod: { type: 'select', label: '招标方式' },
            scoringRuleFile: { type: 'filename', label: '评分规则文件' },
            technicalScoreRatio: { type: 'number', label: '技术分占比(%)' },
            commercialScoreRatio: { type: 'number', label: '商务分占比(%)' },
            scoringWeightAnalysis: { type: 'text', label: '评分权重分析' },
            // 评委布局
            juryCount: { type: 'number', label: '评委数量' },
            juryList: { type: 'text', label: '评委名单' },
            juryTendencyAnalysis: { type: 'text', label: '评委倾向分析' },
            juryPRStrategy: { type: 'text', label: '公关策略' },
            intelSource: { type: 'select', label: '情报来源' }
        },
        hardRules: [
            {
                id: 'bidding_method',
                label: '招标方式',
                validate: (f) => {
                    const method = f.biddingMethod || '';
                    return ['公开招标', '邀请招标', '竞争性谈判', '询价采购', '单一来源'].includes(method);
                },
                getMessage: (f, passed) => {
                    const method = f.biddingMethod || '未选择';
                    return passed ? `✓ 招标方式：${method}` : `招标方式：未选择`;
                },
                severity: 'error'
            },
            {
                id: 'scoring_rule_file',
                label: '评分规则文件',
                validate: (f) => {
                    const file = f.scoringRuleFile || '';
                    return file.trim().length > 0;
                },
                getMessage: (f, passed) => {
                    const file = f.scoringRuleFile || '';
                    return passed ? `✓ 评分规则：${file}` : '评分规则文件：未上传';
                },
                severity: 'error'
            },
            {
                id: 'score_ratio_sum',
                label: '分值比例',
                validate: (f) => {
                    const tech = parseFloat(f.technicalScoreRatio) || 0;
                    const comm = parseFloat(f.commercialScoreRatio) || 0;
                    // 技术分+商务分应接近100%（允许±5%误差，考虑可能有其他分项）
                    return tech > 0 && comm > 0 && (tech + comm >= 80) && (tech + comm <= 105);
                },
                getMessage: (f, passed) => {
                    const tech = parseFloat(f.technicalScoreRatio) || 0;
                    const comm = parseFloat(f.commercialScoreRatio) || 0;
                    const sum = tech + comm;
                    if (passed) {
                        return `✓ 分值比例：技术${tech}% + 商务${comm}% = ${sum}%`;
                    }
                    if (tech === 0 || comm === 0) {
                        return '请填写技术分和商务分占比';
                    }
                    return `⚠️ 分值比例异常：${sum}%（应接近100%）`;
                },
                severity: 'error'
            },
            {
                id: 'scoring_weight_analysis',
                label: '评分权重分析',
                validate: (f) => (f.scoringWeightAnalysis || '').length >= 50,
                getMessage: (f, passed) => {
                    const text = f.scoringWeightAnalysis || '';
                    return text.length >= 50
                        ? `✓ 评分权重分析：${text.length}字`
                        : `评分权重分析：${text.length}字（需≥50字，说明得分点和失分点）`;
                },
                severity: 'error'
            },
            {
                id: 'jury_count',
                label: '评委数量',
                validate: (f) => {
                    const count = parseInt(f.juryCount) || 0;
                    return count >= 3 && count <= 15; // 通常3-15人
                },
                getMessage: (f, passed) => {
                    const count = parseInt(f.juryCount) || 0;
                    if (count === 0) return '评委数量：未填写';
                    return passed ? `✓ 评委数量：${count}人` : `⚠️ 评委数量${count}人（通常3-15人）`;
                },
                severity: 'error'
            },
            {
                id: 'jury_list',
                label: '评委名单',
                validate: (f) => {
                    const list = f.juryList || '';
                    // 至少有2个评委信息（按分隔符拆分）
                    const items = list.split(/[,，;；\n]+/).filter(i => i.trim().length >= 2);
                    return items.length >= 2;
                },
                getMessage: (f, passed) => {
                    const list = f.juryList || '';
                    const items = list.split(/[,，;；\n]+/).filter(i => i.trim().length >= 2);
                    return passed
                        ? `✓ 评委名单：${items.length}人`
                        : `评委名单：${items.length}人（需≥2人，格式：姓名-职位-部门）`;
                },
                severity: 'error'
            },
            {
                id: 'jury_tendency',
                label: '评委倾向分析',
                validate: (f) => (f.juryTendencyAnalysis || '').length >= 30,
                getMessage: (f, passed) => {
                    const text = f.juryTendencyAnalysis || '';
                    return text.length >= 30
                        ? `✓ 评委倾向分析：${text.length}字`
                        : `评委倾向分析：${text.length}字（需≥30字）`;
                },
                severity: 'warning'
            },
            {
                id: 'jury_pr_strategy',
                label: '公关策略',
                validate: (f) => (f.juryPRStrategy || '').length >= 30,
                getMessage: (f, passed) => {
                    const text = f.juryPRStrategy || '';
                    return text.length >= 30
                        ? `✓ 公关策略：${text.length}字`
                        : `公关策略：${text.length}字（需≥30字，说明针对性公关措施）`;
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_competitor_jury',
                label: '评委与竞品关系',
                refTaskCode: '1.3',
                validate: (curr, ref) => {
                    console.log('=== 4.0关联验证: 评委与竞品关系 ===');

                    // 获取评委倾向分析
                    const juryAnalysis = curr.juryTendencyAnalysis || '';
                    if (!juryAnalysis || juryAnalysis.length < 20) {
                        return null; // 待验证
                    }

                    // 获取1.3竞争对手信息
                    const competitorList = ref?.competitorList || ref?.competitorAnalysis || '';
                    if (!competitorList || competitorList.length < 10) {
                        return null; // 待验证
                    }

                    // 检查评委分析是否提到竞争对手
                    const hasCompetitorMention = juryAnalysis.includes('竞') ||
                        juryAnalysis.includes('对手') ||
                        juryAnalysis.includes('其他') ||
                        juryAnalysis.includes('倾向');

                    return hasCompetitorMention;
                },
                passMessage: '✓ 评委倾向分析已考虑竞争因素',
                failMessage: '⚠️ 建议在评委分析中说明与竞争对手的关系',
                pendingMessage: '⏳ 请先完成评委分析和1.3竞争分析',
                severity: 'warning'
            },
            {
                id: 'cross_budget_match',
                label: '预算与技术分权重',
                refTaskCode: '1.1',
                validate: (curr, ref) => {
                    console.log('=== 4.0关联验证: 预算与分值比例 ===');

                    const techRatio = parseFloat(curr.technicalScoreRatio) || 0;
                    const commRatio = parseFloat(curr.commercialScoreRatio) || 0;

                    if (techRatio === 0 || commRatio === 0) {
                        return null; // 待验证
                    }

                    const budget = parseFloat(ref?.a_budget_amount || ref?.aDescription?.match(/\d+/)?.[0]) || 0;

                    // 高预算项目通常技术分权重更高
                    if (budget >= 500 && techRatio < 40) {
                        console.log(`大项目(${budget}万)技术分仅${techRatio}%，偏低`);
                        return false;
                    }

                    return true;
                },
                passMessage: '✓ 分值比例与项目规模匹配',
                failMessage: '⚠️ 大项目通常技术分权重较高，请核实',
                pendingMessage: '⏳ 请先填写分值比例',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_jury_quality',
                label: '评委布局质量',
                prompt: `请验证任务4.0 招标情报与评委布局的内容质量：

验证要点：
1. 评委名单是否有具体姓名和职位（而非"评委1""评委2"）
2. 评委倾向分析是否有针对性（说明每个评委的关注点和倾向）
3. 公关策略是否具体可执行（而非"加强沟通""搞好关系"）
4. 评分权重分析是否说明了得分点和失分点

评分标准：
- 名单具体、分析有针对性、策略可执行：通过
- 信息笼统或策略空洞：不通过`,
                targetFields: ['juryList', 'juryTendencyAnalysis', 'juryPRStrategy', 'scoringWeightAnalysis']
            }
        ]
    },

    // ==================== 4.1 投标文件准备 ====================
    '4.1': {
        fields: {
            bidDocumentFile: { type: 'filename', label: '投标文件' },
            technicalComplete: { type: 'select', label: '技术标完整度' },
            commercialComplete: { type: 'select', label: '商务标完整度' },
            technicalDescription: { type: 'text', label: '技术标说明' },
            bidPrice: { type: 'number', label: '报价金额' },
            internalReview: { type: 'checkbox', label: '内部评审' }
        },
        hardRules: [
            {
                id: 'bid_document',
                label: '投标文件',
                validate: (f) => {
                    const file = f.bidDocumentFile || '';
                    return file.trim() && /\.(docx?|pdf)$/i.test(file);
                },
                getMessage: (f, passed) => {
                    const file = f.bidDocumentFile || '';
                    if (!file.trim()) return '投标文件：未上传';
                    return `✓ 投标文件：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'technical_complete',
                label: '技术标完整度',
                validate: (f) => f.technicalComplete === '完整' || !!f.technicalProposal,
                getMessage: (f, passed) => {
                    const status = f.technicalComplete || '未填写';
                    return status === '完整' || f.technicalProposal ? '✓ 技术标：完整' : `⚠️ 技术标：${status}`;
                },
                severity: 'warning'
            },
            {
                id: 'commercial_complete',
                label: '商务标完整度',
                validate: (f) => f.commercialComplete === '完整' || !!f.commercialProposal,
                getMessage: (f, passed) => {
                    const status = f.commercialComplete || '未填写';
                    return status === '完整' || f.commercialProposal ? '✓ 商务标：完整' : `⚠️ 商务标：${status}`;
                },
                severity: 'warning'
            },
            {
                id: 'technical_description',
                label: '技术标说明',
                validate: (f) => (f.technicalDescription || '').length >= 50,
                getMessage: (f, passed) => {
                    const text = f.technicalDescription || '';
                    return text.length >= 50
                        ? `✓ 技术标说明：${text.length}字`
                        : `技术标说明：${text.length}字（需≥50字）`;
                },
                severity: 'error'
            },
            {
                id: 'bid_price',
                label: '报价金额',
                validate: (f) => {
                    const amount = parseFloat(f.bidPrice);
                    return !isNaN(amount) && amount > 0;
                },
                getMessage: (f, passed) => {
                    const amount = parseFloat(f.bidPrice);
                    if (isNaN(amount) || amount <= 0) return '报价金额：请填写有效数字';
                    return `✓ 报价金额：${amount}万`;
                },
                severity: 'error'
            },
            {
                id: 'internal_review',
                label: '内部评审',
                validate: (f) => f.internalReview === true || f.internalReview === '是',
                getMessage: (f, passed) => {
                    return passed ? '✓ 已通过内部评审' : '⚠️ 未进行内部评审（建议评审后再提交）';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_standard_bid',
                label: '包含植入标准',
                refTaskCode: '1.4',
                validate: (curr, ref) => {
                    console.log('=== 4.1关联验证: 包含植入标准 ===');

                    // 获取技术标说明
                    const techDesc = curr.technicalDescription || curr.technicalBidDescription || curr.技术标说明 || '';
                    if (!techDesc || techDesc.trim().length < 10) {
                        console.log('技术标说明未填写');
                        return null; // 待验证
                    }

                    // 获取1.4植入标准
                    const standards = ref?.technicalStandards || ref?.standardContent || ref?.植入内容 || ref?.植入标准内容 || '';
                    if (!standards || standards.trim().length < 10) {
                        console.log('1.4植入标准未填写');
                        return null; // 待验证
                    }

                    // 提取技术参数关键词
                    const techKeywords = ['克重', '色牢度', '缩水率', '起毛起球', '成分', '含量',
                                         '透气', '防水', '阻燃', '抗皱', '免烫', '耐磨'];

                    // 检查1.4提到的参数是否在技术标中有体现
                    const standardParams = techKeywords.filter(kw => standards.includes(kw));
                    console.log('1.4提到的参数:', standardParams);

                    if (standardParams.length > 0) {
                        const covered = standardParams.filter(p => techDesc.includes(p));
                        console.log('技术标覆盖的参数:', covered);

                        // 至少覆盖一半的参数
                        if (covered.length >= standardParams.length * 0.5) {
                            return true;
                        }
                        return false;
                    }

                    // 如果1.4没有具体参数，只要有技术描述就算通过
                    return true;
                },
                passMessage: '✓ 技术标已包含植入标准',
                failMessage: '⚠️ 技术标未体现1.4植入的标准参数，请核实',
                pendingMessage: '⏳ 请先填写技术标说明或完成1.4标准植入，再验证一致性',
                severity: 'warning'
            },
            {
                id: 'cross_price_solution',
                label: '价格与方案一致',
                refTaskCode: '2.2',
                validate: (curr, ref) => {
                    console.log('=== 4.1关联验证: 价格与方案一致 ===');

                    // 获取报价金额
                    const bidPrice = parseFloat(curr.bidPrice || curr.报价金额 || 0);
                    if (!bidPrice || bidPrice <= 0) {
                        console.log('报价金额未填写');
                        return null; // 待验证
                    }

                    // 获取2.2方案价格
                    const pricingPlan = ref?.pricingPlan || ref?.价格方案 || ref?.价格方案描述 || '';
                    if (!pricingPlan || pricingPlan.trim().length < 5) {
                        console.log('2.2价格方案未填写');
                        return null; // 待验证
                    }

                    // 尝试从方案中提取金额
                    const priceMatches = pricingPlan.match(/(\d+\.?\d*)\s*万/g);
                    console.log('方案中的金额:', priceMatches);

                    if (priceMatches && priceMatches.length > 0) {
                        // 取最大金额作为方案总价
                        const planPrices = priceMatches.map(m => parseFloat(m.replace('万', '')));
                        const maxPlanPrice = Math.max(...planPrices);
                        console.log(`报价: ${bidPrice}万, 方案最大金额: ${maxPlanPrice}万`);

                        // 偏差在±20%内
                        const deviation = Math.abs(bidPrice - maxPlanPrice) / maxPlanPrice;
                        if (deviation <= 0.20) {
                            return true;
                        }
                        console.log(`偏差: ${(deviation * 100).toFixed(1)}%`);
                        return false;
                    }

                    // 无法提取方案价格，默认通过
                    return true;
                },
                passMessage: '✓ 报价与方案价格一致（偏差≤20%）',
                failMessage: '⚠️ 报价与2.2方案价格偏差>20%，请核实原因',
                pendingMessage: '⏳ 请先填写报价金额或完成2.2价格方案，再验证一致性',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_bid_quality',
                label: '投标文件质量',
                prompt: `请验证任务4.1 投标文件的内容质量：

验证要点：
1. 技术标是否包含1.4植入的标准
2. 报价是否与2.2价格方案一致（偏差≤15%）
3. 技术标说明是否专业完整

评分标准：
- 包含标准、价格一致、内容完整：通过
- 遗漏标准或价格偏差大：不通过`,
                targetFields: ['technicalDescription', 'bidPrice']
            }
        ]
    },

    // ==================== 4.2 技术交流会 ====================
    '4.2': {
        fields: {
            meetingDate: { type: 'date', label: '会议时间' },
            ourAttendees: { type: 'text', label: '我方参会人' },
            customerAttendees: { type: 'text', label: '客户参会人' },
            qaRecords: { type: 'list', label: '问答记录' }
        },
        hardRules: [
            {
                id: 'meeting_date',
                label: '会议时间',
                validate: (f) => (f.meetingDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const time = f.meetingDate || '';
                    return time.trim() ? `✓ 会议时间：${time}` : '会议时间：未填写';
                },
                severity: 'error'
            },
            {
                id: 'our_attendees',
                label: '我方参会人数',
                validate: (f) => {
                    const people = f.ourAttendees || '';
                    const count = people.split(/[,，、\s]+/).filter(p => p.trim()).length;
                    return count >= 2;
                },
                getMessage: (f, passed) => {
                    const people = f.ourAttendees || '';
                    const count = people.split(/[,，、\s]+/).filter(p => p.trim()).length;
                    return count >= 2 ? `✓ 我方参会：${count}人` : `我方参会：${count}人（需≥2人）`;
                },
                severity: 'error'
            },
            {
                id: 'customer_attendees',
                label: '客户参会人',
                validate: (f) => (f.customerAttendees || '').trim().length >= 2,
                getMessage: (f, passed) => {
                    const people = f.customerAttendees || '';
                    return people.trim() ? `✓ 客户参会：${people}` : '客户参会人：未填写';
                },
                severity: 'error'
            },
            {
                id: 'qa_count',
                label: '问答记录数量',
                validate: (f) => {
                    const result = validateList(f.qaRecords || f.technicalTopics, {
                        minCount: 5,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.qaRecords || f.technicalTopics, {
                        minCount: 5,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 问答记录：${result.items?.length || 0}条`;
                    return result.message || '问答记录不足5条';
                },
                severity: 'error'
            },
            {
                id: 'qa_quality',
                label: '问答质量',
                validate: (f) => {
                    const list = f.qaRecords || f.technicalTopics || '';
                    if (!list) return false;
                    const items = list.split(/[,，;；\n]+/).filter(i => i.trim());
                    // 每项问答至少20字
                    return items.every(item => item.trim().length >= 15);
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 问答内容充分';
                    return '每条问答记录需≥15字';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_decision_technical',
                label: '客户含技术决策人',
                refTaskCode: '1.2',
                validate: (curr, ref) => {
                    console.log('=== 4.2关联验证: 客户含技术决策人 ===');

                    // 获取客户参会人
                    const attendees = curr.customerAttendees || curr.客户参会人 || '';
                    if (!attendees || attendees.trim().length < 5) {
                        console.log('客户参会人未填写');
                        return null; // 待验证
                    }

                    // 获取1.2决策链
                    const keyPersonList = ref?.keyPersonList || ref?.决策链 || '';
                    if (!keyPersonList || keyPersonList.trim().length < 5) {
                        console.log('1.2决策链未填写');
                        return null; // 待验证
                    }

                    // 提取参会人姓名（中文2-3字）
                    const attendeeNames = attendees.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
                    console.log('参会人姓名:', attendeeNames);

                    // 提取决策链人员
                    const keyPersonNames = keyPersonList.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
                    console.log('决策链人员:', keyPersonNames);

                    // 技术相关职位关键词
                    const techPositions = ['技术', '工程', '研发', '质量', 'IT', '信息', '生产', '工艺'];

                    // 检查参会人是否有技术相关人员
                    const hasTechPerson = techPositions.some(pos =>
                        attendees.includes(pos) || keyPersonList.includes(pos)
                    );

                    // 检查参会人是否在决策链中
                    const inDecisionChain = attendeeNames.some(name =>
                        keyPersonNames.includes(name)
                    );

                    console.log(`有技术人员: ${hasTechPerson}, 在决策链中: ${inDecisionChain}`);

                    // 有技术人员 或 在决策链中都算通过
                    if (hasTechPerson || inDecisionChain) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 客户方有技术负责人或决策人参会',
                failMessage: '⚠️ 参会人不在决策链中，且无技术相关人员，请核实',
                pendingMessage: '⏳ 请先填写客户参会人或完成1.2决策链，再验证',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_technical_meeting',
                label: '技术交流会质量',
                prompt: `请验证任务4.2 技术交流会的内容质量：

验证要点：
1. 客户方是否有技术负责人参会（在决策链中）
2. 5条问答是否互不重复
3. 问答是否有技术深度

评分标准：
- 参会层级足够、问答独立且专业：通过
- 参会层级低或问答敷衍：不通过`,
                targetFields: ['customerAttendees', 'qaRecords', 'technicalTopics']
            }
        ]
    },

    // ==================== 4.3 商务交流会 ====================
    '4.3': {
        fields: {
            meetingDate: { type: 'date', label: '会议时间' },
            commercialDiscussion: { type: 'text', label: '商务讨论记录' },
            priceRange: { type: 'text', label: '价格区间确认' },
            paymentTerms: { type: 'text', label: '账期确认' }
        },
        hardRules: [
            {
                id: 'meeting_date',
                label: '会议时间',
                validate: (f) => (f.meetingDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const time = f.meetingDate || '';
                    return time.trim() ? `✓ 会议时间：${time}` : '会议时间：未填写';
                },
                severity: 'error'
            },
            {
                id: 'commercial_discussion',
                label: '商务讨论记录',
                validate: (f) => {
                    const text = f.commercialDiscussion || f.priceNegotiation || '';
                    return text.length >= 80;
                },
                getMessage: (f, passed) => {
                    const text = f.commercialDiscussion || f.priceNegotiation || '';
                    return text.length >= 80
                        ? `✓ 商务讨论：${text.length}字`
                        : `商务讨论：${text.length}字（需≥80字）`;
                },
                severity: 'error'
            },
            {
                id: 'price_range',
                label: '价格区间确认',
                validate: (f) => {
                    const text = f.priceRange || '';
                    return text.trim() && /\d/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.priceRange || '';
                    if (!text.trim()) return '价格区间：未填写';
                    if (!/\d/.test(text)) return '价格区间：请包含具体数字';
                    return `✓ 价格区间：${text}`;
                },
                severity: 'error'
            },
            {
                id: 'payment_terms',
                label: '账期确认',
                validate: (f) => (f.paymentTerms || '').length >= 15,
                getMessage: (f, passed) => {
                    const text = f.paymentTerms || '';
                    return text.length >= 15
                        ? `✓ 账期：${text}`
                        : `账期：${text.length}字（需≥15字，请说明付款方式和比例）`;
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_bid_price',
                label: '价格区间对照',
                refTaskCode: '4.1',
                validate: (curr, ref) => {
                    if (!ref || !ref.bidPrice) return true;
                    // 简化验证，AI会做更深入检查
                    return true;
                },
                passMessage: '价格讨论与投标价格一致',
                failMessage: '请核实商务讨论价格与投标价格的关系',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_commercial_meeting',
                label: '商务交流会质量',
                prompt: `请验证任务4.3 商务交流会的内容质量：

验证要点：
1. 价格区间是否与4.1报价一致
2. 账期是否明确各阶段付款比例
3. 讨论记录是否有实质内容

评分标准：
- 价格一致、账期明确、讨论深入：通过
- 价格矛盾或账期模糊：不通过`,
                targetFields: ['commercialDiscussion', 'priceNegotiation', 'priceRange', 'paymentTerms']
            }
        ]
    },

    // ==================== 5.1 评分模拟与风险应对 ====================
    '5.1': {
        fields: {
            scoringSimulationFile: { type: 'filename', label: '模拟评分表' },
            expectedScore: { type: 'number', label: '预计得分' },
            riskList: { type: 'list', label: '风险点列表' },
            riskDescription: { type: 'text', label: '风险描述' },
            countermeasures: { type: 'text', label: '应对措施' }
        },
        hardRules: [
            {
                id: 'scoring_simulation',
                label: '模拟评分表',
                validate: (f) => {
                    const file = f.scoringSimulationFile || '';
                    if (!file.trim()) return false;
                    if (!/\.(xlsx?|docx?|pdf)$/i.test(file)) return false;
                    const name = file.replace(/\.[^.]+$/, '');
                    return name.length >= 4;
                },
                getMessage: (f, passed) => {
                    const file = f.scoringSimulationFile || '';
                    if (!file.trim()) return '模拟评分表：未上传';
                    if (!/\.(xlsx?|docx?|pdf)$/i.test(file)) return '模拟评分表：请上传有效文件（xlsx/docx/pdf）';
                    const name = file.replace(/\.[^.]+$/, '');
                    if (name.length < 4) return '模拟评分表：文件名太简单';
                    return `✓ 模拟评分表：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'expected_score',
                label: '预计得分',
                validate: (f) => {
                    const score = parseFloat(f.expectedScore);
                    return !isNaN(score) && score >= 0 && score <= 100;
                },
                getMessage: (f, passed) => {
                    const score = parseFloat(f.expectedScore);
                    if (isNaN(score)) return '预计得分：请填写有效数字';
                    if (score < 0 || score > 100) return '预计得分：应在0-100分之间';
                    return `✓ 预计得分：${score}分`;
                },
                severity: 'error'
            },
            {
                id: 'risk_count',
                label: '风险点数量',
                validate: (f) => {
                    const result = validateList(f.riskList, {
                        minCount: 3,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.riskList, {
                        minCount: 3,
                        minItemLength: 10,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 风险点：${result.items?.length || 0}个`;
                    return result.message || '至少识别3个风险点';
                },
                severity: 'error'
            },
            {
                id: 'risk_description',
                label: '风险描述质量',
                validate: (f) => {
                    const text = f.riskDescription || f.riskList || '';
                    if (text.length < 25) return false;
                    // 检查敷衍内容
                    const lazyPatterns = [
                        /^(可能有风险|有一定风险|风险较低|风险可控|需要注意)$/,
                        /^(无|暂无|略|待定)$/
                    ];
                    for (const pattern of lazyPatterns) {
                        if (pattern.test(text.trim())) return false;
                    }
                    return true;
                },
                getMessage: (f, passed) => {
                    const text = f.riskDescription || f.riskList || '';
                    if (text.length < 25) return `风险描述：${text.length}字（需≥25字）`;
                    if (passed) return `✓ 风险描述：${text.length}字`;
                    return '风险描述：请具体说明风险内容，避免"风险可控""需要注意"等敷衍表述';
                },
                severity: 'error'
            },
            {
                id: 'countermeasures',
                label: '应对措施质量',
                validate: (f) => {
                    const text = f.countermeasures || '';
                    if (text.length < 30) return false;
                    // 检查敷衍内容
                    const lazyPatterns = [
                        /^(加强沟通|密切关注|持续跟进|及时处理|积极应对)$/,
                        /^(无|暂无|略|待定)$/
                    ];
                    for (const pattern of lazyPatterns) {
                        if (pattern.test(text.trim())) return false;
                    }
                    // 应包含具体动作词
                    return /准备|调整|联系|提供|修改|增加|降低|争取|协调/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.countermeasures || '';
                    if (text.length < 30) return `应对措施：${text.length}字（需≥30字）`;
                    if (!passed) return '应对措施：请具体说明应对方案，包含具体行动（如：准备备选方案、联系技术支持等）';
                    return `✓ 应对措施：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'risk_diversity',
                label: '风险类型多样性',
                validate: (f) => {
                    const text = (f.riskList || '') + ' ' + (f.riskDescription || '');
                    // 检查是否覆盖多种风险类型
                    const riskTypes = ['技术', '商务', '价格', '竞争', '交期', '质量', '服务', '资金'];
                    const covered = riskTypes.filter(type => text.includes(type));
                    return covered.length >= 2;
                },
                getMessage: (f, passed) => {
                    if (passed) return '✓ 风险类型覆盖充分';
                    return '风险应覆盖多个维度（如：技术风险、商务风险、竞争风险、交期风险等）';
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_bid_risk',
                label: '风险与投标对照',
                refTaskCode: '4.1',
                validate: (curr, ref) => {
                    // 风险评估应考虑投标价格和技术方案的风险
                    return true; // AI会做更深入检查
                },
                passMessage: '风险评估已考虑投标内容',
                failMessage: '建议结合投标文件识别风险',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_risk_coverage',
                label: '风险覆盖度',
                prompt: `请验证任务5.1 风险应对的内容质量：

验证要点：
1. 3个风险点是否互不重复
2. 是否覆盖多种风险类型（技术/商务/竞争/交期等）
3. 每个风险的应对措施是否具体可执行（而非"加强沟通""密切关注"）

评分标准：
- 风险独立、类型多样、措施具体：通过
- 风险重复或措施敷衍：不通过`,
                targetFields: ['riskList', 'riskDescription', 'countermeasures']
            }
        ]
    },

    // ==================== 6.1 商务谈判 ====================
    '6.1': {
        fields: {
            negotiationDate: { type: 'date', label: '谈判日期' },
            negotiationFile: { type: 'filename', label: '谈判纪要' },
            negotiationRounds: { type: 'number', label: '谈判轮次' },
            customerAttendees: { type: 'text', label: '客户参会人' },
            keyNegotiationPoints: { type: 'list', label: '关键谈判点' },
            concessionRecord: { type: 'text', label: '让步记录' },
            finalPrice: { type: 'number', label: '最终价格' },
            priceReduction: { type: 'number', label: '降价幅度' }
        },
        hardRules: [
            {
                id: 'negotiation_date',
                label: '谈判日期',
                validate: (f) => (f.negotiationDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const date = f.negotiationDate || '';
                    return date.trim() ? `✓ 谈判日期：${date}` : '谈判日期：未填写';
                },
                severity: 'error'
            },
            {
                id: 'negotiation_file',
                label: '谈判纪要',
                validate: (f) => {
                    const file = f.negotiationFile || '';
                    if (!file.trim()) return false;
                    if (!/\.(docx?|pdf)$/i.test(file)) return false;
                    const name = file.replace(/\.[^.]+$/, '');
                    return name.length >= 4;
                },
                getMessage: (f, passed) => {
                    const file = f.negotiationFile || '';
                    if (!file.trim()) return '谈判纪要：未上传';
                    if (!/\.(docx?|pdf)$/i.test(file)) return '谈判纪要：请上传有效文件（docx/pdf）';
                    const name = file.replace(/\.[^.]+$/, '');
                    if (name.length < 4) return '谈判纪要：文件名太简单';
                    return `✓ 谈判纪要：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'negotiation_rounds',
                label: '谈判轮次',
                validate: (f) => {
                    const rounds = parseInt(f.negotiationRounds);
                    return !isNaN(rounds) && rounds >= 1;
                },
                getMessage: (f, passed) => {
                    const rounds = parseInt(f.negotiationRounds);
                    if (isNaN(rounds)) return '谈判轮次：请填写有效数字';
                    if (rounds < 1) return '谈判轮次：至少1轮';
                    return `✓ 谈判轮次：${rounds}轮`;
                },
                severity: 'error'
            },
            {
                id: 'customer_attendees',
                label: '客户参会人',
                validate: (f) => {
                    const attendees = f.customerAttendees || '';
                    if (attendees.trim().length < 2) return false;
                    // 应包含职位信息
                    return /经理|总监|主任|负责人|总|董事|决策|老板/.test(attendees);
                },
                getMessage: (f, passed) => {
                    const attendees = f.customerAttendees || '';
                    if (!attendees.trim()) return '客户参会人：未填写';
                    if (!/经理|总监|主任|负责人|总|董事|决策|老板/.test(attendees)) {
                        return '客户参会人需包含决策层（经理/总监/老板等）';
                    }
                    return `✓ 客户参会人：${attendees}`;
                },
                severity: 'error'
            },
            {
                id: 'key_negotiation_points',
                label: '关键谈判点',
                validate: (f) => {
                    const result = validateList(f.keyNegotiationPoints, {
                        minCount: 3,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    return result.valid;
                },
                getMessage: (f, passed) => {
                    const result = validateList(f.keyNegotiationPoints, {
                        minCount: 3,
                        minItemLength: 15,
                        uniqueRequired: true
                    });
                    if (passed) return `✓ 关键谈判点：${result.items?.length || 0}项`;
                    return result.message || '至少记录3个关键谈判点';
                },
                severity: 'error'
            },
            {
                id: 'concession_record',
                label: '让步记录',
                validate: (f) => {
                    const text = f.concessionRecord || '';
                    if (text.length < 30) return false;
                    // 让步记录应包含具体内容
                    return /让步|降价|优惠|赠送|延长|增加|减免|折扣/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.concessionRecord || '';
                    if (text.length < 30) return `让步记录：${text.length}字（需≥30字）`;
                    if (!passed) return '让步记录：请具体说明让步内容（价格让步、服务让步、交期让步等）';
                    return `✓ 让步记录：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'final_price',
                label: '最终价格',
                validate: (f) => {
                    const price = parseFloat(f.finalPrice);
                    return !isNaN(price) && price > 0;
                },
                getMessage: (f, passed) => {
                    const price = parseFloat(f.finalPrice);
                    if (isNaN(price) || price <= 0) return '最终价格：请填写有效金额';
                    return `✓ 最终价格：${price}万`;
                },
                severity: 'error'
            },
            {
                id: 'price_reduction',
                label: '降价幅度合理性',
                validate: (f) => {
                    const reduction = parseFloat(f.priceReduction);
                    // 降价幅度应在合理范围内（0-30%）
                    return !isNaN(reduction) && reduction >= 0 && reduction <= 30;
                },
                getMessage: (f, passed) => {
                    const reduction = parseFloat(f.priceReduction);
                    if (isNaN(reduction)) return '降价幅度：请填写百分比数字';
                    if (reduction < 0) return '降价幅度：不能为负数';
                    if (reduction > 30) return '降价幅度：超过30%需特别说明';
                    return `✓ 降价幅度：${reduction}%`;
                },
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_price_comparison',
                label: '价格与商务交流一致',
                refTaskCode: '4.3',
                validate: (curr, ref) => {
                    console.log('=== 6.1关联验证: 价格与商务交流一致 ===');

                    // 获取最终价格
                    const finalPrice = parseFloat(curr.finalPrice || curr.最终价格 || 0);
                    if (!finalPrice || finalPrice <= 0) {
                        return null; // 待验证
                    }

                    // 获取4.3的价格区间
                    const priceRange = ref?.priceRange || ref?.价格区间 || ref?.priceNegotiation || '';
                    if (!priceRange) {
                        return null; // 4.3未填写
                    }

                    // 从价格区间提取数字
                    const numbers = priceRange.match(/[\d.]+/g)?.map(Number).filter(n => n > 0) || [];
                    console.log('4.3价格区间数字:', numbers);

                    if (numbers.length === 0) {
                        return null; // 无法提取价格
                    }

                    const minPrice = Math.min(...numbers);
                    const maxPrice = Math.max(...numbers);

                    console.log(`最终价格: ${finalPrice}, 区间: ${minPrice}-${maxPrice}`);

                    // 允许20%的偏差
                    if (finalPrice >= minPrice * 0.8 && finalPrice <= maxPrice * 1.2) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 最终价格在商务交流确认的区间内',
                failMessage: '⚠️ 最终价格与4.3商务交流的价格区间差异较大，请核实',
                pendingMessage: '⏳ 请先完成4.3商务交流，再验证价格一致性',
                severity: 'warning'
            },
            {
                id: 'cross_bid_price',
                label: '与投标价格对比',
                refTaskCode: '4.1',
                validate: (curr, ref) => {
                    console.log('=== 6.1关联验证: 与投标价格对比 ===');

                    const finalPrice = parseFloat(curr.finalPrice || curr.最终价格 || 0);
                    if (!finalPrice || finalPrice <= 0) {
                        return null; // 待验证
                    }

                    const bidPrice = parseFloat(ref?.bidPrice || ref?.投标价格 || 0);
                    if (!bidPrice || bidPrice <= 0) {
                        return null; // 4.1未填写
                    }

                    console.log(`最终价格: ${finalPrice}, 投标价格: ${bidPrice}`);

                    // 计算变化幅度
                    const changePercent = ((bidPrice - finalPrice) / bidPrice * 100).toFixed(1);
                    console.log(`价格变化: ${changePercent}%`);

                    // 最终价格不应低于投标价格的70%（降幅不超过30%）
                    // 最终价格不应高于投标价格的110%（涨幅不超过10%）
                    if (finalPrice > bidPrice * 1.1) {
                        return false; // 价格上涨超过10%，异常
                    }

                    if (finalPrice < bidPrice * 0.7) {
                        return false; // 降价超过30%，异常
                    }

                    return true;
                },
                passMessage: '✓ 价格变动在合理范围内（降幅≤30%）',
                failMessage: '⚠️ 最终价格与投标价格差异过大，请核实原因',
                pendingMessage: '⏳ 请先完成4.1投标文件，再验证价格变动',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_negotiation_quality',
                label: '谈判质量评估',
                prompt: `请验证任务6.1 商务谈判的内容质量：

验证要点：
1. 客户方是否有决策层参与
2. 关键谈判点是否覆盖价格、账期、服务等多维度
3. 让步记录是否有对等交换（我方让步的同时客户也有让步）
4. 降价幅度是否在合理区间

评分标准：
- 决策层参与、谈判点全面、让步对等：通过
- 只是单方让价或谈判点单一：不通过`,
                targetFields: ['customerAttendees', 'keyNegotiationPoints', 'concessionRecord', 'finalPrice', 'priceReduction']
            }
        ]
    },

    // ==================== 7.1 合同签订 ====================
    '7.1': {
        fields: {
            contractDate: { type: 'date', label: '签约日期' },
            contractFile: { type: 'filename', label: '合同文件' },
            contractNumber: { type: 'text', label: '合同编号' },
            contractAmount: { type: 'number', label: '合同金额' },
            paymentTerms: { type: 'text', label: '付款条款' },
            deliveryTerms: { type: 'text', label: '交付条款' },
            warrantyTerms: { type: 'text', label: '质保条款' },
            signatoryCustomer: { type: 'text', label: '客户签署人' },
            signatoryOur: { type: 'text', label: '我方签署人' }
        },
        hardRules: [
            {
                id: 'contract_date',
                label: '签约日期',
                validate: (f) => (f.contractDate || '').trim().length >= 8,
                getMessage: (f, passed) => {
                    const date = f.contractDate || '';
                    return date.trim() ? `✓ 签约日期：${date}` : '签约日期：未填写';
                },
                severity: 'error'
            },
            {
                id: 'contract_file',
                label: '合同文件',
                validate: (f) => {
                    const file = f.contractFile || '';
                    if (!file.trim()) return false;
                    if (!/\.(pdf|docx?)$/i.test(file)) return false;
                    const name = file.replace(/\.[^.]+$/, '');
                    return name.length >= 6;
                },
                getMessage: (f, passed) => {
                    const file = f.contractFile || '';
                    if (!file.trim()) return '合同文件：未上传';
                    if (!/\.(pdf|docx?)$/i.test(file)) return '合同文件：请上传有效文件（pdf/docx）';
                    const name = file.replace(/\.[^.]+$/, '');
                    if (name.length < 6) return '合同文件：文件名太简单（应包含合同编号或项目名）';
                    return `✓ 合同文件：${file}`;
                },
                severity: 'error'
            },
            {
                id: 'contract_number',
                label: '合同编号',
                validate: (f) => {
                    const num = f.contractNumber || '';
                    if (num.trim().length < 5) return false;
                    // 合同编号通常包含字母和数字
                    return /[A-Za-z]/.test(num) || /\d{4,}/.test(num);
                },
                getMessage: (f, passed) => {
                    const num = f.contractNumber || '';
                    if (!num.trim()) return '合同编号：未填写';
                    if (num.trim().length < 5) return '合同编号：格式过于简单';
                    if (passed) return `✓ 合同编号：${num}`;
                    return '合同编号：格式不正确（应包含字母或4位以上数字）';
                },
                severity: 'error'
            },
            {
                id: 'contract_amount',
                label: '合同金额',
                validate: (f) => {
                    const amount = parseFloat(f.contractAmount);
                    return !isNaN(amount) && amount > 0;
                },
                getMessage: (f, passed) => {
                    const amount = parseFloat(f.contractAmount);
                    if (isNaN(amount) || amount <= 0) return '合同金额：请填写有效金额';
                    return `✓ 合同金额：${amount}万`;
                },
                severity: 'error'
            },
            {
                id: 'payment_terms',
                label: '付款条款',
                validate: (f) => {
                    const text = f.paymentTerms || '';
                    if (text.length < 30) return false;
                    // 付款条款应包含百分比和付款节点
                    return /\d+%/.test(text) || /预付|尾款|验收|到货|月结/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.paymentTerms || '';
                    if (text.length < 30) return `付款条款：${text.length}字（需≥30字）`;
                    if (!passed) return '付款条款：请具体说明付款比例和节点（如：预付30%、到货验收50%、尾款20%）';
                    return `✓ 付款条款：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'delivery_terms',
                label: '交付条款',
                validate: (f) => {
                    const text = f.deliveryTerms || '';
                    if (text.length < 20) return false;
                    // 交付条款应包含时间或数量信息
                    return /\d/.test(text) && /天|周|月|日|批|次|件/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.deliveryTerms || '';
                    if (text.length < 20) return `交付条款：${text.length}字（需≥20字）`;
                    if (!passed) return '交付条款：请说明具体交付时间和数量（如：合同签订后30天内交付首批1000件）';
                    return `✓ 交付条款：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'warranty_terms',
                label: '质保条款',
                validate: (f) => {
                    const text = f.warrantyTerms || '';
                    if (text.length < 15) return false;
                    // 质保条款应包含时间
                    return /\d/.test(text) && /年|月|天|日/.test(text);
                },
                getMessage: (f, passed) => {
                    const text = f.warrantyTerms || '';
                    if (text.length < 15) return `质保条款：${text.length}字（需≥15字）`;
                    if (!passed) return '质保条款：请说明质保期限（如：质保期1年，自验收合格之日起计算）';
                    return `✓ 质保条款：${text.length}字`;
                },
                severity: 'error'
            },
            {
                id: 'signatory_customer',
                label: '客户签署人',
                validate: (f) => {
                    const person = f.signatoryCustomer || '';
                    if (person.trim().length < 2) return false;
                    // 签署人应包含职位
                    return /经理|总监|主任|负责人|总|董事|法定代表人|授权代表/.test(person);
                },
                getMessage: (f, passed) => {
                    const person = f.signatoryCustomer || '';
                    if (!person.trim()) return '客户签署人：未填写';
                    if (!passed) return '客户签署人：请包含姓名和职位（如：张三-采购总监）';
                    return `✓ 客户签署人：${person}`;
                },
                severity: 'error'
            },
            {
                id: 'signatory_our',
                label: '我方签署人',
                validate: (f) => {
                    const person = f.signatoryOur || '';
                    return person.trim().length >= 2;
                },
                getMessage: (f, passed) => {
                    const person = f.signatoryOur || '';
                    return person.trim() ? `✓ 我方签署人：${person}` : '我方签署人：未填写';
                },
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_final_amount',
                label: '金额一致性',
                refTaskCode: '6.1',
                validate: (curr, ref) => {
                    console.log('=== 7.1关联验证: 与谈判价格一致性 ===');

                    const contractAmount = parseFloat(curr.contractAmount || curr.签约金额 || 0);
                    if (!contractAmount || contractAmount <= 0) {
                        return null; // 待验证
                    }

                    const negotiatedPrice = parseFloat(ref?.finalPrice || ref?.最终价格 || 0);
                    if (!negotiatedPrice || negotiatedPrice <= 0) {
                        return null; // 6.1未填写
                    }

                    console.log(`签约金额: ${contractAmount}, 谈判价格: ${negotiatedPrice}`);

                    const diff = Math.abs(contractAmount - negotiatedPrice) / negotiatedPrice;
                    const diffPercent = (diff * 100).toFixed(1);
                    console.log(`差异: ${diffPercent}%`);

                    // 差异应≤5%
                    if (diff <= 0.05) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 签约金额与谈判价格一致（差异≤5%）',
                failMessage: '⚠️ 签约金额与6.1谈判价格差异超过5%，请核实原因',
                pendingMessage: '⏳ 请先完成6.1商务谈判，再验证金额一致性',
                severity: 'warning'
            },
            {
                id: 'cross_payment_terms',
                label: '付款条款一致性',
                refTaskCode: '4.3',
                validate: (curr, ref) => {
                    console.log('=== 7.1关联验证: 付款条款一致性 ===');

                    // 获取合同付款条款
                    const contractTerms = curr.paymentTerms || curr.付款条款 || curr.账期 || '';
                    if (!contractTerms || contractTerms.trim().length < 3) {
                        return null; // 待验证
                    }

                    // 获取4.3商务交流的账期
                    const commercialTerms = ref?.paymentTerms || ref?.账期 || ref?.付款方式 || '';
                    if (!commercialTerms || commercialTerms.trim().length < 3) {
                        return null; // 4.3未填写账期
                    }

                    // 提取付款比例数字进行比较
                    const contractNumbers = contractTerms.match(/\d+/g)?.map(Number) || [];
                    const commercialNumbers = commercialTerms.match(/\d+/g)?.map(Number) || [];

                    console.log('合同条款数字:', contractNumbers);
                    console.log('商务协商数字:', commercialNumbers);

                    // 如果提取不到数字，交给AI验证
                    if (contractNumbers.length === 0 || commercialNumbers.length === 0) {
                        return true; // 无法自动验证，默认通过，交给AI
                    }

                    // 检查主要付款比例是否一致
                    const mainRatioMatch = contractNumbers.some(n =>
                        commercialNumbers.includes(n)
                    );

                    return mainRatioMatch;
                },
                passMessage: '✓ 付款条款与商务协商一致',
                failMessage: '⚠️ 付款条款与4.3商务协商的账期不一致，请核实',
                pendingMessage: '⏳ 请先完成4.3商务交流，再验证付款条款',
                severity: 'warning'
            },
            {
                id: 'cross_project_amount',
                label: '与预算对比',
                refTaskCode: '1.1',
                validate: (curr, ref) => {
                    console.log('=== 7.1关联验证: 与项目预算对比 ===');

                    const contractAmount = parseFloat(curr.contractAmount || curr.签约金额 || 0);
                    if (!contractAmount || contractAmount <= 0) {
                        return null; // 待验证
                    }

                    // 从1.1的A描述中提取预算金额
                    const aDesc = ref?.aDescription || ref?.A_描述 || '';
                    if (!aDesc) {
                        return null; // 1.1未填写
                    }

                    // 提取金额数字
                    const budgetNumbers = aDesc.match(/[\d.]+/g)?.map(Number).filter(n => n > 0) || [];
                    console.log('预算描述中的数字:', budgetNumbers);

                    if (budgetNumbers.length === 0) {
                        return null; // 无法提取预算
                    }

                    // 取最大的数字作为预算
                    const budget = Math.max(...budgetNumbers);
                    console.log(`签约金额: ${contractAmount}, 预算: ${budget}`);

                    // 签约金额应在预算的50%-150%范围内
                    if (contractAmount >= budget * 0.5 && contractAmount <= budget * 1.5) {
                        return true;
                    }

                    return false;
                },
                passMessage: '✓ 签约金额在预算合理范围内',
                failMessage: '⚠️ 签约金额与1.1项目预算差异较大，请核实',
                pendingMessage: '⏳ 请先完成1.1 MAN分析的A描述，再验证预算',
                severity: 'warning'
            }
        ],
        aiRules: [
            {
                id: 'ai_contract_completeness',
                label: '合同完整性评估',
                prompt: `请验证任务7.1 合同签订的内容质量：

验证要点：
1. 合同金额是否与6.1谈判最终价格一致（差异≤5%）
2. 付款条款是否完整（有预付、到货/验收、尾款的比例）
3. 交付条款是否明确（有具体时间和数量）
4. 质保条款是否合理（服装行业一般6-12个月）
5. 签署人是否有足够权限

评分标准：
- 金额一致、条款完整、签署规范：通过
- 金额有差异或条款模糊：不通过`,
                targetFields: ['contractAmount', 'paymentTerms', 'deliveryTerms', 'warrantyTerms', 'signatoryCustomer']
            }
        ]
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
