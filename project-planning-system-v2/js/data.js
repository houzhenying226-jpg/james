/**
 * 北方努派项目规划表智能填写系统 V2 - 数据模块
 * 包含存货档案、工艺模板、口语映射规则
 */

// ==================== 存货档案 ====================
const INVENTORY_DATA = [
  // 西服类
  { name: "男西服套装", code: "001", type: "西服", category: "成采", highCode: "201" },
  { name: "男西服套装（1衣2裤）", code: "289", type: "西服", category: "成采", highCode: "289" },
  { name: "男西服上衣", code: "003", type: "西服", category: "成采", highCode: "203" },
  { name: "女西服套装", code: "002", type: "西服", category: "成采", highCode: "202" },
  { name: "女西服套装（1衣1裤1裙）", code: "290", type: "西服", category: "成采", highCode: "290" },
  { name: "女西服上衣", code: "004", type: "西服", category: "成采", highCode: "204" },

  // 西裤/西裙
  { name: "男西裤", code: "005", type: "西裤", category: "成采", highCode: "205" },
  { name: "女西裤", code: "006", type: "西裤", category: "成采", highCode: "206" },
  { name: "女西裙", code: "007", type: "西裙", category: "成采", highCode: "207" },

  // 衬衣类
  { name: "男长袖衬衣", code: "008", type: "衬衣", category: "成采", highCode: "208" },
  { name: "男短袖衬衣", code: "009", type: "衬衣", category: "成采", highCode: "209" },
  { name: "女长袖衬衣", code: "010", type: "衬衣", category: "成采", highCode: "210" },
  { name: "女短袖衬衣", code: "011", type: "衬衣", category: "成采", highCode: "211" },

  // 大衣类
  { name: "男大衣", code: "021", type: "大衣", category: "成采", highCode: "221" },
  { name: "女大衣", code: "022", type: "大衣", category: "成采", highCode: "222" },

  // 马甲类
  { name: "男马甲", code: "012", type: "马甲", category: "成采", highCode: "212" },
  { name: "女马甲", code: "013", type: "马甲", category: "成采", highCode: "213" },

  // 夹克类
  { name: "男夹克上衣", code: "031", type: "夹克", category: "成采", highCode: "231" },
  { name: "女夹克上衣", code: "032", type: "夹克", category: "成采", highCode: "232" },
  { name: "春秋夹克套装", code: "033", type: "夹克", category: "成采", highCode: "233" },
  { name: "夏季夹克套装", code: "034", type: "夹克", category: "成采", highCode: "234" },

  // T恤类
  { name: "男长袖T恤", code: "041", type: "T恤", category: "成采", highCode: "241" },
  { name: "男短袖T恤", code: "042", type: "T恤", category: "成采", highCode: "242" },
  { name: "女长袖T恤", code: "043", type: "T恤", category: "成采", highCode: "243" },
  { name: "女短袖T恤", code: "044", type: "T恤", category: "成采", highCode: "244" },

  // 针织类
  { name: "男针织开衫", code: "051", type: "针织", category: "成采", highCode: "251" },
  { name: "男针织套头衫", code: "052", type: "针织", category: "成采", highCode: "252" },
  { name: "女针织开衫", code: "053", type: "针织", category: "成采", highCode: "253" },
  { name: "女针织套头衫", code: "054", type: "针织", category: "成采", highCode: "254" },

  // 羊绒类
  { name: "男羊绒大衣", code: "061", type: "羊绒", category: "成采", highCode: "261" },
  { name: "女羊绒大衣", code: "062", type: "羊绒", category: "成采", highCode: "262" },

  // 棉服/羽绒类
  { name: "男棉服", code: "071", type: "棉服", category: "成采", highCode: "271" },
  { name: "女棉服", code: "072", type: "棉服", category: "成采", highCode: "272" },
  { name: "男羽绒服", code: "073", type: "羽绒", category: "成采", highCode: "273" },
  { name: "女羽绒服", code: "074", type: "羽绒", category: "成采", highCode: "274" },

  // 风衣类
  { name: "男风衣", code: "081", type: "风衣", category: "成采", highCode: "281" },
  { name: "女风衣", code: "082", type: "风衣", category: "成采", highCode: "282" },

  // 连衣裙
  { name: "女连衣裙", code: "091", type: "连衣裙", category: "成采", highCode: "291" },

  // 冲锋衣
  { name: "男冲锋衣", code: "101", type: "冲锋衣", category: "成采", highCode: "301" },
  { name: "女冲锋衣", code: "102", type: "冲锋衣", category: "成采", highCode: "302" },

  // 配饰
  { name: "领带", code: "501", type: "配饰", category: "成采", highCode: "501" },
  { name: "丝巾", code: "502", type: "配饰", category: "成采", highCode: "502" },
  { name: "皮带", code: "503", type: "配饰", category: "成采", highCode: "503" },
  { name: "领结", code: "504", type: "配饰", category: "成采", highCode: "504" },
  { name: "胸针", code: "505", type: "配饰", category: "成采", highCode: "505" }
];

