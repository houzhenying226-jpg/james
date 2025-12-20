/**
 * 销售考核系统 - 测试数据生成
 */

function generateTestData() {
    // 清除现有数据
    DataStorage.clearAllData();

    // ==================== 创建项目 ====================

    // 张三的项目
    const p1 = DataStorage.createProject({
        name: 'XX集团职业装项目',
        salesperson: '张三',
        amount: 500,
        currentStage: '深入',
        stageStartDate: '2024-11-21'
    });
    p1.monthlyStageTrack = {
        '2024-11': { start: '接触', end: '递进' },
        '2024-12': { start: '递进', end: '深入' }
    };
    p1.stageHistory = [
        { stage: '接触', startDate: '2024-10-15', endDate: '2024-11-10' },
        { stage: '递进', startDate: '2024-11-11', endDate: '2024-11-20' },
        { stage: '深入', startDate: '2024-11-21', endDate: null }
    ];
    DataStorage.saveProject(p1);

    const p2 = DataStorage.createProject({
        name: 'AA学校校服定制项目',
        salesperson: '张三',
        amount: 300,
        currentStage: '递进',
        stageStartDate: '2024-12-01'
    });
    p2.monthlyStageTrack = {
        '2024-12': { start: '接触', end: '递进' }
    };
    DataStorage.saveProject(p2);

    const p3 = DataStorage.createProject({
        name: 'BB酒店制服项目',
        salesperson: '张三',
        amount: 150,
        currentStage: '接触',
        stageStartDate: '2024-12-10'
    });
    DataStorage.saveProject(p3);

    // 李四的项目
    const p4 = DataStorage.createProject({
        name: 'YY公司制服定制项目',
        salesperson: '李四',
        amount: 800,
        currentStage: '执行',
        stageStartDate: '2024-11-05'
    });
    p4.monthlyStageTrack = {
        '2024-11': { start: '递进', end: '深入' },
        '2024-12': { start: '深入', end: '执行' }
    };
    DataStorage.saveProject(p4);

    const p5 = DataStorage.createProject({
        name: 'CC工厂工装项目',
        salesperson: '李四',
        amount: 1200,
        currentStage: '冲刺',
        stageStartDate: '2024-11-20'
    });
    p5.monthlyStageTrack = {
        '2024-11': { start: '深入', end: '执行' },
        '2024-12': { start: '执行', end: '冲刺' }
    };
    DataStorage.saveProject(p5);

    // 王五的项目
    const p6 = DataStorage.createProject({
        name: 'ZZ企业工装批量采购',
        salesperson: '王五',
        amount: 300,
        currentStage: '签约',
        stageStartDate: '2024-12-05'
    });
    p6.monthlyStageTrack = {
        '2024-11': { start: '接触', end: '冲刺' },
        '2024-12': { start: '冲刺', end: '签约' }
    };
    DataStorage.saveProject(p6);

    const p7 = DataStorage.createProject({
        name: 'DD医院医护服项目',
        salesperson: '王五',
        amount: 600,
        currentStage: '谈判',
        stageStartDate: '2024-11-15'
    });
    p7.monthlyStageTrack = {
        '2024-11': { start: '递进', end: '执行' },
        '2024-12': { start: '执行', end: '谈判' }
    };
    DataStorage.saveProject(p7);

    const p8 = DataStorage.createProject({
        name: 'EE银行职业装项目',
        salesperson: '王五',
        amount: 450,
        currentStage: '执行',
        stageStartDate: '2024-11-28'
    });
    p8.monthlyStageTrack = {
        '2024-11': { start: '接触', end: '深入' },
        '2024-12': { start: '深入', end: '执行' }
    };
    DataStorage.saveProject(p8);

    // ==================== 添加任务版本 ====================

    // P1 (XX集团) - 多版本演示
    addTaskVersions(p1.id, '1.1', [
        { date: '2024-11-05', fields: { hasM: true, hasA: true, hasN: true, projectReport: '立项报告.docx' } }
    ]);
    addTaskVersions(p1.id, '1.2', [
        { date: '2024-11-08', fields: { decisionChainFile: '决策链.pptx', keyPersonCount: 5, keyPersonList: '总经理王总、采购总监张总、技术总监李总、财务总监刘总、行政总监陈总' } }
    ]);
    addTaskVersions(p1.id, '1.3', [
        { date: '2024-11-10', fields: { competitorCount: 3, competitorAnalysis: '竞品分析.xlsx', ourAdvantages: '价格优势、质量保证、交付速度' } }
    ]);
    addTaskVersions(p1.id, '1.4', [
        { date: '2024-11-12', fields: { standardCount: 3, standardList: '面料克重标准、缝制工艺标准、交付周期标准' } }
    ]);
    addTaskVersions(p1.id, '2.1', [
        { date: '2024-11-15', fields: { surveyDate: '2024-11-15', surveyReport: '需求调研报告.docx', requirementConfirm: '需求确认书.docx', keyRequirements: '1000套职业装，分批交付' } }
    ]);
    addTaskVersions(p1.id, '2.2', [
        { date: '2024-11-18', fields: { solutionFile: '解决方案V1.pptx', solutionVersion: 'V1.0', solutionHighlights: '定制化设计、分批交付、售后保障' } }
    ]);

    // 任务2.3 - 多版本演示（重点！）
    addTaskVersions(p1.id, '2.3', [
        { date: '2024-11-20', fields: { presentationDate: '2024-11-20T14:00', attendees: '采购部-李经理', feedbackSummary: '需要补充技术细节', feedbackCount: 3 } },
        { date: '2024-12-05', fields: { presentationDate: '2024-12-05T10:00', attendees: '总经理-王总、采购总监-张总监', feedbackSummary: '方案整体认可，需要优化价格', feedbackCount: 8 } },
        { date: '2024-12-12', fields: { presentationDate: '2024-12-12T15:00', attendees: '总经理-王总、技术总监-李总', feedbackSummary: '技术方案确认', feedbackCount: 6 } },
        { date: '2024-12-25', fields: { presentationDate: '2024-12-25T09:00', attendees: '董事长-赵董、总经理-王总', feedbackSummary: '最终确认，准备签约', feedbackCount: 5 } }
    ]);

    addTaskVersions(p1.id, '3.1', [
        { date: '2024-11-25', fields: { deepenedSolutionFile: '深化方案.pptx', changesDescription: '增加定制选项、优化交付计划', improvementCount: 5 } }
    ]);

    // 任务3.2 - 两个版本
    addTaskVersions(p1.id, '3.2', [
        { date: '2024-12-08', fields: { samplePrepared: true, demoDate: '2024-12-08', demoAttendees: '采购部', demoFeedback: '样品质量不错，需要微调颜色' } },
        { date: '2024-12-15', fields: { samplePrepared: true, demoDate: '2024-12-15', demoAttendees: '总经理、采购总监', demoFeedback: '样品确认通过' } }
    ]);

    addTaskVersions(p1.id, '3.3', [
        { date: '2024-12-10', fields: { comparisonDate: '2024-12-10', comparedProducts: '竞品A、竞品B', comparisonResult: '我方产品在质量和价格上均有优势', ourWinPoints: '面料克重更高、工艺更精细、价格更优' } }
    ]);

    // 任务5.1 - 跨阶段演示（虽然项目在"深入"阶段，但可以做"冲刺"类任务）
    addTaskVersions(p1.id, '5.1', [
        { date: '2024-12-20', fields: { scoringSimulationFile: '模拟评分表.xlsx', expectedScore: 85, riskCount: 2, riskList: '价格竞争、交付延迟', countermeasures: '提供额外优惠、建立备用供应链' } }
    ]);

    // P2 (AA学校)
    addTaskVersions(p2.id, '1.1', [
        { date: '2024-11-22', fields: { hasM: true, hasA: true, hasN: true, projectReport: '学校项目立项.docx' } }
    ]);
    addTaskVersions(p2.id, '1.2', [
        { date: '2024-11-25', fields: { decisionChainFile: '学校决策链.pptx', keyPersonCount: 4, keyPersonList: '校长、教务主任、总务主任、采购员' } }
    ]);
    addTaskVersions(p2.id, '1.3', [
        { date: '2024-11-28', fields: { competitorCount: 2, competitorAnalysis: '竞品分析.xlsx', ourAdvantages: '校服设计经验丰富' } }
    ]);
    addTaskVersions(p2.id, '1.4', [
        { date: '2024-12-01', fields: { standardCount: 2, standardList: '面料安全标准、舒适度标准' } }
    ]);
    addTaskVersions(p2.id, '2.1', [
        { date: '2024-12-05', fields: { surveyDate: '2024-12-05', surveyReport: '学校需求调研.docx', requirementConfirm: '需求确认.docx', keyRequirements: '500套校服，春季交付' } }
    ]);
    addTaskVersions(p2.id, '2.2', [
        { date: '2024-12-08', fields: { solutionFile: '校服方案.pptx', solutionVersion: 'V1.0', solutionHighlights: '安全环保面料、青春活力设计' } }
    ]);

    // P3 (BB酒店) - 刚开始
    addTaskVersions(p3.id, '1.1', [
        { date: '2024-12-10', fields: { hasM: true, hasA: true, hasN: true, projectReport: '酒店项目立项.docx' } }
    ]);
    addTaskVersions(p3.id, '1.2', [
        { date: '2024-12-12', fields: { decisionChainFile: '酒店决策链.pptx', keyPersonCount: 2, keyPersonList: '酒店经理、采购主管' } }
    ]);

    // P4 (YY公司) - 李四的项目，进度较快
    addCompleteTasksUpTo(p4.id, '4.3', '2024-10', '2024-12');

    // P5 (CC工厂) - 李四的大项目
    addCompleteTasksUpTo(p5.id, '5.1', '2024-09', '2024-12');

    // P6 (ZZ企业) - 王五的项目，已签约
    addAllCompleteTasks(p6.id, '2024-10', '2024-12');

    // P7 (DD医院) - 王五的项目
    addCompleteTasksUpTo(p7.id, '6.1', '2024-09', '2024-12');

    // P8 (EE银行) - 王五的项目
    addCompleteTasksUpTo(p8.id, '4.3', '2024-10', '2024-12');

    // ==================== 生成11月快照 ====================

    // 临时调整数据生成11月快照
    const originalMonth = DataStorage.getSelectedMonth();
    DataStorage.setSelectedMonth('2024-11');
    ScoreEngine.generateMonthlySnapshot('2024-11');

    // 恢复到12月
    DataStorage.setSelectedMonth('2024-12');

    console.log('测试数据生成完成！');
    console.log('- 3名销售员：张三、李四、王五');
    console.log('- 8个项目');
    console.log('- 多版本任务示例');
    console.log('- 2024年11月快照已生成');
}

