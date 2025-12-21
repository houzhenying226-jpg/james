/**
 * 销售考核系统 - 结构化任务模板
 *
 * 设计原则：
 * 1. 字段固定：每个任务有固定的字段，不允许自由发挥
 * 2. 类型明确：每个字段有明确的类型（text/number/select/radio/checkbox/date/file/list）
 * 3. 选项约束：尽量用选择题代替填空题
 * 4. 便于比对：字段名称统一，便于版本间比对
 */

// ==================== 字段类型定义 ====================
/*
类型说明：
- text: 单行文本
- textarea: 多行文本
- number: 数字
- radio: 单选（是/否 或 自定义选项）
- checkbox: 多选
- select: 下拉选择
- date: 日期
- file: 文件上传
- list: 列表项（可添加多条）
- person: 人员信息（姓名+职位+部门）
*/

// ==================== 任务1.1 MAN分析与项目立项 ====================
const TASK_1_1_TEMPLATE = {
    taskCode: '1.1',
    taskName: 'MAN分析与项目立项',
    description: '完成客户MAN分析（需求M、资金A、决策人N），上传立项报告',

    sections: [
        {
            id: 'section_m',
            title: 'M - 需求确认',
            description: '确认客户是否有明确需求',
            fields: [
                {
                    id: 'm_confirmed',
                    label: 'M(需求)确认',
                    type: 'radio',
                    options: ['是', '否'],
                    required: true,
                    helpText: '客户是否有明确的服装采购需求'
                },
                {
                    id: 'm_product_type',
                    label: '需求产品类型',
                    type: 'checkbox',
                    options: ['男士西服', '女士西服', '衬衫', '西裤', '工装', '保安服', '制服', '其他'],
                    required: true,
                    condition: { field: 'm_confirmed', value: '是' },
                    helpText: '可多选'
                },
                {
                    id: 'm_product_other',
                    label: '其他产品说明',
                    type: 'text',
                    required: true,
                    condition: { field: 'm_product_type', contains: '其他' },
                    validation: { minLength: 2, maxLength: 50 }
                },
                {
                    id: 'm_quantity',
                    label: '需求数量',
                    type: 'number',
                    unit: '套/件',
                    required: true,
                    condition: { field: 'm_confirmed', value: '是' },
                    validation: { min: 1, max: 100000 },
                    helpText: '预计采购总数量'
                },
                {
                    id: 'm_delivery_time',
                    label: '期望交期',
                    type: 'date',
                    required: true,
                    condition: { field: 'm_confirmed', value: '是' },
                    validation: { minDate: 'today' }
                },
                {
                    id: 'm_purpose',
                    label: '采购用途',
                    type: 'select',
                    options: ['新员工入职', '换装更新', '特殊活动', '季节性采购', '其他'],
                    required: true,
                    condition: { field: 'm_confirmed', value: '是' }
                },
                {
                    id: 'm_purpose_detail',
                    label: '用途详细说明',
                    type: 'textarea',
                    required: true,
                    condition: { field: 'm_purpose', value: '其他' },
                    validation: { minLength: 10, maxLength: 200 }
                },
                {
                    id: 'm_no_reason',
                    label: '无需求原因',
                    type: 'select',
                    options: ['暂无计划', '已有供应商', '预算未批', '其他'],
                    required: true,
                    condition: { field: 'm_confirmed', value: '否' }
                }
            ]
        },
        {
            id: 'section_a',
            title: 'A - 资金确认',
            description: '确认客户是否有采购预算',
            fields: [
                {
                    id: 'a_confirmed',
                    label: 'A(资金)确认',
                    type: 'radio',
                    options: ['是', '否'],
                    required: true,
                    helpText: '客户是否有明确的采购预算'
                },
                {
                    id: 'a_budget_amount',
                    label: '预算金额',
                    type: 'number',
                    unit: '万元',
                    required: true,
                    condition: { field: 'a_confirmed', value: '是' },
                    validation: { min: 0.1, max: 10000 }
                },
                {
                    id: 'a_budget_status',
                    label: '预算状态',
                    type: 'select',
                    options: ['已列入年度计划', '已获批准', '待审批', '需临时申请'],
                    required: true,
                    condition: { field: 'a_confirmed', value: '是' }
                },
                {
                    id: 'a_fund_source',
                    label: '资金来源',
                    type: 'select',
                    options: ['行政经费', '项目经费', '专项资金', '工会经费', '其他'],
                    required: true,
                    condition: { field: 'a_confirmed', value: '是' }
                },
                {
                    id: 'a_payment_method',
                    label: '付款方式倾向',
                    type: 'select',
                    options: ['预付全款', '预付30%', '预付50%', '货到付款', '账期结算'],
                    required: false,
                    condition: { field: 'a_confirmed', value: '是' }
                },
                {
                    id: 'a_no_reason',
                    label: '无预算原因',
                    type: 'select',
                    options: ['预算未列', '资金紧张', '需逐级申请', '其他'],
                    required: true,
                    condition: { field: 'a_confirmed', value: '否' }
                }
            ]
        },
        {
            id: 'section_n',
            title: 'N - 决策人确认',
            description: '确认是否接触到采购决策人',
            fields: [
                {
                    id: 'n_confirmed',
                    label: 'N(决策人)确认',
                    type: 'radio',
                    options: ['是', '否'],
                    required: true,
                    helpText: '是否已接触到能做采购决策的人'
                },
                {
                    id: 'n_decision_maker_name',
                    label: '决策人姓名',
                    type: 'text',
                    required: true,
                    condition: { field: 'n_confirmed', value: '是' },
                    validation: {
                        pattern: '^[\\u4e00-\\u9fa5]{2,4}$',
                        message: '请输入2-4个汉字'
                    }
                },
                {
                    id: 'n_decision_maker_position',
                    label: '决策人职位',
                    type: 'select',
                    options: ['总经理', '副总经理', '部门总监', '部门经理', '科长/主管', '其他'],
                    required: true,
                    condition: { field: 'n_confirmed', value: '是' }
                },
                {
                    id: 'n_decision_maker_department',
                    label: '所属部门',
                    type: 'select',
                    options: ['行政部', '采购部', '人力资源部', '办公室', '后勤部', '总经办', '其他'],
                    required: true,
                    condition: { field: 'n_confirmed', value: '是' }
                },
                {
                    id: 'n_approval_limit',
                    label: '审批权限',
                    type: 'select',
                    options: ['5万以下', '5-10万', '10-50万', '50-100万', '100万以上', '无限额', '不清楚'],
                    required: true,
                    condition: { field: 'n_confirmed', value: '是' }
                },
                {
                    id: 'n_contact_phone',
                    label: '联系电话',
                    type: 'text',
                    required: false,
                    condition: { field: 'n_confirmed', value: '是' },
                    validation: {
                        pattern: '^1[3-9]\\d{9}$',
                        message: '请输入正确的手机号'
                    }
                },
                {
                    id: 'n_no_reason',
                    label: '未接触决策人原因',
                    type: 'select',
                    options: ['尚在接触执行层', '决策人不明确', '对方回避', '其他'],
                    required: true,
                    condition: { field: 'n_confirmed', value: '否' }
                }
            ]
        },
        {
            id: 'section_report',
            title: '立项报告',
            description: '上传立项报告文件',
            fields: [
                {
                    id: 'project_report_file',
                    label: '立项报告文件',
                    type: 'file',
                    accept: '.docx,.doc,.pdf,.xlsx,.xls',
                    required: true,
                    helpText: '支持Word、PDF、Excel格式'
                }
            ]
        },
        {
            id: 'section_remarks',
            title: '备注',
            description: '其他需要说明的情况',
            fields: [
                {
                    id: 'remarks',
                    label: '备注说明',
                    type: 'textarea',
                    required: false,
                    validation: { maxLength: 500 }
                }
            ]
        }
    ],

    // 版本演变验证配置
    versionValidation: {
        // 关键字段（变化时需特别关注）
        keyFields: ['m_confirmed', 'a_confirmed', 'n_confirmed', 'a_budget_amount', 'n_decision_maker_name'],
        // 允许的变化
        allowedChanges: {
            'm_confirmed': { '否→是': 'normal', '是→否': 'warning' },
            'a_confirmed': { '否→是': 'normal', '是→否': 'warning' },
            'n_confirmed': { '否→是': 'normal', '是→否': 'warning' },
            'a_budget_amount': { threshold: 0.20 }
        }
    }
};