// ==================== 口语转标准名称映射 ====================
const NAME_ALIASES = {
  // 男士西服
  "男西装": "男西服套装",
  "男士西装": "男西服套装",
  "男士西服": "男西服套装",
  "男正装": "男西服套装",
  "男套装": "男西服套装",
  "男西服两件套": "男西服套装",
  "男士西服两件套": "男西服套装",
  "男西装两件套": "男西服套装",
  "男西服三件套": "男西服套装", // 配置会单独处理
  "男西装三件套": "男西服套装",

  // 女士西服
  "女西装": "女西服套装",
  "女士西装": "女西服套装",
  "女士西服": "女西服套装",
  "女正装": "女西服套装",
  "女套装": "女西服套装",
  "女职业装": "女西服套装",

  // 衬衫
  "男衬衫": "男长袖衬衣",
  "男士衬衫": "男长袖衬衣",
  "男长袖衬衫": "男长袖衬衣",
  "男衬衣": "男长袖衬衣",
  "男短袖衬衫": "男短袖衬衣",
  "女衬衫": "女长袖衬衣",
  "女士衬衫": "女长袖衬衣",
  "女长袖衬衫": "女长袖衬衣",
  "女衬衣": "女长袖衬衣",
  "女短袖衬衫": "女短袖衬衣",

  // 大衣
  "男呢大衣": "男大衣",
  "男士大衣": "男大衣",
  "女呢大衣": "女大衣",
  "女士大衣": "女大衣",

  // 裤子/裙子
  "西服裤": "男西裤",
  "西装裤": "男西裤",
  "男裤": "男西裤",
  "女裤": "女西裤",
  "西裙": "女西裙",
  "职业裙": "女西裙",
  "半身裙": "女西裙",

  // 马甲
  "男士马甲": "男马甲",
  "西服马甲": "男马甲",
  "女士马甲": "女马甲",

  // 夹克
  "工装": "春秋夹克套装",
  "工作服": "春秋夹克套装",
  "男夹克": "男夹克上衣",
  "女夹克": "女夹克上衣",

  // T恤
  "男T恤": "男短袖T恤",
  "女T恤": "女短袖T恤",
  "POLO衫": "男短袖T恤",
  "polo衫": "男短袖T恤"
};

// ==================== 面料采购方识别规则 ====================
const PURCHASER_ALIASES = {
  "努派采购": "努派采购",
  "努派买料": "努派采购",
  "我们采购面料": "努派采购",
  "我们买料": "努派采购",
  "甲方采购": "努派采购",
  "客户采购": "努派采购",
  "工厂包料": "工厂包料",
  "希努尔包料": "工厂包料",
  "希努尔自己的料": "工厂包料",
  "希努尔自己的": "工厂包料",
  "工厂面料": "工厂包料",
  "希努尔面料": "工厂包料"
};

