/**
 * 销售考核系统 - 任务配置
 * 16个任务的完整定义
 */

// 阶段常量
const STAGES = ['接触', '递进', '深入', '执行', '冲刺', '谈判', '签约'];

/**
 * 详细验证函数 - 返回每个检查项的状态
 */
const VALIDATION_FUNCTIONS = {
    // 任务1.1: MAN分析
    '1.1': (fields) => {
        const checks = [
            { label: 'M(需求)确认', passed: !!fields.hasM },
            { label: 'A(资金)确认', passed: !!fields.hasA },
            { label: 'N(决策人)确认', passed: !!fields.hasN },
            { label: '立项报告', passed: !!fields.projectReport }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 0 };
    },

    // 任务1.2: 决策链绘制
    '1.2': (fields) => {
        const hasFile = !!fields.decisionChainFile;
        const count = parseInt(fields.keyPersonCount) || 0;
        const checks = [
            { label: '决策链图', passed: hasFile },
            { label: `关键人数量≥3人 (当前:${count}人)`, passed: count >= 3 }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务1.3: 竞争对手分析
    '1.3': (fields) => {
        const hasFile = !!fields.competitorAnalysis;
        const count = parseInt(fields.competitorCount) || 0;
        const checks = [
            { label: '竞争分析报告', passed: hasFile },
            { label: `竞争对手数量≥2个 (当前:${count}个)`, passed: count >= 2 }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务1.4: 标准植入
    '1.4': (fields) => {
        const count = parseInt(fields.standardCount) || 0;
        const hasList = !!fields.standardList;
        const checks = [
            { label: `植入标准数量≥2个 (当前:${count}个)`, passed: count >= 2 },
            { label: '植入标准详情', passed: hasList }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务2.1: 需求调研
    '2.1': (fields) => {
        const checks = [
            { label: '调研报告', passed: !!fields.surveyReport },
            { label: '需求确认书', passed: !!fields.requirementConfirm }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务2.2: 方案设计
    '2.2': (fields) => {
        const checks = [
            { label: '方案文档', passed: !!fields.solutionFile },
            { label: '方案亮点', passed: !!fields.solutionHighlights }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务2.3: 方案讲解
    '2.3': (fields) => {
        const attendees = fields.attendees || '';
        const hasKeyPerson = /总经理|董事长|决策|总监|副总/.test(attendees);
        const count = parseInt(fields.feedbackCount) || 0;
        const checks = [
            {
                label: '关键决策人参会',
                passed: hasKeyPerson,
                hint: hasKeyPerson ? `检测到: ${attendees.match(/总经理|董事长|决策|总监|副总/g)?.[0] || ''}` : '需包含: 总经理/董事长/总监/副总'
            },
            { label: `反馈问题数量≥5条 (当前:${count}条)`, passed: count >= 5 }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务3.1: 方案深化
    '3.1': (fields) => {
        const hasFile = !!fields.deepenedSolutionFile;
        const count = parseInt(fields.improvementCount) || 0;
        const checks = [
            { label: '深化方案文档', passed: hasFile },
            { label: `优化点数量≥3个 (当前:${count}个)`, passed: count >= 3 }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务3.2: 样品展示
    '3.2': (fields) => {
        const checks = [
            { label: '样品已准备', passed: !!fields.samplePrepared },
            { label: '展示日期', passed: !!fields.demoDate },
            { label: '展示反馈', passed: !!fields.demoFeedback }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务3.3: 样品对比
    '3.3': (fields) => {
        const checks = [
            { label: '对比日期', passed: !!fields.comparisonDate },
            { label: '对比结果', passed: !!fields.comparisonResult },
            { label: '我方胜出点', passed: !!fields.ourWinPoints }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务4.0: 招标情报与评委布局
    '4.0': (fields) => {
        const hasMethod = !!fields.bidding_method;
        const hasDate = !!fields.expected_bid_date;
        const juryCount = parseInt(fields.jury_total_count) || 0;
        const juryList = Array.isArray(fields.jury_list) ? fields.jury_list : [];
        const strategyLen = (fields.attack_strategy || '').length;
        const hasConfidence = !!fields.confidence_level;

        const checks = [
            { label: '招标方式', passed: hasMethod },
            { label: '开标时间', passed: hasDate },
            { label: `评委人数(${juryCount}人)`, passed: juryCount >= 1 },
            { label: `评委列表(${juryList.length}人)`, passed: juryList.length >= 1 && juryList.length === juryCount },
            { label: `攻关策略(${strategyLen}字)`, passed: strategyLen >= 50 },
            { label: '把握程度', passed: hasConfidence }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 30 };
    },

    // 任务4.1: 投标文件
    '4.1': (fields) => {
        const checks = [
            { label: '投标文件', passed: !!fields.bidDocumentFile },
            { label: '技术方案', passed: !!fields.technicalProposal },
            { label: '商务方案', passed: !!fields.commercialProposal }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务4.2: 技术交流会
    '4.2': (fields) => {
        const checks = [
            { label: '会议日期', passed: !!fields.meetingDate },
            { label: '会议纪要', passed: !!fields.meetingMinutes }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务4.3: 商务交流会
    '4.3': (fields) => {
        const checks = [
            { label: '会议日期', passed: !!fields.meetingDate },
            { label: '会议纪要', passed: !!fields.meetingMinutes }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务5.1: 评分模拟
    '5.1': (fields) => {
        const hasFile = !!fields.scoringSimulationFile;
        const count = parseInt(fields.riskCount) || 0;
        const hasMeasures = !!fields.countermeasures;
        const checks = [
            { label: '模拟评分表', passed: hasFile },
            { label: `风险点数量≥3个 (当前:${count}个)`, passed: count >= 3 },
            { label: '应对措施', passed: hasMeasures }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务6.1: 商务谈判
    '6.1': (fields) => {
        const checks = [
            { label: '谈判日期', passed: !!fields.negotiationDate },
            { label: '谈判纪要', passed: !!fields.negotiationFile },
            { label: '最终价格', passed: !!fields.finalPrice }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 50 };
    },

    // 任务7.1: 合同签订
    '7.1': (fields) => {
        const checks = [
            { label: '签约日期', passed: !!fields.contractDate },
            { label: '合同文件', passed: !!fields.contractFile },
            { label: '合同金额', passed: !!fields.contractAmount }
        ];
        const allPassed = checks.every(c => c.passed);
        return { checks, allPassed, passRate: allPassed ? 100 : 0 };
    }
};

/**
 * 获取详细验证结果
 */
function getDetailedValidation(taskCode, fields) {
    const validateFn = VALIDATION_FUNCTIONS[taskCode];
    if (!validateFn) {
        return { checks: [], allPassed: false, passRate: 0 };
    }
    return validateFn(fields);
}

// 16个任务完整配置
const TASK_CONFIG = [
    // ==================== 接触阶段 ====================
    {
        code: "1.1",
        name: "MAN分析与项目立项",
        category: "接触",
        weight: 3.0,
        description: "分析客户的M(需求)、A(资金)、N(决策人)，完成项目立项",
        fields: [
            { key: "hasM", label: "M(需求)确认", type: "boolean", required: true },
            { key: "hasA", label: "A(资金)确认", type: "boolean", required: true },
            { key: "hasN", label: "N(决策人)确认", type: "boolean", required: true },
            { key: "projectReport", label: "立项报告", type: "file", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "M、A、N三项全部确认，且有立项报告",
            check: (fields) => fields.hasM && fields.hasA && fields.hasN && fields.projectReport,
            passRate: 100,
            failRate: 0
        }
    },
    {
        code: "1.2",
        name: "决策链绘制",
        category: "接触",
        weight: 2.5,
        description: "绘制客户决策链，明确关键人物和影响关系",
        fields: [
            { key: "decisionChainFile", label: "决策链图", type: "file", required: true },
            { key: "keyPersonCount", label: "关键人数量", type: "number", required: true },
            { key: "keyPersonList", label: "关键人列表", type: "textarea", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "count_check",
            description: "决策链图完整，关键人≥3人",
            check: (fields) => fields.decisionChainFile && fields.keyPersonCount >= 3,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "1.3",
        name: "竞争对手分析",
        category: "接触",
        weight: 2.5,
        description: "分析主要竞争对手的优劣势",
        fields: [
            { key: "competitorCount", label: "竞争对手数量", type: "number", required: true },
            { key: "competitorAnalysis", label: "竞争分析报告", type: "file", required: true },
            { key: "ourAdvantages", label: "我方优势", type: "textarea", required: true },
            { key: "ourWeaknesses", label: "我方劣势", type: "textarea", required: false },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "count_check",
            description: "分析≥2个竞争对手",
            check: (fields) => fields.competitorAnalysis && fields.competitorCount >= 2,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "1.4",
        name: "标准植入与影响",
        category: "接触",
        weight: 2.0,
        description: "在招标文件或需求中植入有利于我方的标准",
        fields: [
            { key: "standardCount", label: "植入标准数量", type: "number", required: true },
            { key: "standardList", label: "植入标准详情", type: "textarea", required: true },
            { key: "influenceProof", label: "影响证明", type: "file", required: false },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "count_check",
            description: "植入≥2个标准",
            check: (fields) => fields.standardCount >= 2 && fields.standardList,
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 递进阶段 ====================
    {
        code: "2.1",
        name: "需求调研与确认",
        category: "递进",
        weight: 3.0,
        description: "深入调研客户需求，形成需求确认书",
        fields: [
            { key: "surveyDate", label: "调研日期", type: "date", required: true },
            { key: "surveyReport", label: "调研报告", type: "file", required: true },
            { key: "requirementConfirm", label: "需求确认书", type: "file", required: true },
            { key: "keyRequirements", label: "核心需求", type: "textarea", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "调研报告+需求确认书",
            check: (fields) => fields.surveyReport && fields.requirementConfirm,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "2.2",
        name: "方案设计",
        category: "递进",
        weight: 2.5,
        description: "根据需求设计解决方案",
        fields: [
            { key: "solutionFile", label: "方案文档", type: "file", required: true },
            { key: "solutionVersion", label: "方案版本", type: "text", required: true },
            { key: "solutionHighlights", label: "方案亮点", type: "textarea", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "file_check",
            description: "完成方案设计文档",
            check: (fields) => fields.solutionFile && fields.solutionHighlights,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "2.3",
        name: "方案讲解与反馈收集",
        category: "递进",
        weight: 2.5,
        description: "向客户讲解方案并收集反馈",
        fields: [
            { key: "presentationDate", label: "讲解时间", type: "datetime-local", required: true },
            { key: "attendees", label: "参会关键人", type: "text", required: true },
            { key: "feedbackSummary", label: "客户反馈摘要", type: "textarea", required: false },
            { key: "feedbackCount", label: "反馈问题数量", type: "number", required: true },
            { key: "presentationFile", label: "讲解PPT", type: "file", required: false },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "key_person_check",
            description: "关键决策人参会(总经理/董事长/决策)且反馈≥5条",
            check: (fields) => {
                const hasKeyPerson = /总经理|董事长|决策|总监|副总/.test(fields.attendees || '');
                const hasFeedback = fields.feedbackCount >= 5;
                return hasKeyPerson && hasFeedback;
            },
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 深入阶段 ====================
    {
        code: "3.1",
        name: "方案深化",
        category: "深入",
        weight: 2.5,
        description: "根据反馈深化方案",
        fields: [
            { key: "deepenedSolutionFile", label: "深化方案", type: "file", required: true },
            { key: "changesDescription", label: "修改内容", type: "textarea", required: true },
            { key: "improvementCount", label: "优化点数量", type: "number", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "count_check",
            description: "优化点≥3个",
            check: (fields) => fields.deepenedSolutionFile && fields.improvementCount >= 3,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "3.2",
        name: "样品准备与现场展示",
        category: "深入",
        weight: 2.5,
        description: "准备样品并进行现场展示",
        fields: [
            { key: "samplePrepared", label: "样品已准备", type: "boolean", required: true },
            { key: "demoDate", label: "展示日期", type: "date", required: true },
            { key: "demoAttendees", label: "展示参会人", type: "text", required: true },
            { key: "demoFeedback", label: "展示反馈", type: "textarea", required: true },
            { key: "demoPhotos", label: "展示照片", type: "file", required: false },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "样品准备+现场展示完成",
            check: (fields) => fields.samplePrepared && fields.demoDate && fields.demoFeedback,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "3.3",
        name: "样品对比展示",
        category: "深入",
        weight: 2.0,
        description: "与竞品进行对比展示",
        fields: [
            { key: "comparisonDate", label: "对比日期", type: "date", required: true },
            { key: "comparedProducts", label: "对比产品", type: "textarea", required: true },
            { key: "comparisonResult", label: "对比结果", type: "textarea", required: true },
            { key: "ourWinPoints", label: "我方胜出点", type: "textarea", required: true },
            { key: "comparisonFile", label: "对比报告", type: "file", required: false },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "完成对比展示",
            check: (fields) => fields.comparisonDate && fields.comparisonResult && fields.ourWinPoints,
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 执行阶段 ====================
    {
        code: "4.0",
        name: "招标情报与评委布局",
        category: "执行",
        weight: 4.0,
        description: "收集招标情报，分析评委构成，制定攻关策略",
        fields: [
            // Section 1: 基础信息
            { key: "bidding_method", label: "招标方式", type: "radio", required: true,
              options: ['公开招标', '邀请招标', '内部比价', '竞争性谈判', '单一来源采购'] },
            { key: "expected_bid_date", label: "预计开标时间", type: "date", required: true },
            { key: "bid_project_number", label: "招标项目编号", type: "text", required: false },
            // Section 2: 第三方招标公司信息（条件显示）
            { key: "agency_name", label: "招标公司名称", type: "text", required: false },
            { key: "agency_contact_name", label: "负责人", type: "text", required: false },
            { key: "agency_contact_phone", label: "联系方式", type: "text", required: false },
            { key: "agency_relationship", label: "关系程度", type: "radio", required: false,
              options: ['无联系', '初步接触', '熟悉', '深度合作'] },
            // Section 3: 内部评审规则（条件显示）
            { key: "evaluation_method", label: "评审方式", type: "radio", required: false,
              options: ['综合评分法', '最低价法', '性价比法'] },
            { key: "technical_score_ratio", label: "技术分占比(%)", type: "number", required: false },
            { key: "commercial_score_ratio", label: "商务分占比(%)", type: "number", required: false },
            { key: "other_score_items", label: "其他评分项", type: "text", required: false },
            { key: "scoring_rule_file", label: "评分规则文件", type: "file", required: false },
            // Section 4: 评委构成分析
            { key: "jury_total_count", label: "评委总人数", type: "number", required: true },
            { key: "jury_list", label: "评委列表", type: "list", required: true,
              itemFields: [
                { id: 'name', label: '姓名', type: 'text', required: true },
                { id: 'department', label: '部门', type: 'text', required: true },
                { id: 'position', label: '职位', type: 'text', required: true },
                { id: 'jury_type', label: '类型', type: 'select', options: ['技术评委', '商务评委', '采购评委', '领导评委'] },
                { id: 'influence', label: '话语权', type: 'radio', options: ['高', '中', '低'] },
                { id: 'relationship', label: '关系', type: 'radio', options: ['支持我方', '中立', '倾向竞品', '未知'] },
                { id: 'our_contact', label: '维护人', type: 'text', required: false }
              ] },
            // Section 5: 攻关计划与自评
            { key: "attack_strategy", label: "攻关策略", type: "textarea", required: true },
            { key: "confidence_level", label: "整体把握程度", type: "radio", required: true,
              options: ['非常有把握', '比较有把握', '一般', '较弱', '很弱'] },
            { key: "resource_needs", label: "需要协调的资源", type: "textarea", required: false }
        ],
        validation: {
            type: "custom",
            description: "招标情报完整，评委分析详细，攻关策略具体",
            check: (fields) => {
                const hasMethod = !!fields.bidding_method;
                const hasDate = !!fields.expected_bid_date;
                const hasJuryCount = (parseInt(fields.jury_total_count) || 0) >= 1;
                const hasJuryList = Array.isArray(fields.jury_list) && fields.jury_list.length >= 1;
                const hasStrategy = (fields.attack_strategy || '').length >= 50;
                const hasConfidence = !!fields.confidence_level;
                return hasMethod && hasDate && hasJuryCount && hasJuryList && hasStrategy && hasConfidence;
            },
            passRate: 100,
            failRate: 30
        }
    },
    {
        code: "4.1",
        name: "投标文件准备",
        category: "执行",
        weight: 3.0,
        description: "准备完整的投标文件",
        fields: [
            { key: "bidDocumentFile", label: "投标文件", type: "file", required: true },
            { key: "technicalProposal", label: "技术方案", type: "file", required: true },
            { key: "commercialProposal", label: "商务方案", type: "file", required: true },
            { key: "bidPrice", label: "投标价格(万)", type: "number", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "投标三件套完整",
            check: (fields) => fields.bidDocumentFile && fields.technicalProposal && fields.commercialProposal,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "4.2",
        name: "技术交流会",
        category: "执行",
        weight: 2.5,
        description: "组织技术交流会议",
        fields: [
            { key: "meetingDate", label: "会议日期", type: "date", required: true },
            { key: "meetingAttendees", label: "参会人员", type: "textarea", required: true },
            { key: "technicalTopics", label: "技术议题", type: "textarea", required: true },
            { key: "meetingMinutes", label: "会议纪要", type: "file", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "file_check",
            description: "技术交流会完成",
            check: (fields) => fields.meetingDate && fields.meetingMinutes,
            passRate: 100,
            failRate: 50
        }
    },
    {
        code: "4.3",
        name: "商务交流会",
        category: "执行",
        weight: 2.5,
        description: "组织商务交流会议",
        fields: [
            { key: "meetingDate", label: "会议日期", type: "date", required: true },
            { key: "meetingAttendees", label: "参会人员", type: "textarea", required: true },
            { key: "businessTopics", label: "商务议题", type: "textarea", required: true },
            { key: "priceNegotiation", label: "价格讨论", type: "textarea", required: true },
            { key: "meetingMinutes", label: "会议纪要", type: "file", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "file_check",
            description: "商务交流会完成",
            check: (fields) => fields.meetingDate && fields.meetingMinutes,
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 冲刺阶段 ====================
    {
        code: "5.1",
        name: "评分模拟与风险应对",
        category: "冲刺",
        weight: 3.0,
        description: "模拟评标打分，识别风险并制定应对措施",
        fields: [
            { key: "scoringSimulationFile", label: "模拟评分表", type: "file", required: true },
            { key: "expectedScore", label: "预计得分", type: "number", required: true },
            { key: "riskCount", label: "风险点数量", type: "number", required: true },
            { key: "riskList", label: "风险清单", type: "textarea", required: true },
            { key: "countermeasures", label: "应对措施", type: "textarea", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "count_check",
            description: "模拟评分完成，风险点≥3个",
            check: (fields) => fields.scoringSimulationFile && fields.riskCount >= 3 && fields.countermeasures,
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 谈判阶段 ====================
    {
        code: "6.1",
        name: "商务谈判",
        category: "谈判",
        weight: 3.0,
        description: "进行商务条款谈判",
        fields: [
            { key: "negotiationDate", label: "谈判日期", type: "date", required: true },
            { key: "negotiationRounds", label: "谈判轮次", type: "number", required: true },
            { key: "negotiationTopics", label: "谈判要点", type: "textarea", required: true },
            { key: "finalPrice", label: "最终价格(万)", type: "number", required: true },
            { key: "concessions", label: "让步内容", type: "textarea", required: false },
            { key: "negotiationFile", label: "谈判纪要", type: "file", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "商务谈判完成",
            check: (fields) => fields.negotiationDate && fields.negotiationFile && fields.finalPrice,
            passRate: 100,
            failRate: 50
        }
    },

    // ==================== 签约阶段 ====================
    {
        code: "7.1",
        name: "合同签订",
        category: "签约",
        weight: 3.0,
        description: "完成合同签订",
        fields: [
            { key: "contractDate", label: "签约日期", type: "date", required: true },
            { key: "contractAmount", label: "合同金额(万)", type: "number", required: true },
            { key: "contractFile", label: "合同文件", type: "file", required: true },
            { key: "paymentTerms", label: "付款条款", type: "textarea", required: true },
            { key: "deliveryTerms", label: "交付条款", type: "textarea", required: true },
            { key: "notes", label: "备注说明", type: "textarea", required: false }
        ],
        validation: {
            type: "all_required",
            description: "合同签订完成",
            check: (fields) => fields.contractDate && fields.contractFile && fields.contractAmount,
            passRate: 100,
            failRate: 0
        }
    }
];

// 获取任务配置
function getTaskConfig(taskCode) {
    return TASK_CONFIG.find(t => t.code === taskCode);
}

// 获取某个阶段的所有任务
function getTasksByCategory(category) {
    return TASK_CONFIG.filter(t => t.category === category);
}

// 计算任务总权重
function getTotalWeight() {
    return TASK_CONFIG.reduce((sum, t) => sum + t.weight, 0);
}

// 难度系数配置（根据项目金额）
const DIFFICULTY_COEF_CONFIG = [
    { min: 0, max: 100, coef: 0.8, label: "100万以下" },
    { min: 100, max: 300, coef: 0.9, label: "100-300万" },
    { min: 300, max: 500, coef: 1.0, label: "300-500万" },
    { min: 500, max: 800, coef: 1.1, label: "500-800万" },
    { min: 800, max: 1000, coef: 1.2, label: "800-1000万" },
    { min: 1000, max: Infinity, coef: 1.3, label: "1000万以上" }
];

// 停留系数配置（根据当前阶段停留天数）
const STAY_COEF_CONFIG = [
    { min: 0, max: 15, coef: 1.0, label: "15天内" },
    { min: 15, max: 30, coef: 0.95, label: "15-30天" },
    { min: 30, max: 45, coef: 0.9, label: "30-45天" },
    { min: 45, max: 60, coef: 0.85, label: "45-60天" },
    { min: 60, max: Infinity, coef: 0.8, label: "60天以上" }
];

// 推进系数配置（根据本月阶段推进情况）
const PROGRESS_COEF_CONFIG = [
    { stages: -2, coef: 0.7, label: "后退2个及以上阶段" },
    { stages: -1, coef: 0.85, label: "后退1个阶段" },
    { stages: 0, coef: 1.0, label: "保持不变" },
    { stages: 1, coef: 1.1, label: "推进1个阶段" },
    { stages: 2, coef: 1.2, label: "推进2个阶段" },
    { stages: 3, coef: 1.3, label: "推进3个及以上阶段" }
];

// 等级配置
const GRADE_CONFIG = [
    { min: 90, max: 100, grade: "卓越", icon: "⭐⭐⭐", color: "#FFD700" },
    { min: 80, max: 90, grade: "优秀", icon: "⭐⭐", color: "#28a745" },
    { min: 70, max: 80, grade: "良好", icon: "⭐", color: "#17a2b8" },
    { min: 60, max: 70, grade: "合格", icon: "✓", color: "#6c757d" },
    { min: 0, max: 60, grade: "待提升", icon: "⚠", color: "#dc3545" }
];

// 获取难度系数
function getDifficultyCoef(amount) {
    const config = DIFFICULTY_COEF_CONFIG.find(c => amount >= c.min && amount < c.max);
    return config || DIFFICULTY_COEF_CONFIG[0];
}

// 获取停留系数
function getStayCoef(days) {
    const config = STAY_COEF_CONFIG.find(c => days >= c.min && days < c.max);
    return config || STAY_COEF_CONFIG[STAY_COEF_CONFIG.length - 1];
}

// 获取推进系数
function getProgressCoef(stageChange) {
    if (stageChange <= -2) return PROGRESS_COEF_CONFIG[0];
    if (stageChange >= 3) return PROGRESS_COEF_CONFIG[5];
    const config = PROGRESS_COEF_CONFIG.find(c => c.stages === stageChange);
    return config || PROGRESS_COEF_CONFIG[2];
}

// 获取等级
function getGrade(score) {
    const config = GRADE_CONFIG.find(c => score >= c.min && score < c.max);
    return config || GRADE_CONFIG[GRADE_CONFIG.length - 1];
}

// 获取阶段索引
function getStageIndex(stageName) {
    return STAGES.indexOf(stageName);
}

// 计算阶段变化数
function getStageChange(fromStage, toStage) {
    const fromIndex = getStageIndex(fromStage);
    const toIndex = getStageIndex(toStage);
    if (fromIndex === -1 || toIndex === -1) return 0;
    return toIndex - fromIndex;
}
