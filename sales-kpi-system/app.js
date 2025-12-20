/**
 * 销售考核系统 - 主应用
 * 北京北方努派服装公司
 */

// 全局数据存储
let salesData = [];
let calculatedResults = [];

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

    // 计算所有人的得分
    calculatedResults = SalesCalculator.calculateAll(salesData);

    showStatus('success', `成功导入 ${salesData.length} 条数据！点击"排行榜"查看结果。`);

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
 * 更新排行榜显示
 */
function updateRanking() {
    const container = document.getElementById('rankingContent');

    if (calculatedResults.length === 0) {
        container.innerHTML = '<p class="empty-hint">请先导入数据</p>';
        return;
    }

    let html = `
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>姓名</th>
                    <th>项目</th>
                    <th>总分</th>
                    <th>等级</th>
                </tr>
            </thead>
            <tbody>
    `;

    calculatedResults.forEach(result => {
        const rankClass = result.rank <= 3 ? `rank-${result.rank}` : '';
        html += `
            <tr>
                <td class="rank ${rankClass}">${getRankIcon(result.rank)}</td>
                <td class="name-cell" onclick="showPersonDetailByName('${result.name}')">${result.name}</td>
                <td>${result.project}</td>
                <td class="score">${result.finalScore}</td>
                <td class="grade" style="color: ${result.gradeColor}">${result.gradeIcon} ${result.grade}</td>
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

    calculatedResults.forEach(result => {
        const option = document.createElement('option');
        option.value = result.name;
        option.textContent = `${result.name} - ${result.finalScore}分`;
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
 * 显示个人详情
 */
function showPersonDetail() {
    const select = document.getElementById('personSelect');
    const container = document.getElementById('detailContent');
    const name = select.value;

    if (!name) {
        container.innerHTML = '<p class="empty-hint">请选择销售员</p>';
        return;
    }

    const result = calculatedResults.find(r => r.name === name);
    if (!result) {
        container.innerHTML = '<p class="empty-hint">未找到该销售员数据</p>';
        return;
    }

    let html = '';

    // 得分概览
    html += `
        <div class="score-overview">
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
                <div class="label">停留系数</div>
                <div class="value">×${result.stayCoef.value}</div>
            </div>
            <div class="score-card">
                <div class="label">推进系数</div>
                <div class="value">×${result.progressCoef.value}</div>
            </div>
        </div>
    `;

    // 基础分明细
    html += `
        <div class="detail-section">
            <h3>基础分明细（满分100分）</h3>
            <div class="base-score-grid">
                <div class="base-score-item">
                    <div class="item-label">子活动得分</div>
                    <div class="item-value">${result.subActivityScore}</div>
                    <div class="item-max">满分 40 分</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">进攻计划得分</div>
                    <div class="item-value">${result.attackPlan}</div>
                    <div class="item-max">满分 30 分</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">影响效果得分</div>
                    <div class="item-value">${result.impactScore}</div>
                    <div class="item-max">满分 20 分（推进${result.progressStages}阶段）</div>
                </div>
                <div class="base-score-item">
                    <div class="item-label">流程合规得分</div>
                    <div class="item-value">${result.complianceScore}</div>
                    <div class="item-max">满分 10 分（完成${result.completedTasks}/16任务）</div>
                </div>
            </div>
        </div>
    `;

    // 系数分析
    html += `
        <div class="detail-section">
            <h3>系数影响分析</h3>
            <div class="coefficients-grid">
                <div class="coefficient-item">
                    <div class="coef-header">
                        <span class="coef-name">难度系数</span>
                        <span class="coef-value">×${result.difficultyCoef.value}</span>
                    </div>
                    <div class="coef-reason">${result.difficultyCoef.reason}</div>
                </div>
                <div class="coefficient-item">
                    <div class="coef-header">
                        <span class="coef-name">停留系数</span>
                        <span class="coef-value">×${result.stayCoef.value}</span>
                    </div>
                    <div class="coef-reason">${result.stayCoef.reason}</div>
                </div>
                <div class="coefficient-item">
                    <div class="coef-header">
                        <span class="coef-name">推进系数</span>
                        <span class="coef-value">×${result.progressCoef.value}</span>
                    </div>
                    <div class="coef-reason">${result.progressCoef.reason}</div>
                </div>
            </div>
        </div>
    `;

    // 任务完成情况
    html += `
        <div class="detail-section">
            <h3>16项任务完成情况</h3>
            <table class="tasks-table">
                <thead>
                    <tr>
                        <th>任务编号</th>
                        <th>任务名称</th>
                        <th>阶段</th>
                        <th>权重</th>
                        <th>完成度</th>
                        <th>得分</th>
                    </tr>
                </thead>
                <tbody>
    `;

    result.taskScores.forEach(task => {
        const completionClass = task.completion === 100 ? 'completion-100' :
                               task.completion === 50 ? 'completion-50' : 'completion-0';
        html += `
            <tr>
                <td>${task.id}</td>
                <td>${task.name}</td>
                <td>${task.stage}</td>
                <td>${task.weight}分</td>
                <td class="${completionClass}">${task.completion}%</td>
                <td class="score-cell">${task.score}分</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';

    // 计算过程
    const process = SalesCalculator.getCalculationProcess(result);
    html += `
        <div class="detail-section">
            <h3>得分计算过程</h3>
            <div class="calculation-process">
    `;

    process.forEach((step, index) => {
        const isLast = index === process.length - 1;
        html += `
            <div class="step ${isLast ? 'final-step' : ''}">
                <strong>${step.label}：</strong> ${step.formula} = <strong>${step.value}</strong>
            </div>
        `;
    });

    html += '</div></div>';

    container.innerHTML = html;
}

// ==================== Excel导出 ====================

/**
 * 导出Excel
 */
function exportToExcel() {
    if (calculatedResults.length === 0) {
        alert('没有数据可导出，请先导入数据');
        return;
    }

    // 准备导出数据
    const exportData = [];

    // 标题行
    exportData.push([
        '排名', '姓名', '项目名称', '项目金额(万)', '当前阶段',
        '子活动得分', '进攻计划得分', '影响效果得分', '流程合规得分', '基础分',
        '难度系数', '停留系数', '推进系数',
        '最终得分', '等级'
    ]);

    // 数据行
    calculatedResults.forEach(result => {
        exportData.push([
            result.rank,
            result.name,
            result.project,
            result.amount,
            result.currentStage,
            result.subActivityScore,
            result.attackPlan,
            result.impactScore,
            result.complianceScore,
            result.baseScore,
            result.difficultyCoef.value,
            result.stayCoef.value,
            result.progressCoef.value,
            result.finalScore,
            result.grade
        ]);
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_array ? XLSX.utils.aoa_to_sheet(exportData) : XLSX.utils.aoa_to_sheet(exportData);

    // 设置列宽
    ws['!cols'] = [
        { wch: 6 },   // 排名
        { wch: 10 },  // 姓名
        { wch: 25 },  // 项目名称
        { wch: 12 },  // 项目金额
        { wch: 10 },  // 当前阶段
        { wch: 12 },  // 子活动得分
        { wch: 12 },  // 进攻计划
        { wch: 12 },  // 影响效果
        { wch: 12 },  // 流程合规
        { wch: 10 },  // 基础分
        { wch: 10 },  // 难度系数
        { wch: 10 },  // 停留系数
        { wch: 10 },  // 推进系数
        { wch: 10 },  // 最终得分
        { wch: 10 }   // 等级
    ];

    XLSX.utils.book_append_sheet(wb, ws, '月度考核结果');

    // 生成文件名
    const now = new Date();
    const fileName = `销售考核结果_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}.xlsx`;

    // 下载
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
    calculatedResults = SalesCalculator.calculateAll(salesData);

    showStatus('success', `已加载 ${salesData.length} 条测试数据！点击"排行榜"查看结果。`);

    updateRanking();
    updatePersonSelect();
}
