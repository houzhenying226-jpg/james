/**
 * 销售考核系统 - 核心计算引擎 V2
 * 支持任务版本化和月度快照
 */

class ScoreCalculator {

    /**
     * 计算单个项目的得分
     * @param {Project} project - 项目数据
     * @param {string} month - 计算月份 (YYYY-MM)
     * @param {string} monthStartStage - 月初阶段（用于计算推进）
     * @returns {Object} 项目得分详情
     */
    static calculateProject(project, month, monthStartStage = null) {
        const result = {
            projectId: project.projectId,
            projectName: project.projectName,
            salesPerson: project.salesPerson,
            amount: project.amount,
            currentStage: project.currentStage,
            stageDate: project.stageDate,

            // 任务得分明细
            taskScores: [],
            subActivityScore: 0,      // 子活动得分 (40分满分)
            attackPlanScore: project.attackPlanScore || 0,  // 进攻计划 (30分满分)
            impactScore: 0,           // 影响效果 (20分满分)
            complianceScore: 0,       // 流程合规 (10分满分)
            baseScore: 0,             // 基础分

            // 系数
            difficultyCoef: { value: 1.0, reason: '' },
            stayCoef: { value: 1.0, reason: '' },
            progressCoef: { value: 1.0, reason: '' },

            // 统计
            stayDays: 0,
            progressStages: 0,
            completedTasks: 0,
            totalVersions: 0,

            // 最终
            finalScore: 0,
            grade: '',
            gradeIcon: '',
            gradeColor: ''
        };

        // 1. 计算子活动得分（取每个任务的最高分版本）
        this.calculateTaskScores(project, result);

        // 2. 计算影响效果得分
        const startStage = monthStartStage || project.monthStartStage || project.currentStage;
        this.calculateImpactScore(result, startStage, project.currentStage);

        // 3. 计算流程合规得分
        this.calculateComplianceScore(result);

        // 4. 计算基础分
        result.baseScore = Math.round((
            result.subActivityScore +
            result.attackPlanScore +
            result.impactScore +
            result.complianceScore
        ) * 100) / 100;

        // 5. 计算三大系数
        this.calculateDifficultyCoef(result, project.amount);
        this.calculateStayCoef(result, project.stageDate);
        this.calculateProgressCoef(result, startStage, project.currentStage);

        // 6. 计算最终得分
        result.finalScore = Math.round(
            result.baseScore *
            result.difficultyCoef.value *
            result.stayCoef.value *
            result.progressCoef.value * 100
        ) / 100;

        // 7. 评定等级
        this.calculateGrade(result);

        return result;
    }

    /**
     * 计算任务得分（取每个任务的最高分版本）
     */
    static calculateTaskScores(project, result) {
        let totalScore = 0;
        let completedCount = 0;
        let totalVersions = 0;

        TASK_DEFINITIONS.forEach(taskDef => {
            const task = project.tasks ? project.tasks[taskDef.id] : null;

            let bestScore = 0;
            let bestCompletion = 0;
            let versionCount = 0;
            let bestVersionId = null;

            if (task && task.versions && task.versions.length > 0) {
                versionCount = task.versions.length;
                totalVersions += versionCount;

                // 找最高分版本
                task.versions.forEach(v => {
                    const score = taskDef.weight * (v.completionRate / 100);
                    if (score > bestScore) {
                        bestScore = score;
                        bestCompletion = v.completionRate;
                        bestVersionId = v.versionId;
                    }
                });
            }

            bestScore = Math.round(bestScore * 100) / 100;

            if (bestCompletion === 100) {
                completedCount++;
            }

            totalScore += bestScore;

            result.taskScores.push({
                taskId: taskDef.id,
                taskName: taskDef.name,
                stage: taskDef.stage,
                weight: taskDef.weight,
                versionCount: versionCount,
                bestVersionId: bestVersionId,
                completionRate: bestCompletion,
                score: bestScore
            });
        });

        result.subActivityScore = Math.round(totalScore * 100) / 100;
        result.completedTasks = completedCount;
        result.totalVersions = totalVersions;
    }

    /**
     * 计算影响效果得分
     * 公式：本月推进阶段数 ÷ 7 × 20
     */
    static calculateImpactScore(result, startStage, endStage) {
        const startIndex = STAGE_INDEX[startStage] || 1;
        const endIndex = STAGE_INDEX[endStage] || 1;

        result.progressStages = Math.max(0, endIndex - startIndex);
        result.impactScore = Math.round((result.progressStages / 7) * 20 * 100) / 100;
    }

    /**
     * 计算流程合规得分
     * 公式：完成度100%的任务数 ÷ 16 × 10
     */
    static calculateComplianceScore(result) {
        result.complianceScore = Math.round((result.completedTasks / 16) * 10 * 100) / 100;
    }

    /**
     * 计算难度系数
     */
    static calculateDifficultyCoef(result, amount) {
        for (const rule of DIFFICULTY_RULES) {
            if (amount >= rule.min && amount < rule.max) {
                result.difficultyCoef = {
                    value: rule.coefficient,
                    reason: `项目金额${amount}万元 (${rule.label})`
                };
                break;
            }
        }
    }

    /**
     * 计算停留系数
     */
    static calculateStayCoef(result, stageDate) {
        const date = new Date(stageDate);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        result.stayDays = diffDays;

        for (const rule of STAY_RULES) {
            if (diffDays >= rule.min && diffDays <= rule.max) {
                result.stayCoef = {
                    value: rule.coefficient,
                    reason: `停留${diffDays}天 (${rule.label})`
                };
                break;
            }
        }
    }

