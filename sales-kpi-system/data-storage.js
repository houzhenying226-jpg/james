/**
 * 销售考核系统 - 数据存储层
 * 使用localStorage持久化
 */

const STORAGE_KEYS = {
    PROJECTS: 'sales_kpi_projects',
    TASKS: 'sales_kpi_tasks',
    SNAPSHOTS: 'sales_kpi_snapshots',
    CONFIG: 'sales_kpi_config'
};

class DataStorage {
    // ==================== 项目操作 ====================

    /**
     * 获取所有项目
     */
    static getAllProjects() {
        const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        return data ? JSON.parse(data) : {};
    }

    /**
     * 获取单个项目
     */
    static getProject(projectId) {
        const projects = this.getAllProjects();
        return projects[projectId] || null;
    }

    /**
     * 保存项目
     */
    static saveProject(project) {
        const projects = this.getAllProjects();
        project.updateTime = new Date().toISOString();
        projects[project.id] = project;
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        return project;
    }

    /**
     * 删除项目
     */
    static deleteProject(projectId) {
        const projects = this.getAllProjects();
        delete projects[projectId];
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

        // 同时删除相关任务
        const tasks = this.getAllTasks();
        Object.keys(tasks).forEach(taskId => {
            if (taskId.startsWith(projectId + '-')) {
                delete tasks[taskId];
            }
        });
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }

    /**
     * 获取某销售员的所有项目
     */
    static getProjectsBySalesperson(salesperson) {
        const projects = this.getAllProjects();
        return Object.values(projects).filter(p => p.salesperson === salesperson);
    }

    /**
     * 获取所有销售员列表
     */
    static getAllSalespeople() {
        const projects = this.getAllProjects();
        const set = new Set();
        Object.values(projects).forEach(p => set.add(p.salesperson));
        return Array.from(set);
    }

    /**
     * 生成项目ID
     */
    static generateProjectId() {
        return 'P' + Date.now().toString(36).toUpperCase();
    }

    /**
     * 创建新项目
     */
    static createProject(data) {
        const project = {
            id: this.generateProjectId(),
            name: data.name,
            salesperson: data.salesperson,
            amount: parseFloat(data.amount) || 0,
            currentStage: data.currentStage || '接触',
            stageStartDate: data.stageStartDate || new Date().toISOString().split('T')[0],
            monthlyStageTrack: {},
            stageHistory: [
                {
                    stage: data.currentStage || '接触',
                    startDate: data.stageStartDate || new Date().toISOString().split('T')[0],
                    endDate: null
                }
            ],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
        };

        // 初始化当月阶段追踪
        const currentMonth = this.getCurrentMonth();
        project.monthlyStageTrack[currentMonth] = {
            start: project.currentStage,
            end: project.currentStage
        };

        return this.saveProject(project);
    }

    /**
     * 更新项目阶段
     */
    static updateProjectStage(projectId, newStage) {
        const project = this.getProject(projectId);
        if (!project) return null;

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = this.getCurrentMonth();

        // 更新阶段历史
        if (project.stageHistory.length > 0) {
            const lastHistory = project.stageHistory[project.stageHistory.length - 1];
            if (lastHistory.endDate === null) {
                lastHistory.endDate = today;
            }
        }
        project.stageHistory.push({
            stage: newStage,
            startDate: today,
            endDate: null
        });

        // 更新当前阶段
        project.currentStage = newStage;
        project.stageStartDate = today;

        // 更新月度追踪
        if (!project.monthlyStageTrack[currentMonth]) {
            project.monthlyStageTrack[currentMonth] = {
                start: project.currentStage,
                end: newStage
            };
        } else {
            project.monthlyStageTrack[currentMonth].end = newStage;
        }

        return this.saveProject(project);
    }

    // ==================== 任务操作 ====================

    /**
     * 获取所有任务
     */
    static getAllTasks() {
        const data = localStorage.getItem(STORAGE_KEYS.TASKS);
        return data ? JSON.parse(data) : {};
    }

    /**
     * 获取单个任务
     */
    static getTask(taskId) {
        const tasks = this.getAllTasks();
        return tasks[taskId] || null;
    }

    /**
     * 获取项目的所有任务
     */
    static getProjectTasks(projectId) {
        const tasks = this.getAllTasks();
        const result = {};
        Object.keys(tasks).forEach(taskId => {
            if (tasks[taskId].projectId === projectId) {
                result[taskId] = tasks[taskId];
            }
        });
        return result;
    }

    /**
     * 保存任务
     */
    static saveTask(task) {
        const tasks = this.getAllTasks();
        task.updateTime = new Date().toISOString();
        tasks[task.id] = task;
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return task;
    }

    /**
     * 获取或创建任务
     */
    static getOrCreateTask(projectId, taskCode) {
        const taskId = `${projectId}-${taskCode}`;
        let task = this.getTask(taskId);

        if (!task) {
            const config = getTaskConfig(taskCode);
            if (!config) return null;

            task = {
                id: taskId,
                projectId: projectId,
                taskCode: taskCode,
                taskName: config.name,
                category: config.category,
                weight: config.weight,
                versions: [],
                bestVersionId: null,
                currentScore: 0,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            };
            this.saveTask(task);
        }

        return task;
    }

