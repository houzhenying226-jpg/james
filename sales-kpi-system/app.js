/**
 * 销售考核系统 - 主应用
 * 北京北方努派服装公司
 */

// 全局数据存储
let salesData = [];           // 原始项目数据
let salespeople = [];         // 按销售员分组后的数据
let projectResults = [];      // 所有项目的计算结果

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initUpload();
});

/**
 * 初始化标签页切换
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 添加当前活动状态
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * 初始化文件上传
 */
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // 点击上传
    uploadArea.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

// ==================== 文件处理 ====================

/**
 * 处理上传的Excel文件
 */
function handleFile(file) {
    const statusDiv = document.getElementById('uploadStatus');

    // 验证文件类型
    const validTypes = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validTypes.some(type => fileName.endsWith(type));

    if (!isValid) {
        showStatus('error', '请上传Excel文件（.xlsx 或 .xls）');
        return;
    }

    showStatus('success', '正在解析文件...');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // 读取第一个工作表
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 解析数据
            parseExcelData(jsonData);

        } catch (error) {
            console.error('解析错误:', error);
            showStatus('error', '文件解析失败：' + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

/**
 * 解析Excel数据
 */
function parseExcelData(jsonData) {
    salesData = [];

    // 跳过标题行，从第2行开始
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue; // 跳过空行

        try {
            const person = {
                name: String(row[EXCEL_COLUMNS.name] || '').trim(),
                project: String(row[EXCEL_COLUMNS.project] || '').trim(),
                currentStage: String(row[EXCEL_COLUMNS.currentStage] || '').trim(),
                amount: parseFloat(row[EXCEL_COLUMNS.amount]) || 0,
                stageDate: parseDate(row[EXCEL_COLUMNS.stageDate]),
                startStage: String(row[EXCEL_COLUMNS.startStage] || '').trim(),
                endStage: String(row[EXCEL_COLUMNS.endStage] || '').trim(),
                tasks: [],
                attackPlan: parseFloat(row[EXCEL_COLUMNS.attackPlan]) || 0
            };

            // 解析16个任务完成度
            for (let j = 0; j < 16; j++) {
                const taskValue = row[EXCEL_COLUMNS.tasksStart + j];
                person.tasks.push(parseCompletion(taskValue));
            }

            // 验证数据
            if (person.name && person.currentStage) {
                salesData.push(person);
            }
        } catch (error) {
            console.warn(`第${i + 1}行数据解析失败:`, error);
        }
    }

    if (salesData.length === 0) {
        showStatus('error', '未找到有效数据，请检查Excel格式');
        return;
    }

    // 计算所有项目得分并按销售员分组
    const result = SalesCalculator.calculateAll(salesData);
    salespeople = result.salespeople;
    projectResults = result.projectResults;

    // 统计销售员数量
    const personCount = salespeople.length;
    const projectCount = salesData.length;

    showStatus('success', `成功导入 ${projectCount} 个项目，共 ${personCount} 名销售员！点击"排行榜"查看结果。`);

    // 更新界面
    updateRanking();
    updatePersonSelect();
}

/**
 * 解析日期
 */
function parseDate(value) {
    if (!value) return new Date().toISOString().split('T')[0];

    // 如果是Excel日期数字
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }

    // 如果是字符串
    return String(value).trim();
}

/**
 * 解析完成度
 */
function parseCompletion(value) {
    if (value === undefined || value === null || value === '') return 0;

    // 处理百分比字符串
    if (typeof value === 'string') {
        value = value.replace('%', '').trim();
    }

    const num = parseFloat(value);
    if (isNaN(num)) return 0;

    // 如果是小数形式（0.5），转换为百分比
    if (num > 0 && num <= 1) {
        return num * 100;
    }

    return num;
}

/**
 * 显示状态信息
 */
function showStatus(type, message) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.className = 'upload-status ' + type;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
}

// ==================== 排行榜 ====================

/**
 * 更新排行榜显示（按销售员汇总）
 */