    /**
     * 计算推进系数
     */
    static calculateProgressCoef(result, startStage, endStage) {
        const startIndex = STAGE_INDEX[startStage] || 1;
        const endIndex = STAGE_INDEX[endStage] || 1;
        const progress = endIndex - startIndex;

        if (progress < 0) {
            result.progressCoef = {
                value: 0.7,
                reason: `从${startStage}倒退到${endStage} (倒退)`
            };
        } else if (progress === 0) {
            result.progressCoef = {
                value: 0.9,
                reason: `维持在${startStage}阶段 (无推进)`
            };
        } else if (progress === 1) {
            result.progressCoef = {
                value: 1.0,
                reason: `从${startStage}推进到${endStage} (推进1阶段)`
            };
        } else {
            result.progressCoef = {
                value: 1.2,
                reason: `从${startStage}推进到${endStage} (推进${progress}阶段)`
            };
        }
    }

    /**
     * 评定等级
     */
    static calculateGrade(result) {
        for (const rule of GRADE_RULES) {
            if (result.finalScore >= rule.min) {
                result.grade = rule.grade;
                result.gradeIcon = rule.icon;
                result.gradeColor = rule.color;
                break;
            }
        }
    }

    /**
     * 计算销售员汇总数据
     * @param {Array} projectResults - 项目计算结果列表
     * @returns {Object} 汇总数据
     */
    static calculatePersonSummary(projectResults) {
        if (!projectResults || projectResults.length === 0) {
            return null;
        }

        const count = projectResults.length;
        const totalScore = projectResults.reduce((sum, p) => sum + p.finalScore, 0);
        const avgScore = Math.round((totalScore / count) * 100) / 100;

        // 找最高/最低分项目
        const sorted = [...projectResults].sort((a, b) => b.finalScore - a.finalScore);
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];

        // 计算平均各项得分
        const avgSubActivity = Math.round(projectResults.reduce((sum, p) => sum + p.subActivityScore, 0) / count * 100) / 100;
        const avgAttackPlan = Math.round(projectResults.reduce((sum, p) => sum + p.attackPlanScore, 0) / count * 100) / 100;
        const avgImpact = Math.round(projectResults.reduce((sum, p) => sum + p.impactScore, 0) / count * 100) / 100;
        const avgCompliance = Math.round(projectResults.reduce((sum, p) => sum + p.complianceScore, 0) / count * 100) / 100;
        const avgBaseScore = Math.round(projectResults.reduce((sum, p) => sum + p.baseScore, 0) / count * 100) / 100;

        // 评定等级
        let grade = '', gradeIcon = '', gradeColor = '';
        for (const rule of GRADE_RULES) {
            if (avgScore >= rule.min) {
                grade = rule.grade;
                gradeIcon = rule.icon;
                gradeColor = rule.color;
                break;
            }
        }

        return {
            projectCount: count,
            avgScore,
            avgSubActivity,
            avgAttackPlan,
            avgImpact,
            avgCompliance,
            avgBaseScore,
            highestProject: highest,
            lowestProject: lowest,
            grade,
            gradeIcon,
            gradeColor,
            projects: projectResults
        };
    }

    /**
     * 生成月度快照
     * @param {string} month - 月份 (YYYY-MM)
     * @returns {MonthlySnapshot}
     */
    static generateMonthlySnapshot(month) {
        const projects = DataStorage.getAllProjects();
        const salespeople = {};

        // 按销售员分组计算
        Object.values(projects).forEach(project => {
            const name = project.salesPerson;
            if (!salespeople[name]) {
                salespeople[name] = {
                    name: name,
                    projectResults: []
                };
            }

            // 计算项目得分
            const result = this.calculateProject(project, month, project.monthStartStage);
            salespeople[name].projectResults.push(result);
        });

        // 计算每个人的汇总
        const personSnapshots = {};
        Object.keys(salespeople).forEach(name => {
            const summary = this.calculatePersonSummary(salespeople[name].projectResults);
            personSnapshots[name] = {
                name: name,
                ...summary
            };
        });

        // 计算排名
        const ranked = Object.values(personSnapshots).sort((a, b) => b.avgScore - a.avgScore);
        ranked.forEach((person, index) => {
            person.rank = index + 1;
            personSnapshots[person.name].rank = index + 1;
        });

        return {
            snapshotId: `snapshot-${month}`,
            month: month,
            snapshotTime: new Date().toISOString(),
            isLocked: true,
            salespeople: personSnapshots,
            ranking: ranked.map(p => ({
                rank: p.rank,
                name: p.name,
                projectCount: p.projectCount,
                avgScore: p.avgScore,
                grade: p.grade,
                gradeIcon: p.gradeIcon
            }))
        };
    }

    /**
     * 获取当前月份的实时排行榜（未快照）
     * @returns {Object}
     */
    static getCurrentRanking() {
        const projects = DataStorage.getAllProjects();
        const month = DataStorage.getCurrentMonth();
        const salespeople = {};

        // 按销售员分组
        Object.values(projects).forEach(project => {
            const name = project.salesPerson;
            if (!salespeople[name]) {
                salespeople[name] = {
                    name: name,
                    projectResults: []
                };
            }

            const result = this.calculateProject(project, month, project.monthStartStage);
            salespeople[name].projectResults.push(result);
        });

        // 计算汇总和排名
        const summaries = Object.keys(salespeople).map(name => {
            const summary = this.calculatePersonSummary(salespeople[name].projectResults);
            return {
                name: name,
                ...summary
            };
        });

        // 排序
        summaries.sort((a, b) => b.avgScore - a.avgScore);
        summaries.forEach((person, index) => {
            person.rank = index + 1;
        });

        return {
            month: month,
            isSnapshot: false,
            salespeople: summaries
        };
    }
}
