/**
 * 销售考核系统 - 数据存储层
 * 使用 localStorage 进行持久化存储
 */

const STORAGE_KEYS = {
    PROJECTS: 'sales_kpi_projects',
    SNAPSHOTS: 'sales_kpi_snapshots',
    CURRENT_MONTH: 'sales_kpi_current_month',
    SETTINGS: 'sales_kpi_settings'
};

class DataStorage {

    // ==================== 项目管理 ====================

    /**
     * 获取所有项目
     * @returns {Object} {projectId: Project}
     */
    static getAllProjects() {
        const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        return data ? JSON.parse(data) : {};
    }

    /**
     * 保存所有项目
     * @param {Object} projects - 项目集合
     */
    static saveAllProjects(projects) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }

    /**
     * 获取单个项目
     * @param {string} projectId - 项目ID
     * @returns {Project|null}
     */
    static getProject(projectId) {
        const projects = this.getAllProjects();
        return projects[projectId] || null;
    }

    /**
     * 保存单个项目
     * @param {Project} project - 项目数据
     */
    static saveProject(project) {
        const projects = this.getAllProjects();
        project.updateTime = new Date().toISOString();
        projects[project.projectId] = project;
        this.saveAllProjects(projects);
    }

    /**
     * 删除项目
     * @param {string} projectId - 项目ID
     */
    static deleteProject(projectId) {
        const projects = this.getAllProjects();
        delete projects[projectId];
        this.saveAllProjects(projects);
    }

    /**
     * 按销售员获取项目列表
     * @param {string} salesPerson - 销售员姓名
     * @returns {Array<Project>}
     */
    static getProjectsBySalesPerson(salesPerson) {
        const projects = this.getAllProjects();
        return Object.values(projects).filter(p => p.salesPerson === salesPerson);
    }

    /**
     * 获取所有销售员列表
     * @returns {Array<string>}
     */
    static getAllSalespeople() {
        const projects = this.getAllProjects();
        const names = new Set(Object.values(projects).map(p => p.salesPerson));
        return Array.from(names);
    }

    // ==================== 任务版本管理 ====================

    /**
     * 添加任务版本
     * @param {string} projectId - 项目ID
     * @param {string} taskId - 任务ID
     * @param {TaskVersion} version - 版本数据
     */
    static addTaskVersion(projectId, taskId, version) {
        const project = this.getProject(projectId);
        if (!project) return false;

        // 初始化任务
        if (!project.tasks) {
            project.tasks = {};
        }
        if (!project.tasks[taskId]) {
            const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);
            project.tasks[taskId] = {
                taskId: taskId,
                taskName: taskDef ? taskDef.name : taskId,
                projectId: projectId,
                versions: [],
                currentVersion: null,
                currentScore: 0,
                bestCompletionRate: 0
            };
        }

        // 生成版本号
        const existingVersions = project.tasks[taskId].versions.length;
        version.versionId = `V${existingVersions + 1}.0`;
        version.uploadDate = version.uploadDate || new Date().toISOString().split('T')[0];

        // 计算得分
        const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);
        const weight = taskDef ? taskDef.weight : 0;
        version.score = Math.round(weight * (version.completionRate / 100) * 100) / 100;

        // 添加版本
        project.tasks[taskId].versions.push(version);

        // 更新最高分
        this.updateTaskBestScore(project, taskId);

        // 保存
        this.saveProject(project);
        return true;
    }

    /**
     * 更新任务最高分
     * @param {Project} project - 项目
     * @param {string} taskId - 任务ID
     */
    static updateTaskBestScore(project, taskId) {
        const task = project.tasks[taskId];
        if (!task || !task.versions.length) return;

        let bestVersion = task.versions[0];
        task.versions.forEach(v => {
            if (v.score > bestVersion.score) {
                bestVersion = v;
            }
        });

        task.currentVersion = bestVersion.versionId;
        task.currentScore = bestVersion.score;
        task.bestCompletionRate = bestVersion.completionRate;
    }

    /**
     * 获取任务的所有版本
     * @param {string} projectId - 项目ID
     * @param {string} taskId - 任务ID
     * @returns {Array<TaskVersion>}
     */
    static getTaskVersions(projectId, taskId) {
        const project = this.getProject(projectId);
        if (!project || !project.tasks || !project.tasks[taskId]) {
            return [];
        }
        return project.tasks[taskId].versions;
    }

    // ==================== 月度快照管理 ====================

    /**
     * 获取所有快照
     * @returns {Object} {month: MonthlySnapshot}
     */
    static getAllSnapshots() {
        const data = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
        return data ? JSON.parse(data) : {};
    }

    /**
     * 保存所有快照
     * @param {Object} snapshots - 快照集合
     */
    static saveAllSnapshots(snapshots) {
        localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
    }

    /**
     * 获取指定月份的快照
     * @param {string} month - 月份 (YYYY-MM)
     * @returns {MonthlySnapshot|null}
     */
    static getSnapshot(month) {
        const snapshots = this.getAllSnapshots();
        return snapshots[month] || null;
    }

    /**
     * 保存月度快照
     * @param {MonthlySnapshot} snapshot - 快照数据
     */
    static saveSnapshot(snapshot) {
        const snapshots = this.getAllSnapshots();
        snapshot.isLocked = true;
        snapshots[snapshot.month] = snapshot;
        this.saveAllSnapshots(snapshots);
    }

    /**
     * 检查月份是否有快照
     * @param {string} month - 月份
     * @returns {boolean}
     */
    static hasSnapshot(month) {
        const snapshots = this.getAllSnapshots();
        return !!snapshots[month];
    }

    /**
     * 获取所有已有快照的月份列表
     * @returns {Array<string>}
     */
    static getSnapshotMonths() {
        const snapshots = this.getAllSnapshots();
        return Object.keys(snapshots).sort();
    }

    // ==================== 当前月份管理 ====================

    /**
     * 获取当前选中的月份
     * @returns {string} YYYY-MM
     */
    static getCurrentMonth() {
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_MONTH);
        if (saved) return saved;

        // 默认返回当前月份
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    /**
     * 设置当前选中的月份
     * @param {string} month - 月份
     */
    static setCurrentMonth(month) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_MONTH, month);
    }

    /**
     * 获取上个月份
     * @param {string} month - 当前月份 YYYY-MM
     * @returns {string}
     */
    static getPreviousMonth(month) {
        const [year, m] = month.split('-').map(Number);
        if (m === 1) {
            return `${year - 1}-12`;
        }
        return `${year}-${String(m - 1).padStart(2, '0')}`;
    }

    /**
     * 获取下个月份
     * @param {string} month - 当前月份 YYYY-MM
     * @returns {string}
     */
    static getNextMonth(month) {
        const [year, m] = month.split('-').map(Number);
        if (m === 12) {
            return `${year + 1}-01`;
        }
        return `${year}-${String(m + 1).padStart(2, '0')}`;
    }

    // ==================== 工具方法 ====================

    /**
     * 清除所有数据（谨慎使用）
     */
    static clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MONTH);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }

    /**
     * 导出所有数据
     * @returns {Object}
     */
    static exportAllData() {
        return {
            projects: this.getAllProjects(),
            snapshots: this.getAllSnapshots(),
            currentMonth: this.getCurrentMonth(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * 导入数据
     * @param {Object} data - 导入的数据
     */
    static importData(data) {
        if (data.projects) {
            this.saveAllProjects(data.projects);
        }
        if (data.snapshots) {
            this.saveAllSnapshots(data.snapshots);
        }
        if (data.currentMonth) {
            this.setCurrentMonth(data.currentMonth);
        }
    }

    /**
     * 生成唯一ID
     * @returns {string}
     */
    static generateId() {
        return 'P' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}
