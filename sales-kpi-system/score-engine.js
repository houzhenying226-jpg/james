/**
 * 销售考核系统 - 分数计算引擎
 */

class ScoreEngine {
    /**
     * 计算项目得分
     * @param {Object} project - 项目对象
     * @param {string} month - 月份 (YYYY-MM)
     * @returns {Object} 得分详情
     */
    static calculateProjectScore(project, month = null) {
        if (!month) {
            month = DataStorage.getCurrentMonth();
        }

        const result = {
            projectId: project.id,
            projectName: project.name,
            salesperson: project.salesperson,
            amount: project.amount,
            currentStage: project.currentStage,
            month: month,

            // 任务得分明细
            taskScores: {},
            completedTasks: 0,
            totalTasks: TASK_CONFIG.length,

            // 四个维度
            subActivityScore: 0,    // 子活动得分 (40分)
            attackPlanScore: 0,     // 进攻计划 (30分) - 暂定为固定值或根据其他指标
            impactScore: 0,         // 影响效果 (20分) - 暂定
            complianceScore: 0,     // 流程合规 (10分)

            // 基础分
            baseScore: 0,

            // 系数
            difficultyCoef: { value: 1.0, label: '' },
            stayCoef: { value: 1.0, label: '' },
            progressCoef: { value: 1.0, label: '' },

            // 最终分
            finalScore: 0,
            grade: '',
            gradeIcon: '',
            gradeColor: ''
        };

        // 1. 计算任务得分
        this.calculateTaskScores(project, result);

        // 2. 计算四个维度
        this.calculateDimensions(project, result);

        // 3. 计算基础分
        result.baseScore = Math.round((
            result.subActivityScore +
            result.attackPlanScore +
            result.impactScore +
            result.complianceScore
        ) * 100) / 100;

        // 4. 计算系数
        this.calculateCoefficients(project, result, month);

        // 5. 计算最终分
        result.finalScore = Math.round(
            result.baseScore *
            result.difficultyCoef.value *
            result.stayCoef.value *
            result.progressCoef.value *
            100
        ) / 100;

        // 6. 获取等级
        const grade = getGrade(result.finalScore);
        result.grade = grade.grade;
        result.gradeIcon = grade.icon;
        result.gradeColor = grade.color;

        return result;
    }

    /**
     * 计算任务得分
     */
    static calculateTaskScores(project, result) {
        const projectTasks = DataStorage.getProjectTasks(project.id);

        TASK_CONFIG.forEach(taskConfig => {
            const taskId = `${project.id}-${taskConfig.code}`;
            const task = projectTasks[taskId];

            const taskScore = {
                taskCode: taskConfig.code,
                taskName: taskConfig.name,
                category: taskConfig.category,
                weight: taskConfig.weight,
                versionCount: 0,
                bestVersionId: null,
                completionRate: 0,
                score: 0
            };

            if (task && task.versions.length > 0) {
                taskScore.versionCount = task.versions.length;
                taskScore.bestVersionId = task.bestVersionId;
                taskScore.score = task.currentScore;

                // 找到最优版本的完成度
                const bestVersion = task.versions.find(v => v.versionId === task.bestVersionId);
                if (bestVersion) {
                    taskScore.completionRate = bestVersion.completionRate;
                }

                if (taskScore.completionRate === 100) {
                    result.completedTasks++;
                }
            }

            result.taskScores[taskConfig.code] = taskScore;
            result.subActivityScore += taskScore.score;
        });

        // 限制子活动得分最高40分
        result.subActivityScore = Math.min(40, Math.round(result.subActivityScore * 100) / 100);
    }

    /**
     * 计算四个维度得分
     */
    static calculateDimensions(project, result) {
        // 子活动得分已在calculateTaskScores中计算

        // 进攻计划得分 (30分)
        // 暂时根据任务完成度估算
        const completionRatio = result.completedTasks / result.totalTasks;
        result.attackPlanScore = Math.round(30 * completionRatio * 100) / 100;

        // 影响效果得分 (20分)
        // 根据阶段进展估算
        const stageIndex = getStageIndex(project.currentStage);
        const stageRatio = (stageIndex + 1) / STAGES.length;
        result.impactScore = Math.round(20 * stageRatio * 100) / 100;

        // 流程合规得分 (10分)
        // 根据任务完成度计算
        result.complianceScore = Math.round(10 * completionRatio * 100) / 100;
    }

