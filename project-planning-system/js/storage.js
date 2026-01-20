/**
 * 北方努派项目规划表智能填写系统 - 存储模块
 * 处理 LocalStorage 的存取操作
 */

const STORAGE_KEYS = {
  PROJECTS: 'nupai_project_plans',
  DRAFT: 'nupai_draft_plan',
  SETTINGS: 'nupai_settings'
};

// 存储管理器
const StorageManager = {
  // 保存项目到历史记录
  saveProject(project) {
    const projects = this.getAllProjects();

    // 生成唯一ID
    if (!project.id) {
      project.id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 更新时间戳
    project.metadata = project.metadata || {};
    project.metadata.updateTime = new Date().toISOString();
    if (!project.metadata.createTime) {
      project.metadata.createTime = project.metadata.updateTime;
    }

    // 查找是否已存在
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project); // 新项目添加到最前面
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return { success: true, id: project.id };
    } catch (e) {
      console.error('保存项目失败:', e);
      return { success: false, error: '存储空间不足' };
    }
  },

  // 获取所有项目
  getAllProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('读取项目列表失败:', e);
      return [];
    }
  },

  // 根据ID获取项目
  getProjectById(id) {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  },

  // 删除项目
  deleteProject(id) {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== id);

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
      return { success: true };
    } catch (e) {
      console.error('删除项目失败:', e);
      return { success: false, error: e.message };
    }
  },

  // 保存草稿（正在编辑的表单）
  saveDraft(draft) {
    try {
      draft.lastSaved = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
      return { success: true };
    } catch (e) {
      console.error('保存草稿失败:', e);
      return { success: false, error: e.message };
    }
  },

  // 获取草稿
  getDraft() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('读取草稿失败:', e);
      return null;
    }
  },

  // 清除草稿
  clearDraft() {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
      return { success: true };
    } catch (e) {
      console.error('清除草稿失败:', e);
      return { success: false, error: e.message };
    }
  },

  // 保存设置（如 API Key）
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return { success: true };
    } catch (e) {
      console.error('保存设置失败:', e);
      return { success: false, error: e.message };
    }
  },

  // 获取设置
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('读取设置失败:', e);
      return {};
    }
  },

  // 搜索项目
  searchProjects(keyword) {
    const projects = this.getAllProjects();
    if (!keyword) return projects;

    const lowerKeyword = keyword.toLowerCase();
    return projects.filter(p => {
      const basicInfo = p.basicInfo || {};
      return (
        (basicInfo.customerName && basicInfo.customerName.toLowerCase().includes(lowerKeyword)) ||
        (basicInfo.contractNo && basicInfo.contractNo.toLowerCase().includes(lowerKeyword)) ||
        (basicInfo.salesPerson && basicInfo.salesPerson.toLowerCase().includes(lowerKeyword))
      );
    });
  },

  // 检查存储空间
  getStorageInfo() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16编码，每个字符2字节
      }
    }

    return {
      used: totalSize,
      usedMB: (totalSize / 1024 / 1024).toFixed(2),
      projectCount: this.getAllProjects().length
    };
  },

  // 导出所有数据
  exportAllData() {
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
        const existingProjects = this.getAllProjects();
        const mergedProjects = [...data.projects];

        // 合并现有项目（避免重复）
        existingProjects.forEach(ep => {
          if (!mergedProjects.find(p => p.id === ep.id)) {
            mergedProjects.push(ep);
          }
        });

        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mergedProjects));
      }

      if (data.settings) {
        const currentSettings = this.getSettings();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
          ...currentSettings,
          ...data.settings
        }));
      }

      return { success: true, message: '数据导入成功' };
    } catch (e) {
      console.error('导入数据失败:', e);
      return { success: false, error: e.message };
    }
  }
};

// 导出给其他模块使用
window.StorageManager = StorageManager;
window.STORAGE_KEYS = STORAGE_KEYS;
