/**
 * 销售考核系统 - 测试数据生成
 * 生成11月和12月的完整测试数据
 */

function generateTestData() {
    // 清除现有数据
    DataStorage.clearAllData();

    // ==================== 项目数据 ====================

    const projects = {
        // ========== 张三的项目 ==========
        'P001': {
            projectId: 'P001',
            projectName: 'XX集团服装采购项目',
            salesPerson: '张三',
            amount: 500,
            currentStage: '深入',
            stageDate: '2024-11-25',
            monthStartStage: '接触',  // 本月初阶段
            attackPlanScore: 28,
            createTime: '2024-10-15',
            updateTime: '2024-12-15',
            tasks: {
                '1.1': createTask('1.1', 'P001', [
                    { date: '2024-11-05', completion: 100, note: '完成立项' }
                ]),
                '1.2': createTask('1.2', 'P001', [
                    { date: '2024-11-08', completion: 100, note: '绘制完成' }
                ]),
                '1.3': createTask('1.3', 'P001', [
                    { date: '2024-11-10', completion: 50, note: '初步分析' },
                    { date: '2024-12-05', completion: 100, note: '深入分析完成' }
                ]),
                '1.4': createTask('1.4', 'P001', [
                    { date: '2024-11-12', completion: 100, note: '计划制定' }
                ]),
                '2.1': createTask('2.1', 'P001', [
                    { date: '2024-11-15', completion: 100, note: '调研完成' }
                ]),
                '2.2': createTask('2.2', 'P001', [
                    { date: '2024-11-18', completion: 100, note: '方案设计V1' }
                ]),
                '2.3': createTask('2.3', 'P001', [
                    { date: '2024-11-20', completion: 50, note: '讲给采购部，3人参会', fields: { 参会关键人: '采购部-李经理', 反馈数量: 3 } },
                    { date: '2024-12-12', completion: 100, note: '讲给决策层，8人参会', fields: { 参会关键人: '总经理-王总、采购总监', 反馈数量: 8 } }
                ]),
                '3.1': createTask('3.1', 'P001', [
                    { date: '2024-11-25', completion: 100, note: '深化完成' }
                ]),
                '3.2': createTask('3.2', 'P001', [
                    { date: '2024-11-28', completion: 50, note: '初次展示' },
                    { date: '2024-12-08', completion: 100, note: '完整展示' },
                    { date: '2024-12-15', completion: 100, note: '补充技术细节' }
                ]),
                '3.3': createTask('3.3', 'P001', [
                    { date: '2024-12-10', completion: 100, note: '对比展示完成' }
                ])
            }
        },

        'P002': {
            projectId: 'P002',
            projectName: 'AA学校校服定制项目',
            salesPerson: '张三',
            amount: 300,
            currentStage: '递进',
            stageDate: '2024-12-01',
            monthStartStage: '接触',
            attackPlanScore: 22,
            createTime: '2024-11-20',
            updateTime: '2024-12-10',
            tasks: {
                '1.1': createTask('1.1', 'P002', [
                    { date: '2024-11-22', completion: 100, note: '学校项目立项' }
                ]),
                '1.2': createTask('1.2', 'P002', [
                    { date: '2024-11-25', completion: 100, note: '决策链绘制' }
                ]),
                '1.3': createTask('1.3', 'P002', [
                    { date: '2024-11-28', completion: 100, note: '竞品分析' }
                ]),
                '1.4': createTask('1.4', 'P002', [
                    { date: '2024-12-01', completion: 100, note: '标准影响' }
                ]),
                '2.1': createTask('2.1', 'P002', [
                    { date: '2024-12-05', completion: 100, note: '需求调研' }
                ]),
                '2.2': createTask('2.2', 'P002', [
                    { date: '2024-12-08', completion: 50, note: '方案设计中' }
                ])
            }
        },

        'P003': {
            projectId: 'P003',
            projectName: 'BB酒店制服项目',
            salesPerson: '张三',
            amount: 150,
            currentStage: '接触',
            stageDate: '2024-12-10',
            monthStartStage: '接触',
            attackPlanScore: 15,
            createTime: '2024-12-08',
            updateTime: '2024-12-12',
            tasks: {
                '1.1': createTask('1.1', 'P003', [
                    { date: '2024-12-10', completion: 100, note: '酒店项目立项' }
                ]),
                '1.2': createTask('1.2', 'P003', [
                    { date: '2024-12-12', completion: 50, note: '初步绘制' }
                ])
            }
        },

        // ========== 李四的项目 ==========
        'P004': {
            projectId: 'P004',
            projectName: 'YY公司制服定制项目',
            salesPerson: '李四',
            amount: 800,
            currentStage: '执行',
            stageDate: '2024-11-05',
            monthStartStage: '递进',
            attackPlanScore: 26,
            createTime: '2024-10-01',
            updateTime: '2024-12-15',
            tasks: {
                '1.1': createTask('1.1', 'P004', [{ date: '2024-10-05', completion: 100 }]),
                '1.2': createTask('1.2', 'P004', [{ date: '2024-10-08', completion: 100 }]),
                '1.3': createTask('1.3', 'P004', [{ date: '2024-10-10', completion: 100 }]),
                '1.4': createTask('1.4', 'P004', [{ date: '2024-10-12', completion: 100 }]),
                '2.1': createTask('2.1', 'P004', [{ date: '2024-10-15', completion: 100 }]),
                '2.2': createTask('2.2', 'P004', [{ date: '2024-10-18', completion: 100 }]),
                '2.3': createTask('2.3', 'P004', [
                    { date: '2024-10-20', completion: 50 },
                    { date: '2024-11-05', completion: 100 }
                ]),
                '3.1': createTask('3.1', 'P004', [{ date: '2024-11-08', completion: 100 }]),
                '3.2': createTask('3.2', 'P004', [{ date: '2024-11-12', completion: 100 }]),
                '3.3': createTask('3.3', 'P004', [{ date: '2024-11-15', completion: 100 }]),
                '4.1': createTask('4.1', 'P004', [{ date: '2024-11-20', completion: 100 }]),
                '4.2': createTask('4.2', 'P004', [{ date: '2024-11-25', completion: 100 }]),
                '4.3': createTask('4.3', 'P004', [{ date: '2024-12-01', completion: 100 }])
            }
        },

        'P005': {
            projectId: 'P005',
            projectName: 'CC工厂工装项目',
            salesPerson: '李四',
            amount: 1200,
            currentStage: '冲刺',
            stageDate: '2024-11-20',
            monthStartStage: '深入',
            attackPlanScore: 28,
            createTime: '2024-09-15',
            updateTime: '2024-12-15',
            tasks: {
                '1.1': createTask('1.1', 'P005', [{ date: '2024-09-20', completion: 100 }]),
                '1.2': createTask('1.2', 'P005', [{ date: '2024-09-22', completion: 100 }]),
                '1.3': createTask('1.3', 'P005', [{ date: '2024-09-25', completion: 100 }]),
                '1.4': createTask('1.4', 'P005', [{ date: '2024-09-28', completion: 100 }]),
                '2.1': createTask('2.1', 'P005', [{ date: '2024-10-01', completion: 100 }]),
                '2.2': createTask('2.2', 'P005', [{ date: '2024-10-05', completion: 100 }]),
                '2.3': createTask('2.3', 'P005', [{ date: '2024-10-10', completion: 100 }]),
                '3.1': createTask('3.1', 'P005', [{ date: '2024-10-15', completion: 100 }]),
                '3.2': createTask('3.2', 'P005', [{ date: '2024-10-20', completion: 100 }]),
                '3.3': createTask('3.3', 'P005', [{ date: '2024-10-25', completion: 100 }]),
                '4.1': createTask('4.1', 'P005', [{ date: '2024-11-01', completion: 100 }]),
                '4.2': createTask('4.2', 'P005', [{ date: '2024-11-10', completion: 100 }]),
                '4.3': createTask('4.3', 'P005', [{ date: '2024-11-15', completion: 100 }]),
                '5.1': createTask('5.1', 'P005', [
                    { date: '2024-11-25', completion: 50 },
                    { date: '2024-12-10', completion: 100 }
                ])
            }
        },

        // ========== 王五的项目 ==========
        'P006': {
            projectId: 'P006',
            projectName: 'ZZ企业工装批量采购',
            salesPerson: '王五',
            amount: 300,
            currentStage: '签约',
            stageDate: '2024-12-05',
            monthStartStage: '接触',
            attackPlanScore: 30,
            createTime: '2024-10-01',
            updateTime: '2024-12-15',
            tasks: generateAllTasksComplete('P006', '2024-10', '2024-12-05')
        },

        'P007': {
            projectId: 'P007',
            projectName: 'DD医院医护服项目',
            salesPerson: '王五',
            amount: 600,
            currentStage: '谈判',
            stageDate: '2024-11-15',
            monthStartStage: '递进',
            attackPlanScore: 27,
            createTime: '2024-09-20',
            updateTime: '2024-12-12',
            tasks: {
                '1.1': createTask('1.1', 'P007', [{ date: '2024-09-25', completion: 100 }]),
                '1.2': createTask('1.2', 'P007', [{ date: '2024-09-28', completion: 100 }]),
                '1.3': createTask('1.3', 'P007', [{ date: '2024-10-01', completion: 100 }]),
                '1.4': createTask('1.4', 'P007', [{ date: '2024-10-05', completion: 100 }]),
                '2.1': createTask('2.1', 'P007', [{ date: '2024-10-08', completion: 100 }]),
                '2.2': createTask('2.2', 'P007', [{ date: '2024-10-12', completion: 100 }]),
                '2.3': createTask('2.3', 'P007', [{ date: '2024-10-15', completion: 100 }]),
                '3.1': createTask('3.1', 'P007', [{ date: '2024-10-20', completion: 100 }]),
                '3.2': createTask('3.2', 'P007', [{ date: '2024-10-25', completion: 100 }]),
                '3.3': createTask('3.3', 'P007', [{ date: '2024-10-28', completion: 100 }]),
                '4.1': createTask('4.1', 'P007', [{ date: '2024-11-01', completion: 100 }]),
                '4.2': createTask('4.2', 'P007', [{ date: '2024-11-05', completion: 100 }]),
                '4.3': createTask('4.3', 'P007', [{ date: '2024-11-10', completion: 100 }]),
                '5.1': createTask('5.1', 'P007', [{ date: '2024-11-15', completion: 100 }]),
                '6.1': createTask('6.1', 'P007', [
                    { date: '2024-11-20', completion: 50 },
                    { date: '2024-12-05', completion: 100 }
                ])
            }
        },

        'P008': {
            projectId: 'P008',
            projectName: 'EE银行职业装项目',
            salesPerson: '王五',
            amount: 450,
            currentStage: '执行',
            stageDate: '2024-11-28',
            monthStartStage: '接触',
            attackPlanScore: 25,
            createTime: '2024-10-20',
            updateTime: '2024-12-10',
            tasks: {
                '1.1': createTask('1.1', 'P008', [{ date: '2024-10-22', completion: 100 }]),
                '1.2': createTask('1.2', 'P008', [{ date: '2024-10-25', completion: 100 }]),
                '1.3': createTask('1.3', 'P008', [{ date: '2024-10-28', completion: 100 }]),
                '1.4': createTask('1.4', 'P008', [{ date: '2024-11-01', completion: 100 }]),
                '2.1': createTask('2.1', 'P008', [{ date: '2024-11-05', completion: 100 }]),
                '2.2': createTask('2.2', 'P008', [{ date: '2024-11-08', completion: 100 }]),
                '2.3': createTask('2.3', 'P008', [{ date: '2024-11-12', completion: 100 }]),
                '3.1': createTask('3.1', 'P008', [{ date: '2024-11-15', completion: 100 }]),
                '3.2': createTask('3.2', 'P008', [{ date: '2024-11-18', completion: 100 }]),
                '3.3': createTask('3.3', 'P008', [{ date: '2024-11-22', completion: 100 }]),
                '4.1': createTask('4.1', 'P008', [{ date: '2024-11-25', completion: 100 }]),
                '4.2': createTask('4.2', 'P008', [{ date: '2024-12-01', completion: 100 }]),
                '4.3': createTask('4.3', 'P008', [{ date: '2024-12-05', completion: 100 }])
            }
        }
    };

    // 保存项目数据
    DataStorage.saveAllProjects(projects);

    // ==================== 生成11月快照 ====================
    const nov2024Snapshot = generateNovemberSnapshot(projects);
    DataStorage.saveSnapshot(nov2024Snapshot);

    // 设置当前月份为12月
    DataStorage.setCurrentMonth('2024-12');

    console.log('测试数据生成完成！');
    console.log('- 3名销售员：张三、李四、王五');
    console.log('- 8个项目');
    console.log('- 11月快照已生成');
    console.log('- 当前月份：2024年12月');

    return {
        projects: projects,
        snapshot: nov2024Snapshot
    };
}

