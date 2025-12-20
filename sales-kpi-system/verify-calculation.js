/**
 * 计算验证脚本
 * 用于验证张三的计算结果是否符合需求文档示例
 */

// 模拟配置
const TASKS = [
    { id: '1.1', name: 'MAN分析与项目立项', weight: 3.0 },
    { id: '1.2', name: '决策链地图绘制', weight: 2.5 },
    { id: '1.3', name: '竞品深度分析', weight: 2.5 },
    { id: '1.4', name: '技术标准影响计划', weight: 2.0 },
    { id: '2.1', name: '需求深度调研', weight: 2.5 },
    { id: '2.2', name: '客户化方案设计', weight: 3.0 },
    { id: '2.3', name: '方案讲解与反馈收集', weight: 2.5 },
    { id: '3.1', name: '决策链地图深化', weight: 2.0 },
    { id: '3.2', name: '样品准备与现场展示', weight: 2.5 },
    { id: '3.3', name: '竞品方案对比展示', weight: 2.5 },
    { id: '4.1', name: '最终方案优化与提交', weight: 2.5 },
    { id: '4.2', name: '入围确认与竞品信息跟踪', weight: 2.0 },
    { id: '4.3', name: '投标策略制定与投标文件准备', weight: 2.5 },
    { id: '5.1', name: '评分模拟与风险应对', weight: 3.0 },
    { id: '6.1', name: '商务谈判与让步策略', weight: 3.0 },
    { id: '7.1', name: '合同签订与项目交接', weight: 2.0 }
];

// 张三的任务完成情况
// 1.1-3.3共10个100%，3.2和4.1两个50%，其余0%
const zhangSanTasks = [
    100, 100, 100, 100,  // 1.1-1.4 (4个100%)
    100, 100, 100,       // 2.1-2.3 (3个100%)
    100, 50, 100,        // 3.1-3.3 (3.1和3.3是100%，3.2是50%)
    50, 0, 0,            // 4.1-4.3 (4.1是50%，其他0%)
    0,                   // 5.1
    0,                   // 6.1
    0                    // 7.1
];

console.log('=== 张三计算验证 ===\n');

// 1. 子活动得分
let subActivityScore = 0;
let completedTasks = 0;

console.log('任务完成情况：');
TASKS.forEach((task, index) => {
    const completion = zhangSanTasks[index];
    const score = task.weight * (completion / 100);
    subActivityScore += score;
    if (completion === 100) completedTasks++;
    console.log(`  ${task.id}: ${completion}% × ${task.weight} = ${score.toFixed(2)}分`);
});

subActivityScore = Math.round(subActivityScore * 100) / 100;
console.log(`\n子活动得分合计：${subActivityScore}分`);
console.log(`完成100%的任务数：${completedTasks}个`);

// 2. 进攻计划得分
const attackPlan = 28;
console.log(`\n进攻计划得分：${attackPlan}分`);

// 3. 影响效果得分
// 从接触(1)到深入(3)，推进2阶段
const progressStages = 3 - 1; // = 2
const impactScore = Math.round((progressStages / 7) * 20 * 100) / 100;
console.log(`\n影响效果得分：${progressStages}/7 × 20 = ${impactScore}分`);

// 4. 流程合规得分
const complianceScore = Math.round((completedTasks / 16) * 10 * 100) / 100;
console.log(`流程合规得分：${completedTasks}/16 × 10 = ${complianceScore}分`);

// 5. 基础分
const baseScore = subActivityScore + attackPlan + impactScore + complianceScore;
console.log(`\n基础分：${subActivityScore} + ${attackPlan} + ${impactScore} + ${complianceScore} = ${baseScore}分`);

// 6. 三大系数
const difficultyCoef = 1.2;  // 500万
const stayCoef = 1.0;        // 25天（当前日期-2024-11-25）
const progressCoef = 1.2;    // 推进2阶段

console.log(`\n难度系数：${difficultyCoef} (500万项目)`);
console.log(`停留系数：${stayCoef} (约25天)`);
console.log(`推进系数：${progressCoef} (推进2阶段)`);

// 7. 最终得分
const finalScore = Math.round(baseScore * difficultyCoef * stayCoef * progressCoef * 100) / 100;
console.log(`\n最终得分：${baseScore} × ${difficultyCoef} × ${stayCoef} × ${progressCoef} = ${finalScore}分`);

// 与需求文档对比
console.log('\n=== 与需求文档对比 ===');
console.log('需求文档示例结果：');
console.log('  子活动得分 = 22.5分');
console.log('  进攻计划 = 28分');
console.log('  影响效果 = 5.71分');
console.log('  流程合规 = 5.56分');
console.log('  基础分 = 61.77分');
console.log('  最终得分 = 88.95分');

console.log('\n实际计算结果：');
console.log(`  子活动得分 = ${subActivityScore}分`);
console.log(`  进攻计划 = ${attackPlan}分`);
console.log(`  影响效果 = ${impactScore}分`);
console.log(`  流程合规 = ${complianceScore}分`);
console.log(`  基础分 = ${baseScore}分`);
console.log(`  最终得分 = ${finalScore}分`);

// 需求文档中的任务分解验证
console.log('\n=== 需求文档任务分解验证 ===');
console.log('需求文档写的是：3+2.5+1.25+2+2.5+3+2.5+2+1.25+2.5 = 22.5分');
console.log('这对应的是：1.1(3) + 1.2(2.5) + 1.3×0.5(1.25) + 1.4(2) + 2.1(2.5) + 2.2(3) + 2.3(2.5) + 3.1(2) + 3.2×0.5(1.25) + 3.3(2.5)');
console.log('');
console.log('但用户的原始描述是：');
console.log('  1.1-3.3共10个100%');
console.log('  3.2和4.1两个50%');
console.log('');
console.log('所以按照用户描述：');
console.log('  1.1-1.4全部100%: 3+2.5+2.5+2 = 10分');
console.log('  2.1-2.3全部100%: 2.5+3+2.5 = 8分');
console.log('  3.1=100%, 3.2=50%, 3.3=100%: 2+1.25+2.5 = 5.75分');
console.log('  4.1=50%: 1.25分');
console.log('  总计: 10+8+5.75+1.25 = 25分');
console.log('');
console.log('需求文档的22.5分可能是按照不同的任务完成情况计算的。');
console.log('我们的系统会按照实际导入的数据进行计算。');
