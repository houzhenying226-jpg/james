/**
 * 销售考核系统 - 主应用逻辑
 */

// 当前状态
let currentProjectId = null;
let currentTaskCode = null;
let currentFilter = 'all';
let currentGroup = 'none';

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTaskFilters();
    checkFirstRun();
    refreshAll();
});

/**
 * 检查首次运行
 */
function checkFirstRun() {
    console.log('checkFirstRun: 检查是否有数据...');
    const hasData = DataStorage.hasData();
    console.log('checkFirstRun: hasData =', hasData);

    if (!hasData) {
        setTimeout(() => {
            if (confirm('检测到系统首次运行，是否加载测试数据？\n\n测试数据包含：\n- 3名销售员：张三、李四、王五\n- 8个项目\n- 多版本任务示例\n- 2024年11月快照')) {
                generateTestData();
                refreshAll();
            }
        }, 500);
    }
}

/**
 * 初始化导航
 */
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

/**
 * 切换视图
 */
function switchView(viewName) {
    // 更新导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // 更新视图
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');

    // 刷新对应视图
    if (viewName === 'projects') {
        refreshProjectsList();
    } else if (viewName === 'tasks') {
        if (!currentProjectId) {
            document.getElementById('tasksList').innerHTML =
                '<p class="empty-hint">请从项目视图选择一个项目</p>';
        }
    } else if (viewName === 'assessment') {
        refreshAssessment();
    }
}

/**
 * 初始化任务筛选按钮
 */
function initTaskFilters() {
    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            refreshTasksList();
        });
    });

    // 分组按钮
    document.querySelectorAll('.group-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGroup = btn.dataset.group;
            refreshTasksList();
        });
    });
}

/**
 * 刷新所有
 */
function refreshAll() {
    refreshProjectsList();
    updateMonthDisplay();
}

// ==================== 项目视图 ====================

/**
 * 刷新项目列表
 */