// ==================== 任务4.0 招标情报与评委布局 ====================
const TASK_4_0_TEMPLATE = {
    taskCode: '4.0',
    taskName: '招标情报与评委布局',
    description: '收集招标情报，分析评委构成，制定攻关策略',

    sections: [
        // Section 1: 基础信息 - 始终显示
        {
            id: 'section_basic',
            title: '基础信息',
            description: '招标基本信息',
            fields: [
                {
                    id: 'bidding_method',
                    label: '招标方式',
                    type: 'radio',
                    options: ['公开招标', '邀请招标', '内部比价', '竞争性谈判', '单一来源采购'],
                    required: true,
                    helpText: '选择客户采用的采购方式'
                },
                {
                    id: 'expected_bid_date',
                    label: '预计开标时间',
                    type: 'date',
                    required: true,
                    helpText: '预计开标或评审的时间'
                },
                {
                    id: 'bid_project_number',
                    label: '招标项目编号',
                    type: 'text',
                    required: false,
                    validation: { maxLength: 50 },
                    helpText: '如有招标编号请填写'
                }
            ]
        },

        // Section 2: 第三方招标公司信息 - 条件显示（公开招标或邀请招标时显示）
        {
            id: 'section_agency',
            title: '第三方招标公司信息',
            description: '招标代理公司信息（如有）',
            condition: { field: 'bidding_method', values: ['公开招标', '邀请招标'] },
            fields: [
                {
                    id: 'agency_name',
                    label: '招标公司名称',
                    type: 'text',
                    required: true,
                    condition: { field: 'bidding_method', values: ['公开招标', '邀请招标'] },
                    validation: { minLength: 2, maxLength: 100 }
                },
                {
                    id: 'agency_contact_name',
                    label: '负责人',
                    type: 'text',
                    required: true,
                    condition: { field: 'bidding_method', values: ['公开招标', '邀请招标'] },
                    validation: { minLength: 2, maxLength: 20 }
                },
                {
                    id: 'agency_contact_phone',
                    label: '联系方式',
                    type: 'text',
                    required: true,
                    condition: { field: 'bidding_method', values: ['公开招标', '邀请招标'] },
                    validation: { pattern: '^[0-9-]{7,20}$', message: '请输入有效的电话号码' }
                },
                {
                    id: 'agency_relationship',
                    label: '关系程度',
                    type: 'radio',
                    options: ['无联系', '初步接触', '熟悉', '深度合作'],
                    required: true,
                    condition: { field: 'bidding_method', values: ['公开招标', '邀请招标'] },
                    helpText: '与该招标公司的关系程度'
                }
            ]
        },

        // Section 3: 内部评审规则 - 条件显示（内部比价或竞争性谈判时显示）
        {
            id: 'section_internal_rules',
            title: '内部评审规则',
            description: '客户内部评审规则信息',
            condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
            fields: [
                {
                    id: 'evaluation_method',
                    label: '评审方式',
                    type: 'radio',
                    options: ['综合评分法', '最低价法', '性价比法'],
                    required: true,
                    condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
                    helpText: '客户采用的评审打分方式'
                },
                {
                    id: 'technical_score_ratio',
                    label: '技术分占比',
                    type: 'number',
                    unit: '%',
                    required: true,
                    condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
                    validation: { min: 0, max: 100 }
                },
                {
                    id: 'commercial_score_ratio',
                    label: '商务分占比',
                    type: 'number',
                    unit: '%',
                    required: true,
                    condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
                    validation: { min: 0, max: 100 }
                },
                {
                    id: 'other_score_items',
                    label: '其他评分项',
                    type: 'text',
                    required: false,
                    condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
                    validation: { maxLength: 200 },
                    helpText: '如有其他评分项请说明（如服务分、资质分等）'
                },
                {
                    id: 'scoring_rule_file',
                    label: '评分规则文件',
                    type: 'file',
                    accept: '.docx,.doc,.pdf,.xlsx,.xls',
                    required: false,
                    condition: { field: 'bidding_method', values: ['内部比价', '竞争性谈判'] },
                    helpText: '上传评分规则文件（如有）'
                }
            ]
        },

        // Section 4: 评委构成分析 - 始终显示
        {
            id: 'section_jury',
            title: '评委构成分析',
            description: '评委信息与关系分析',
            fields: [
                {
                    id: 'jury_total_count',
                    label: '评委总人数',
                    type: 'number',
                    required: true,
                    validation: { min: 1, max: 20 },
                    helpText: '参与评审的评委总人数'
                },
                {
                    id: 'jury_list',
                    label: '评委列表',
                    type: 'list',
                    required: true,
                    helpText: '添加每位评委的详细信息',
                    itemFields: [
                        {
                            id: 'name',
                            label: '姓名',
                            type: 'text',
                            required: true,
                            validation: { minLength: 2, maxLength: 10 }
                        },
                        {
                            id: 'department',
                            label: '部门',
                            type: 'text',
                            required: true,
                            validation: { minLength: 2, maxLength: 30 }
                        },
                        {
                            id: 'position',
                            label: '职位',
                            type: 'text',
                            required: true,
                            validation: { minLength: 2, maxLength: 30 }
                        },
                        {
                            id: 'jury_type',
                            label: '评委类型',
                            type: 'select',
                            options: ['技术评委', '商务评委', '采购评委', '领导评委'],
                            required: true
                        },
                        {
                            id: 'influence',
                            label: '话语权',
                            type: 'radio',
                            options: ['高', '中', '低'],
                            required: true
                        },
                        {
                            id: 'relationship',
                            label: '关系程度',
                            type: 'radio',
                            options: ['支持我方', '中立', '倾向竞品', '未知'],
                            required: true
                        },
                        {
                            id: 'our_contact',
                            label: '维护人',
                            type: 'text',
                            required: false,
                            validation: { maxLength: 10 },
                            helpText: '我方对接此评委的销售人员'
                        }
                    ]
                }
            ]
        },

        // Section 5: 攻关计划与自评 - 始终显示
        {
            id: 'section_strategy',
            title: '攻关计划与自评',
            description: '针对评委的攻关策略和整体评估',
            fields: [
                {
                    id: 'attack_strategy',
                    label: '攻关策略',
                    type: 'textarea',
                    required: true,
                    validation: { minLength: 50, maxLength: 1000 },
                    helpText: '针对各评委的攻关策略和计划（至少50字）'
                },
                {
                    id: 'confidence_level',
                    label: '整体把握程度',
                    type: 'radio',
                    options: ['非常有把握', '比较有把握', '一般', '较弱', '很弱'],
                    required: true,
                    helpText: '自评中标把握程度'
                },
                {
                    id: 'resource_needs',
                    label: '需要协调的资源',
                    type: 'textarea',
                    required: false,
                    validation: { maxLength: 500 },
                    helpText: '需要公司或领导协调支持的资源'
                }
            ]
        }
    ],

    // 版本演变验证配置
    versionValidation: {
        keyFields: ['bidding_method', 'jury_total_count', 'confidence_level', 'jury_list'],
        allowedChanges: {
            'confidence_level': {
                '很弱→较弱': 'normal',
                '较弱→一般': 'normal',
                '一般→比较有把握': 'normal',
                '比较有把握→非常有把握': 'normal',
                '非常有把握→比较有把握': 'warning',
                '比较有把握→一般': 'warning',
                '一般→较弱': 'warning',
                '较弱→很弱': 'warning'
            },
            'jury_total_count': { threshold: 0.30 }
        }
    }
};