/**
 * 添加任务版本
 */
function addTaskVersions(projectId, taskCode, versions) {
    versions.forEach(v => {
        // 构造文件列表
        const files = [];
        const config = getTaskConfig(taskCode);
        config.fields.filter(f => f.type === 'file').forEach(f => {
            if (v.fields[f.key]) {
                files.push({ name: v.fields[f.key] });
            }
        });

        DataStorage.uploadTaskVersion(projectId, taskCode, v.fields, files);

        // 修改创建日期
        const task = DataStorage.getTask(`${projectId}-${taskCode}`);
        if (task && task.versions.length > 0) {
            const lastVersion = task.versions[task.versions.length - 1];
            lastVersion.createDate = v.date;
            lastVersion.createTime = v.date + 'T12:00:00.000Z';
            DataStorage.saveTask(task);
        }
    });
}

/**
 * 添加完整任务到指定编号
 */
function addCompleteTasksUpTo(projectId, upToCode, startMonth, endMonth) {
    const upToIndex = TASK_CONFIG.findIndex(t => t.code === upToCode);

    TASK_CONFIG.slice(0, upToIndex + 1).forEach((taskConfig, index) => {
        const month = index < 8 ? startMonth : (index < 12 ? '2024-11' : endMonth);
        const day = String((index % 28) + 1).padStart(2, '0');
        const date = `${month}-${day}`;

        const fields = generateCompleteFields(taskConfig);
        addTaskVersions(projectId, taskConfig.code, [{ date, fields }]);
    });
}