/**
 * 创建任务数据
 */
function createTask(taskId, projectId, versions) {
    const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);

    const taskVersions = versions.map((v, index) => ({
        versionId: `V${index + 1}.0`,
        uploadDate: v.date,
        fields: v.fields || {},
        files: v.files || [],
        completionRate: v.completion,
        score: Math.round(taskDef.weight * (v.completion / 100) * 100) / 100,
        status: '已验证',
        note: v.note || ''
    }));

    // 找最高分
    let best = taskVersions[0];
    taskVersions.forEach(v => {
        if (v.score > best.score) best = v;
    });

    return {
        taskId: taskId,
        taskName: taskDef.name,
        projectId: projectId,
        versions: taskVersions,
        currentVersion: best.versionId,
        currentScore: best.score,
        bestCompletionRate: best.completionRate
    };
}

/**
 * 生成全部任务完成的数据
 */
function generateAllTasksComplete(projectId, startMonth, endDate) {
    const tasks = {};
    const dates = [
        '01', '03', '05', '08', '10', '12', '15', '18',
        '20', '22', '25', '28', '30', '02', '05', '08'
    ];

    TASK_DEFINITIONS.forEach((taskDef, index) => {
        const month = index < 10 ? startMonth : '2024-11';
        const day = dates[index] || '15';
        tasks[taskDef.id] = createTask(taskDef.id, projectId, [
            { date: `${month}-${day}`, completion: 100 }
        ]);
    });

    return tasks;
}