function updateRanking() {
    const container = document.getElementById('rankingContent');

    if (salespeople.length === 0) {
        container.innerHTML = '<p class="empty-hint">请先导入数据</p>';
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

    salespeople.forEach(person => {
        const rankClass = person.rank <= 3 ? `rank-${person.rank}` : '';
        html += `
            <tr>
                <td class="rank ${rankClass}">${getRankIcon(person.rank)}</td>
                <td class="name-cell" onclick="showPersonDetailByName('${person.name}')">${person.name}</td>
                <td>${person.projectCount}</td>
                <td class="score">${person.avgScore}</td>
                <td class="grade" style="color: ${person.gradeColor}">${person.gradeIcon} ${person.grade}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
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

// ==================== 个人详情 ====================

/**
 * 更新人员选择器
 */
function updatePersonSelect() {
    const select = document.getElementById('personSelect');
    select.innerHTML = '<option value="">-- 请选择 --</option>';

    salespeople.forEach(person => {
        const option = document.createElement('option');
        option.value = person.name;
        option.textContent = `${person.name} - ${person.projectCount}个项目 - 平均${person.avgScore}分`;
        select.appendChild(option);
    });
}

/**
 * 通过名字显示详情（从排行榜点击）
 */
function showPersonDetailByName(name) {
    // 切换到详情标签
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="detail"]').classList.add('active');
    document.getElementById('detail').classList.add('active');

    // 选择人员
    document.getElementById('personSelect').value = name;
    showPersonDetail();
}

/**
 * 显示个人详情（汇总视图）
 */
function showPersonDetail() {
    const select = document.getElementById('personSelect');
    const container = document.getElementById('detailContent');
    const name = select.value;

    if (!name) {
        container.innerHTML = '<p class="empty-hint">请选择销售员</p>';
        return;
    }

    const person = salespeople.find(p => p.name === name);
    if (!person) {
        container.innerHTML = '<p class="empty-hint">未找到该销售员数据</p>';
        return;
    }

    let html = '';

    // 综合得分概览
    html += `
        <div class="score-overview">
            <div class="score-card final">
                <div class="label">平均得分</div>
                <div class="value">${person.avgScore}</div>
                <div class="grade">${person.gradeIcon} ${person.grade}</div>
            </div>
            <div class="score-card">
                <div class="label">项目总数</div>
                <div class="value">${person.projectCount}</div>
            </div>
            <div class="score-card">
                <div class="label">最高分</div>
                <div class="value">${person.highestProject.finalScore}</div>
                <div class="grade" style="font-size: 0.8rem">${person.highestProject.project.substring(0, 10)}...</div>
            </div>
            <div class="score-card">
                <div class="label">最低分</div>
                <div class="value">${person.lowestProject.finalScore}</div>
                <div class="grade" style="font-size: 0.8rem">${person.lowestProject.project.substring(0, 10)}...</div>
            </div>
        </div>
    `;

    // 平均得分明细
    html += `
        <div class="detail-section">
            <h3>平均得分明细（基于${person.projectCount}个项目）</h3>
            <div class="base-score-grid">
                <div class="base-score-item">
                    <div class="item-label">平均子活动得分</div>
                    <div class="item-value">${person.avgSubActivity}</div>
                    <div class="item-max">满分 40 分</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">平均进攻计划得分</div>
                    <div class="item-value">${person.avgAttackPlan}</div>
                    <div class="item-max">满分 30 分</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">平均影响效果得分</div>
                    <div class="item-value">${person.avgImpact}</div>
                    <div class="item-max">满分 20 分</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">平均流程合规得分</div>
                    <div class="item-value">${person.avgCompliance}</div>
                    <div class="item-max">满分 10 分</div>
                </div>
            </div>
        </div>
    `;

    // 项目列表
    html += `
        <div class="detail-section">
            <h3>项目明细列表</h3>
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>项目名称</th>
                        <th>金额(万)</th>
                        <th>当前阶段</th>
                        <th>推进情况</th>
                        <th>基础分</th>
                        <th>最终得分</th>
                        <th>等级</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // 按得分降序显示项目
    const sortedProjects = [...person.projects].sort((a, b) => b.finalScore - a.finalScore);
    sortedProjects.forEach((project, index) => {
        const isHighest = index === 0;
        const isLowest = index === sortedProjects.length - 1 && sortedProjects.length > 1;
        const rowClass = isHighest ? 'highest-row' : (isLowest ? 'lowest-row' : '');

        html += `
            <tr class="${rowClass}" onclick="showProjectDetail('${person.name}', ${index})" style="cursor: pointer">
                <td>
                    ${isHighest ? '🔥 ' : ''}${isLowest ? '⚠️ ' : ''}
                    ${project.project}
                </td>
                <td>${project.amount}</td>
                <td>${project.currentStage}</td>
                <td>${project.startStage} → ${project.endStage}</td>
                <td>${project.baseScore}</td>
                <td class="score">${project.finalScore}</td>
                <td class="grade" style="color: ${project.gradeColor}">${project.gradeIcon}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    html += '<p style="color: #666; font-size: 0.9rem; margin-top: 10px;">💡 点击项目行查看详细计算过程</p>';
    html += '</div>';

    container.innerHTML = html;
}

/**
 * 显示单个项目详情（弹窗或展开）
 */
function showProjectDetail(personName, projectIndex) {
    const person = salespeople.find(p => p.name === personName);
    if (!person) return;

    const sortedProjects = [...person.projects].sort((a, b) => b.finalScore - a.finalScore);
    const project = sortedProjects[projectIndex];
    if (!project) return;

    // 创建或获取详情模态框
    let modal = document.getElementById('projectDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'projectDetailModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    let html = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${project.project}</h2>
                <button class="modal-close" onclick="closeProjectModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="score-overview" style="margin-bottom: 20px;">
                    <div class="score-card final">
                        <div class="label">最终得分</div>
                        <div class="value">${project.finalScore}</div>
                        <div class="grade">${project.gradeIcon} ${project.grade}</div>
                    </div>
                    <div class="score-card">
                        <div class="label">基础分</div>
                        <div class="value">${project.baseScore}</div>
                    </div>
                    <div class="score-card">
                        <div class="label">难度系数</div>
                        <div class="value">×${project.difficultyCoef.value}</div>
                    </div>
                    <div class="score-card">
                        <div class="label">停留系数</div>
                        <div class="value">×${project.stayCoef.value}</div>
                    </div>
                    <div class="score-card">
                        <div class="label">推进系数</div>
                        <div class="value">×${project.progressCoef.value}</div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>基础分明细</h3>
                    <div class="base-score-grid">
                        <div class="base-score-item">
                            <div class="item-label">子活动得分</div>
                            <div class="item-value">${project.subActivityScore}</div>
                            <div class="item-max">满分 40 分</div>
                        </div>
                        <div class="base-score-item">
                            <div class="item-label">进攻计划得分</div>
                            <div class="item-value">${project.attackPlan}</div>
                            <div class="item-max">满分 30 分</div>
                        </div>
                        <div class="base-score-item">
                            <div class="item-label">影响效果得分</div>
                            <div class="item-value">${project.impactScore}</div>
                            <div class="item-max">推进${project.progressStages}阶段</div>
                        </div>
                        <div class="base-score-item">
                            <div class="item-label">流程合规得分</div>
                            <div class="item-value">${project.complianceScore}</div>
                            <div class="item-max">完成${project.completedTasks}/16任务</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>系数说明</h3>
                    <div class="coefficients-grid">
                        <div class="coefficient-item">
                            <div class="coef-header">
                                <span class="coef-name">难度系数</span>
                                <span class="coef-value">×${project.difficultyCoef.value}</span>
                            </div>
                            <div class="coef-reason">${project.difficultyCoef.reason}</div>
                        </div>
                        <div class="coefficient-item">
                            <div class="coef-header">
                                <span class="coef-name">停留系数</span>
                                <span class="coef-value">×${project.stayCoef.value}</span>
                            </div>
                            <div class="coef-reason">${project.stayCoef.reason}</div>
                        </div>
                        <div class="coefficient-item">
                            <div class="coef-header">
                                <span class="coef-name">推进系数</span>
                                <span class="coef-value">×${project.progressCoef.value}</span>
                            </div>
                            <div class="coef-reason">${project.progressCoef.reason}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>计算过程</h3>
                    <div class="calculation-process">
                        <div class="step">
                            <strong>基础分：</strong> ${project.subActivityScore} + ${project.attackPlan} + ${project.impactScore} + ${project.complianceScore} = <strong>${project.baseScore}分</strong>
                        </div>
                        <div class="step final-step">
                            <strong>最终得分：</strong> ${project.baseScore} × ${project.difficultyCoef.value} × ${project.stayCoef.value} × ${project.progressCoef.value} = <strong>${project.finalScore}分</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = html;
    modal.style.display = 'flex';
}

/**
 * 关闭项目详情模态框
 */
function closeProjectModal() {
    const modal = document.getElementById('projectDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== Excel导出 ====================

/**
 * 导出Excel（包含汇总表和明细表）
 */
function exportToExcel() {
    if (salespeople.length === 0) {
        alert('没有数据可导出，请先导入数据');
        return;
    }

    const wb = XLSX.utils.book_new();

    // ========== Sheet1: 销售员汇总表 ==========
    const summaryData = [];
    summaryData.push([
        '排名', '姓名', '项目数', '平均分', '等级',
        '平均子活动', '平均进攻计划', '平均影响效果', '平均流程合规', '平均基础分',
        '最高分项目', '最高分', '最低分项目', '最低分'
    ]);

    salespeople.forEach(person => {
        summaryData.push([
            person.rank,
            person.name,
            person.projectCount,
            person.avgScore,
            person.grade,
            person.avgSubActivity,
            person.avgAttackPlan,
            person.avgImpact,
            person.avgCompliance,
            person.avgBaseScore,
            person.highestProject.project,
            person.highestProject.finalScore,
            person.lowestProject.project,
            person.lowestProject.finalScore
        ]);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [
        { wch: 6 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
        { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
        { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, '销售员汇总');

    // ========== Sheet2: 项目明细表 ==========
    const detailData = [];
    detailData.push([
        '销售员', '项目名称', '项目金额(万)', '当前阶段', '推进情况',
        '子活动得分', '进攻计划', '影响效果', '流程合规', '基础分',
        '难度系数', '停留系数', '推进系数',
        '最终得分', '等级'
    ]);

    salespeople.forEach(person => {
        person.projects.forEach(project => {
            detailData.push([
                person.name,
                project.project,
                project.amount,
                project.currentStage,
                `${project.startStage}→${project.endStage}`,
                project.subActivityScore,
                project.attackPlan,
                project.impactScore,
                project.complianceScore,
                project.baseScore,
                project.difficultyCoef.value,
                project.stayCoef.value,
                project.progressCoef.value,
                project.finalScore,
                project.grade
            ]);
        });
    });

    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    ws2['!cols'] = [
        { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 14 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, '项目明细');

    // 生成文件名并下载
    const now = new Date();
    const fileName = `销售考核结果_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * 下载导入模板
 */
function downloadTemplate() {
    const templateData = [];

    // 标题行
    const headers = [
        '销售员姓名', '项目名称', '当前阶段', '项目金额(万元)', '进入当前阶段日期',
        '本月初阶段', '本月末阶段'
    ];

    // 添加16个任务列
    TASKS.forEach(task => {
        headers.push(`${task.id} ${task.name}`);
    });

    headers.push('进攻计划得分');
    templateData.push(headers);

    // 示例数据行
    const exampleRow = [
        '张三', 'XX公司采购项目', '深入', 500, '2024-11-25',
        '接触', '深入',
        '100%', '100%', '50%', '100%', '100%', '100%', '50%', '100%',
        '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%',
        28
    ];
    templateData.push(exampleRow);

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    const colWidths = [
        { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 18 },
        { wch: 12 }, { wch: 12 }
    ];
    TASKS.forEach(() => colWidths.push({ wch: 25 }));
    colWidths.push({ wch: 14 });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, '导入模板');
    XLSX.writeFile(wb, '销售考核导入模板.xlsx');
}

/**
 * 加载测试数据
 */
function loadTestData() {
    salesData = JSON.parse(JSON.stringify(TEST_DATA)); // 深拷贝

    // 计算并分组
    const result = SalesCalculator.calculateAll(salesData);
    salespeople = result.salespeople;
    projectResults = result.projectResults;

    const personCount = salespeople.length;
    const projectCount = salesData.length;

    showStatus('success', `已加载 ${projectCount} 个项目，共 ${personCount} 名销售员！点击"排行榜"查看结果。`);

    updateRanking();
    updatePersonSelect();
}
