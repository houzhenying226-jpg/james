/**
 * 销售考核系统 V2 - 主应用
 * 任务版本化 + 月度快照
 */

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initMonthSelector();
    checkFirstRun();
    refreshAll();
});

/**
 * 检查首次运行
 */
function checkFirstRun() {
    const projects = DataStorage.getAllProjects();
    if (Object.keys(projects).length === 0) {
        // 首次运行，提示加载测试数据
        setTimeout(() => {
            if (confirm('检测到系统首次运行，是否加载测试数据？\n\n测试数据包含：\n- 3名销售员：张三、李四、王五\n- 8个项目\n- 2024年11月快照\n- 多版本任务示例')) {
                loadTestData();
                location.reload();
            }
        }, 500);
    }
}

/**
 * 初始化标签页切换
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * 初始化月份选择器
 */
function initMonthSelector() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        const current = DataStorage.getCurrentMonth();
        const prev = DataStorage.getPreviousMonth(current);
        DataStorage.setCurrentMonth(prev);
        refreshAll();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        const current = DataStorage.getCurrentMonth();
        const next = DataStorage.getNextMonth(current);
        DataStorage.setCurrentMonth(next);
        refreshAll();
    });

    document.getElementById('generateSnapshot').addEventListener('click', () => {
        generateCurrentSnapshot();
    });
}

/**
 * 刷新所有界面
 */
function refreshAll() {
    updateMonthDisplay();
    updateRanking();
    updateProjectList();
    updatePersonSelect();
    updateSnapshotList();
}

// ==================== 月份显示 ====================

function updateMonthDisplay() {
    const month = DataStorage.getCurrentMonth();
    const [year, m] = month.split('-');
    document.getElementById('currentMonthLabel').textContent = `${year}年${parseInt(m)}月`;

    const hasSnapshot = DataStorage.hasSnapshot(month);
    const statusEl = document.getElementById('snapshotStatus');
    const snapshotBtn = document.getElementById('generateSnapshot');

    if (hasSnapshot) {
        statusEl.textContent = '📸 已生成快照';
        statusEl.className = 'snapshot-status locked';
        snapshotBtn.classList.add('hidden');
    } else {
        statusEl.textContent = '⏳ 未生成快照';
        statusEl.className = 'snapshot-status unlocked';
        snapshotBtn.classList.remove('hidden');
    }
}

// ==================== 排行榜 ====================