// ==================== 面料品牌列表 ====================
const FABRIC_BRANDS = [
  "VBC", "vbc",
  "杰尼亚", "Zegna", "zegna",
  "1881",
  "世家宝", "Scabal",
  "多美", "Dormeuil",
  "切瑞蒂", "Cerruti",
  "鲁比纳奇", "Rubinacci",
  "希努尔职装", "希努尔",
  "南山", "如意", "阳光"
];

// ==================== 面料成分列表 ====================
const FABRIC_COMPOSITIONS = [
  "100%羊毛", "纯羊毛",
  "100%棉", "纯棉",
  "羊毛羊绒", "70%羊毛30%羊绒", "80%羊毛20%羊绒",
  "羊毛真丝", "95%羊毛5%真丝",
  "羊毛涤纶", "70%羊毛30%涤纶", "50%羊毛50%涤纶",
  "涤纶", "100%涤纶"
];

// ==================== 面料颜色列表 ====================
const FABRIC_COLORS = [
  "深灰", "灰色", "浅灰", "中灰", "炭灰",
  "藏青", "藏蓝", "深蓝", "宝蓝", "海军蓝",
  "黑色", "纯黑",
  "深咖", "咖啡色", "棕色",
  "米色", "卡其色", "驼色",
  "白色", "米白", "乳白"
];

// ==================== 工艺模板 ====================
const CRAFT_TEMPLATES = {
  "标准高端": {
    suit: {
      lining: "半麻衬",
      innerFabric: "顺色东丽里布",
      button: "牛角扣",
      lapel: "平驳领",
      lapelWidth: 7.5,
      back: "弹力背",
      slit: "单开叉"
    },
    pants: {
      waist: "防滑腰里",
      pleat: "犀牛褶",
      hem: "裤口防磨条",
      innerFabric: "顺色东丽里布"
    },
    shirt: {
      collar: "标准领",
      collarLining: "有领衬",
      placket: "暗门襟",
      button: "贝壳扣",
      cuff: "单扣袖"
    },
    coat: {
      innerFabric: "顺色宾霸里布",
      button: "牛角扣3粒",
      lapel: "平驳头",
      lapelWidth: 7.5,
      slit: "后开叉"
    },
    skirt: {
      waist: "防滑腰里",
      innerFabric: "顺色东丽里布"
    }
  },
  "经济实惠": {
    suit: {
      lining: "粘合衬",
      innerFabric: "普通里布",
      button: "树脂扣",
      lapel: "平驳领",
      lapelWidth: 7,
      back: "无弹力",
      slit: "单开叉"
    },
    pants: {
      waist: "普通腰里",
      pleat: "无褶",
      hem: "无防磨条",
      innerFabric: "普通里布"
    },
    shirt: {
      collar: "标准领",
      collarLining: "有领衬",
      placket: "明门襟",
      button: "树脂扣",
      cuff: "单扣袖"
    },
    coat: {
      innerFabric: "普通里布",
      button: "树脂扣3粒",
      lapel: "平驳头",
      lapelWidth: 7,
      slit: "后开叉"
    },
    skirt: {
      waist: "普通腰里",
      innerFabric: "普通里布"
    }
  }
};

// ==================== 工艺模板识别规则 ====================
const TEMPLATE_ALIASES = {
  "标准高端": "标准高端",
  "高端工艺": "标准高端",
  "高端": "标准高端",
  "好的工艺": "标准高端",
  "贵的": "标准高端",
  "经济实惠": "经济实惠",
  "普通工艺": "经济实惠",
  "普通": "经济实惠",
  "便宜的": "经济实惠",
  "实惠": "经济实惠"
};

// ==================== 工厂列表 ====================
const FACTORIES = ["希努尔", "其他工厂"];

// ==================== 包装方式列表 ====================
const PACKAGING_OPTIONS = ["希努尔大货包装", "单件独立包装", "简易包装"];