    /**
     * 计算系数
     */
    static calculateCoefficients(project, result, month) {
        // 1. 难度系数（根据金额）
        result.difficultyCoef = getDifficultyCoef(project.amount);

        // 2. 停留系数（根据当前阶段停留天数）
        const stayDays = this.calculateStayDays(project);
        result.stayCoef = getStayCoef(stayDays);
        result.stayCoef.days = stayDays;

        // 3. 推进系数（根据本月阶段变化）
        const stageChange = this.calculateStageChange(project, month);
        result.progressCoef = getProgressCoef(stageChange);
        result.progressCoef.change = stageChange;
    }

    /**
     * 计算当前阶段停留天数
     */
    static calculateStayDays(project) {
        if (!project.stageStartDate) return 0;

        const startDate = new Date(project.stageStartDate);
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * 计算本月阶段变化
     */
    static calculateStageChange(project, month) {
        const track = project.monthlyStageTrack && project.monthlyStageTrack[month];
        if (!track) return 0;

        return getStageChange(track.start, track.end);
    }

    /**
     * 计算销售员月度汇总
     */
    static calculateSalespersonSummary(salesperson, month = null) {
        if (!month) {
            month = DataStorage.getCurrentMonth();
        }

        const projects = DataStorage.getProjectsBySalesperson(salesperson);
        if (projects.length === 0) {
            return null;
        }

        const projectResults = projects.map(p => this.calculateProjectScore(p, month));

        const totalScore = projectResults.reduce((sum, r) => sum + r.finalScore, 0);
        const avgScore = Math.round(totalScore / projectResults.length * 100) / 100;

        const grade = getGrade(avgScore);

        return {
            salesperson: salesperson,
            month: month,
            projectCount: projects.length,
            projects: projectResults,
            totalScore: totalScore,
            avgScore: avgScore,
            highestScore: Math.max(...projectResults.map(r => r.finalScore)),
            lowestScore: Math.min(...projectResults.map(r => r.finalScore)),
            grade: grade.grade,
            gradeIcon: grade.icon,
            gradeColor: grade.color
        };
    }

    /**
     * 生成月度排名
     */
    static generateMonthlyRanking(month = null) {
        if (!month) {
            month = DataStorage.getCurrentMonth();
        }

        const salespeople = DataStorage.getAllSalespeople();
        const summaries = salespeople
            .map(s => this.calculateSalespersonSummary(s, month))
            .filter(s => s !== null);

        // 按平均分排序
        summaries.sort((a, b) => b.avgScore - a.avgScore);

        // 添加排名
        summaries.forEach((s, index) => {
            s.rank = index + 1;
        });

        return {
            month: month,
            ranking: summaries,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * 生成月度快照
     */
    static generateMonthlySnapshot(month = null) {
        if (!month) {
            month = DataStorage.getCurrentMonth();
        }

        const ranking = this.generateMonthlyRanking(month);
        const snapshotData = {};

        ranking.ranking.forEach(summary => {
            snapshotData[summary.salesperson] = {
                month: month,
                salesperson: summary.salesperson,
                snapshotTime: new Date().toISOString(),
                isLocked: true,

                projectSnapshots: summary.projects.map(p => ({
                    projectId: p.projectId,
                    projectName: p.projectName,
                    currentStage: p.currentStage,
                    amount: p.amount,
                    taskScores: p.taskScores,
                    baseScore: p.baseScore,
                    difficultyCoef: p.difficultyCoef,
                    stayCoef: p.stayCoef,
                    progressCoef: p.progressCoef,
                    finalScore: p.finalScore,
                    grade: p.grade
                })),

                totalProjects: summary.projectCount,
                avgScore: summary.avgScore,
                rank: summary.rank,
                grade: summary.grade,
                gradeIcon: summary.gradeIcon
            };
        });

        DataStorage.saveSnapshot(month, snapshotData);

        return {
            month: month,
            data: snapshotData,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * 获取排名数据（优先使用快照）
     */
    static getRankingData(month = null) {
        if (!month) {
            month = DataStorage.getSelectedMonth();
        }

        // 检查是否有快照
        const snapshot = DataStorage.getMonthSnapshot(month);
        if (snapshot && Object.keys(snapshot).length > 0) {
            // 使用快照数据
            const ranking = Object.values(snapshot)
                .sort((a, b) => a.rank - b.rank);

            return {
                month: month,
                isSnapshot: true,
                snapshotTime: ranking[0]?.snapshotTime,
                ranking: ranking
            };
        }

        // 实时计算
        const realtime = this.generateMonthlyRanking(month);
        return {
            month: month,
            isSnapshot: false,
            ranking: realtime.ranking
        };
    }
}
