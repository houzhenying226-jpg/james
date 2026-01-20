/**
 * 北方努派项目规划表智能填写系统 V2 - 存储模块
 * 使用LocalStorage存储项目数据
 */

const Storage = {
  PROJECTS_KEY: 'nupai_projects_v2',
  SETTINGS_KEY: 'nupai_settings_v2',

  // ==================== 项目存储 ====================

  // 获取所有项目
  getAllProjects() {
    try {
      const data = localStorage.getItem(this.PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('读取项目数据失败:', e);
      return [];
    }
  },

  // 保存项目
  saveProject(project) {
    try {
      const projects = this.getAllProjects();
      const now = new Date().toISOString();

      if (project.id) {
        // 更新现有项目
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          project.metadata.updateTime = now;
          projects[index] = project;
        } else {
          projects.unshift(project);
        }
      } else {
        // 新项目
        project.id = this.generateId();
        project.metadata = {
          createTime: now,
          updateTime: now,
          rawInput: project.metadata?.rawInput || ''
        };
        projects.unshift(project);
      }

      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
      return project;
    } catch (e) {
      console.error('保存项目失败:', e);
      throw new Error('保存失败，请重试');
    }
  },

  // 获取单个项目
  getProject(id) {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id);
  },

  // 删除项目
  deleteProject(id) {
    try {
      const projects = this.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('删除项目失败:', e);
      return false;
    }
  },

  // 获取最近项目
  getRecentProjects(limit = 5) {
    const projects = this.getAllProjects();
    return projects.slice(0, limit);
  },

  // 搜索项目
  searchProjects(keyword) {
    if (!keyword) return this.getAllProjects();

    const lowerKeyword = keyword.toLowerCase();
    const projects = this.getAllProjects();

    return projects.filter(p =>
      p.basicInfo?.customerName?.toLowerCase().includes(lowerKeyword) ||
      p.basicInfo?.contractNo?.toLowerCase().includes(lowerKeyword)
    );
  },

  // ==================== 设置存储 ====================

  // 获取设置
  getSettings() {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (e) {
      return this.getDefaultSettings();
    }
  },

  // 保存设置
  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('保存设置失败:', e);
      return false;
    }
  },

  // 默认设置
  getDefaultSettings() {
    return {
      defaultFactory: '希努尔',
      defaultPackaging: '希努尔大货包装',
      defaultCraftTemplate: '标准高端',
      autoSave: true
    };
  },

  // ==================== 工具函数 ====================

  // 生成唯一ID
  generateId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // 获取存储使用情况
  getStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key).length * 2; // UTF-16编码
      }
    }
    return {
      used: total,
      usedMB: (total / 1024 / 1024).toFixed(2),
      max: 5 * 1024 * 1024, // 5MB
      maxMB: '5.00'
    };
  },

  // 清理所有数据
  clearAll() {
    localStorage.removeItem(this.PROJECTS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
  },

  // 导出数据
  exportData() {
    return {
      projects: this.getAllProjects(),
      settings: this.getSettings(),
      exportTime: new Date().toISOString()
    };
  },

  // 导入数据
  importData(data) {
    try {
      if (data.projects && Array.isArray(data.projects)) {
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(data.projects));
      }
      if (data.settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
      }
      return true;
    } catch (e) {
      console.error('导入数据失败:', e);
      return false;
    }
  }
};

// 导出
window.Storage = Storage;
