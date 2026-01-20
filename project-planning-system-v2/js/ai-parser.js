/**
 * 北方努派项目规划表智能填写系统 V2 - AI解析引擎
 * 调用DeepSeek API解析用户自然语言输入
 */

const AIParser = {
  // API配置
  apiKey: '',
  apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',

  // 初始化
  init() {
    this.apiKey = localStorage.getItem('deepseek_api_key') || '';
  },

  // 设置API Key
  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('deepseek_api_key', key);
  },

  // 获取API Key
  getApiKey() {
    return this.apiKey;
  },

  // 检查是否配置了API Key
  hasApiKey() {
    return !!this.apiKey;
  },

  // 构建解析Prompt
  buildPrompt(userInput) {
    return `你是北方努派服装公司的项目规划表解析助手。

用户会用口语描述一个职业装定制项目的需求，你需要解析并提取以下信息：

## 项目基本信息
- customerName: 客户名称（如果只提到简称，尝试补全公司全称）
- contractNo: 合同号
- projectAmount: 项目金额（转换为数字，单位元）
- totalPeople: 制装人数
- deliveryDate: 项目交期（格式：YYYY-MM-DD）

## 制作明细（details数组）
每条明细包含：
- inventoryName: 存货名称（必须转换为标准名称，如"男西服套装"、"女西服套装"、"男长袖衬衣"等）
- configuration: 配置（如"1衣1裤"、"1衣1裤1马甲"）
- quantity: 人数
- fabricPurchaser: 面料采购方（"努派采购" 或 "工厂包料"）
- fabricBrand: 面料品牌
- fabricComposition: 面料成分
- fabricYarn: 面料纱织（如super130、super150）
- fabricColor: 面料颜色
- craftTemplate: 工艺模板（"标准高端" 或 "经济实惠"，默认"标准高端"）
- factory: 工厂（默认"希努尔"）
- packaging: 包装（默认"希努尔大货包装"）

## 口语转换规则
存货名称转换：
- "男西装"、"男士西服"、"男正装" → "男西服套装"
- "女西装"、"女士西服"、"女职业装" → "女西服套装"
- "男衬衫"、"男衬衣" → "男长袖衬衣"（默认长袖）
- "男短袖衬衫" → "男短袖衬衣"
- "女衬衫" → "女长袖衬衣"
- "男大衣"、"男呢大衣" → "男大衣"
- "西裙"、"职业裙" → "女西裙"
- "工装"、"工作服" → "春秋夹克套装"

面料采购方识别：
- "努派采购"、"努派买料"、"我们采购面料" → "努派采购"
- "工厂包料"、"希努尔自己的料"、"工厂面料" → "工厂包料"

配置识别：
- "三件套" → "1衣1裤1马甲"
- "1衣2裤" → "1衣2裤"
- 默认 → "1衣1裤"

特殊处理：
- "同样面料"、"面料同上" → 复制上一条的面料信息
- "同样工艺"、"工艺同上" → 复制上一条的工艺
- 如果未明确说明，工艺模板默认为"标准高端"
- 如果未明确说明，工厂默认为"希努尔"
- 如果未明确说明，包装默认为"希努尔大货包装"

## 输出格式
请以JSON格式输出，结构如下：
{
  "basicInfo": {
    "customerName": "",
    "contractNo": "",
    "projectAmount": 0,
    "totalPeople": 0,
    "deliveryDate": ""
  },
  "details": [
    {
      "inventoryName": "",
      "configuration": "",
      "quantity": 0,
      "fabricPurchaser": "",
      "fabricBrand": "",
      "fabricComposition": "",
      "fabricYarn": "",
      "fabricColor": "",
      "craftTemplate": "",
      "factory": "",
      "packaging": ""
    }
  ],
  "warnings": ["需要补充的信息提示"],
  "confidence": 0.95
}

注意：
1. 只输出JSON，不要有其他文字
2. 如果某个字段无法从输入中识别，设为空字符串""或0
3. warnings中列出需要用户补充的信息
4. confidence是你对解析结果的置信度(0-1)

## 用户输入
${userInput}`;
  },

  // 调用DeepSeek API
  async callAPI(userInput) {
    if (!this.hasApiKey()) {
      throw new Error('请先配置DeepSeek API Key');
    }

    const prompt = this.buildPrompt(userInput);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的职业装定制项目信息提取助手。请严格按照要求的JSON格式输出，不要添加任何额外的文字说明。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('API返回内容为空');
      }

      // 解析JSON
      return this.parseResponse(content);
    } catch (error) {
      console.error('AI解析错误:', error);
      throw error;
    }
  },

  // 解析API响应
  parseResponse(content) {
    // 尝试提取JSON
    let jsonStr = content;

    // 如果包含markdown代码块，提取其中的JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    try {
      const result = JSON.parse(jsonStr);
      return this.postProcess(result);
    } catch (e) {
      console.error('JSON解析失败:', e, content);
      throw new Error('AI返回格式错误，请重试');
    }
  },

  // 后处理：补充默认值、计算编码等
  postProcess(result) {
    const processed = {
      basicInfo: {
        customerName: result.basicInfo?.customerName || '',
        contractNo: result.basicInfo?.contractNo || '',
        projectAmount: result.basicInfo?.projectAmount || 0,
        totalPeople: result.basicInfo?.totalPeople || 0,
        deliveryDate: result.basicInfo?.deliveryDate || '',
        reportDate: new Date().toISOString().split('T')[0],
        salesDepartment: '',
        salesPerson: '',
        productionPerson: ''
      },
      details: [],
      warnings: result.warnings || [],
      confidence: result.confidence || 0.8
    };

    // 处理每条明细
    if (Array.isArray(result.details)) {
      result.details.forEach((detail, index) => {
        const processedDetail = this.processDetail(detail, index, result.details);
        processed.details.push(processedDetail);
      });
    }

    // 检查并添加警告
    this.addWarnings(processed);

    return processed;
  },

  // 处理单条明细
  processDetail(detail, index, allDetails) {
    // 查找存货信息
    const inventory = findInventoryByAlias(detail.inventoryName) ||
                     INVENTORY_DATA.find(i => i.name === detail.inventoryName);

    // 确定采购方
    let fabricPurchaser = detail.fabricPurchaser || '努派采购';

    // 确定存货名称和编码
    let inventoryName = inventory ? inventory.name : detail.inventoryName;
    let inventoryCode = '';

    if (inventory) {
      if (fabricPurchaser === '努派采购') {
        inventoryName = getHighEndName(inventory.name);
        inventoryCode = inventory.highCode || inventory.code;
      } else {
        inventoryCode = inventory.code;
      }
    }

    // 处理"同上"逻辑
    let fabricBrand = detail.fabricBrand || '';
    let fabricComposition = detail.fabricComposition || '';
    let fabricYarn = detail.fabricYarn || '';
    let fabricColor = detail.fabricColor || '';
    let craftTemplate = detail.craftTemplate || '标准高端';

    if (index > 0 && (detail.sameAsPrevious || detail.fabricBrand === '同上')) {
      const prev = allDetails[index - 1];
      fabricBrand = prev.fabricBrand || fabricBrand;
      fabricComposition = prev.fabricComposition || fabricComposition;
      fabricYarn = prev.fabricYarn || fabricYarn;
      fabricColor = prev.fabricColor || fabricColor;
    }

    // 获取工艺详情
    const category = inventory ? inventory.type : '西服';
    const craftDetails = getCraftTemplateDetails(craftTemplate, category);
    const craftDescription = formatCraftDescription(craftDetails, category);

    return {
      inventoryName,
      inventoryCode,
      category,
      configuration: detail.configuration || '1衣1裤',
      quantity: detail.quantity || 0,
      fabricPurchaser,
      fabricNo: detail.fabricNo || '',
      fabricBrand,
      fabricComposition,
      fabricYarn,
      fabricColor,
      factory: detail.factory || '希努尔',
      packaging: detail.packaging || '希努尔大货包装',
      styleNo: detail.styleNo || '按样衣放版',
      craftTemplate,
      craftDetails,
      craftDescription,
      specialRequirements: detail.specialRequirements || '',
      needSample: detail.needSample || false,
      needFitting: detail.needFitting || false,
      parseStatus: {
        confidence: 0.9,
        missingFields: [],
        warnings: []
      }
    };
  },

  // 添加警告信息
  addWarnings(result) {
    const warnings = result.warnings || [];

    // 检查基本信息
    if (!result.basicInfo.customerName) {
      warnings.push('缺少客户名称');
    }
    if (!result.basicInfo.contractNo) {
      warnings.push('缺少合同号');
    }
    if (!result.basicInfo.projectAmount) {
      warnings.push('缺少项目金额');
    }
    if (!result.basicInfo.deliveryDate) {
      warnings.push('缺少项目交期');
    }

    // 检查明细
    result.details.forEach((detail, index) => {
      const missingFields = [];

      if (!detail.fabricNo) {
        missingFields.push('面料号');
      }
      if (!detail.fabricBrand) {
        missingFields.push('面料品牌');
      }
      if (!detail.fabricColor) {
        missingFields.push('面料颜色');
      }
      if (!detail.quantity) {
        missingFields.push('人数');
      }

      if (missingFields.length > 0) {
        warnings.push(`明细${index + 1}缺少：${missingFields.join('、')}`);
        detail.parseStatus.missingFields = missingFields;
      }

      // 特殊检查
      if (detail.category === '大衣' && !detail.coatLength) {
        warnings.push(`明细${index + 1}：大衣需要指定衣长`);
      }
    });

    result.warnings = [...new Set(warnings)]; // 去重
  },

  // 离线解析（当没有API时的降级方案）
  offlineParse(userInput) {
    const result = {
      basicInfo: {
        customerName: '',
        contractNo: '',
        projectAmount: 0,
        totalPeople: 0,
        deliveryDate: '',
        reportDate: new Date().toISOString().split('T')[0],
        salesDepartment: '',
        salesPerson: '',
        productionPerson: ''
      },
      details: [],
      warnings: ['离线模式：仅做基础解析，建议配置API获得更好体验'],
      confidence: 0.5
    };

    // 简单的正则匹配

    // 解析合同号
    const contractMatch = userInput.match(/[A-Z]{2}\d{2}[-]?\d{3}/i);
    if (contractMatch) {
      result.basicInfo.contractNo = contractMatch[0];
    }

    // 解析金额
    const amount = parseAmount(userInput);
    if (amount) {
      result.basicInfo.projectAmount = amount;
    }

    // 解析总人数
    const totalPeopleMatch = userInput.match(/(\d+)\s*人/);
    if (totalPeopleMatch) {
      result.basicInfo.totalPeople = parseInt(totalPeopleMatch[1]);
    }

    // 解析日期
    const date = parseDate(userInput);
    if (date) {
      result.basicInfo.deliveryDate = date;
    }

    // 解析明细（简单匹配）
    const detailPatterns = [
      /男西[服装]套?装?[^\d]*(\d+)\s*人/g,
      /女西[服装]套?装?[^\d]*(\d+)\s*人/g,
      /男大衣[^\d]*(\d+)\s*人/g,
      /女大衣[^\d]*(\d+)\s*人/g,
      /男衬[衫衣][^\d]*(\d+)\s*人/g,
      /女衬[衫衣][^\d]*(\d+)\s*人/g
    ];

    const nameMap = {
      '男西服': '男西服套装',
      '男西装': '男西服套装',
      '女西服': '女西服套装',
      '女西装': '女西服套装',
      '男大衣': '男大衣',
      '女大衣': '女大衣',
      '男衬衫': '男长袖衬衣',
      '男衬衣': '男长袖衬衣',
      '女衬衫': '女长袖衬衣',
      '女衬衣': '女长袖衬衣'
    };

    // 简单的明细提取 - 按行解析以获取每个明细的采购方
    const lines = userInput.split(/[。\n]/);
    const defaultPurchaser = parseFabricPurchaser(userInput) || '努派采购';

    for (const [key, name] of Object.entries(nameMap)) {
      // 在每一行中查找匹配
      for (const line of lines) {
        const regex = new RegExp(`${key}[^\\d]*(\\d+)\\s*人`);
        const match = regex.exec(line);
        if (match) {
          const inventory = INVENTORY_DATA.find(i => i.name === name);

          // 检测这一行的采购方
          let fabricPurchaser = parseFabricPurchaser(line);
          if (!fabricPurchaser) {
            // 如果这一行没有明确采购方，检查是否有"同样"等词
            if (/同样|同上|一样/.test(line) && result.details.length > 0) {
              fabricPurchaser = result.details[result.details.length - 1].fabricPurchaser;
            } else {
              fabricPurchaser = defaultPurchaser;
            }
          }

          // 根据采购方确定名称和编码
          let finalName = name;
          let code = '';
          if (inventory) {
            if (fabricPurchaser === '努派采购') {
              finalName = name + '-高';
              code = inventory.highCode;
            } else {
              code = inventory.code;
            }
          }

          result.details.push({
            inventoryName: finalName,
            inventoryCode: code,
            category: inventory ? inventory.type : '',
            configuration: '1衣1裤',
            quantity: parseInt(match[1]),
            fabricPurchaser,
            fabricNo: '',
            fabricBrand: '',
            fabricComposition: '',
            fabricYarn: '',
            fabricColor: '',
            factory: '希努尔',
            packaging: '希努尔大货包装',
            styleNo: '按样衣放版',
            craftTemplate: '标准高端',
            craftDetails: getCraftTemplateDetails('标准高端', inventory?.type || '西服'),
            craftDescription: '',
            specialRequirements: '',
            needSample: false,
            needFitting: false,
            parseStatus: {
              confidence: 0.5,
              missingFields: ['面料号', '面料品牌', '面料颜色'],
              warnings: []
            }
          });
          break; // 找到后跳出行循环，避免重复
        }
      }
    }

    this.addWarnings(result);
    return result;
  },

  // 主解析入口
  async parse(userInput) {
    if (!userInput || userInput.trim().length === 0) {
      throw new Error('请输入项目需求描述');
    }

    // 如果有API Key，使用AI解析
    if (this.hasApiKey()) {
      try {
        return await this.callAPI(userInput);
      } catch (error) {
        console.error('AI解析失败，尝试离线解析:', error);
        // 如果API调用失败，降级到离线解析
        const result = this.offlineParse(userInput);
        result.warnings.unshift(`AI解析失败(${error.message})，已使用离线模式`);
        return result;
      }
    } else {
      // 没有API Key，使用离线解析
      return this.offlineParse(userInput);
    }
  }
};

// 初始化
AIParser.init();

// 导出
window.AIParser = AIParser;