// ==================== 配置解析规则 ====================
const CONFIG_PATTERNS = {
  "三件套": { coats: 1, pants: 1, vests: 1 },
  "3件套": { coats: 1, pants: 1, vests: 1 },
  "两件套": { coats: 1, pants: 1 },
  "2件套": { coats: 1, pants: 1 },
  "1衣2裤": { coats: 1, pants: 2 },
  "一衣两裤": { coats: 1, pants: 2 },
  "1衣1裤1裙": { coats: 1, pants: 1, skirts: 1 },
  "1衣1裤1马甲": { coats: 1, pants: 1, vests: 1 },
  "单上衣": { coats: 1 },
  "只要上衣": { coats: 1 },
  "单裤": { pants: 1 },
  "只要裤子": { pants: 1 }
};

// ==================== 工具函数 ====================

/**
 * 根据口语名称查找标准存货名称
 */
function findInventoryByAlias(alias) {
  // 先检查别名映射
  const standardName = NAME_ALIASES[alias];
  if (standardName) {
    return INVENTORY_DATA.find(item => item.name === standardName);
  }
  // 直接查找标准名称
  return INVENTORY_DATA.find(item => item.name === alias);
}

/**
 * 根据存货名称和采购方获取存货编码
 */
function getInventoryCode(inventoryName, fabricPurchaser) {
  const item = INVENTORY_DATA.find(i => i.name === inventoryName);
  if (!item) return '';

  // 努派采购使用高端编码
  if (fabricPurchaser === '努派采购') {
    return item.highCode || item.code;
  }
  return item.code;
}

/**
 * 根据存货名称获取带"-高"后缀的名称（努派采购时使用）
 */
function getHighEndName(inventoryName) {
  const item = INVENTORY_DATA.find(i => i.name === inventoryName);
  if (!item) return inventoryName;

  // 配饰类不加-高后缀
  if (item.type === '配饰') return inventoryName;

  return inventoryName + '-高';
}

/**
 * 解析面料采购方
 */
function parseFabricPurchaser(text) {
  for (const [alias, standard] of Object.entries(PURCHASER_ALIASES)) {
    if (text.includes(alias)) {
      return standard;
    }
  }
  return null;
}

/**
 * 解析工艺模板
 */
function parseCraftTemplate(text) {
  for (const [alias, standard] of Object.entries(TEMPLATE_ALIASES)) {
    if (text.includes(alias)) {
      return standard;
    }
  }
  return '标准高端'; // 默认使用标准高端
}

/**
 * 获取工艺模板详情
 */
function getCraftTemplateDetails(templateName, category) {
  const template = CRAFT_TEMPLATES[templateName] || CRAFT_TEMPLATES['标准高端'];

  // 根据品类返回对应的工艺
  const categoryMap = {
    '西服': 'suit',
    '西裤': 'pants',
    '西裙': 'skirt',
    '衬衣': 'shirt',
    '大衣': 'coat',
    '羊绒': 'coat'
  };

  const key = categoryMap[category] || 'suit';
  return template[key] || template.suit;
}

/**
 * 格式化工艺描述
 */
function formatCraftDescription(craftDetails, category) {
  if (!craftDetails) return '';

  const parts = [];

  if (category === '西服' || !category) {
    if (craftDetails.lining) parts.push(craftDetails.lining);
    if (craftDetails.innerFabric) parts.push(craftDetails.innerFabric);
    if (craftDetails.button) parts.push(craftDetails.button);
    if (craftDetails.lapel && craftDetails.lapelWidth) {
      parts.push(`${craftDetails.lapel}${craftDetails.lapelWidth}cm`);
    }
    if (craftDetails.back) parts.push(craftDetails.back);
    if (craftDetails.slit) parts.push(craftDetails.slit);
  }

  if (category === '西裤') {
    if (craftDetails.waist) parts.push(craftDetails.waist);
    if (craftDetails.pleat) parts.push(craftDetails.pleat);
    if (craftDetails.hem) parts.push(craftDetails.hem);
  }

  if (category === '大衣' || category === '羊绒') {
    if (craftDetails.innerFabric) parts.push(craftDetails.innerFabric);
    if (craftDetails.button) parts.push(craftDetails.button);
    if (craftDetails.lapel && craftDetails.lapelWidth) {
      parts.push(`${craftDetails.lapel}${craftDetails.lapelWidth}cm`);
    }
    if (craftDetails.slit) parts.push(craftDetails.slit);
  }

  return parts.join('、');
}