function updateRanking() {
    const container = document.getElementById('rankingContent');
    const month = DataStorage.getCurrentMonth();

    // 检查是否有快照
    const snapshot = DataStorage.getSnapshot(month);

    let ranking;
    let isSnapshot = false;

    if (snapshot) {
        // 使用快照数据
        ranking = snapshot.ranking || [];
        isSnapshot = true;
    } else {
        // 实时计算
        const result = ScoreCalculator.getCurrentRanking();
        ranking = result.salespeople.map(p => ({
            rank: p.rank,
            name: p.name,
            projectCount: p.projectCount,
            avgScore: p.avgScore,
            grade: p.grade,
            gradeIcon: p.gradeIcon,
            gradeColor: p.gradeColor
        }));
    }

    if (ranking.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无数据，请先创建项目或加载测试数据</p>';
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

    ranking.forEach(person => {
        const rankClass = person.rank <= 3 ? `rank-${person.rank}` : '';
        html += `
            <tr>
                <td class="rank ${rankClass}">${getRankIcon(person.rank)}</td>
                <td class="name-cell" onclick="showPersonDetailByName('${person.name}')">${person.name}</td>
                <td>${person.projectCount}</td>
                <td class="score">${person.avgScore}</td>
                <td class="grade" style="color: ${person.gradeColor || '#333'}">${person.gradeIcon || ''} ${person.grade}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    if (isSnapshot) {
        const snapshot = DataStorage.getSnapshot(month);
        html += `<p style="text-align: center; color: #666; margin-top: 15px; font-size: 0.9rem;">📸 快照时间：${new Date(snapshot.snapshotTime).toLocaleString()}</p>`;
    } else {
        html += `<p style="text-align: center; color: #ffc107; margin-top: 15px; font-size: 0.9rem;">⏳ 实时数据（未生成快照）</p>`;
    }

    container.innerHTML = html;
}

function getRankIcon(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
}

// ==================== 项目管理 ====================

function updateProjectList() {
    const container = document.getElementById('projectList');
    const filterPerson = document.getElementById('projectFilterPerson');
    const projects = DataStorage.getAllProjects();

    // 更新筛选器选项
    const salespeople = DataStorage.getAllSalespeople();
    filterPerson.innerHTML = '<option value="">全部</option>';
    salespeople.forEach(name => {
        filterPerson.innerHTML += `<option value="${name}">${name}</option>`;
    });

    // 获取筛选条件
    const personFilter = filterPerson.value;
    const stageFilter = document.getElementById('projectFilterStage').value;

    // 筛选和显示项目
    let projectList = Object.values(projects);

    if (personFilter) {
        projectList = projectList.filter(p => p.salesPerson === personFilter);
    }
    if (stageFilter) {
        projectList = projectList.filter(p => p.currentStage === stageFilter);
    }

    if (projectList.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无项目</p>';
        return;
    }

    const month = DataStorage.getCurrentMonth();
    let html = '';

    projectList.forEach(project => {
        const result = ScoreCalculator.calculateProject(project, month, project.monthStartStage);
        const completedTasks = result.taskScores.filter(t => t.completionRate === 100).length;
        const totalVersions = result.totalVersions;

        html += `
            <div class="project-card" onclick="showProjectDetail('${project.projectId}')">
                <div class="project-card-header">
                    <div class="project-card-title">${project.projectName}</div>
                    <div class="project-card-stage">${project.currentStage}</div>
                </div>
                <div class="project-card-info">
                    <span>👤 ${project.salesPerson}</span>
                    <span>💰 ${project.amount}万</span>
                    <span>📅 ${project.stageDate}</span>
                </div>
                <div class="project-card-score">
                    <div>
                        <span class="score-value">${result.finalScore}分</span>
                        <span class="grade" style="color: ${result.gradeColor}">${result.gradeIcon}</span>
                    </div>
                    <div class="task-progress">
                        ✅ ${completedTasks}/16任务 · 📝 ${totalVersions}个版本
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function filterProjects() {
    updateProjectList();
}

// ==================== 项目详情弹窗 ====================

function showProjectDetail(projectId) {
    const project = DataStorage.getProject(projectId);
    if (!project) return;

    const month = DataStorage.getCurrentMonth();
    const result = ScoreCalculator.calculateProject(project, month, project.monthStartStage);

    document.getElementById('projectModalTitle').textContent = project.projectName;

    let html = `
        <div class="score-overview" style="margin-bottom: 20px;">
            <div class="score-card final">
                <div class="label">最终得分</div>
                <div class="value">${result.finalScore}</div>
                <div class="grade">${result.gradeIcon} ${result.grade}</div>
            </div>
            <div class="score-card">
                <div class="label">基础分</div>
                <div class="value">${result.baseScore}</div>
            </div>
            <div class="score-card">
                <div class="label">难度系数</div>
                <div class="value">×${result.difficultyCoef.value}</div>
            </div>
            <div class="score-card">
                <div class="label">推进系数</div>
                <div class="value">×${result.progressCoef.value}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>项目信息</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div><strong>销售员：</strong>${project.salesPerson}</div>
                <div><strong>金额：</strong>${project.amount}万元</div>
                <div><strong>当前阶段：</strong>${project.currentStage}</div>
                <div><strong>进攻计划：</strong>${result.attackPlanScore}分</div>
                <div><strong>阶段日期：</strong>${project.stageDate}</div>
                <div><strong>推进情况：</strong>${project.monthStartStage || '-'} → ${project.currentStage}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>任务完成情况（点击查看/上传版本）</h3>
            <div class="task-list">
    `;

    result.taskScores.forEach(task => {
        const statusClass = task.completionRate === 100 ? 'completed' :
                           task.completionRate > 0 ? 'partial' : 'pending';
        html += `
            <div class="task-item ${statusClass}" onclick="showTaskVersions('${projectId}', '${task.taskId}')">
                <div class="task-info">
                    <span class="task-id">${task.taskId}</span>
                    <span class="task-name">${task.taskName}</span>
                    <div class="task-stage">阶段：${task.stage} · 权重：${task.weight}分</div>
                </div>
                <div class="task-score">
                    <div class="score-value">${task.score} / ${task.weight}</div>
                    <div class="version-count">${task.versionCount}个版本</div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    document.getElementById('projectModalBody').innerHTML = html;
    document.getElementById('projectModal').classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// ==================== 任务版本管理 ====================

function showTaskVersions(projectId, taskId) {
    const project = DataStorage.getProject(projectId);
    if (!project) return;

    const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);
    const task = project.tasks ? project.tasks[taskId] : null;
    const versions = task ? task.versions : [];

    document.getElementById('versionModalTitle').textContent = `${taskId} ${taskDef.name}`;

    let html = `
        <div style="margin-bottom: 20px;">
            <strong>权重：</strong>${taskDef.weight}分 ·
            <strong>阶段：</strong>${taskDef.stage} ·
            <strong>版本数：</strong>${versions.length}
        </div>

        <div class="version-list">
    `;

    if (versions.length === 0) {
        html += '<p class="empty-hint">暂无版本记录</p>';
    } else {
        // 按得分排序显示
        const sortedVersions = [...versions].sort((a, b) => b.score - a.score);

        sortedVersions.forEach((version, index) => {
            const isBest = index === 0;
            html += `
                <div class="version-item ${isBest ? 'best' : ''}">
                    <div class="version-icon ${isBest ? 'best' : 'normal'}">
                        ${isBest ? '✓' : version.versionId.replace('V', '').replace('.0', '')}
                    </div>
                    <div class="version-content">
                        <div class="version-header">
                            <div>
                                <span class="version-id">${version.versionId}</span>
                                ${isBest ? '<span style="color: #28a745; font-size: 0.8rem;"> [当前最优]</span>' : ''}
                            </div>
                            <span class="version-score">${version.score}分 (${version.completionRate}%)</span>
                        </div>
                        <div class="version-date">📅 ${version.uploadDate}</div>
                        ${version.note ? `<div class="version-note">📝 ${version.note}</div>` : ''}
                        ${version.files && version.files.length > 0 ? `
                            <div class="version-files">
                                ${version.files.map(f => `<span class="file-tag">📄 ${f.name}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    }

    html += `
        </div>
        <div class="form-actions">
            <button class="btn btn-primary" onclick="showUploadVersionForm('${projectId}', '${taskId}')">
                ➕ 上传新版本
            </button>
        </div>
    `;

    document.getElementById('versionModalBody').innerHTML = html;
    document.getElementById('versionModal').classList.add('active');
}

function closeVersionModal() {
    document.getElementById('versionModal').classList.remove('active');
}

// ==================== 上传新版本 ====================

function showUploadVersionForm(projectId, taskId) {
    const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);

    let html = `
        <form id="uploadVersionForm" onsubmit="submitNewVersion(event, '${projectId}', '${taskId}')">
            <div class="form-group">
                <label>完成度 *</label>
                <div class="completion-selector">
                    <div class="completion-option" data-value="100" onclick="selectCompletion(this, 100)">
                        <span class="completion-value">100%</span>
                        <span class="completion-label">完成</span>
                    </div>
                    <div class="completion-option" data-value="50" onclick="selectCompletion(this, 50)">
                        <span class="completion-value">50%</span>
                        <span class="completion-label">部分完成</span>
                    </div>
                    <div class="completion-option" data-value="0" onclick="selectCompletion(this, 0)">
                        <span class="completion-value">0%</span>
                        <span class="completion-label">未完成</span>
                    </div>
                </div>
                <input type="hidden" name="completionRate" id="completionRateInput" required>
            </div>

            <div class="form-group">
                <label>上传日期</label>
                <input type="date" name="uploadDate" value="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
                <label>备注说明</label>
                <textarea name="note" rows="3" placeholder="简要描述本次完成情况..."></textarea>
            </div>

            <div class="form-group">
                <label>相关文件（仅记录文件名）</label>
                <input type="text" name="fileName" placeholder="例如：方案讲解PPT.pptx">
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="showTaskVersions('${projectId}', '${taskId}')">返回</button>
                <button type="submit" class="btn btn-primary">保存版本</button>
            </div>
        </form>
    `;

    document.getElementById('versionModalBody').innerHTML = html;
}

function selectCompletion(element, value) {
    // 移除其他选中状态
    document.querySelectorAll('.completion-option').forEach(el => {
        el.classList.remove('selected', 'selected-100', 'selected-50', 'selected-0');
    });

    // 添加选中状态
    element.classList.add('selected', `selected-${value}`);
    document.getElementById('completionRateInput').value = value;
}

function submitNewVersion(event, projectId, taskId) {
    event.preventDefault();

    const form = event.target;
    const completionRate = parseInt(form.completionRate.value);

    if (isNaN(completionRate)) {
        alert('请选择完成度');
        return;
    }

    const version = {
        uploadDate: form.uploadDate.value,
        completionRate: completionRate,
        note: form.note.value,
        files: form.fileName.value ? [{ name: form.fileName.value }] : [],
        fields: {},
        status: '已验证'
    };

    DataStorage.addTaskVersion(projectId, taskId, version);

    alert('版本保存成功！');
    showTaskVersions(projectId, taskId);
    refreshAll();
}

// ==================== 新建项目 ====================

function showAddProjectModal() {
    document.getElementById('addProjectForm').reset();
    document.querySelector('[name="stageDate"]').value = new Date().toISOString().split('T')[0];
    document.getElementById('addProjectModal').classList.add('active');
}

function closeAddProjectModal() {
    document.getElementById('addProjectModal').classList.remove('active');
}

function submitNewProject(event) {
    event.preventDefault();

    const form = event.target;
    const project = {
        projectId: DataStorage.generateId(),
        projectName: form.projectName.value,
        salesPerson: form.salesPerson.value,
        amount: parseFloat(form.amount.value),
        currentStage: form.currentStage.value,
        stageDate: form.stageDate.value,
        monthStartStage: form.currentStage.value,
        attackPlanScore: parseFloat(form.attackPlanScore.value) || 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        tasks: {}
    };

    DataStorage.saveProject(project);
    closeAddProjectModal();
    refreshAll();
    alert('项目创建成功！');
}

// ==================== 个人详情 ====================

function updatePersonSelect() {
    const select = document.getElementById('personSelect');
    const salespeople = DataStorage.getAllSalespeople();

    select.innerHTML = '<option value="">-- 请选择 --</option>';
    salespeople.forEach(name => {
        select.innerHTML += `<option value="${name}">${name}</option>`;
    });
}

function showPersonDetailByName(name) {
    // 切换到详情标签
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="detail"]').classList.add('active');
    document.getElementById('detail').classList.add('active');

    document.getElementById('personSelect').value = name;
    showPersonDetail();
}

function showPersonDetail() {
    const container = document.getElementById('detailContent');
    const name = document.getElementById('personSelect').value;

    if (!name) {
        container.innerHTML = '<p class="empty-hint">请选择销售员查看详情</p>';
        return;
    }

    const month = DataStorage.getCurrentMonth();
    const projects = DataStorage.getProjectsBySalesPerson(name);

    if (projects.length === 0) {
        container.innerHTML = '<p class="empty-hint">该销售员暂无项目</p>';
        return;
    }

    // 计算所有项目
    const projectResults = projects.map(p =>
        ScoreCalculator.calculateProject(p, month, p.monthStartStage)
    );

    const summary = ScoreCalculator.calculatePersonSummary(projectResults);

    let html = `
        <div class="score-overview">
            <div class="score-card final">
                <div class="label">平均得分</div>
                <div class="value">${summary.avgScore}</div>
                <div class="grade">${summary.gradeIcon} ${summary.grade}</div>
            </div>
            <div class="score-card">
                <div class="label">项目数</div>
                <div class="value">${summary.projectCount}</div>
            </div>
            <div class="score-card">
                <div class="label">最高分</div>
                <div class="value">${summary.highestProject.finalScore}</div>
            </div>
            <div class="score-card">
                <div class="label">最低分</div>
                <div class="value">${summary.lowestProject.finalScore}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>项目列表</h3>
    `;

    projectResults.sort((a, b) => b.finalScore - a.finalScore).forEach((result, index) => {
        const isHighest = index === 0;
        const isLowest = index === projectResults.length - 1 && projectResults.length > 1;

        html += `
            <div class="project-card" onclick="showProjectDetail('${result.projectId}')" style="border-left-color: ${result.gradeColor}">
                <div class="project-card-header">
                    <div class="project-card-title">
                        ${isHighest ? '🔥 ' : ''}${isLowest ? '⚠️ ' : ''}${result.projectName}
                    </div>
                    <div class="project-card-stage">${result.currentStage}</div>
                </div>
                <div class="project-card-info">
                    <span>💰 ${result.amount}万</span>
                    <span>📊 基础分: ${result.baseScore}</span>
                </div>
                <div class="project-card-score">
                    <span class="score-value">${result.finalScore}分</span>
                    <span class="grade" style="color: ${result.gradeColor}">${result.gradeIcon} ${result.grade}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}

// ==================== 快照管理 ====================

function generateCurrentSnapshot() {
    const month = DataStorage.getCurrentMonth();

    if (DataStorage.hasSnapshot(month)) {
        alert('该月份已有快照，无法重复生成！');
        return;
    }

    if (!confirm(`确定要生成 ${month} 的月度快照吗？\n\n快照生成后数据将被锁定，无法修改。`)) {
        return;
    }

    const snapshot = ScoreCalculator.generateMonthlySnapshot(month);
    DataStorage.saveSnapshot(snapshot);

    alert('快照生成成功！');
    refreshAll();
}

function updateSnapshotList() {
    const container = document.getElementById('snapshotList');
    const months = DataStorage.getSnapshotMonths();

    if (months.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无快照</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 10px;">';

    months.reverse().forEach(month => {
        const snapshot = DataStorage.getSnapshot(month);
        const time = new Date(snapshot.snapshotTime).toLocaleString();
        const personCount = Object.keys(snapshot.salespeople || {}).length;

        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9ff; border-radius: 8px;">
                <div>
                    <strong>${month}</strong>
                    <span style="color: #666; font-size: 0.9rem; margin-left: 10px;">
                        ${personCount}人 · ${time}
                    </span>
                </div>
                <button class="btn btn-secondary" onclick="DataStorage.setCurrentMonth('${month}'); refreshAll();">
                    查看
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ==================== 数据管理 ====================

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

function confirmClearData() {
    if (!confirm('⚠️ 警告：此操作将删除所有数据！\n\n确定要清除所有数据吗？')) {
        return;
    }

    if (!confirm('⚠️ 再次确认：数据删除后无法恢复！\n\n真的要继续吗？')) {
        return;
    }

    DataStorage.clearAllData();
    alert('数据已清除');
    location.reload();
}

function exportToExcel() {
    alert('Excel导出功能开发中...\n\n当前可使用"设置 → 导出全部数据"导出JSON格式。');
}