function refreshProjectsList() {
    console.log('refreshProjectsList: 开始刷新项目列表');
    const container = document.getElementById('projectsList');
    const projects = DataStorage.getAllProjects();
    console.log('refreshProjectsList: 获取到项目数据:', projects);
    console.log('refreshProjectsList: 项目数量:', Object.keys(projects).length);
    const projectList = Object.values(projects);

    // 更新筛选器
    updateSalespersonFilter();

    // 获取筛选条件
    const salespersonFilter = document.getElementById('projectFilterSalesperson').value;
    const stageFilter = document.getElementById('projectFilterStage').value;

    // 筛选
    let filtered = projectList;
    if (salespersonFilter) {
        filtered = filtered.filter(p => p.salesperson === salespersonFilter);
    }
    if (stageFilter) {
        filtered = filtered.filter(p => p.currentStage === stageFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无项目，请点击"新建项目"创建</p>';
        return;
    }

    let html = '';
    filtered.forEach(project => {
        const score = ScoreEngine.calculateProjectScore(project);
        const taskProgress = `${score.completedTasks}/${score.totalTasks}`;
        const progressPercent = Math.round(score.completedTasks / score.totalTasks * 100);

        html += `
            <div class="project-card">
                <div class="project-card-header">
                    <div class="project-card-title">${project.name}</div>
                    <div class="project-card-stage">${project.currentStage}</div>
                </div>
                <div class="project-card-info">
                    <span>👤 ${project.salesperson}</span>
                    <span>💰 ${project.amount}万</span>
                    <span>📅 ${project.stageStartDate}</span>
                    <span>📋 任务进度: ${taskProgress} (${progressPercent}%)</span>
                </div>
                <div class="project-card-footer">
                    <div class="project-card-score">
                        <span class="score-value">${score.finalScore}分</span>
                        <span style="color: ${score.gradeColor}">${score.gradeIcon} ${score.grade}</span>
                    </div>
                    <div class="project-card-actions">
                        <button class="btn btn-primary" onclick="enterWorkbench('${project.id}')">
                            进入工作台
                        </button>
                        <button class="btn btn-secondary" onclick="editProject('${project.id}')">
                            编辑
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * 更新销售员筛选器
 */
function updateSalespersonFilter() {
    const select = document.getElementById('projectFilterSalesperson');
    const salespeople = DataStorage.getAllSalespeople();
    const currentValue = select.value;

    select.innerHTML = '<option value="">全部</option>';
    salespeople.forEach(name => {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    });

    select.value = currentValue;
}

/**
 * 筛选项目
 */
function filterProjects() {
    refreshProjectsList();
}

/**
 * 显示新建项目弹窗
 */
function showAddProjectModal() {
    document.getElementById('projectModalTitle').textContent = '新建项目';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.querySelector('[name="stageStartDate"]').value = new Date().toISOString().split('T')[0];
    document.getElementById('projectModal').classList.add('active');
}

/**
 * 编辑项目
 */
function editProject(projectId) {
    const project = DataStorage.getProject(projectId);
    if (!project) return;

    document.getElementById('projectModalTitle').textContent = '编辑项目';
    document.getElementById('projectId').value = project.id;
    document.querySelector('[name="name"]').value = project.name;
    document.querySelector('[name="salesperson"]').value = project.salesperson;
    document.querySelector('[name="amount"]').value = project.amount;
    document.querySelector('[name="currentStage"]').value = project.currentStage;
    document.querySelector('[name="stageStartDate"]').value = project.stageStartDate;

    document.getElementById('projectModal').classList.add('active');
}

/**
 * 关闭项目弹窗
 */
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

/**
 * 提交项目表单
 */
function submitProject(event) {
    event.preventDefault();
    const form = event.target;
    const projectId = document.getElementById('projectId').value;

    const data = {
        name: form.name.value,
        salesperson: form.salesperson.value,
        amount: parseFloat(form.amount.value),
        currentStage: form.currentStage.value,
        stageStartDate: form.stageStartDate.value
    };

    if (projectId) {
        // 编辑
        const project = DataStorage.getProject(projectId);
        if (project) {
            // 检查阶段是否变化
            if (project.currentStage !== data.currentStage) {
                DataStorage.updateProjectStage(projectId, data.currentStage);
            }
            project.name = data.name;
            project.salesperson = data.salesperson;
            project.amount = data.amount;
            DataStorage.saveProject(project);
        }
    } else {
        // 新建
        DataStorage.createProject(data);
    }

    closeProjectModal();
    refreshProjectsList();
    alert(projectId ? '项目已更新！' : '项目创建成功！');
}

// ==================== 任务视图（工作台） ====================

/**
 * 进入工作台
 */
function enterWorkbench(projectId) {
    console.log('enterWorkbench: 项目ID =', projectId);
    currentProjectId = projectId;
    const project = DataStorage.getProject(projectId);
    console.log('enterWorkbench: 获取到项目 =', project);

    if (!project) {
        console.error('enterWorkbench: 项目不存在！ID =', projectId);
        console.log('enterWorkbench: 当前所有项目 =', DataStorage.getAllProjects());
        alert('项目不存在，ID: ' + projectId);
        return;
    }

    // 更新标题
    document.getElementById('workbenchTitle').textContent = `工作台：${project.name}`;

    // 切换到任务视图
    switchView('tasks');

    // 刷新任务列表
    refreshTasksList();
}

/**
 * 退出工作台
 */
function exitWorkbench() {
    currentProjectId = null;
    switchView('projects');
}

/**
 * 刷新任务列表
 */
function refreshTasksList() {
    const container = document.getElementById('tasksList');

    if (!currentProjectId) {
        container.innerHTML = '<p class="empty-hint">请从项目视图选择一个项目</p>';
        return;
    }

    const project = DataStorage.getProject(currentProjectId);
    if (!project) {
        container.innerHTML = '<p class="empty-hint">项目不存在</p>';
        return;
    }

    // 计算项目得分
    const score = ScoreEngine.calculateProjectScore(project);

    // 更新得分显示
    document.getElementById('workbenchScore').textContent = score.finalScore;
    document.getElementById('workbenchGrade').textContent = `${score.gradeIcon} ${score.grade}`;
    document.getElementById('workbenchGrade').style.color = score.gradeColor;

    // 获取任务数据
    const projectTasks = DataStorage.getProjectTasks(currentProjectId);

    // 筛选
    let tasks = TASK_CONFIG.map(config => {
        const taskId = `${currentProjectId}-${config.code}`;
        const task = projectTasks[taskId];
        return {
            config: config,
            task: task,
            score: score.taskScores[config.code]
        };
    });

    // 应用筛选
    if (currentFilter === 'complete') {
        tasks = tasks.filter(t => t.score && t.score.completionRate === 100);
    } else if (currentFilter === 'incomplete') {
        tasks = tasks.filter(t => !t.score || t.score.completionRate < 100);
    }

    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-hint">没有符合条件的任务</p>';
        return;
    }

    // 渲染
    let html = '';

    if (currentGroup === 'category') {
        // 按阶段分组
        const categories = {};
        tasks.forEach(t => {
            const cat = t.config.category;
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(t);
        });

        STAGES.forEach(stage => {
            if (categories[stage]) {
                html += `<div class="task-category-header">${stage}阶段</div>`;
                categories[stage].forEach(t => {
                    html += renderTaskCard(t);
                });
            }
        });
    } else {
        // 不分组
        tasks.forEach(t => {
            html += renderTaskCard(t);
        });
    }

    container.innerHTML = html;
}

/**
 * 渲染任务卡片
 */
function renderTaskCard(taskData) {
    const { config, task, score } = taskData;
    const versionCount = task ? task.versions.length : 0;
    const completionRate = score ? score.completionRate : 0;
    const taskScore = score ? score.score : 0;

    let statusClass = 'pending';
    let statusIcon = '⚪';
    if (completionRate === 100) {
        statusClass = 'completed';
        statusIcon = '✅';
    } else if (completionRate > 0) {
        statusClass = 'partial';
        statusIcon = '⚠️';
    }

    // 版本链
    let versionChain = '';
    if (task && task.versions.length > 0) {
        versionChain = task.versions.map(v =>
            `<span class="version-badge ${v.versionId === task.bestVersionId ? 'best' : ''}">${v.versionId}</span>`
        ).join('');
    }

    return `
        <div class="task-card ${statusClass}">
            <div class="task-card-header">
                <div class="task-card-title">
                    <span class="task-code">${config.code}</span>
                    <span class="task-name">${config.name}</span>
                </div>
                <span class="task-category-badge">${config.category}阶段</span>
            </div>
            <div class="task-card-status">
                <span class="task-status-icon">${statusIcon}</span>
                <span>${completionRate}%</span>
                <span class="task-score">${taskScore} / ${config.weight}分</span>
            </div>
            <div class="task-card-versions">
                ${versionCount > 0 ? `
                    <div>最新：${task.bestVersionId} (${task.versions[task.versions.length - 1].createDate})</div>
                    <div class="version-chain">${versionChain}</div>
                ` : '<div>暂无版本记录</div>'}
            </div>
            <div class="task-card-actions">
                <button class="btn btn-secondary" onclick="showVersionHistory('${config.code}')" ${versionCount === 0 ? 'disabled' : ''}>
                    查看版本历史
                </button>
                <button class="btn btn-primary" onclick="showUploadVersion('${config.code}')">
                    ➕ 上传新版本
                </button>
            </div>
        </div>
    `;
}

// ==================== 上传新版本 ====================

/**
 * 显示上传版本弹窗
 */
function showUploadVersion(taskCode) {
    currentTaskCode = taskCode;
    const config = getTaskConfig(taskCode);
    if (!config) return;

    const task = DataStorage.getTask(`${currentProjectId}-${taskCode}`);
    const nextVersion = task ? `V${task.versions.length + 1}.0` : 'V1.0';

    let html = `
        <div class="current-status">
            <h4>📊 当前状态</h4>
            <p>任务：${config.code} ${config.name}</p>
            <p>权重：${config.weight}分</p>
            <p>新版本号：<strong>${nextVersion}</strong></p>
        </div>

        <form id="versionForm" onsubmit="submitVersion(event)">
            <h4 style="margin: 20px 0 15px;">填写信息</h4>
    `;

    // 动态生成表单字段
    config.fields.forEach(field => {
        html += renderFormField(field);
    });

    html += `
            <div class="validation-preview" id="validationPreview">
                <h4>验证结果</h4>
                <div id="validationItems"></div>
                <div class="score-preview">
                    <span class="score-preview-label">预计得分：</span>
                    <span class="score-preview-value" id="previewScore">0 / ${config.weight}</span>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeVersionModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存版本</button>
            </div>
        </form>
    `;

    document.getElementById('versionModalTitle').textContent = `上传新版本：${config.code} ${config.name}`;
    document.getElementById('versionModalBody').innerHTML = html;
    document.getElementById('versionModal').classList.add('active');

    // 添加实时验证
    setTimeout(() => {
        document.querySelectorAll('#versionForm input, #versionForm select, #versionForm textarea').forEach(input => {
            input.addEventListener('change', updateValidationPreview);
            input.addEventListener('input', updateValidationPreview);
        });
        updateValidationPreview();
    }, 100);
}

/**
 * 渲染表单字段
 */
function renderFormField(field) {
    const required = field.required ? 'required' : '';
    const requiredMark = field.required ? ' *' : '';

    switch (field.type) {
        case 'boolean':
            return `
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="field_${field.key}" name="${field.key}">
                        <label for="field_${field.key}">${field.label}${requiredMark}</label>
                    </div>
                </div>
            `;
        case 'textarea':
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}</label>
                    <textarea name="${field.key}" ${required} placeholder="请输入${field.label}"></textarea>
                </div>
            `;
        case 'file':
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}（输入文件名）</label>
                    <div class="file-input-wrapper">
                        <input type="text" name="${field.key}" ${required} placeholder="例如：报告.docx">
                    </div>
                </div>
            `;
        case 'number':
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}</label>
                    <input type="number" name="${field.key}" ${required} placeholder="0" min="0">
                </div>
            `;
        case 'date':
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}</label>
                    <input type="date" name="${field.key}" ${required} value="${new Date().toISOString().split('T')[0]}">
                </div>
            `;
        case 'datetime-local':
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}</label>
                    <input type="datetime-local" name="${field.key}" ${required}>
                </div>
            `;
        default:
            return `
                <div class="form-group">
                    <label>${field.label}${requiredMark}</label>
                    <input type="text" name="${field.key}" ${required} placeholder="请输入${field.label}">
                </div>
            `;
    }
}

