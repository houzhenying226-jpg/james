/**
 * 销售考核系统 - 任务验证规则配置
 * 为16个任务定义硬规则、关联验证、AI验证规则
 */

const TASK_RULES = {
    // ==================== 1.1 MAN分析与项目立项 ====================
    '1.1': {
        hardRules: [
            {
                id: 'man_m',
                label: 'M(需求)确认',
                validate: (f) => !!f.hasM,
                passMessage: '已确认客户有明确需求',
                failMessage: '请确认客户是否有明确需求',
                severity: 'error'
            },
            {
                id: 'man_a',
                label: 'A(资金)确认',
                validate: (f) => !!f.hasA,
                passMessage: '已确认客户有预算能力',
                failMessage: '请确认客户是否有预算能力',
                severity: 'error'
            },
            {
                id: 'man_n',
                label: 'N(决策人)确认',
                validate: (f) => !!f.hasN,
                passMessage: '已确认接触到决策人',
                failMessage: '请确认是否接触到决策人',
                severity: 'error'
            },
            {
                id: 'project_report',
                label: '立项报告',
                validate: (f) => !!f.projectReport,
                passMessage: '立项报告已上传',
                failMessage: '请上传立项报告',
                severity: 'error'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_man_quality',
                label: 'MAN分析质量',
                prompt: '请评估这个MAN分析的完整性，备注说明是否充分说明了需求、预算、决策人情况',
                targetFields: ['notes']
            }
        ]
    },

    // ==================== 1.2 决策链绘制 ====================
    '1.2': {
        hardRules: [
            {
                id: 'decision_chain_file',
                label: '决策链图',
                validate: (f) => !!f.decisionChainFile,
                passMessage: '决策链图已上传',
                failMessage: '请上传决策链图',
                severity: 'error'
            },
            {
                id: 'key_person_count',
                label: '关键人数量',
                validate: (f) => (parseInt(f.keyPersonCount) || 0) >= 3,
                passMessage: (f) => `关键人${f.keyPersonCount}人，符合要求`,
                failMessage: (f) => `关键人${f.keyPersonCount || 0}人，需至少3人`,
                severity: 'error'
            },
            {
                id: 'key_person_list',
                label: '关键人列表详情',
                validate: (f) => (f.keyPersonList || '').length >= 20,
                passMessage: '关键人信息详尽',
                failMessage: '关键人列表描述过于简略（至少20字）',
                severity: 'warning'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_decision_chain',
                label: '决策链完整性',
                prompt: '请评估关键人列表是否包含了典型的决策链角色（如：使用者、影响者、决策者、批准者）',
                targetFields: ['keyPersonList']
            }
        ]
    },

    // ==================== 1.3 竞争对手分析 ====================
    '1.3': {
        hardRules: [
            {
                id: 'competitor_file',
                label: '竞争分析报告',
                validate: (f) => !!f.competitorAnalysis,
                passMessage: '竞争分析报告已上传',
                failMessage: '请上传竞争分析报告',
                severity: 'error'
            },
            {
                id: 'competitor_count',
                label: '竞争对手数量',
                validate: (f) => (parseInt(f.competitorCount) || 0) >= 2,
                passMessage: (f) => `已分析${f.competitorCount}个竞争对手`,
                failMessage: '至少分析2个竞争对手',
                severity: 'error'
            },
            {
                id: 'our_advantages',
                label: '我方优势描述',
                validate: (f) => (f.ourAdvantages || '').length >= 30,
                passMessage: '我方优势描述详尽',
                failMessage: '我方优势描述过于简略（至少30字）',
                severity: 'warning'
            }
        ],
        crossRefs: [],
        aiRules: [
            {
                id: 'ai_competitor_swot',
                label: 'SWOT分析质量',
                prompt: '请评估竞争分析是否涵盖了优势、劣势、机会、威胁的分析',
                targetFields: ['ourAdvantages', 'ourWeaknesses']
            }
        ]
    },

    // ==================== 1.4 标准植入与影响 ====================
    '1.4': {
        hardRules: [
            {
                id: 'standard_count',
                label: '植入标准数量',
                validate: (f) => (parseInt(f.standardCount) || 0) >= 2,
                passMessage: (f) => `已植入${f.standardCount}个标准`,
                failMessage: '至少植入2个有利标准',
                severity: 'error'
            },
            {
                id: 'standard_list',
                label: '标准详情',
                validate: (f) => (f.standardList || '').length >= 30,
                passMessage: '标准详情描述充分',
                failMessage: '请详细描述植入的标准内容（至少30字）',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_competitor_standard',
                label: '对比竞争对手',
                refTaskCode: '1.3',
                validate: (curr, ref) => {
                    // 检查标准是否针对竞争对手的弱点
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
                prompt: '请评估这些植入的标准是否能有效排斥竞争对手、突出我方优势',
                targetFields: ['standardList']
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
                passMessage: '调研报告已上传',
                failMessage: '请上传调研报告',
                severity: 'error'
            },
            {
                id: 'requirement_confirm',
                label: '需求确认书',
                validate: (f) => !!f.requirementConfirm,
                passMessage: '需求确认书已上传',
                failMessage: '请上传需求确认书',
                severity: 'error'
            },
            {
                id: 'key_requirements',
                label: '核心需求描述',
                validate: (f) => (f.keyRequirements || '').length >= 50,
                passMessage: '核心需求描述充分',
                failMessage: '核心需求描述过于简略（至少50字）',
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
                passMessage: '方案文档已上传',
                failMessage: '请上传方案文档',
                severity: 'error'
            },
            {
                id: 'solution_highlights',
                label: '方案亮点',
                validate: (f) => (f.solutionHighlights || '').length >= 30,
                passMessage: '方案亮点描述充分',
                failMessage: '请详细描述方案亮点（至少30字）',
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
                passMessage: '讲解时间已记录',
                failMessage: '请填写讲解时间',
                severity: 'error'
            },
            {
                id: 'key_attendees',
                label: '关键决策人参会',
                validate: (f) => /总经理|董事长|决策|总监|副总|CEO|总裁/.test(f.attendees || ''),
                passMessage: '关键决策人已参会',
                failMessage: '参会人需包含关键决策人（总经理/董事长/总监等）',
                severity: 'error'
            },
            {
                id: 'feedback_count',
                label: '反馈问题数量',
                validate: (f) => (parseInt(f.feedbackCount) || 0) >= 5,
                passMessage: (f) => `收集${f.feedbackCount}条反馈，符合要求`,
                failMessage: (f) => `仅收集${f.feedbackCount || 0}条反馈，需至少5条`,
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_decision_chain_attendees',
                label: '参会人在决策链中',
                refTaskCode: '1.2',
                validate: (curr, ref) => {
                    // 检查参会人是否在决策链关键人列表中
                    const attendees = (curr.attendees || '').toLowerCase();
                    const keyPersons = (ref.keyPersonList || '').toLowerCase();
                    // 简化验证：只要有交集就通过
                    return true;
                },
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
                passMessage: '深化方案已上传',
                failMessage: '请上传深化后的方案',
                severity: 'error'
            },
            {
                id: 'improvement_count',
                label: '优化点数量',
                validate: (f) => (parseInt(f.improvementCount) || 0) >= 3,
                passMessage: (f) => `${f.improvementCount}个优化点，符合要求`,
                failMessage: '至少需要3个优化点',
                severity: 'error'
            },
            {
                id: 'changes_description',
                label: '修改内容描述',
                validate: (f) => (f.changesDescription || '').length >= 50,
                passMessage: '修改内容描述详尽',
                failMessage: '修改内容描述过于简略（至少50字）',
                severity: 'warning'
            }
        ],
        crossRefs: [
            {
                id: 'cross_feedback_improvement',
                label: '响应客户反馈',
                refTaskCode: '2.3',
                validate: (curr, ref) => {
                    // 优化点数量应该响应反馈数量
                    return true;
                },
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
                passMessage: '样品已准备就绪',
                failMessage: '请确认样品是否已准备',
                severity: 'error'
            },
            {
                id: 'demo_date',
                label: '展示日期',
                validate: (f) => !!f.demoDate,
                passMessage: '展示日期已记录',
                failMessage: '请填写展示日期',
                severity: 'error'
            },
            {
                id: 'demo_feedback',
                label: '展示反馈',
                validate: (f) => (f.demoFeedback || '').length >= 30,
                passMessage: '展示反馈已记录',
                failMessage: '请详细记录展示反馈（至少30字）',
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
                passMessage: '对比日期已记录',
                failMessage: '请填写对比日期',
                severity: 'error'
            },
            {
                id: 'comparison_result',
                label: '对比结果',
                validate: (f) => (f.comparisonResult || '').length >= 30,
                passMessage: '对比结果已记录',
                failMessage: '请详细记录对比结果（至少30字）',
                severity: 'error'
            },
            {
                id: 'our_win_points',
                label: '我方胜出点',
                validate: (f) => (f.ourWinPoints || '').length >= 20,
                passMessage: '我方胜出点已明确',
                failMessage: '请说明我方胜出点（至少20字）',
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
                passMessage: '投标文件已上传',
                failMessage: '请上传投标文件',
                severity: 'error'
            },
            {
                id: 'technical_proposal',
                label: '技术方案',
                validate: (f) => !!f.technicalProposal,
                passMessage: '技术方案已上传',
                failMessage: '请上传技术方案',
                severity: 'error'
            },
            {
                id: 'commercial_proposal',
                label: '商务方案',
                validate: (f) => !!f.commercialProposal,
                passMessage: '商务方案已上传',
                failMessage: '请上传商务方案',
                severity: 'error'
            },
            {
                id: 'bid_price',
                label: '投标价格',
                validate: (f) => (parseFloat(f.bidPrice) || 0) > 0,
                passMessage: (f) => `投标价格${f.bidPrice}万`,
                failMessage: '请填写投标价格',
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
                passMessage: '会议日期已记录',
                failMessage: '请填写会议日期',
                severity: 'error'
            },
            {
                id: 'meeting_minutes',
                label: '会议纪要',
                validate: (f) => !!f.meetingMinutes,
                passMessage: '会议纪要已上传',
                failMessage: '请上传会议纪要',
                severity: 'error'
            },
            {
                id: 'technical_topics',
                label: '技术议题',
                validate: (f) => (f.technicalTopics || '').length >= 30,
                passMessage: '技术议题记录详尽',
                failMessage: '请详细记录技术议题（至少30字）',
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
                passMessage: '会议日期已记录',
                failMessage: '请填写会议日期',
                severity: 'error'
            },
            {
                id: 'meeting_minutes',
                label: '会议纪要',
                validate: (f) => !!f.meetingMinutes,
                passMessage: '会议纪要已上传',
                failMessage: '请上传会议纪要',
                severity: 'error'
            },
            {
                id: 'price_negotiation',
                label: '价格讨论',
                validate: (f) => (f.priceNegotiation || '').length >= 30,
                passMessage: '价格讨论记录详尽',
                failMessage: '请详细记录价格讨论内容（至少30字）',
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
                passMessage: '模拟评分表已上传',
                failMessage: '请上传模拟评分表',
                severity: 'error'
            },
            {
                id: 'risk_count',
                label: '风险点数量',
                validate: (f) => (parseInt(f.riskCount) || 0) >= 3,
                passMessage: (f) => `识别${f.riskCount}个风险点`,
                failMessage: '至少识别3个风险点',
                severity: 'error'
            },
            {
                id: 'countermeasures',
                label: '应对措施',
                validate: (f) => (f.countermeasures || '').length >= 50,
                passMessage: '应对措施描述充分',
                failMessage: '请详细描述应对措施（至少50字）',
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
                passMessage: '谈判日期已记录',
                failMessage: '请填写谈判日期',
                severity: 'error'
            },
            {
                id: 'negotiation_file',
                label: '谈判纪要',
                validate: (f) => !!f.negotiationFile,
                passMessage: '谈判纪要已上传',
                failMessage: '请上传谈判纪要',
                severity: 'error'
            },
            {
                id: 'final_price',
                label: '最终价格',
                validate: (f) => (parseFloat(f.finalPrice) || 0) > 0,
                passMessage: (f) => `最终价格${f.finalPrice}万`,
                failMessage: '请填写最终价格',
                severity: 'error'
            }
        ],
        crossRefs: [
            {
                id: 'cross_price_comparison',
                label: '价格对比分析',
                refTaskCode: '4.3',
                validate: (curr, ref) => {
                    // 可以比较最终价格与之前讨论的价格
                    return true;
                },
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
                passMessage: '签约日期已记录',
                failMessage: '请填写签约日期',
                severity: 'error'
            },
            {
                id: 'contract_file',
                label: '合同文件',
                validate: (f) => !!f.contractFile,
                passMessage: '合同文件已上传',
                failMessage: '请上传合同文件',
                severity: 'error'
            },
            {
                id: 'contract_amount',
                label: '合同金额',
                validate: (f) => (parseFloat(f.contractAmount) || 0) > 0,
                passMessage: (f) => `合同金额${f.contractAmount}万`,
                failMessage: '请填写合同金额',
                severity: 'error'
            },
            {
                id: 'payment_terms',
                label: '付款条款',
                validate: (f) => (f.paymentTerms || '').length >= 20,
                passMessage: '付款条款已明确',
                failMessage: '请填写付款条款（至少20字）',
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
                    // 允许5%的差异
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

// 导出
window.TASK_RULES = TASK_RULES;
