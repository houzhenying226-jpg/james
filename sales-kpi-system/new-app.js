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
    initMonthSelector();
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
    const today = new Date().toISOString().split('T')[0];

    let html = `
        <div class="current-status">
            <div class="version-header-info">
                <div>
                    <h4>${config.code} ${config.name}</h4>
                    <p>权重：${config.weight}分</p>
                </div>
                <div class="version-badge-large">${nextVersion}</div>
            </div>
            <p class="version-date">📅 ${today}</p>
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
                <div class="validation-section">
                    <h4>📋 基础验证</h4>
                    <div id="hardRulesValidation"></div>
                </div>

                <div class="validation-section">
                    <h4>🔗 关联验证</h4>
                    <div id="crossRefValidation"></div>
                </div>

                <div class="validation-section">
                    <h4>🤖 AI智能验证</h4>
                    <div id="aiValidation">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="runAIValidation()">
                            运行AI验证
                        </button>
                        <div id="aiValidationResult"></div>
                    </div>
                </div>

                <div class="validation-overall" id="validationOverall"></div>

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

    // 1. 硬规则验证
    const hardRulesResult = ValidationEngine.validateHardRules(currentTaskCode, formData);
    renderHardRulesValidation(hardRulesResult);

    // 2. 关联验证
    const crossRefResult = ValidationEngine.validateCrossReference(currentTaskCode, formData, currentProjectId);
    renderCrossRefValidation(crossRefResult);

    // 3. 更新总体结果
    updateOverallValidation(hardRulesResult, crossRefResult, config);
}

/**
 * 渲染硬规则验证结果
 */
function renderHardRulesValidation(result) {
    const container = document.getElementById('hardRulesValidation');
    if (!container) return;

    if (result.checks.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无验证规则</p>';
        return;
    }

    let html = '<ul class="validation-list">';
    result.checks.forEach(check => {
        const cls = check.passed ? 'pass' : (check.severity === 'warning' ? 'warning' : 'fail');
        const icon = check.passed ? '✅' : (check.severity === 'warning' ? '⚠️' : '❌');
        const message = typeof check.message === 'function' ? check.message : check.message;
        html += `<li class="${cls}">${icon} ${check.label}：${message}</li>`;
    });
    html += '</ul>';

    container.innerHTML = html;
}

/**
 * 渲染关联验证结果
 */
function renderCrossRefValidation(result) {
    const container = document.getElementById('crossRefValidation');
    if (!container) return;

    if (result.checks.length === 0) {
        container.innerHTML = '<p class="empty-hint">此任务无关联验证项</p>';
        return;
    }

    let html = '<ul class="validation-list">';
    result.checks.forEach(check => {
        // 处理三种状态：通过(true)、失败(false)、待验证(null/pending)
        let cls, icon;
        if (check.passed === null || check.pending) {
            cls = 'pending';
            icon = '⏳';
        } else if (check.passed) {
            cls = 'pass';
            icon = '✅';
        } else {
            cls = 'warning';
            icon = '⚠️';
        }
        html += `<li class="${cls}">${icon} ${check.label}：${check.message}</li>`;
    });
    html += '</ul>';

    container.innerHTML = html;
}

/**
 * 更新总体验证结果
 */
function updateOverallValidation(hardRulesResult, crossRefResult, config) {
    const overallEl = document.getElementById('validationOverall');
    const scoreEl = document.getElementById('previewScore');

    const hardPassed = hardRulesResult.passed;
    const hardErrors = hardRulesResult.checks.filter(c => !c.passed && c.severity !== 'warning');
    const hardWarnings = hardRulesResult.checks.filter(c => !c.passed && c.severity === 'warning');
    const crossWarnings = crossRefResult.checks.filter(c => !c.passed);

    // 计算得分
    const rate = hardPassed ? config.validation.passRate : config.validation.failRate;
    const score = Math.round(config.weight * (rate / 100) * 100) / 100;
    scoreEl.textContent = `${score} / ${config.weight} (${rate}%)`;

    // 渲染总体结果
    let overallHtml = '';
    if (hardErrors.length === 0 && hardWarnings.length === 0 && crossWarnings.length === 0) {
        overallHtml = `
            <div class="validation-overall-result pass">
                ✅ 验证通过
            </div>
        `;
    } else if (hardErrors.length === 0) {
        const warnings = [...hardWarnings, ...crossWarnings].map(c => c.label);
        overallHtml = `
            <div class="validation-overall-result warning">
                ⚠️ 建议复核（${warnings.join('、')}）
            </div>
        `;
    } else {
        const missing = hardErrors.map(c => c.label);
        overallHtml = `
            <div class="validation-overall-result fail">
                ❌ 不达标（缺少：${missing.join('、')}）
            </div>
        `;
    }

    overallEl.innerHTML = overallHtml;
}

/**
 * 运行AI验证
 */
async function runAIValidation() {
    const resultEl = document.getElementById('aiValidationResult');
    const config = getTaskConfig(currentTaskCode);
    if (!config) return;

    // 检查API是否可用
    if (!AIValidator.isEnabled()) {
        resultEl.innerHTML = `
            <p class="validation-hint" style="margin-top: 10px;">
                ⚠️ 未配置API Key，请在设置中配置Gemini API Key
            </p>
        `;
        return;
    }

    resultEl.innerHTML = '<p style="margin-top: 10px;">🔄 正在运行AI验证...</p>';

    const form = document.getElementById('versionForm');
    const formData = getFormData(form, config);

    try {
        const result = await ValidationEngine.validateWithAI(currentTaskCode, formData);

        if (result.checks.length === 0) {
            resultEl.innerHTML = '<p class="empty-hint" style="margin-top: 10px;">该任务暂无AI验证规则</p>';
            return;
        }

        let html = '<ul class="validation-list" style="margin-top: 10px;">';
        result.checks.forEach(check => {
            const cls = check.passed ? 'pass' : 'warning';
            const icon = check.passed ? '✅' : '💡';
            html += `<li class="${cls}">${icon} ${check.label}：${check.message}</li>`;
            if (check.suggestions && check.suggestions.length > 0) {
                check.suggestions.forEach(s => {
                    html += `<li class="warning" style="padding-left: 30px;">💡 建议：${s}</li>`;
                });
            }
        });
        html += '</ul>';

        resultEl.innerHTML = html;
    } catch (error) {
        resultEl.innerHTML = `
            <p class="validation-hint" style="margin-top: 10px; color: #c62828;">
                ❌ AI验证失败：${error.message}
            </p>
        `;
    }
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

// 当前展开的销售员
let expandedSalesperson = null;
// 当前排名数据缓存
let currentRankingData = null;

/**
 * 刷新考核视图
 */
function refreshAssessment() {
    initMonthSelector();
    updateSnapshotStatus();
    refreshRanking();
}

/**
 * 初始化月份选择器
 */
function initMonthSelector() {
    const select = document.getElementById('monthSelect');
    const currentMonth = DataStorage.getSelectedMonth();

    // 生成最近12个月的选项
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const value = `${year}-${month}`;
        const label = `${year}年${d.getMonth() + 1}月`;
        months.push({ value, label });
    }

    select.innerHTML = months.map(m =>
        `<option value="${m.value}" ${m.value === currentMonth ? 'selected' : ''}>${m.label}</option>`
    ).join('');
}

/**
 * 月份变更事件
 */
function onMonthChange() {
    const select = document.getElementById('monthSelect');
    DataStorage.setSelectedMonth(select.value);
    expandedSalesperson = null;
    updateSnapshotStatus();
    refreshRanking();
}

/**
 * 更新快照状态
 */
function updateSnapshotStatus() {
    const month = DataStorage.getSelectedMonth();
    const hasSnapshot = DataStorage.hasSnapshot(month);
    const statusEl = document.getElementById('snapshotStatus');
    const btnEl = document.getElementById('generateSnapshotBtn');

    if (hasSnapshot) {
        const snapshot = DataStorage.getMonthSnapshot(month);
        const firstPerson = Object.values(snapshot)[0];
        const time = firstPerson ? new Date(firstPerson.snapshotTime).toLocaleString() : '';

        statusEl.className = 'snapshot-status locked';
        statusEl.innerHTML = `
            <span class="status-icon">🔒</span>
            <span class="status-text">已锁定</span>
            <span class="status-time">${time}</span>
        `;
        btnEl.style.display = 'none';
    } else {
        statusEl.className = 'snapshot-status';
        statusEl.innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text">未生成快照</span>
        `;
        btnEl.style.display = 'inline-block';
    }
}

