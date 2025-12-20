/**
 * 销售考核系统 - 核心计算引擎
 * 北京北方努派服装公司
 */

class SalesCalculator {

    /**
     * 计算单个销售员的完整考核结果
     * @param {Object} data - 销售员数据
     * @returns {Object} 完整考核结果
     */
    static calculate(data) {
        const result = {
            // 原始数据
            name: data.name,
            project: data.project,
            currentStage: data.currentStage,
            amount: data.amount,
            stageDate: data.stageDate,
            startStage: data.startStage,
            endStage: data.endStage,
            tasks: data.tasks,
            attackPlan: data.attackPlan,

            // 计算结果
            taskScores: [],
            subActivityScore: 0,      // 子活动得分
            impactScore: 0,           // 影响效果得分
            complianceScore: 0,       // 流程合规得分
            baseScore: 0,             // 基础分

            difficultyCoef: { value: 1.0, reason: '' },
            stayCoef: { value: 1.0, reason: '' },
            progressCoef: { value: 1.0, reason: '' },

            stayDays: 0,
            progressStages: 0,
            completedTasks: 0,

            finalScore: 0,
            grade: '',
            gradeIcon: '',
            gradeColor: ''
        };

        // 1. 计算子活动得分（40分满分）
        this.calculateTaskScores(result);

        // 2. 计算影响效果得分（20分满分）
        this.calculateImpactScore(result);

        // 3. 计算流程合规得分（10分满分）
        this.calculateComplianceScore(result);

        // 4. 计算基础分
        result.baseScore = result.subActivityScore + result.attackPlan + result.impactScore + result.complianceScore;

        // 5. 计算三大系数
        this.calculateDifficultyCoef(result);
        this.calculateStayCoef(result);
        this.calculateProgressCoef(result);

        // 6. 计算最终得分
        result.finalScore = result.baseScore * result.difficultyCoef.value * result.stayCoef.value * result.progressCoef.value;
        result.finalScore = Math.round(result.finalScore * 100) / 100; // 保留两位小数

        // 7. 评定等级
        this.calculateGrade(result);

        return result;
    }

    /**
     * 计算16个任务的得分
     */
    static calculateTaskScores(result) {
        let totalScore = 0;
        let completedCount = 0;

        result.taskScores = TASKS.map((task, index) => {
            const completion = result.tasks[index] || 0;
            const score = task.weight * (completion / 100);

            if (completion === 100) {
                completedCount++;
            }

            totalScore += score;

            return {
                id: task.id,
                name: task.name,
                stage: task.stage,
                weight: task.weight,
                completion: completion,
                score: Math.round(score * 100) / 100
            };
        });

        result.subActivityScore = Math.round(totalScore * 100) / 100;
        result.completedTasks = completedCount;
    }

    /**
     * 计算影响效果得分
     * 公式：本月推进阶段数 ÷ 7 × 20
     */
    static calculateImpactScore(result) {
        const startIndex = STAGE_INDEX[result.startStage] || 1;
        const endIndex = STAGE_INDEX[result.endStage] || 1;

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
     * 基于项目金额
     */
    static calculateDifficultyCoef(result) {
        const amount = result.amount;

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
     * 基于在当前阶段停留天数
     */
    static calculateStayCoef(result) {
        // 计算停留天数
        const stageDate = new Date(result.stageDate);
        const today = new Date();
        const diffTime = Math.abs(today - stageDate);
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
     * 基于本月阶段变化
     */
    static calculateProgressCoef(result) {
        const startIndex = STAGE_INDEX[result.startStage] || 1;
        const endIndex = STAGE_INDEX[result.endStage] || 1;
        const progress = endIndex - startIndex;

        if (progress < 0) {
            // 倒退
            result.progressCoef = {
                value: 0.7,
                reason: `从${result.startStage}倒退到${result.endStage} (倒退)`
            };
        } else if (progress === 0) {
            // 无推进
            result.progressCoef = {
                value: 0.9,
                reason: `维持在${result.startStage}阶段 (无推进)`
            };
        } else if (progress === 1) {
            // 推进1阶段
            result.progressCoef = {
                value: 1.0,
                reason: `从${result.startStage}推进到${result.endStage} (推进1阶段)`
            };
        } else {
            // 推进≥2阶段
            result.progressCoef = {
                value: 1.2,
                reason: `从${result.startStage}推进到${result.endStage} (推进${progress}阶段)`
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
     * 批量计算并排序
     * @param {Array} dataList - 销售员数据列表
     * @returns {Array} 排序后的结果列表
     */
    static calculateAll(dataList) {
        const results = dataList.map(data => this.calculate(data));

        // 按最终得分降序排序
        results.sort((a, b) => b.finalScore - a.finalScore);

        // 添加排名
        results.forEach((result, index) => {
            result.rank = index + 1;
        });

        return results;
    }

    /**
     * 生成计算过程说明（用于详情展示）
     */
    static getCalculationProcess(result) {
        return [
            {
                label: '子活动得分',
                formula: '各任务权重 × 完成度',
                value: `${result.subActivityScore}分`
            },
            {
                label: '进攻计划得分',
                formula: '手工录入',
                value: `${result.attackPlan}分`
            },
            {
                label: '影响效果得分',
                formula: `${result.progressStages} ÷ 7 × 20`,
                value: `${result.impactScore}分`
            },
            {
                label: '流程合规得分',
                formula: `${result.completedTasks} ÷ 16 × 10`,
                value: `${result.complianceScore}分`
            },
            {
                label: '基础分',
                formula: `${result.subActivityScore} + ${result.attackPlan} + ${result.impactScore} + ${result.complianceScore}`,
                value: `${result.baseScore}分`
            },
            {
                label: '最终得分',
                formula: `${result.baseScore} × ${result.difficultyCoef.value} × ${result.stayCoef.value} × ${result.progressCoef.value}`,
                value: `${result.finalScore}分`
            }
        ];
    }
}