/**
 * 添加全部完成的任务
 */
function addAllCompleteTasks(projectId, startMonth, endMonth) {
    addCompleteTasksUpTo(projectId, '7.1', startMonth, endMonth);
}

/**
 * 生成完整的字段数据
 */
function generateCompleteFields(taskConfig) {
    const fields = {};

    taskConfig.fields.forEach(field => {
        switch (field.type) {
            case 'boolean':
                fields[field.key] = true;
                break;
            case 'number':
                fields[field.key] = 10;
                break;
            case 'date':
                fields[field.key] = new Date().toISOString().split('T')[0];
                break;
            case 'datetime-local':
                fields[field.key] = new Date().toISOString().slice(0, 16);
                break;
            case 'file':
                fields[field.key] = `${field.label}.docx`;
                break;
            case 'textarea':
                fields[field.key] = `${field.label}内容示例`;
                break;
            default:
                fields[field.key] = `${field.label}示例`;
        }
    });

    // 特殊处理某些字段以确保验证通过
    if (taskConfig.code === '2.3') {
        fields.attendees = '总经理-王总、采购总监';
        fields.feedbackCount = 8;
    }
    if (taskConfig.code === '1.2') {
        fields.keyPersonCount = 5;
    }
    if (taskConfig.code === '1.3') {
        fields.competitorCount = 3;
    }
    if (taskConfig.code === '1.4') {
        fields.standardCount = 3;
    }
    if (taskConfig.code === '3.1') {
        fields.improvementCount = 5;
    }
    if (taskConfig.code === '5.1') {
        fields.riskCount = 4;
    }

    return fields;
}