/**
 * 更新验证预览
 */
function updateValidationPreview() {
    const config = getTaskConfig(currentTaskCode);
    if (!config) return;

    const form = document.getElementById('versionForm');
    const formData = getFormData(form, config);

    // 使用详细验证函数
    const validationResult = getDetailedValidation(currentTaskCode, formData);

    // 渲染每个检查项
    const validationItems = document.getElementById('validationItems');
    let itemsHtml = '';

    if (validationResult.checks.length > 0) {
        validationResult.checks.forEach(check => {
            const icon = check.passed ? '✅' : '❌';
            const statusClass = check.passed ? 'validation-pass' : 'validation-fail';
            const hint = check.hint ? ` <span class="validation-hint">(${check.hint})</span>` : '';
            itemsHtml += `
                <div class="validation-item ${statusClass}">
                    <span class="validation-icon">${icon}</span>
                    <span>${check.label}${hint}</span>
                </div>
            `;
        });

        // 显示汇总
        const passedCount = validationResult.checks.filter(c => c.passed).length;
        const totalCount = validationResult.checks.length;
        if (validationResult.allPassed) {
            itemsHtml += `
                <div class="validation-summary validation-pass">
                    ✅ 所有检查项已通过 (${passedCount}/${totalCount})
                </div>
            `;
        } else {
            const missingItems = validationResult.checks.filter(c => !c.passed).map(c => c.label);
            itemsHtml += `
                <div class="validation-summary validation-fail">
                    ❌ 缺少以下项目：${missingItems.join('、')}
                </div>
            `;
        }
    } else {
        // 回退到旧逻辑
        let isValid = false;
        try {
            isValid = config.validation.check(formData);
        } catch (e) {
            isValid = false;
        }
        itemsHtml = `
            <div class="validation-item">
                <span class="validation-icon ${isValid ? 'validation-pass' : 'validation-fail'}">
                    ${isValid ? '✅' : '❌'}
                </span>
                <span>${config.validation.description}</span>
            </div>
        `;
    }

    validationItems.innerHTML = itemsHtml;

    // 更新预计得分
    const rate = validationResult.allPassed ? config.validation.passRate : config.validation.failRate;
    const score = Math.round(config.weight * (rate / 100) * 100) / 100;
    document.getElementById('previewScore').textContent = `${score} / ${config.weight} (${rate}%)`;
}

