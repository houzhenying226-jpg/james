/**
 * 销售考核系统 - 配置文件
 * 北京北方努派服装公司
 */

// 16个销售任务配置
const TASKS = [
    { id: '1.1', name: 'MAN分析与项目立项', stage: '接触', weight: 3.0 },
    { id: '1.2', name: '决策链地图绘制', stage: '接触', weight: 2.5 },
    { id: '1.3', name: '竞品深度分析', stage: '接触', weight: 2.5 },
    { id: '1.4', name: '技术标准影响计划', stage: '接触', weight: 2.0 },
    { id: '2.1', name: '需求深度调研', stage: '递进', weight: 2.5 },
    { id: '2.2', name: '客户化方案设计', stage: '递进', weight: 3.0 },
    { id: '2.3', name: '方案讲解与反馈收集', stage: '递进', weight: 2.5 },
    { id: '3.1', name: '决策链地图深化', stage: '深入', weight: 2.0 },
    { id: '3.2', name: '样品准备与现场展示', stage: '深入', weight: 2.5 },
    { id: '3.3', name: '竞品方案对比展示', stage: '深入', weight: 2.5 },
    { id: '4.1', name: '最终方案优化与提交', stage: '执行', weight: 2.5 },
    { id: '4.2', name: '入围确认与竞品信息跟踪', stage: '执行', weight: 2.0 },
    { id: '4.3', name: '投标策略制定与投标文件准备', stage: '执行', weight: 2.5 },
    { id: '5.1', name: '评分模拟与风险应对', stage: '冲刺', weight: 3.0 },
    { id: '6.1', name: '商务谈判与让步策略', stage: '谈判', weight: 3.0 },
    { id: '7.1', name: '合同签订与项目交接', stage: '签约', weight: 2.0 }
];

// 阶段顺序（用于计算推进阶段数）
const STAGES = ['接触', '递进', '深入', '执行', '冲刺', '谈判', '签约'];
const STAGE_INDEX = {
    '接触': 1,
    '递进': 2,
    '深入': 3,
    '执行': 4,
    '冲刺': 5,
    '谈判': 6,
    '签约': 7
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

// 推进系数规则
const PROGRESS_RULES = [
    { condition: 'backward', coefficient: 0.7, label: '倒退' },
    { condition: 'none', coefficient: 0.9, label: '无推进' },
    { condition: 'one', coefficient: 1.0, label: '推进1阶段' },
    { condition: 'two_or_more', coefficient: 1.2, label: '推进≥2阶段' }
];

// 等级评定标准
const GRADE_RULES = [
    { min: 90, grade: '卓越', icon: '⭐⭐⭐', color: '#ffd700' },
    { min: 75, grade: '良好', icon: '⭐⭐', color: '#28a745' },
    { min: 60, grade: '合格', icon: '⭐', color: '#17a2b8' },
    { min: 40, grade: '待改进', icon: '⚠️', color: '#ffc107' },
    { min: 0, grade: '不合格', icon: '❌', color: '#dc3545' }
];

// Excel列映射（从0开始）
const EXCEL_COLUMNS = {
    name: 0,           // A - 销售员姓名
    project: 1,        // B - 项目名称
    currentStage: 2,   // C - 当前阶段
    amount: 3,         // D - 项目金额（万元）
    stageDate: 4,      // E - 进入当前阶段日期
    startStage: 5,     // F - 本月初阶段
    endStage: 6,       // G - 本月末阶段
    tasksStart: 7,     // H-W - 任务1.1-7.1完成度（16列）
    attackPlan: 23     // X - 进攻计划得分
};

// 测试数据（每人2-3个项目）
const TEST_DATA = [
    // 张三 - 3个项目
    {
        name: '张三',
        project: 'XX集团服装采购项目',
        currentStage: '深入',
        amount: 500,
        stageDate: '2024-11-25',
        startStage: '接触',
        endStage: '深入',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 50, 100, 50, 0, 0, 0, 0, 0],
        attackPlan: 28
    },
    {
        name: '张三',
        project: 'AA学校校服定制项目',
        currentStage: '递进',
        amount: 300,
        stageDate: '2024-12-01',
        startStage: '接触',
        endStage: '递进',
        tasks: [100, 100, 100, 100, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        attackPlan: 22
    },
    {
        name: '张三',
        project: 'BB酒店制服项目',
        currentStage: '接触',
        amount: 150,
        stageDate: '2024-12-10',
        startStage: '接触',
        endStage: '接触',
        tasks: [100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        attackPlan: 15
    },
    // 李四 - 2个项目
    {
        name: '李四',
        project: 'YY公司制服定制项目',
        currentStage: '执行',
        amount: 800,
        stageDate: '2024-11-05',
        startStage: '递进',
        endStage: '执行',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
        attackPlan: 26
    },
    {
        name: '李四',
        project: 'CC工厂工装项目',
        currentStage: '冲刺',
        amount: 1200,
        stageDate: '2024-11-20',
        startStage: '深入',
        endStage: '冲刺',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0],
        attackPlan: 28
    },
    // 王五 - 3个项目
    {
        name: '王五',
        project: 'ZZ企业工装批量采购',
        currentStage: '签约',
        amount: 300,
        stageDate: '2024-12-05',
        startStage: '接触',
        endStage: '签约',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        attackPlan: 30
    },
    {
        name: '王五',
        project: 'DD医院医护服项目',
        currentStage: '谈判',
        amount: 600,
        stageDate: '2024-11-15',
        startStage: '递进',
        endStage: '谈判',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0],
        attackPlan: 27
    },
    {
        name: '王五',
        project: 'EE银行职业装项目',
        currentStage: '执行',
        amount: 450,
        stageDate: '2024-11-28',
        startStage: '接触',
        endStage: '执行',
        tasks: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
        attackPlan: 25
    }
];
