/**
 * 销售考核系统 - 数据模型定义
 * 版本化任务管理 + 月度快照
 */

// ==================== 数据结构定义 ====================

/**
 * 任务版本
 * @typedef {Object} TaskVersion
 * @property {string} versionId - 版本号 (V1.0, V2.0, ...)
 * @property {string} uploadDate - 上传日期 (YYYY-MM-DD)
 * @property {Object} fields - 任务字段数据
 * @property {Array} files - 文件列表 [{name, type, size, uploadTime}]
 * @property {number} completionRate - 完成度 (0/50/100)
 * @property {number} score - 得分
 * @property {string} status - 状态 (草稿/已提交/已验证)
 * @property {string} note - 备注
 */

/**
 * 项目任务
 * @typedef {Object} ProjectTask
 * @property {string} taskId - 任务ID (1.1, 2.3, ...)
 * @property {string} taskName - 任务名称
 * @property {string} projectId - 所属项目ID
 * @property {Array<TaskVersion>} versions - 版本历史
 * @property {string} currentVersion - 当前最高分版本
 * @property {number} currentScore - 当前最高分
 * @property {number} bestCompletionRate - 最高完成度
 */

/**
 * 项目
 * @typedef {Object} Project
 * @property {string} projectId - 项目ID
 * @property {string} projectName - 项目名称
 * @property {string} salesPerson - 销售员姓名
 * @property {number} amount - 项目金额（万元）
 * @property {string} currentStage - 当前阶段
 * @property {string} stageDate - 进入当前阶段日期
 * @property {number} attackPlanScore - 进攻计划得分
 * @property {Object} tasks - 任务集合 {taskId: ProjectTask}
 * @property {string} createTime - 创建时间
 * @property {string} updateTime - 最后更新时间
 */

/**
 * 月度快照
 * @typedef {Object} MonthlySnapshot
 * @property {string} snapshotId - 快照ID
 * @property {string} month - 月份 (YYYY-MM)
 * @property {string} snapshotTime - 快照时间
 * @property {boolean} isLocked - 是否锁定
 * @property {Object} salespeople - 销售员数据 {name: PersonSnapshot}
 */

/**
 * 销售员快照数据
 * @typedef {Object} PersonSnapshot
 * @property {string} name - 姓名
 * @property {Array} projects - 项目快照列表
 * @property {number} totalProjects - 项目总数
 * @property {number} averageScore - 平均分
 * @property {number} rank - 排名
 * @property {string} grade - 等级
 * @property {string} gradeIcon - 等级图标
 */

// ==================== 16个任务定义 ====================

const TASK_DEFINITIONS = [
    {
        id: '1.1',
        name: 'MAN分析与项目立项',
        stage: '接触',
        weight: 3.0,
        fields: ['立项时间', '客户名称', '项目背景', '预算规模']
    },
    {
        id: '1.2',
        name: '决策链地图绘制',
        stage: '接触',
        weight: 2.5,
        fields: ['关键决策人', '影响者', '使用者', '关系强度']
    },
    {
        id: '1.3',
        name: '竞品深度分析',
        stage: '接触',
        weight: 2.5,
        fields: ['主要竞品', '竞品优势', '竞品劣势', '差异化策略']
    },
    {
        id: '1.4',
        name: '技术标准影响计划',
        stage: '接触',
        weight: 2.0,
        fields: ['技术要求', '标准建议', '影响方式', '预期效果']
    },
    {
        id: '2.1',
        name: '需求深度调研',
        stage: '递进',
        weight: 2.5,
        fields: ['调研时间', '调研对象', '核心需求', '痛点分析']
    },
    {
        id: '2.2',
        name: '客户化方案设计',
        stage: '递进',
        weight: 3.0,
        fields: ['方案版本', '定制内容', '技术亮点', '成本估算']
    },
    {
        id: '2.3',
        name: '方案讲解与反馈收集',
        stage: '递进',
        weight: 2.5,
        fields: ['讲解时间', '参会关键人', '客户反馈摘要', '后续跟进计划']
    },
    {
        id: '3.1',
        name: '决策链地图深化',
        stage: '深入',
        weight: 2.0,
        fields: ['新增关系', '关系变化', '关键突破', '风险点']
    },
    {
        id: '3.2',
        name: '样品准备与现场展示',
        stage: '深入',
        weight: 2.5,
        fields: ['展示时间', '展示地点', '参与人员', '现场反馈']
    },
    {
        id: '3.3',
        name: '竞品方案对比展示',
        stage: '深入',
        weight: 2.5,
        fields: ['对比维度', '我方优势', '应对策略', '客户反应']
    },
    {
        id: '4.1',
        name: '最终方案优化与提交',
        stage: '执行',
        weight: 2.5,
        fields: ['提交时间', '优化内容', '报价金额', '交付周期']
    },
    {
        id: '4.2',
        name: '入围确认与竞品信息跟踪',
        stage: '执行',
        weight: 2.0,
        fields: ['入围状态', '竞品动态', '客户倾向', '应对措施']
    },
    {
        id: '4.3',
        name: '投标策略制定与投标文件准备',
        stage: '执行',
        weight: 2.5,
        fields: ['投标策略', '报价策略', '技术方案', '商务条款']
    },
    {
        id: '5.1',
        name: '评分模拟与风险应对',
        stage: '冲刺',
        weight: 3.0,
        fields: ['模拟得分', '风险点', '应对方案', '信心指数']
    },
    {
        id: '6.1',
        name: '商务谈判与让步策略',
        stage: '谈判',
        weight: 3.0,
        fields: ['谈判时间', '谈判对象', '让步空间', '达成共识']
    },
    {
        id: '7.1',
        name: '合同签订与项目交接',
        stage: '签约',
        weight: 2.0,
        fields: ['签约时间', '合同金额', '交接内容', '后续跟进']
    }
];

// 阶段定义
const STAGES = ['接触', '递进', '深入', '执行', '冲刺', '谈判', '签约'];
const STAGE_INDEX = {
    '接触': 1, '递进': 2, '深入': 3, '执行': 4,
    '冲刺': 5, '谈判': 6, '签约': 7
};

// 难度系数规则
const DIFFICULTY_RULES = [
    { min: 0, max: 200, coefficient: 0.8, label: '<200万' },
    { min: 200, max: 500, coefficient: 1.0, label: '200-500万' },
    { min: 500, max: 1000, coefficient: 1.2, label: '500-1000万' },
    { min: 1000, max: Infinity, coefficient: 1.5, label: '>1000万' }
];

// 停留系数规则
const STAY_RULES = [
    { min: 0, max: 30, coefficient: 1.0, label: '≤30天' },
    { min: 31, max: 60, coefficient: 0.95, label: '31-60天' },
    { min: 61, max: 90, coefficient: 0.9, label: '61-90天' },
    { min: 91, max: Infinity, coefficient: 0.8, label: '>90天' }
];

// 等级评定标准
const GRADE_RULES = [
    { min: 90, grade: '卓越', icon: '⭐⭐⭐', color: '#ffd700' },
    { min: 75, grade: '良好', icon: '⭐⭐', color: '#28a745' },
    { min: 60, grade: '合格', icon: '⭐', color: '#17a2b8' },
    { min: 40, grade: '待改进', icon: '⚠️', color: '#ffc107' },
    { min: 0, grade: '不合格', icon: '❌', color: '#dc3545' }
];