/**
 * 获取表单数据
 */
function getFormData(form, config) {
    const data = {};
    config.fields.forEach(field => {
        const input = form.elements[field.key];
        if (!input) return;

        if (field.type === 'boolean') {
            data[field.key] = input.checked;
        } else if (field.type === 'number') {
            data[field.key] = parseFloat(input.value) || 0;
        } else {
            data[field.key] = input.value;
        }
    });
    return data;
}

/**
 * 提交版本
 */
function submitVersion(event) {
    event.preventDefault();
    const config = getTaskConfig(currentTaskCode);
    if (!config) return;

    const form = event.target;
    const formData = getFormData(form, config);

    // 收集文件
    const files = [];
    config.fields.filter(f => f.type === 'file').forEach(f => {
        if (formData[f.key]) {
            files.push({ name: formData[f.key] });
        }
    });

    // 上传版本
    DataStorage.uploadTaskVersion(currentProjectId, currentTaskCode, formData, files);

    closeVersionModal();
    refreshTasksList();
    alert('版本上传成功！');
}

/**
 * 关闭版本弹窗
 */
function closeVersionModal() {
    document.getElementById('versionModal').classList.remove('active');
    currentTaskCode = null;
}

// ==================== 版本历史 ====================

/**
 * 显示版本历史
 */
