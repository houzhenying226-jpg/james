/**
 * 销售考核系统 - AI全局一致性分析器
 * 分析整个项目的数据一致性、连贯性和真实性
 */

const GlobalAnalyzer = {
    // API配置
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    STORAGE_KEY: 'gemini_api_key',

    /**
     * 获取API密钥
     */
    getApiKey() {
        return localStorage.getItem(this.STORAGE_KEY) || '';
    },

    /**
     * 全局一致性分析
     * @param {Object} projectData - 项目基本信息
     * @param {Object} allTasksData - 所有任务数据
     * @returns {Promise<Object>} 分析结果
     */
    async analyzeProject(projectData, allTasksData) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { error: true, message: '请先配置Gemini API密钥' };
        }

        const prompt = this.buildGlobalPrompt(projectData, allTasksData);
        return await this.callAI(prompt);
    },

    /**
     * 构建全局分析Prompt
     */
    buildGlobalPrompt(projectData, allTasksData) {
        // 格式化任务数据为易读格式
        const formattedTasks = this.formatTasksData(allTasksData);

        return `你是资深销售管理专家，请分析以下销售项目的数据一致性和连贯性。

【项目基本信息】
项目名称：${projectData.name || '未命名项目'}
客户名称：${projectData.customer || '未填写'}
负责销售：${projectData.salesperson || '未填写'}
项目阶段：${projectData.stage || '未知'}

【所有任务数据】
${formattedTasks}

【请进行以下分析】

## 一、金额追踪分析
追踪路径：预算(1.1 A描述) → 方案报价(2.2) → 投标报价(4.1) → 价格区间(4.3) → 最终价格(6.1) → 签约金额(7.1)

请检查：
- 提取每个节点的金额数字
- 计算相邻节点的变化幅度
- 判断变化是否合理（正常商务谈判降幅5-15%）
- 标出异常：如大幅跳涨、前后矛盾

## 二、人物追踪分析
追踪路径：决策人(1.1 N描述) → 决策链(1.2) → 参会人(2.3/4.2) → 谈判对象(6.1)

请检查：
- 决策链中的人物是否在后续任务中出现
- 新出现的人物是否有来源说明
- 人物的职位描述是否前后一致
- 是否有"幽灵人物"（突然出现又消失）

## 三、需求追踪分析
追踪路径：需求描述(1.1 M描述) → 需求调研(2.1) → 方案设计(2.2) → 样品展示(3.2) → 合同签订(7.1)

请检查：
- 需求数量是否一致（500套→500套，不是突变成200套）
- 需求品类是否一致（西服+衬衫 始终是这些，不是突然变成工装）
- 需求是否被完整响应

## 四、时间逻辑分析
检查各任务的时间顺序：
1.x → 2.x → 3.x → 4.x → 5.x → 6.x → 7.x

请检查：
- 是否有时间倒挂（如签约日期早于谈判日期）
- 时间间隔是否合理（如方案讲解和方案深化间隔3个月 → 可疑）

## 五、问题响应链分析
追踪路径：
- 2.3收集的问题 → 3.1的修改是否响应
- 1.3竞争对手的威胁 → 5.1是否有对应风险
- 4.2技术问题 → 后续是否解决

请检查：
- 有没有问题被遗漏未响应
- 响应是否真正解决了问题

## 六、整体叙事连贯性
从头到尾读一遍这个项目的故事：
- 故事是否讲得通？
- 有没有前后矛盾的地方？
- 有没有信息断层（某些关键信息突然消失）？

【请返回JSON格式报告】
{
  "项目概况": {
    "任务完成度": "X/16个任务已填写",
    "数据质量评级": "优/良/中/差",
    "主要问题数": 0
  },

  "一致性检查": [
    {
      "维度": "金额追踪",
      "状态": "一致/有偏差/矛盾",
      "追踪链": "预算80万 → 报价75万 → 投标78万 → 成交72万 → 签约72万",
      "分析": "整体呈下降趋势，降幅10%，属于正常商务谈判范围",
      "异常点": []
    },
    {
      "维度": "人物追踪",
      "状态": "一致/有偏差/矛盾",
      "追踪链": "决策人王部长 → 决策链含王部长/李科长/赵专员 → 参会人李科长 → 谈判对象王部长",
      "分析": "人物关系清晰，决策链覆盖完整",
      "异常点": []
    },
    {
      "维度": "需求追踪",
      "状态": "一致/有偏差/矛盾",
      "追踪链": "500套西服 → 调研500套 → 方案500套 → 签约450套",
      "分析": "签约数量少50套，可能是谈判调整，偏差在合理范围",
      "异常点": []
    },
    {
      "维度": "时间逻辑",
      "状态": "正常/有问题",
      "时间线": "立项1/5 → 调研1/10 → 方案1/15 → 讲解1/20 → 投标2/1 → 谈判2/15 → 签约2/20",
      "异常点": []
    },
    {
      "维度": "问题响应",
      "状态": "完整/有遗漏",
      "分析": "2.3收集5个问题，3.1响应了4个",
      "异常点": []
    }
  ],

  "发现的问题": [
    {
      "严重程度": "高/中/低",
      "问题类型": "金额矛盾/人物异常/需求变化/时间倒挂/问题遗漏",
      "具体描述": "详细说明问题是什么",
      "涉及任务": ["1.1", "6.1"],
      "建议处理": "要求销售说明原因 / 需要补充信息 / 可能是填写错误"
    }
  ],

  "审核建议": {
    "整体结论": "可通过/需复核/建议驳回",
    "重点关注": ["列出主管应该重点审核的几个点"],
    "询问销售": ["列出需要向销售确认的问题"]
  }
}`;
    },

    /**
     * 格式化任务数据为易读格式
     */
    formatTasksData(allTasksData) {
        if (!allTasksData || Object.keys(allTasksData).length === 0) {
            return '暂无任务数据';
        }

        let formatted = '';
        const taskOrder = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '5.1', '6.1', '7.1'];

        for (const code of taskOrder) {
            const task = allTasksData[code];
            if (task && task.fields && Object.keys(task.fields).length > 0) {
                formatted += `\n--- 任务 ${code}: ${task.name || ''} ---\n`;
                for (const [key, value] of Object.entries(task.fields)) {
                    if (value && value !== '未填写') {
                        formatted += `${key}: ${value}\n`;
                    }
                }
            }
        }

        return formatted || '暂无任务数据';
    },

    /**
     * 版本演变分析
     * @param {string} taskCode - 任务编号
     * @param {string} taskName - 任务名称
     * @param {Array} versions - 版本列表
     * @returns {Promise<Object>} 分析结果
     */
    async analyzeVersionChanges(taskCode, taskName, versions) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { error: true, message: '请先配置Gemini API密钥' };
        }

        if (!versions || versions.length < 2) {
            return { error: true, message: '至少需要2个版本才能分析演变' };
        }

        const prompt = `你是销售管理专家，请分析任务"${taskName}"(${taskCode})的版本演变。

【版本历史】
${versions.map((v, i) => `
--- 版本 ${v.version || `V${i + 1}.0`} (${v.date || '未知日期'}) ---
${JSON.stringify(v.fields || v.data, null, 2)}
`).join('\n')}

【请分析】

1. 版本变化追踪
   - 每个版本相比上一版本有什么变化？
   - 变化的性质：补充信息 / 修正错误 / 内容矛盾

2. 关键信息一致性
   - 金额数字是否变化？变化是否合理？
   - 人物信息是否变化？是补充还是修改？
   - 日期时间是否变化？

3. 矛盾检测
   - 有没有前后矛盾的信息？
   - 比如V1说预算80万，V2说预算50万，但没有说明原因

【请返回JSON】
{
  "版本数": ${versions.length},
  "变化分析": [
    {
      "从版本": "V1.0",
      "到版本": "V2.0",
      "变化类型": "补充/修正/矛盾",
      "具体变化": [
        {"字段": "字段名", "原值": "原始值", "新值": "新值", "判断": "合理/需说明"}
      ]
    }
  ],
  "关键信息追踪": {
    "金额": {"一致": true, "说明": "无金额变化"},
    "人物": {"一致": true, "说明": "无人物变化"},
    "日期": {"一致": true, "说明": "无日期变化"}
  },
  "发现的矛盾": [],
  "建议": "最新版本可信 / 需要销售解释版本变化原因"
}`;

        return await this.callAI(prompt);
    },

    /**
     * 调用AI API
     */
    async callAI(prompt) {
        const apiKey = this.getApiKey();

        try {
            const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 3000
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // 解析JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('JSON解析失败:', e);
                    return { error: true, message: '无法解析AI返回的JSON', rawText: text };
                }
            }
            return { error: true, message: '无法解析AI返回', rawText: text };
        } catch (error) {
            console.error('AI分析失败:', error);
            return { error: true, message: error.message };
        }
    },

    /**
     * 渲染全局分析结果
     */
    renderGlobalAnalysisResult(result) {
        if (result.error) {
            return `<div class="global-analysis-error">
                <span class="error-icon">❌</span>
                <span class="error-message">${result.message}</span>
            </div>`;
        }

        const overview = result.项目概况 || {};
        const consistencyChecks = result.一致性检查 || [];
        const foundIssues = result.发现的问题 || [];
        const reviewSuggestion = result.审核建议 || {};

        // 数据质量评级颜色
        const qualityColors = {
            '优': 'green',
            '良': 'blue',
            '中': 'yellow',
            '差': 'red'
        };
        const qualityColor = qualityColors[overview.数据质量评级] || 'gray';

        let html = `
            <div class="global-analysis-report">
                <h3>📊 项目数据一致性分析报告</h3>

                <!-- 概况 -->
                <div class="report-summary">
                    <span class="badge ${qualityColor}">
                        数据质量：${overview.数据质量评级 || '未评估'}
                    </span>
                    <span class="summary-item">📋 任务完成：${overview.任务完成度 || '未知'}</span>
                    <span class="summary-item">⚠️ 发现问题：${overview.主要问题数 || 0}个</span>
                </div>

                <!-- 一致性检查 -->
                <div class="consistency-checks">
                    <h4>🔍 一致性检查</h4>
                    ${consistencyChecks.map(check => {
                        const statusClass = check.状态 === '一致' ? 'pass' :
                            (check.状态 === '矛盾' ? 'fail' : 'warning');
                        const statusIcon = check.状态 === '一致' ? '✅' :
                            (check.状态 === '矛盾' ? '❌' : '⚠️');

                        return `
                            <div class="check-item ${statusClass}">
                                <div class="check-header">
                                    <span class="check-icon">${statusIcon}</span>
                                    <span class="check-title">${check.维度}</span>
                                    <span class="check-status">${check.状态}</span>
                                </div>
                                ${check.追踪链 ? `<div class="check-trace">${check.追踪链}</div>` : ''}
                                ${check.时间线 ? `<div class="check-trace">${check.时间线}</div>` : ''}
                                <div class="check-analysis">${check.分析}</div>
                                ${check.异常点 && check.异常点.length > 0 ? `
                                    <div class="check-issues">
                                        ${check.异常点.map(issue => `<div class="issue-item">⚠️ ${issue}</div>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- 发现的问题 -->
                ${foundIssues.length > 0 ? `
                    <div class="found-issues">
                        <h4>⚠️ 发现的问题</h4>
                        ${foundIssues.map(issue => `
                            <div class="issue-card ${issue.严重程度 || 'low'}">
                                <div class="issue-header">
                                    <span class="issue-severity">${issue.严重程度 || '未知'}</span>
                                    <span class="issue-type">${issue.问题类型 || '未分类'}</span>
                                </div>
                                <div class="issue-desc">${issue.具体描述}</div>
                                <div class="issue-meta">
                                    <span class="issue-tasks">涉及任务：${(issue.涉及任务 || []).join(', ')}</span>
                                </div>
                                <div class="issue-suggest">💡 建议：${issue.建议处理}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-issues">✅ 未发现明显数据一致性问题</div>'}

                <!-- 审核建议 -->
                <div class="review-suggestion">
                    <h4>📋 审核建议</h4>
                    <div class="conclusion ${reviewSuggestion.整体结论 === '可通过' ? 'pass' :
                        (reviewSuggestion.整体结论 === '建议驳回' ? 'fail' : 'review')}">
                        ${reviewSuggestion.整体结论 || '需人工审核'}
                    </div>

                    ${reviewSuggestion.重点关注 && reviewSuggestion.重点关注.length > 0 ? `
                        <div class="focus-points">
                            <strong>🔍 重点关注：</strong>
                            <ul>${reviewSuggestion.重点关注.map(p => `<li>${p}</li>`).join('')}</ul>
                        </div>
                    ` : ''}

                    ${reviewSuggestion.询问销售 && reviewSuggestion.询问销售.length > 0 ? `
                        <div class="questions">
                            <strong>❓ 需向销售确认：</strong>
                            <ul>${reviewSuggestion.询问销售.map(q => `<li>${q}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * 渲染版本分析结果
     */
    renderVersionAnalysisResult(result) {
        if (result.error) {
            return `<div class="version-analysis-error">
                <span class="error-icon">❌</span>
                <span class="error-message">${result.message}</span>
            </div>`;
        }

        const changes = result.变化分析 || [];
        const keyInfo = result.关键信息追踪 || {};
        const contradictions = result.发现的矛盾 || [];

        let html = `
            <div class="version-analysis-report">
                <h4>📝 版本演变分析</h4>
                <p class="version-count">共 ${result.版本数 || '?'} 个版本</p>

                <!-- 变化分析 -->
                ${changes.length > 0 ? `
                    <div class="version-changes">
                        ${changes.map(change => `
                            <div class="change-item ${change.变化类型 === '矛盾' ? 'contradiction' : ''}">
                                <div class="change-header">
                                    ${change.从版本} → ${change.到版本}
                                    <span class="change-type ${change.变化类型}">${change.变化类型}</span>
                                </div>
                                ${change.具体变化 && change.具体变化.length > 0 ? `
                                    <ul class="change-details">
                                        ${change.具体变化.map(c => `
                                            <li>
                                                <strong>${c.字段}:</strong>
                                                "${c.原值}" → "${c.新值}"
                                                <span class="change-judgment">${c.判断}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 关键信息追踪 -->
                <div class="key-info-tracking">
                    <h5>关键信息一致性</h5>
                    <div class="key-info-grid">
                        ${Object.entries(keyInfo).map(([key, val]) => `
                            <div class="key-info-item ${val.一致 ? 'consistent' : 'inconsistent'}">
                                <span class="key-name">${key}</span>
                                <span class="key-status">${val.一致 ? '✅' : '⚠️'}</span>
                                <span class="key-desc">${val.说明}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 矛盾 -->
                ${contradictions.length > 0 ? `
                    <div class="contradictions">
                        <h5>⚠️ 发现的矛盾</h5>
                        ${contradictions.map(c => `
                            <div class="contradiction-item">
                                <span class="contradiction-version">${c.版本}</span>
                                <span class="contradiction-desc">${c.问题}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 建议 -->
                <div class="version-suggestion">
                    <strong>结论：</strong>${result.建议 || '无'}
                </div>
            </div>
        `;

        return html;
    }
};

// 导出
window.GlobalAnalyzer = GlobalAnalyzer;
