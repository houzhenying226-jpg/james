/**
 * 销售考核系统 - 测试数据生成
 * 修复版本 - 简化数据结构，添加调试日志
 */

function generateTestData() {
    console.log('=== 开始生成测试数据 ===');

    // 清除现有数据
    DataStorage.clearAllData();
    console.log('已清除旧数据');

    // ==================== 直接构造项目数据 ====================
    const projects = {};
    const tasks = {};

    // 项目1：XX集团 - 张三
    const p1Id = 'P001';
    projects[p1Id] = {
        id: p1Id,
        name: 'XX集团职业装项目',
        salesperson: '张三',
        amount: 500,
        currentStage: '深入',
        stageStartDate: '2024-11-21',
        monthlyStageTrack: {
            '2024-11': { start: '接触', end: '递进' },
            '2024-12': { start: '递进', end: '深入' }
        },
        stageHistory: [
            { stage: '接触', startDate: '2024-10-15', endDate: '2024-11-10' },
            { stage: '递进', startDate: '2024-11-11', endDate: '2024-11-20' },
            { stage: '深入', startDate: '2024-11-21', endDate: null }
        ],
        createTime: '2024-10-15T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目2：AA学校 - 张三
    const p2Id = 'P002';
    projects[p2Id] = {
        id: p2Id,
        name: 'AA学校校服定制项目',
        salesperson: '张三',
        amount: 300,
        currentStage: '递进',
        stageStartDate: '2024-12-01',
        monthlyStageTrack: {
            '2024-12': { start: '接触', end: '递进' }
        },
        stageHistory: [
            { stage: '接触', startDate: '2024-11-20', endDate: '2024-11-30' },
            { stage: '递进', startDate: '2024-12-01', endDate: null }
        ],
        createTime: '2024-11-20T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目3：BB酒店 - 张三
    const p3Id = 'P003';
    projects[p3Id] = {
        id: p3Id,
        name: 'BB酒店制服项目',
        salesperson: '张三',
        amount: 150,
        currentStage: '接触',
        stageStartDate: '2024-12-10',
        monthlyStageTrack: {
            '2024-12': { start: '接触', end: '接触' }
        },
        stageHistory: [
            { stage: '接触', startDate: '2024-12-10', endDate: null }
        ],
        createTime: '2024-12-10T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目4：YY公司 - 李四
    const p4Id = 'P004';
    projects[p4Id] = {
        id: p4Id,
        name: 'YY公司制服定制项目',
        salesperson: '李四',
        amount: 800,
        currentStage: '执行',
        stageStartDate: '2024-11-05',
        monthlyStageTrack: {
            '2024-11': { start: '递进', end: '深入' },
            '2024-12': { start: '深入', end: '执行' }
        },
        stageHistory: [
            { stage: '递进', startDate: '2024-10-01', endDate: '2024-11-04' },
            { stage: '深入', startDate: '2024-11-05', endDate: '2024-12-10' },
            { stage: '执行', startDate: '2024-12-11', endDate: null }
        ],
        createTime: '2024-10-01T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目5：CC工厂 - 李四
    const p5Id = 'P005';
    projects[p5Id] = {
        id: p5Id,
        name: 'CC工厂工装项目',
        salesperson: '李四',
        amount: 1200,
        currentStage: '冲刺',
        stageStartDate: '2024-11-20',
        monthlyStageTrack: {
            '2024-11': { start: '深入', end: '执行' },
            '2024-12': { start: '执行', end: '冲刺' }
        },
        stageHistory: [
            { stage: '深入', startDate: '2024-10-15', endDate: '2024-11-19' },
            { stage: '执行', startDate: '2024-11-20', endDate: '2024-12-10' },
            { stage: '冲刺', startDate: '2024-12-11', endDate: null }
        ],
        createTime: '2024-09-15T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目6：ZZ企业 - 王五
    const p6Id = 'P006';
    projects[p6Id] = {
        id: p6Id,
        name: 'ZZ企业工装批量采购',
        salesperson: '王五',
        amount: 300,
        currentStage: '签约',
        stageStartDate: '2024-12-05',
        monthlyStageTrack: {
            '2024-11': { start: '接触', end: '冲刺' },
            '2024-12': { start: '冲刺', end: '签约' }
        },
        stageHistory: [
            { stage: '签约', startDate: '2024-12-05', endDate: null }
        ],
        createTime: '2024-10-01T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目7：DD医院 - 王五
    const p7Id = 'P007';
    projects[p7Id] = {
        id: p7Id,
        name: 'DD医院医护服项目',
        salesperson: '王五',
        amount: 600,
        currentStage: '谈判',
        stageStartDate: '2024-11-15',
        monthlyStageTrack: {
            '2024-11': { start: '递进', end: '执行' },
            '2024-12': { start: '执行', end: '谈判' }
        },
        stageHistory: [
            { stage: '谈判', startDate: '2024-12-01', endDate: null }
        ],
        createTime: '2024-09-20T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    // 项目8：EE银行 - 王五
    const p8Id = 'P008';
    projects[p8Id] = {
        id: p8Id,
        name: 'EE银行职业装项目',
        salesperson: '王五',
        amount: 450,
        currentStage: '执行',
        stageStartDate: '2024-11-28',
        monthlyStageTrack: {
            '2024-11': { start: '接触', end: '深入' },
            '2024-12': { start: '深入', end: '执行' }
        },
        stageHistory: [
            { stage: '执行', startDate: '2024-12-05', endDate: null }
        ],
        createTime: '2024-10-20T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };

    console.log('项目数据已构造:', Object.keys(projects));

    // ==================== 生成任务数据 ====================

    // 为P001添加多版本任务（重点演示）
    tasks['P001-1.1'] = createTaskData('P001', '1.1', [
        { date: '2024-11-05', rate: 100, fields: { hasM: true, hasA: true, hasN: true, projectReport: '立项报告.docx' } }
    ]);

    tasks['P001-1.2'] = createTaskData('P001', '1.2', [
        { date: '2024-11-08', rate: 100, fields: { decisionChainFile: '决策链.pptx', keyPersonCount: 5, keyPersonList: '总经理、采购总监等' } }
    ]);

    tasks['P001-1.3'] = createTaskData('P001', '1.3', [
        { date: '2024-11-10', rate: 100, fields: { competitorCount: 3, competitorAnalysis: '竞品分析.xlsx', ourAdvantages: '价格优势' } }
    ]);

    tasks['P001-1.4'] = createTaskData('P001', '1.4', [
        { date: '2024-11-12', rate: 100, fields: { standardCount: 3, standardList: '三个标准' } }
    ]);

    tasks['P001-2.1'] = createTaskData('P001', '2.1', [
        { date: '2024-11-15', rate: 100, fields: { surveyDate: '2024-11-15', surveyReport: '调研报告.docx', requirementConfirm: '确认书.docx', keyRequirements: '核心需求' } }
    ]);

    tasks['P001-2.2'] = createTaskData('P001', '2.2', [
        { date: '2024-11-18', rate: 100, fields: { solutionFile: '方案.pptx', solutionVersion: 'V1.0', solutionHighlights: '亮点' } }
    ]);

    // 任务2.3 - 多版本演示（重点！）
    tasks['P001-2.3'] = createTaskData('P001', '2.3', [
        { date: '2024-11-20', rate: 50, fields: { presentationDate: '2024-11-20T14:00', attendees: '采购部-李经理', feedbackSummary: '需要补充', feedbackCount: 3 } },
        { date: '2024-12-05', rate: 100, fields: { presentationDate: '2024-12-05T10:00', attendees: '总经理-王总、采购总监', feedbackSummary: '认可', feedbackCount: 8 } },
        { date: '2024-12-12', rate: 100, fields: { presentationDate: '2024-12-12T15:00', attendees: '总经理-王总、技术总监', feedbackSummary: '确认', feedbackCount: 6 } },
        { date: '2024-12-25', rate: 100, fields: { presentationDate: '2024-12-25T09:00', attendees: '董事长-赵董、总经理-王总', feedbackSummary: '最终确认', feedbackCount: 5 } }
    ]);

    tasks['P001-3.1'] = createTaskData('P001', '3.1', [
        { date: '2024-11-25', rate: 100, fields: { deepenedSolutionFile: '深化方案.pptx', changesDescription: '优化', improvementCount: 5 } }
    ]);

    tasks['P001-3.2'] = createTaskData('P001', '3.2', [
        { date: '2024-12-08', rate: 50, fields: { samplePrepared: true, demoDate: '2024-12-08', demoAttendees: '采购部', demoFeedback: '需微调' } },
        { date: '2024-12-15', rate: 100, fields: { samplePrepared: true, demoDate: '2024-12-15', demoAttendees: '总经理', demoFeedback: '通过' } }
    ]);

    tasks['P001-3.3'] = createTaskData('P001', '3.3', [
        { date: '2024-12-10', rate: 100, fields: { comparisonDate: '2024-12-10', comparedProducts: '竞品A、B', comparisonResult: '胜出', ourWinPoints: '质量好' } }
    ]);

    // 任务5.1 - 跨阶段演示
    tasks['P001-5.1'] = createTaskData('P001', '5.1', [
        { date: '2024-12-20', rate: 50, fields: { scoringSimulationFile: '模拟表.xlsx', expectedScore: 85, riskCount: 2, riskList: '风险1、2', countermeasures: '措施' } }
    ]);

    console.log('任务数据已构造');

    // ==================== 保存到localStorage ====================
    localStorage.setItem('sales_kpi_projects', JSON.stringify(projects));
    localStorage.setItem('sales_kpi_tasks', JSON.stringify(tasks));
    localStorage.setItem('sales_kpi_config', JSON.stringify({
        selectedMonth: '2024-12',
        currentMonth: '2024-12'
    }));

    console.log('数据已保存到localStorage');

    // 验证保存
    const savedProjects = JSON.parse(localStorage.getItem('sales_kpi_projects'));
    console.log('验证 - 保存的项目数量:', Object.keys(savedProjects).length);
    console.log('验证 - 项目列表:', Object.keys(savedProjects));

    // ==================== 生成11月快照 ====================
    try {
        DataStorage.setSelectedMonth('2024-11');
        ScoreEngine.generateMonthlySnapshot('2024-11');
        DataStorage.setSelectedMonth('2024-12');
        console.log('11月快照已生成');
    } catch (e) {
        console.warn('快照生成失败:', e);
    }

    console.log('=== 测试数据生成完成 ===');
    console.log('- 8个项目');
    console.log('- 3名销售员：张三、李四、王五');
    console.log('- 多版本任务示例');

    return { projects, tasks };
}

/**
 * 创建任务数据
 */
function createTaskData(projectId, taskCode, versions) {
    const config = TASK_CONFIG.find(t => t.code === taskCode);
    if (!config) {
        console.error('任务配置不存在:', taskCode);
        return null;
    }

    const taskVersions = versions.map((v, index) => ({
        versionId: `V${index + 1}.0`,
        createDate: v.date,
        createTime: v.date + 'T12:00:00.000Z',
        fields: v.fields || {},
        files: [],
        validation: { isValid: v.rate === 100 },
        completionRate: v.rate,
        score: Math.round(config.weight * (v.rate / 100) * 100) / 100,
        status: '已验证'
    }));

    // 找最高分版本
    let best = taskVersions[0];
    taskVersions.forEach(v => {
        if (v.score > best.score || (v.score === best.score && v.createDate > best.createDate)) {
            best = v;
        }
    });

    return {
        id: `${projectId}-${taskCode}`,
        projectId: projectId,
        taskCode: taskCode,
        taskName: config.name,
        category: config.category,
        weight: config.weight,
        versions: taskVersions,
        bestVersionId: best.versionId,
        currentScore: best.score,
        createTime: versions[0].date + 'T00:00:00.000Z',
        updateTime: new Date().toISOString()
    };
}

// loadTestData函数已移至new-app.js中