function showVersionHistory(taskCode) {
    const config = getTaskConfig(taskCode);
    const task = DataStorage.getTask(`${currentProjectId}-${taskCode}`);

    if (!task || task.versions.length === 0) {
        alert('暂无版本记录');
        return;
    }

    let html = `
        <div class="current-status">
            <p>当前采用版本：<strong>${task.bestVersionId}</strong>（最高分）</p>
        </div>
        <div class="version-list">
    `;

    // 按时间倒序
    const sortedVersions = [...task.versions].reverse();

    sortedVersions.forEach(version => {
        const isBest = version.versionId === task.bestVersionId;

        html += `
            <div class="version-item ${isBest ? 'best' : ''}">
                <div class="version-icon ${isBest ? 'best' : 'normal'}">
                    ${isBest ? '✓' : version.versionId.replace('V', '').split('.')[0]}
                </div>
                <div class="version-content">
                    <div class="version-header">
                        <div>
                            <span class="version-id">${version.versionId}</span>
                            ${isBest ? '<span style="color: #28a745; font-size: 0.8rem;"> [当前采用]</span>' : ''}
                        </div>
                        <span class="version-score">${version.score}分 (${version.completionRate}%)</span>
                    </div>
                    <div class="version-date">📅 ${version.createDate}</div>
                    <div class="version-fields">
                        ${renderVersionFields(version.fields, config)}
                    </div>
                    ${version.files && version.files.length > 0 ? `
                        <div class="version-files" style="margin-top: 8px;">
                            ${version.files.map(f => `<span style="background: #e0e5ff; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; margin-right: 5px;">📄 ${f.name}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('historyModalTitle').textContent = `版本历史：${config.code} ${config.name}`;
    document.getElementById('historyModalBody').innerHTML = html;
    document.getElementById('historyModal').classList.add('active');
}

/**
 * 渲染版本字段
 */
function renderVersionFields(fields, config) {
    if (!fields) return '';

    let html = '';
    config.fields.forEach(fieldConfig => {
        const value = fields[fieldConfig.key];
        if (value !== undefined && value !== null && value !== '') {
            let displayValue = value;
            if (fieldConfig.type === 'boolean') {
                displayValue = value ? '是' : '否';
            }
            html += `<div class="version-field"><strong>${fieldConfig.label}：</strong>${displayValue}</div>`;
        }
    });
    return html;
}

/**
 * 关闭历史弹窗
 */
function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('active');
}

// ==================== 考核视图 ====================

/**
 * 刷新考核视图
 */
function refreshAssessment() {
    updateMonthDisplay();
    refreshRanking();
}

/**
 * 更新月份显示
 */
function updateMonthDisplay() {
    const month = DataStorage.getSelectedMonth();
    const [year, m] = month.split('-');
    document.getElementById('currentMonthDisplay').textContent = `${year}年${parseInt(m)}月`;

    // 更新快照状态
    const hasSnapshot = DataStorage.hasSnapshot(month);
    const statusEl = document.getElementById('snapshotStatus');

    if (hasSnapshot) {
        const snapshot = DataStorage.getMonthSnapshot(month);
        const firstPerson = Object.values(snapshot)[0];
        const time = firstPerson ? new Date(firstPerson.snapshotTime).toLocaleString() : '';

        statusEl.className = 'snapshot-status locked';
        statusEl.innerHTML = `
            <span class="status-icon">📸</span>
            <span class="status-text">快照已生成 (${time})</span>
        `;
    } else {
        statusEl.className = 'snapshot-status';
        statusEl.innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text">未生成快照</span>
            <button class="btn btn-primary" onclick="generateSnapshot()">📸 生成快照</button>
        `;
    }
}

/**
 * 上一月
 */
function prevMonth() {
    const current = DataStorage.getSelectedMonth();
    const [year, month] = current.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
        newMonth = 12;
        newYear--;
    }
    DataStorage.setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
    refreshAssessment();
}

/**
 * 下一月
 */
function nextMonth() {
    const current = DataStorage.getSelectedMonth();
    const [year, month] = current.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
        newMonth = 1;
        newYear++;
    }
    DataStorage.setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
    refreshAssessment();
}

/**
 * 刷新排名
 */
function refreshRanking() {
    const container = document.getElementById('rankingContent');
    const rankingData = ScoreEngine.getRankingData();

    if (rankingData.ranking.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无数据</p>';
        return;
    }

    let html = `
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>姓名</th>
                    <th>项目数</th>
                    <th>平均分</th>
                    <th>等级</th>
                </tr>
            </thead>
            <tbody>
    `;

    rankingData.ranking.forEach(person => {
        const rankClass = person.rank <= 3 ? `rank-${person.rank}` : '';
        html += `
            <tr>
                <td class="rank-cell ${rankClass}">${getRankIcon(person.rank)}</td>
                <td class="name-cell" onclick="showPersonProjects('${person.salesperson}')">${person.salesperson}</td>
                <td>${person.projectCount || person.totalProjects}</td>
                <td class="score-cell">${person.avgScore}</td>
                <td style="color: ${person.gradeColor}">${person.gradeIcon} ${person.grade}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    if (rankingData.isSnapshot) {
        html += `<p style="text-align: center; color: #28a745; margin-top: 15px;">📸 数据来源：月度快照</p>`;
    } else {
        html += `<p style="text-align: center; color: #ffc107; margin-top: 15px;">⏳ 数据来源：实时计算（未生成快照）</p>`;
    }

    container.innerHTML = html;
}

/**
 * 获取排名图标
 */
function getRankIcon(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
}

/**
 * 显示某人的项目
 */
function showPersonProjects(salesperson) {
    document.getElementById('projectFilterSalesperson').value = salesperson;
    switchView('projects');
    refreshProjectsList();
}

/**
 * 生成快照
 */
function generateSnapshot() {
    const month = DataStorage.getSelectedMonth();

    if (DataStorage.hasSnapshot(month)) {
        if (!confirm('该月份已有快照，确定要重新生成吗？')) {
            return;
        }
    }

    if (!confirm(`确定要生成 ${month} 的月度快照吗？\n\n快照生成后将锁定该月数据。`)) {
        return;
    }

    ScoreEngine.generateMonthlySnapshot(month);
    alert('快照生成成功！');
    refreshAssessment();
}

/**
 * 导出Excel
 */
function exportToExcel() {
    alert('Excel导出功能开发中...\n\n当前可使用"设置 → 导出数据"导出JSON格式。');
}

// ==================== 设置 ====================

/**
 * 关闭设置弹窗
 */
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

/**
 * 刷新快照列表
 */
function refreshSnapshotList() {
    const container = document.getElementById('snapshotList');
    const months = DataStorage.getSnapshotMonths();

    if (months.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无快照</p>';
        return;
    }

    let html = '';
    months.reverse().forEach(month => {
        const snapshot = DataStorage.getMonthSnapshot(month);
        const personCount = Object.keys(snapshot).length;

        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                <span><strong>${month}</strong> (${personCount}人)</span>
                <button class="btn btn-secondary" onclick="DataStorage.setSelectedMonth('${month}'); closeSettingsModal(); switchView('assessment'); refreshAssessment();">
                    查看
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * 加载测试数据
 */
function loadTestDataFromSettings() {
    console.log('loadTestDataFromSettings: 开始加载测试数据');
    if (DataStorage.hasData()) {
        if (!confirm('当前已有数据，加载测试数据将清除现有数据。确定继续？')) {
            return;
        }
    }

    generateTestData();
    console.log('loadTestDataFromSettings: 测试数据已生成');
    closeSettingsModal();
    refreshAll();
    alert('测试数据加载成功！\n\n请查看控制台(F12)了解详细日志。');
}

/**
 * 导出所有数据
 */
function exportAllData() {
    const data = DataStorage.exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-kpi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * 清除所有数据
 */
function clearAllData() {
    if (!confirm('⚠️ 警告：此操作将删除所有数据！\n\n确定要清除吗？')) {
        return;
    }

    if (!confirm('⚠️ 再次确认：数据删除后无法恢复！')) {
        return;
    }

    DataStorage.clearAllData();
    closeSettingsModal();
    location.reload();
}

// ==================== AI配置 ====================

/**
 * 显示设置弹窗时加载API Key
 */
function showSettingsModal() {
    refreshSnapshotList();
    // 加载已保存的API Key
    const savedKey = AIValidator.getApiKey();
    if (savedKey) {
        document.getElementById('geminiApiKey').value = savedKey;
    }
    document.getElementById('apiTestResult').style.display = 'none';
    document.getElementById('settingsModal').classList.add('active');
}

/**
 * 保存API Key
 */
function saveApiKey() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    AIValidator.setApiKey(apiKey);

    const resultDiv = document.getElementById('apiTestResult');
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#e8f5e9';
    resultDiv.style.color = '#2e7d32';
    resultDiv.textContent = '✅ API Key 已保存';

    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 3000);
}

/**
 * 测试API连接
 */
async function testApiConnection() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    if (!apiKey) {
        alert('请先输入API Key');
        return;
    }

    // 临时保存以便测试
    AIValidator.setApiKey(apiKey);

    const resultDiv = document.getElementById('apiTestResult');
    resultDiv.style.display = 'block';
    resultDiv.style.background = '#fff3e0';
    resultDiv.style.color = '#e65100';
    resultDiv.textContent = '🔄 正在测试连接...';

    try {
        const result = await AIValidator.testConnection();

        if (result.success) {
            resultDiv.style.background = '#e8f5e9';
            resultDiv.style.color = '#2e7d32';
            resultDiv.textContent = `✅ ${result.message}`;
        } else {
            resultDiv.style.background = '#ffebee';
            resultDiv.style.color = '#c62828';
            resultDiv.textContent = `❌ ${result.message}`;
        }
    } catch (error) {
        resultDiv.style.background = '#ffebee';
        resultDiv.style.color = '#c62828';
        resultDiv.textContent = `❌ 测试失败: ${error.message}`;
    }
}

// ==================== 高级验证集成 ====================

/**
 * 执行高级验证（集成到上传版本流程）
 */
async function runAdvancedValidation(taskCode, fields, projectId) {
    const enableAI = AIValidator.isEnabled();

    try {
        const result = await ValidationEngine.validate(taskCode, fields, {
            enableAI,
            projectId
        });

        return result;
    } catch (error) {
        console.error('高级验证失败:', error);
        return null;
    }
}

/**
 * 显示高级验证结果
 */
function showAdvancedValidationResult(result) {
    if (!result) return;

    const html = ValidationEngine.renderResult(result);

    // 创建弹窗显示
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>📋 验证报告</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                ${html}
                <div class="actions" style="margin-top: 20px;">
                    <button class="btn-pass" onclick="this.closest('.modal-overlay').remove()">
                        确认
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}