/**
 * 刷新排名
 */
function refreshRanking() {
    const container = document.getElementById('rankingContent');
    currentRankingData = ScoreEngine.getRankingData();

    if (currentRankingData.ranking.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无数据，请先在项目视图添加项目</p>';
        return;
    }

    let html = `
        <table class="ranking-table">
            <thead>
                <tr>
                    <th style="width: 60px;">排名</th>
                    <th>姓名</th>
                    <th style="width: 80px;">项目数</th>
                    <th style="width: 100px;">平均分</th>
                    <th style="width: 100px;">等级</th>
                </tr>
            </thead>
            <tbody>
    `;

    currentRankingData.ranking.forEach(person => {
        const rankClass = person.rank <= 3 ? `rank-${person.rank}` : '';
        const isExpanded = expandedSalesperson === person.salesperson;
        const salesperson = person.salesperson;

        // 排名行
        html += `
            <tr class="ranking-row ${isExpanded ? 'expanded' : ''}"
                onclick="togglePersonDetail('${salesperson}')">
                <td class="rank-cell ${rankClass}">${getRankIcon(person.rank)}</td>
                <td class="name-cell">${salesperson} ${isExpanded ? '▼' : '▶'}</td>
                <td>${person.projectCount || person.totalProjects}</td>
                <td class="score-cell">${person.avgScore}</td>
                <td style="color: ${person.gradeColor}">${person.gradeIcon} ${person.grade}</td>
            </tr>
        `;

        // 明细行
        html += `
            <tr class="project-details-row ${isExpanded ? 'visible' : ''}" id="detail-${salesperson}">
                <td colspan="5" class="project-details-cell">
                    ${isExpanded ? renderPersonProjects(person) : ''}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // 数据来源提示
    if (currentRankingData.isSnapshot) {
        html += `<p style="text-align: center; color: #28a745; margin-top: 15px;">
            📸 数据来源：月度快照（数据已锁定）
        </p>`;
    } else {
        html += `<p style="text-align: center; color: #ffc107; margin-top: 15px;">
            ⏳ 数据来源：实时计算（点击"生成本月快照"锁定数据）
        </p>`;
    }

    container.innerHTML = html;
}

/**
 * 切换销售员项目明细
 */
function togglePersonDetail(salesperson) {
    if (expandedSalesperson === salesperson) {
        expandedSalesperson = null;
    } else {
        expandedSalesperson = salesperson;
    }
    refreshRanking();
}

/**
 * 渲染销售员的项目明细
 */
function renderPersonProjects(person) {
    // 获取项目数据
    let projects = [];

    if (currentRankingData.isSnapshot && person.projectSnapshots) {
        // 从快照获取
        projects = person.projectSnapshots;
    } else if (person.projects) {
        // 从实时数据获取
        projects = person.projects;
    }

    if (projects.length === 0) {
        return '<div class="project-details-content"><p class="empty-hint">暂无项目数据</p></div>';
    }

    let html = '<div class="project-details-content">';

    projects.forEach(project => {
        const projectName = project.projectName || project.name;
        const finalScore = project.finalScore || 0;
        const currentStage = project.currentStage || '接触';
        const amount = project.amount || 0;

        html += `
            <div class="project-detail-card">
                <div class="project-detail-header">
                    <span class="project-detail-name">${projectName}</span>
                    <span class="project-detail-score">${finalScore}分</span>
                </div>
                <div class="project-detail-meta">
                    <span>📍 阶段: ${currentStage}</span>
                    <span>💰 金额: ${amount}万</span>
                    <span>📊 等级: ${project.grade || '-'}</span>
                </div>
                <div class="task-scores-grid">
                    ${renderTaskScoresGrid(project.taskScores)}
                </div>
                ${renderCoefficients(project)}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

/**
 * 渲染任务得分网格
 */
function renderTaskScoresGrid(taskScores) {
    if (!taskScores) return '<p class="empty-hint">暂无任务数据</p>';

    let html = '';
    const taskCodes = Object.keys(taskScores).sort();

    taskCodes.forEach(code => {
        const task = taskScores[code];
        const score = task.score || 0;
        const weight = task.weight || 0;
        const versionId = task.versionId || task.bestVersionId || '-';

        let scoreClass = 'zero';
        if (score >= weight) {
            scoreClass = 'full';
        } else if (score > 0) {
            scoreClass = 'partial';
        }

        html += `
            <div class="task-score-item" title="${task.taskName || ''}">
                <div class="task-score-code">${code}</div>
                <div class="task-score-value ${scoreClass}">${score}/${weight}</div>
            </div>
        `;
    });

    return html;
}

/**
 * 渲染系数信息
 */
function renderCoefficients(project) {
    if (!project.difficultyCoef && !project.stayCoef && !project.progressCoef) {
        return '';
    }

    let html = '<div class="coefficients-row">';

    if (project.difficultyCoef) {
        html += `
            <span class="coefficient-badge">
                难度系数: <span class="value">${project.difficultyCoef.value || project.difficultyCoef}</span>
            </span>
        `;
    }

    if (project.stayCoef) {
        const days = project.stayCoef.days || '';
        html += `
            <span class="coefficient-badge">
                停留系数: <span class="value">${project.stayCoef.value || project.stayCoef}</span>
                ${days ? `(${days}天)` : ''}
            </span>
        `;
    }

    if (project.progressCoef) {
        const change = project.progressCoef.change;
        const changeText = change > 0 ? `+${change}阶段` : (change < 0 ? `${change}阶段` : '保持');
        html += `
            <span class="coefficient-badge">
                推进系数: <span class="value">${project.progressCoef.value || project.progressCoef}</span>
                (${changeText})
            </span>
        `;
    }

    html += '</div>';
    return html;
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
 * 显示某人的项目（跳转到项目视图）
 */
function showPersonProjects(salesperson) {
    document.getElementById('projectFilterSalesperson').value = salesperson;
    switchView('projects');
    refreshProjectsList();
}

/**
 * 关闭项目明细弹窗
 */
function closeProjectDetailModal() {
    document.getElementById('projectDetailModal').classList.remove('active');
}

/**
 * 生成快照
 */
function generateSnapshot() {
    const month = DataStorage.getSelectedMonth();
    const [year, m] = month.split('-');
    const monthLabel = `${year}年${parseInt(m)}月`;

    if (DataStorage.hasSnapshot(month)) {
        if (!confirm(`${monthLabel} 已有快照数据。\n\n确定要重新生成吗？这将覆盖现有快照。`)) {
            return;
        }
    } else {
        if (!confirm(`确定要生成 ${monthLabel} 的月度快照吗？\n\n快照生成后，该月数据将被锁定。`)) {
            return;
        }
    }

    ScoreEngine.generateMonthlySnapshot(month);
    alert(`${monthLabel} 快照生成成功！\n\n该月考核数据已锁定。`);
    expandedSalesperson = null;
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

// ==================== AI全局一致性分析 ====================

/**
 * 获取项目的所有任务数据（用于全局分析）
 */
function getAllTasksDataForProject(projectId) {
    const projectTasks = DataStorage.getProjectTasks(projectId);
    const result = {};

    TASK_CONFIG.forEach(config => {
        const taskId = `${projectId}-${config.code}`;
        const task = projectTasks[taskId];

        if (task && task.versions && task.versions.length > 0) {
            // 获取最新版本的数据
            const bestVersion = task.versions.find(v => v.versionId === task.bestVersionId)
                || task.versions[task.versions.length - 1];

            result[config.code] = {
                name: config.name,
                fields: bestVersion.fields || {},
                versionId: bestVersion.versionId,
                createDate: bestVersion.createDate
            };
        }
    });

    return result;
}

/**
 * 显示全局分析弹窗
 */
function showGlobalAnalysisModal() {
    if (!currentProjectId) {
        alert('请先选择一个项目');
        return;
    }

    const project = DataStorage.getProject(currentProjectId);
    if (!project) {
        alert('项目不存在');
        return;
    }

    const html = `
        <div class="global-analysis-container">
            <div class="analysis-info">
                <p><strong>项目：</strong>${project.name}</p>
                <p><strong>销售：</strong>${project.salesperson}</p>
                <p><strong>阶段：</strong>${project.currentStage}</p>
            </div>

            <div class="analysis-actions">
                <button id="globalAnalysisBtn" class="btn btn-primary" onclick="runGlobalAnalysis()">
                    🔍 运行全局一致性分析
                </button>
            </div>

            <div id="globalAnalysisResult" class="analysis-result"></div>
        </div>
    `;

    document.getElementById('globalAnalysisModalTitle').textContent = '📊 AI全局一致性分析';
    document.getElementById('globalAnalysisModalBody').innerHTML = html;
    document.getElementById('globalAnalysisModal').classList.add('active');
}

/**
 * 关闭全局分析弹窗
 */
function closeGlobalAnalysisModal() {
    document.getElementById('globalAnalysisModal').classList.remove('active');
}

/**
 * 运行全局分析
 */
async function runGlobalAnalysis() {
    const btn = document.getElementById('globalAnalysisBtn');
    const resultDiv = document.getElementById('globalAnalysisResult');

    // 检查API Key
    if (!GlobalAnalyzer.getApiKey()) {
        resultDiv.innerHTML = `
            <div class="global-analysis-error">
                <span class="error-icon">⚠️</span>
                <span class="error-message">请先在设置中配置Gemini API Key</span>
            </div>
        `;
        return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ 分析中...';
    resultDiv.innerHTML = '<div class="loading-indicator">🔄 AI正在分析项目数据一致性，请稍候...</div>';

    try {
        // 获取项目数据
        const project = DataStorage.getProject(currentProjectId);
        const allTasksData = getAllTasksDataForProject(currentProjectId);

        // 检查是否有任务数据
        if (Object.keys(allTasksData).length === 0) {
            resultDiv.innerHTML = `
                <div class="global-analysis-error">
                    <span class="error-icon">⚠️</span>
                    <span class="error-message">该项目暂无任务数据，请先填写任务</span>
                </div>
            `;
            btn.disabled = false;
            btn.textContent = '🔍 运行全局一致性分析';
            return;
        }

        // 调用AI分析
        const result = await GlobalAnalyzer.analyzeProject(project, allTasksData);

        // 渲染结果
        resultDiv.innerHTML = GlobalAnalyzer.renderGlobalAnalysisResult(result);

    } catch (error) {
        resultDiv.innerHTML = `
            <div class="global-analysis-error">
                <span class="error-icon">❌</span>
                <span class="error-message">分析失败：${error.message}</span>
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.textContent = '🔍 运行全局一致性分析';
    }
}

/**
 * 运行版本演变分析
 */
async function runVersionAnalysis(taskCode) {
    const config = getTaskConfig(taskCode);
    const task = DataStorage.getTask(`${currentProjectId}-${taskCode}`);

    if (!task || task.versions.length < 2) {
        alert('至少需要2个版本才能进行演变分析');
        return;
    }

    // 检查API Key
    if (!GlobalAnalyzer.getApiKey()) {
        alert('请先在设置中配置Gemini API Key');
        return;
    }

    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = '<div class="loading-indicator">🔄 正在分析版本演变...</div>';
    document.getElementById('historyModalBody').appendChild(resultDiv);

    try {
        const result = await GlobalAnalyzer.analyzeVersionChanges(
            taskCode,
            config.name,
            task.versions
        );

        resultDiv.innerHTML = GlobalAnalyzer.renderVersionAnalysisResult(result);
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="version-analysis-error">
                <span class="error-icon">❌</span>
                <span class="error-message">分析失败：${error.message}</span>
            </div>
        `;
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