// ==================== 模板工具函数 ====================

const TaskTemplates = {
    // 模板存储
    templates: {
        '1.1': TASK_1_1_TEMPLATE,
        '4.0': TASK_4_0_TEMPLATE
        // 后续添加其他任务模板
    },

    /**
     * 获取任务模板
     */
    getTemplate(taskCode) {
        return this.templates[taskCode] || null;
    },

    /**
     * 检查任务是否有模板
     */
    hasTemplate(taskCode) {
        return !!this.templates[taskCode];
    },

    /**
     * 获取所有字段定义（扁平化）
     */
    getFields(taskCode) {
        const template = this.getTemplate(taskCode);
        if (!template) return [];

        const fields = [];
        template.sections.forEach(section => {
            section.fields.forEach(field => {
                fields.push({
                    ...field,
                    sectionId: section.id,
                    sectionTitle: section.title
                });
            });
        });
        return fields;
    },

    /**
     * 获取字段定义
     */
    getField(taskCode, fieldId) {
        const fields = this.getFields(taskCode);
        return fields.find(f => f.id === fieldId) || null;
    },

    /**
     * 检查字段是否应该显示（基于条件）
     */
    shouldShowField(field, formData) {
        if (!field.condition) return true;

        const { field: condField, value, contains } = field.condition;
        const condValue = formData[condField];

        if (value !== undefined) {
            return condValue === value;
        }

        if (contains !== undefined) {
            if (Array.isArray(condValue)) {
                return condValue.includes(contains);
            }
            return String(condValue).includes(contains);
        }

        return true;
    },

    /**
     * 验证字段值
     */
    validateField(field, value, formData) {
        const errors = [];

        // 检查条件显示
        if (!this.shouldShowField(field, formData)) {
            return { valid: true, errors: [] };
        }

        // 必填检查
        if (field.required) {
            if (value === undefined || value === null || value === '') {
                errors.push(`${field.label}为必填项`);
            } else if (Array.isArray(value) && value.length === 0) {
                errors.push(`${field.label}至少选择一项`);
            }
        }

        // 如果值为空且非必填，跳过后续验证
        if (!value && !field.required) {
            return { valid: true, errors: [] };
        }

        // 验证规则
        if (field.validation) {
            const v = field.validation;

            // 最小长度
            if (v.minLength && String(value).length < v.minLength) {
                errors.push(`${field.label}至少${v.minLength}个字符`);
            }

            // 最大长度
            if (v.maxLength && String(value).length > v.maxLength) {
                errors.push(`${field.label}最多${v.maxLength}个字符`);
            }

            // 最小值
            if (v.min !== undefined && parseFloat(value) < v.min) {
                errors.push(`${field.label}最小值为${v.min}`);
            }

            // 最大值
            if (v.max !== undefined && parseFloat(value) > v.max) {
                errors.push(`${field.label}最大值为${v.max}`);
            }

            // 正则匹配
            if (v.pattern) {
                const regex = new RegExp(v.pattern);
                if (!regex.test(String(value))) {
                    errors.push(v.message || `${field.label}格式不正确`);
                }
            }

            // 最小日期
            if (v.minDate === 'today' && field.type === 'date') {
                const today = new Date().toISOString().split('T')[0];
                if (value < today) {
                    errors.push(`${field.label}不能早于今天`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * 验证表单数据
     */
    validateForm(taskCode, formData) {
        const fields = this.getFields(taskCode);
        const allErrors = [];
        let allValid = true;

        fields.forEach(field => {
            const value = formData[field.id];
            const result = this.validateField(field, value, formData);

            if (!result.valid) {
                allValid = false;
                allErrors.push(...result.errors);
            }
        });

        return {
            valid: allValid,
            errors: allErrors
        };
    },

    /**
     * 生成表单HTML
     */
    renderForm(taskCode, formData = {}, options = {}) {
        const template = this.getTemplate(taskCode);
        if (!template) {
            return '<div class="error">模板未找到</div>';
        }

        let html = `<div class="structured-form" data-task="${taskCode}">`;

        template.sections.forEach(section => {
            html += `
                <div class="form-section" data-section="${section.id}">
                    <h3 class="section-title">${section.title}</h3>
                    ${section.description ? `<p class="section-desc">${section.description}</p>` : ''}
                    <div class="section-fields">
            `;

            section.fields.forEach(field => {
                const show = this.shouldShowField(field, formData);
                const value = formData[field.id];

                html += `
                    <div class="form-field ${show ? '' : 'hidden'}"
                         data-field="${field.id}"
                         data-condition='${JSON.stringify(field.condition || {})}'>
                        <label class="field-label ${field.required ? 'required' : ''}">
                            ${field.label}
                            ${field.unit ? `<span class="unit">(${field.unit})</span>` : ''}
                        </label>
                        ${this.renderFieldInput(field, value)}
                        ${field.helpText ? `<span class="help-text">${field.helpText}</span>` : ''}
                        <span class="error-text"></span>
                    </div>
                `;
            });

            html += '</div></div>';
        });

        html += '</div>';
        return html;
    },

    /**
     * 渲染字段输入控件
     */
    renderFieldInput(field, value) {
        const id = field.id;
        const disabled = field.disabled ? 'disabled' : '';

        switch (field.type) {
            case 'text':
                return `<input type="text" id="${id}" name="${id}"
                        value="${value || ''}"
                        class="form-input" ${disabled}
                        ${field.validation?.maxLength ? `maxlength="${field.validation.maxLength}"` : ''}>`;

            case 'textarea':
                return `<textarea id="${id}" name="${id}"
                        class="form-textarea" ${disabled}
                        ${field.validation?.maxLength ? `maxlength="${field.validation.maxLength}"` : ''}
                        rows="3">${value || ''}</textarea>`;

            case 'number':
                return `<input type="number" id="${id}" name="${id}"
                        value="${value || ''}"
                        class="form-input" ${disabled}
                        ${field.validation?.min !== undefined ? `min="${field.validation.min}"` : ''}
                        ${field.validation?.max !== undefined ? `max="${field.validation.max}"` : ''}>`;

            case 'date':
                return `<input type="date" id="${id}" name="${id}"
                        value="${value || ''}"
                        class="form-input" ${disabled}>`;

            case 'radio':
                return `<div class="radio-group">
                    ${field.options.map(opt => `
                        <label class="radio-label">
                            <input type="radio" name="${id}" value="${opt}"
                                   ${value === opt ? 'checked' : ''} ${disabled}>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>`;

            case 'checkbox':
                const selectedValues = Array.isArray(value) ? value : [];
                return `<div class="checkbox-group">
                    ${field.options.map(opt => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="${id}" value="${opt}"
                                   ${selectedValues.includes(opt) ? 'checked' : ''} ${disabled}>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>`;

            case 'select':
                return `<select id="${id}" name="${id}" class="form-select" ${disabled}>
                    <option value="">请选择</option>
                    ${field.options.map(opt => `
                        <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                </select>`;

            case 'file':
                return `<div class="file-input-wrapper">
                    <input type="file" id="${id}" name="${id}"
                           class="form-file" ${disabled}
                           ${field.accept ? `accept="${field.accept}"` : ''}>
                    ${value ? `<span class="file-name">${value}</span>` : ''}
                </div>`;

            default:
                return `<input type="text" id="${id}" name="${id}"
                        value="${value || ''}" class="form-input" ${disabled}>`;
        }
    },

    /**
     * 从结构化数据生成版本比对表格
     */
    renderVersionComparison(taskCode, versions) {
        const fields = this.getFields(taskCode);
        if (versions.length < 2) {
            return '<div>版本不足，无法比对</div>';
        }

        let html = '<table class="version-compare-table">';

        // 表头
        html += '<thead><tr><th>字段</th>';
        versions.forEach(v => {
            html += `<th>${v.version || v.versionId}</th>`;
        });
        html += '<th>变化判断</th></tr></thead>';

        // 表体
        html += '<tbody>';
        fields.forEach(field => {
            html += '<tr>';
            html += `<td class="field-name">${field.label}</td>`;

            let prevValue = null;
            let changeClass = '';
            let changeText = '';

            versions.forEach((v, idx) => {
                const data = v.fields || v.data || {};
                const value = data[field.id];
                const displayValue = this.formatValue(field, value);

                html += `<td>${displayValue}</td>`;

                // 检测变化
                if (idx > 0 && prevValue !== null) {
                    const change = this.detectFieldChange(field, prevValue, value);
                    if (change) {
                        changeClass = change.level;
                        changeText = change.symbol;
                    }
                }
                prevValue = value;
            });

            html += `<td class="change-cell ${changeClass}">${changeText}</td>`;
            html += '</tr>';
        });
        html += '</tbody></table>';

        return html;
    },

    /**
     * 格式化字段值用于显示
     */
    formatValue(field, value) {
        if (value === undefined || value === null || value === '') {
            return '<span class="empty">-</span>';
        }

        if (Array.isArray(value)) {
            return value.join('、');
        }

        if (field.type === 'number' && field.unit) {
            return `${value}${field.unit}`;
        }

        return String(value);
    },

    /**
     * 检测字段变化
     */
    detectFieldChange(field, prevValue, currValue) {
        if (prevValue === currValue) return null;
        if (prevValue == null && currValue == null) return null;

        // 勾选项变化
        if (field.type === 'radio' && field.options?.includes('是')) {
            if (prevValue === '否' && currValue === '是') {
                return { level: 'normal', symbol: '✅ 改善' };
            }
            if (prevValue === '是' && currValue === '否') {
                return { level: 'warning', symbol: '⚠️ 恶化' };
            }
        }

        // 金额变化
        if (field.type === 'number') {
            const prev = parseFloat(prevValue) || 0;
            const curr = parseFloat(currValue) || 0;
            if (prev > 0 && curr > 0) {
                const change = (curr - prev) / prev;
                if (Math.abs(change) > 0.2) {
                    return {
                        level: 'warning',
                        symbol: `⚠️ ${change > 0 ? '+' : ''}${(change * 100).toFixed(0)}%`
                    };
                }
            }
        }

        return { level: 'info', symbol: '修改' };
    }
};

// 导出
window.TaskTemplates = TaskTemplates;
window.TASK_1_1_TEMPLATE = TASK_1_1_TEMPLATE;
