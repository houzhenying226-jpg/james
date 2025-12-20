/**
 * 销售考核系统 - AI验证器
 * 使用Gemini API进行内容质量验证
 */

const AIValidator = {
    // API配置
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    STORAGE_KEY: 'gemini_api_key',

    /**
     * 获取API Key
     */
    getApiKey() {
        return localStorage.getItem(this.STORAGE_KEY) || '';
    },

    /**
     * 保存API Key
     */
    setApiKey(key) {
        localStorage.setItem(this.STORAGE_KEY, key);
    },

    /**
     * 检查API是否可用
     */
    isEnabled() {
        const key = this.getApiKey();
        return key && key.length > 10;
    },

    /**
     * 测试API连接
     */
    async testConnection() {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, message: 'API Key未设置' };
        }

        try {
            const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: '请回复"连接成功"' }]
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    message: `API错误: ${error.error?.message || response.statusText}`
                };
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                success: true,
                message: `连接成功！API响应: ${text.substring(0, 50)}`
            };
        } catch (error) {
            return {
                success: false,
                message: `网络错误: ${error.message}`
            };
        }
    },

    /**
     * 执行AI验证
     * @param {string} prompt - 验证提示词
     * @param {object} fields - 表单数据
     * @param {string[]} targetFields - 需要验证的字段名
     * @returns {Promise<{passed: boolean, message: string, confidence: number, suggestions: string[]}>}
     */
    async validate(prompt, fields, targetFields) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API Key未设置');
        }

        // 构建验证内容
        const fieldContents = targetFields
            .map(key => `${key}: ${fields[key] || '(空)'}`)
            .join('\n');

        const fullPrompt = `你是一个销售项目评审专家，请根据以下要求评估内容质量。

评估要求：
${prompt}

待评估内容：
${fieldContents}

请严格按照以下JSON格式回复（不要包含其他内容）：
{
    "passed": true或false,
    "confidence": 0-100的置信度分数,
    "message": "一句话评估结论",
    "suggestions": ["改进建议1", "改进建议2"]
}`;

        try {
            const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API请求失败');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // 解析JSON响应
            return this.parseResponse(text);
        } catch (error) {
            throw new Error(`AI验证失败: ${error.message}`);
        }
    },

    /**
     * 解析AI响应
     */
    parseResponse(text) {
        try {
            // 尝试提取JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    passed: !!result.passed,
                    confidence: Math.min(100, Math.max(0, result.confidence || 50)),
                    message: result.message || '评估完成',
                    suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
                };
            }
        } catch (e) {
            // JSON解析失败，尝试从文本推断
        }

        // 回退：从文本推断结果
        const lowerText = text.toLowerCase();
        const passed = lowerText.includes('通过') || lowerText.includes('合格') ||
                       lowerText.includes('pass') || lowerText.includes('good');

        return {
            passed,
            confidence: 50,
            message: text.substring(0, 100),
            suggestions: []
        };
    },

    /**
     * 批量验证多个规则
     */
    async validateBatch(rules, fields) {
        const results = [];

        for (const rule of rules) {
            try {
                const result = await this.validate(rule.prompt, fields, rule.targetFields);
                results.push({
                    id: rule.id,
                    label: rule.label,
                    ...result
                });
            } catch (error) {
                results.push({
                    id: rule.id,
                    label: rule.label,
                    passed: true,
                    confidence: 0,
                    message: `验证跳过: ${error.message}`,
                    suggestions: []
                });
            }

            // 添加延迟避免API限流
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return results;
    }
};

// 导出
window.AIValidator = AIValidator;