    /**
     * 上传新版本
     */
    static uploadTaskVersion(projectId, taskCode, formData, files = []) {
        const task = this.getOrCreateTask(projectId, taskCode);
        if (!task) return null;

        const config = getTaskConfig(taskCode);
        const versionId = `V${task.versions.length + 1}.0`;
        const now = new Date();

        // 验证
        const validation = this.validateTaskFields(formData, config);

        // 计算分数
        const completionRate = validation.isValid ? config.validation.passRate : config.validation.failRate;
        const score = Math.round(config.weight * (completionRate / 100) * 100) / 100;

        // 创建版本
        const newVersion = {
            versionId: versionId,
            createDate: now.toISOString().split('T')[0],
            createTime: now.toISOString(),
            fields: formData,
            files: files.map(f => ({
                name: f.name || f,
                type: f.type || this.getFileType(f.name || f),
                size: f.size || ''
            })),
            validation: validation,
            completionRate: completionRate,
            score: score,
            status: '已验证'
        };

        task.versions.push(newVersion);

        // 更新最优版本
        this.updateBestVersion(task);

        return this.saveTask(task);
    }

    /**
     * 验证任务字段
     */
    static validateTaskFields(formData, config) {
        const result = {
            isValid: false,
            checks: {}
        };

        try {
            result.isValid = config.validation.check(formData);
        } catch (e) {
            result.isValid = false;
        }

        return result;
    }

    /**
     * 更新最优版本
     */
    static updateBestVersion(task) {
        if (task.versions.length === 0) {
            task.bestVersionId = null;
            task.currentScore = 0;
            return;
        }

        // 按分数降序排序，同分取最新
        const sorted = [...task.versions].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.createTime) - new Date(a.createTime);
        });

        task.bestVersionId = sorted[0].versionId;
        task.currentScore = sorted[0].score;
    }

    /**
     * 获取文件类型
     */
    static getFileType(filename) {
        if (!filename) return 'unknown';
        const ext = filename.split('.').pop().toLowerCase();
        return ext;
    }

    // ==================== 快照操作 ====================

    /**
     * 获取所有快照
     */
    static getAllSnapshots() {
        const data = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
        return data ? JSON.parse(data) : {};
    }

    /**
     * 获取某月快照
     */
    static getMonthSnapshot(month) {
        const snapshots = this.getAllSnapshots();
        return snapshots[month] || null;
    }

    /**
     * 获取某人某月快照
     */
    static getPersonMonthSnapshot(month, salesperson) {
        const monthSnapshot = this.getMonthSnapshot(month);
        if (!monthSnapshot) return null;
        return monthSnapshot[salesperson] || null;
    }

    /**
     * 保存快照
     */
    static saveSnapshot(month, snapshotData) {
        const snapshots = this.getAllSnapshots();
        if (!snapshots[month]) {
            snapshots[month] = {};
        }
        Object.assign(snapshots[month], snapshotData);
        localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    }

    /**
     * 检查某月是否有快照
     */
    static hasSnapshot(month) {
        const snapshot = this.getMonthSnapshot(month);
        return snapshot && Object.keys(snapshot).length > 0;
    }

    /**
     * 获取已有快照的月份列表
     */
    static getSnapshotMonths() {
        const snapshots = this.getAllSnapshots();
        return Object.keys(snapshots).filter(month =>
            Object.keys(snapshots[month]).length > 0
        ).sort();
    }

    // ==================== 配置操作 ====================

    /**
     * 获取配置
     */
    static getConfig() {
        const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
        return data ? JSON.parse(data) : {
            currentMonth: this.getCurrentMonth()
        };
    }

    /**
     * 保存配置
     */
    static saveConfig(config) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }

    /**
     * 获取当前月份
     */
    static getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    /**
     * 获取选中的月份
     */
    static getSelectedMonth() {
        const config = this.getConfig();
        return config.selectedMonth || this.getCurrentMonth();
    }

    /**
     * 设置选中的月份
     */
    static setSelectedMonth(month) {
        const config = this.getConfig();
        config.selectedMonth = month;
        this.saveConfig(config);
    }

    // ==================== 数据管理 ====================

    /**
     * 导出所有数据
     */
    static exportAllData() {
        return {
            projects: this.getAllProjects(),
            tasks: this.getAllTasks(),
            snapshots: this.getAllSnapshots(),
            config: this.getConfig(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * 导入数据
     */
    static importData(data) {
        if (data.projects) {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
        }
        if (data.tasks) {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
        }
        if (data.snapshots) {
            localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(data.snapshots));
        }
        if (data.config) {
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
        }
    }

    /**
     * 清除所有数据
     */
    static clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
        localStorage.removeItem(STORAGE_KEYS.CONFIG);
    }

    /**
     * 检查是否有数据
     */
    static hasData() {
        const projects = this.getAllProjects();
        return Object.keys(projects).length > 0;
    }
}
