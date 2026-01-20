/**
 * 北方努派项目规划表智能填写系统 - AI服务模块
 * 集成 DeepSeek API 提供智能辅助功能
 */

const AIService = {
  // API配置
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',

  // 获取API Key
  getApiKey() {
    const settings = StorageManager.getSettings();
    return settings.apiKey || '';
  },

  // 检查API是否可用
  isAvailable() {
    return !!this.getApiKey();
  },

  // 调用DeepSeek API
  async callAPI(messages, options = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: '请先在设置中配置DeepSeek API Key' };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || ''
      };
    } catch (error) {
      console.error('AI API调用失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 存货名称智能匹配
  async matchInventoryName(userInput) {
    const inventoryList = INVENTORY_DATA.map(item => item.name).join('、');

    const messages = [
      {
        role: 'system',
        content: `你是一个服装行业的专业助手。用户会输入一些口语化的服装描述，你需要将其匹配到标准的存货名称。

可选的标准存货名称列表：
${inventoryList}

请根据用户输入，返回JSON格式的匹配结果：
{
  "matchedName": "匹配到的标准存货名称",
  "confidence": "高/中/低",
  "suggestedConfiguration": "建议的配置，如：1衣1裤",
  "reason": "匹配原因说明"
}

如果无法匹配，matchedName返回空字符串。`
      },
      {
        role: 'user',
        content: userInput
      }
    ];

    const result = await this.callAPI(messages);
    if (!result.success) {
      return result;
    }

    try {
      // 尝试解析JSON
      const content = result.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (e) {
      return { success: true, data: { matchedName: '', reason: result.content } };
    }
  },

  // 工艺要求智能补全
  async suggestCraftRequirements(inventoryName, customerLevel, fabricBrand) {
    const craftOptions = getCraftOptions(inventoryName);
    if (!craftOptions) {
      return { success: false, error: '该存货类型暂无工艺选项' };
    }

    const optionsText = Object.entries(craftOptions).map(([type, options]) => {
      return `${type}工艺：${JSON.stringify(options)}`;
    }).join('\n');

    const messages = [
      {
        role: 'system',
        content: `你是一个职业装定制行业的工艺专家。根据存货类型、客户档次和面料品牌，推荐合适的工艺配置。

存货名称：${inventoryName}
可选工艺：
${optionsText}

请返回JSON格式的推荐结果：
{
  "recommendations": {
    "工艺类型_选项名": "推荐值"
  },
  "craftText": "工艺要求文本描述",
  "reason": "推荐理由"
}

注意：
1. 高档客户（如央企、金融机构）推荐高端工艺（全麻衬、宾霸里布、牛角扣等）
2. 普通客户可以选择性价比高的工艺组合
3. 进口面料（杰尼亚、VBC等）配高端工艺`
      },
      {
        role: 'user',
        content: `客户档次：${customerLevel || '未知'}，面料品牌：${fabricBrand || '未知'}`
      }
    ];

    const result = await this.callAPI(messages);
    if (!result.success) {
      return result;
    }

    try {
      const content = result.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (e) {
      return { success: true, data: { craftText: result.content } };
    }
  },

  // 表格完整性检查
  async checkProjectCompleteness(project) {
    const projectSummary = this.formatProjectForAI(project);

    const messages = [
      {
        role: 'system',
        content: `你是一个职业装项目规划表的审核专家。请检查项目规划表的完整性和合理性。

检查要点：
1. 必填字段是否完整
2. 数据是否合理（如人数与配置是否匹配）
3. 工艺要求是否完整
4. 交期是否合理
5. 面料信息是否完整

请返回JSON格式的检查结果：
{
  "isComplete": true/false,
  "score": 0-100,
  "issues": [
    {"field": "字段名", "type": "缺失/不合理/建议", "message": "问题描述"}
  ],
  "suggestions": ["改进建议1", "改进建议2"]
}`
      },
      {
        role: 'user',
        content: projectSummary
      }
    ];

    const result = await this.callAPI(messages, { maxTokens: 2000 });
    if (!result.success) {
      return result;
    }

    try {
      const content = result.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (e) {
      return { success: true, data: { suggestions: [result.content] } };
    }
  },

  // 格式化项目数据供AI分析
  formatProjectForAI(project) {
    const info = project.basicInfo || {};
    const details = project.details || [];
    const timeline = project.timeline || {};

    let text = `【项目基本信息】
客户名称：${info.customerName || '未填'}
合同号：${info.contractNo || '未填'}
签订主体：${info.signingEntity || '未填'}
项目金额：${info.projectAmount || '未填'} 元
制装人数：${info.totalPeople || '未填'} 人
项目交期：${info.deliveryDate || '未填'}
销售人员：${info.salesPerson || '未填'}
生产人员：${info.productionPerson || '未填'}

【制作明细】共${details.length}条：
`;

    details.forEach((d, i) => {
      text += `
${i + 1}. ${d.inventoryName || '未选'}
   - 档次：${d.level || '未填'}
   - 配置：${d.configuration || '未填'}
   - 人数：${d.quantity || '未填'}
   - 面料：${d.fabricBrand || '未填'} ${d.fabricNo || ''} ${d.fabricColor || ''}
   - 面料成分：${d.fabricComposition || '未填'}
   - 工艺要求：${d.craftRequirements || '未填'}
   - 制作工厂：${d.factory || '未填'}
`;
    });

    text += `
【执行规划时间】
面辅料申请日期：${timeline.fabricApplyDate || '未填'}
面辅料入库日期：${timeline.fabricArriveDate || '未填'}
量体完成日期：${timeline.measureCompleteDate || '未填'}
生产下单日期：${timeline.productionOrderDate || '未填'}
生产入库日期：${timeline.productionCompleteDate || '未填'}
交货完成日期：${timeline.deliveryCompleteDate || '未填'}
`;

    return text;
  },

  // 智能配置建议
  async suggestConfiguration(inventoryName) {
    const messages = [
      {
        role: 'system',
        content: `你是一个职业装配置专家。根据存货名称，给出常见的配置建议。

请返回JSON格式：
{
  "suggestions": [
    {"config": "配置描述", "description": "适用场景"}
  ]
}`
      },
      {
        role: 'user',
        content: `存货名称：${inventoryName}`
      }
    ];

    const result = await this.callAPI(messages, { maxTokens: 500 });
    if (!result.success) {
      return result;
    }

    try {
      const content = result.content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (e) {
      return { success: false, error: '解析配置建议失败' };
    }
  }
};

// 导出给其他模块使用
window.AIService = AIService;