/**
 * 解析配置
 */
function parseConfiguration(text) {
  for (const [pattern, config] of Object.entries(CONFIG_PATTERNS)) {
    if (text.includes(pattern)) {
      return config;
    }
  }
  // 默认配置
  return { coats: 1, pants: 1 };
}

/**
 * 格式化配置为字符串
 */
function formatConfiguration(config) {
  const parts = [];
  if (config.coats) parts.push(`${config.coats}衣`);
  if (config.pants) parts.push(`${config.pants}裤`);
  if (config.skirts) parts.push(`${config.skirts}裙`);
  if (config.vests) parts.push(`${config.vests}马甲`);
  return parts.join('') || '1衣1裤';
}

/**
 * 解析日期（支持多种格式）
 */
function parseDate(text) {
  // 提取日期相关的文本
  const patterns = [
    /(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})[日号]?/, // 2026-02-09 或 2026年2月9日
    /(\d{1,2})[-\/月](\d{1,2})[日号]/, // 2月9日 或 2-9
    /(\d{1,2})\.(\d{1,2})/, // 2.9
    /下个?月/, // 下个月
    /(\d+)天后/ // 30天后
  ];

  const now = new Date();
  const currentYear = now.getFullYear();

  // 完整日期格式
  let match = text.match(patterns[0]);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  }

  // 月日格式（默认当年或明年）
  match = text.match(patterns[1]);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    let year = currentYear;
    // 如果月份小于当前月，认为是明年
    if (month < now.getMonth() + 1) {
      year = currentYear + 1;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 点分隔格式
  match = text.match(patterns[2]);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    let year = currentYear;
    if (month < now.getMonth() + 1) {
      year = currentYear + 1;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 下个月
  if (patterns[3].test(text)) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return nextMonth.toISOString().split('T')[0];
  }

  return null;
}

/**
 * 解析金额
 */
function parseAmount(text) {
  // 匹配金额格式
  const patterns = [
    /(\d+(?:\.\d+)?)\s*万/, // 200万
    /(\d+(?:,\d{3})*(?:\.\d+)?)\s*元/, // 2,000,000元
    /(\d+(?:,\d{3})*(?:\.\d+)?)/ // 纯数字
  ];

  let match = text.match(patterns[0]);
  if (match) {
    return parseFloat(match[1]) * 10000;
  }

  match = text.match(patterns[1]);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }

  return null;
}

/**
 * 解析人数
 */
function parsePeopleCount(text) {
  const match = text.match(/(\d+)\s*人/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

// ==================== 导出 ====================
window.INVENTORY_DATA = INVENTORY_DATA;
window.NAME_ALIASES = NAME_ALIASES;
window.PURCHASER_ALIASES = PURCHASER_ALIASES;
window.FABRIC_BRANDS = FABRIC_BRANDS;
window.FABRIC_COMPOSITIONS = FABRIC_COMPOSITIONS;
window.FABRIC_COLORS = FABRIC_COLORS;
window.CRAFT_TEMPLATES = CRAFT_TEMPLATES;
window.TEMPLATE_ALIASES = TEMPLATE_ALIASES;
window.FACTORIES = FACTORIES;
window.PACKAGING_OPTIONS = PACKAGING_OPTIONS;
window.CONFIG_PATTERNS = CONFIG_PATTERNS;

window.findInventoryByAlias = findInventoryByAlias;
window.getInventoryCode = getInventoryCode;
window.getHighEndName = getHighEndName;
window.parseFabricPurchaser = parseFabricPurchaser;
window.parseCraftTemplate = parseCraftTemplate;
window.getCraftTemplateDetails = getCraftTemplateDetails;
window.formatCraftDescription = formatCraftDescription;
window.parseConfiguration = parseConfiguration;
window.formatConfiguration = formatConfiguration;
window.parseDate = parseDate;
window.parseAmount = parseAmount;
window.parsePeopleCount = parsePeopleCount;