/**
 * 生成11月快照
 */
function generateNovemberSnapshot(projects) {
    // 11月的阶段状态（模拟11月底的状态）
    const nov11Projects = JSON.parse(JSON.stringify(projects));

    // 调整为11月底状态
    nov11Projects['P001'].currentStage = '递进';
    nov11Projects['P001'].monthStartStage = '接触';
    // P002在11月还没开始
    delete nov11Projects['P002'];
    delete nov11Projects['P003'];

    nov11Projects['P004'].currentStage = '深入';
    nov11Projects['P004'].monthStartStage = '递进';

    nov11Projects['P005'].currentStage = '执行';
    nov11Projects['P005'].monthStartStage = '深入';

    nov11Projects['P006'].currentStage = '冲刺';
    nov11Projects['P006'].monthStartStage = '接触';

    nov11Projects['P007'].currentStage = '执行';
    nov11Projects['P007'].monthStartStage = '递进';

    nov11Projects['P008'].currentStage = '深入';
    nov11Projects['P008'].monthStartStage = '接触';

    // 使用调整后的数据生成快照
    const tempProjects = DataStorage.getAllProjects();
    DataStorage.saveAllProjects(nov11Projects);

    const snapshot = ScoreCalculator.generateMonthlySnapshot('2024-11');
    snapshot.snapshotTime = '2024-11-30T23:59:59.000Z';

    // 恢复原数据
    DataStorage.saveAllProjects(tempProjects);

    return snapshot;
}

/**
 * 加载测试数据（供UI调用）
 */
function loadTestData() {
    const result = generateTestData();
    return result;
}
