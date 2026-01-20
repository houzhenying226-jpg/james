/**
 * 北方努派项目规划表智能填写系统 - 数据文件
 * 包含存货档案、工艺选项等静态数据
 */

// 存货档案数据（105个标准存货）
const INVENTORY_DATA = [
  // 西服类
  { id: 1, category: "成采", code: "001", name: "男西服套装", type: "西服" },
  { id: 2, category: "成采", code: "289", name: "男西服套装（1衣2裤）", type: "西服" },
  { id: 3, category: "委外", code: "201", name: "男西服套装-高", type: "西服" },
  { id: 4, category: "成采", code: "003", name: "男西服上衣", type: "西服" },
  { id: 5, category: "委外", code: "203", name: "男西服上衣-高", type: "西服" },
  { id: 6, category: "成采", code: "005", name: "男西裤", type: "西裤" },
  { id: 7, category: "委外", code: "205", name: "男西裤-高", type: "西裤" },
  { id: 8, category: "成采", code: "002", name: "女西服套装", type: "西服" },
  { id: 9, category: "成采", code: "290", name: "女西服套装（1衣1裤1裙）", type: "西服" },
  { id: 10, category: "成采", code: "291", name: "女西服套装（1衣2裤）", type: "西服" },
  { id: 11, category: "成采", code: "292", name: "女西服套装（1衣1裙）", type: "西服" },
  { id: 12, category: "成采", code: "293", name: "女西服套装（1衣2裙）", type: "西服" },
  { id: 13, category: "委外", code: "202", name: "女西服套装-高", type: "西服" },
  { id: 14, category: "成采", code: "004", name: "女西服上衣", type: "西服" },
  { id: 15, category: "委外", code: "204", name: "女西服上衣-高", type: "西服" },
  { id: 16, category: "成采", code: "006", name: "女西裤", type: "西裤" },
  { id: 17, category: "委外", code: "206", name: "女西裤-高", type: "西裤" },
  { id: 18, category: "成采", code: "009", name: "女西裙", type: "西裙" },
  { id: 19, category: "委外", code: "209", name: "女西裙-高", type: "西裙" },

  // 衬衫类
  { id: 20, category: "成采", code: "010", name: "男长袖衬衣", type: "衬衫" },
  { id: 21, category: "委外", code: "210", name: "男长袖衬衣-高", type: "衬衫" },
  { id: 22, category: "成采", code: "011", name: "男短袖衬衣", type: "衬衫" },
  { id: 23, category: "委外", code: "211", name: "男短袖衬衣-高", type: "衬衫" },
  { id: 24, category: "成采", code: "012", name: "女长袖衬衣", type: "衬衫" },
  { id: 25, category: "委外", code: "212", name: "女长袖衬衣-高", type: "衬衫" },
  { id: 26, category: "成采", code: "013", name: "女短袖衬衣", type: "衬衫" },
  { id: 27, category: "委外", code: "213", name: "女短袖衬衣-高", type: "衬衫" },
  { id: 28, category: "成采", code: "046", name: "男保暖衬衣", type: "衬衫" },
  { id: 29, category: "委外", code: "237", name: "男保暖衬衣-高", type: "衬衫" },
  { id: 30, category: "成采", code: "047", name: "女保暖衬衣", type: "衬衫" },
  { id: 31, category: "委外", code: "238", name: "女保暖衬衣-高", type: "衬衫" },

  // T恤类
  { id: 32, category: "成采", code: "男长T", name: "男长袖T恤", type: "T恤" },
  { id: 33, category: "成采", code: "男短T", name: "男短袖T恤", type: "T恤" },
  { id: 34, category: "成采", code: "女长T", name: "女长袖T恤", type: "T恤" },
  { id: 35, category: "成采", code: "女短T", name: "女短袖T恤", type: "T恤" },
  { id: 36, category: "委外", code: "男长T-高", name: "男长袖T恤-高", type: "T恤" },
  { id: 37, category: "委外", code: "男短T-高", name: "男短袖T恤-高", type: "T恤" },
  { id: 38, category: "委外", code: "女长T-高", name: "女长袖T恤-高", type: "T恤" },
  { id: 39, category: "委外", code: "女短T-高", name: "女短袖T恤-高", type: "T恤" },

  // 大衣类
  { id: 40, category: "成采", code: "021", name: "男大衣", type: "大衣" },
  { id: 41, category: "委外", code: "221", name: "男大衣-高", type: "大衣" },
  { id: 42, category: "成采", code: "022", name: "女大衣", type: "大衣" },
  { id: 43, category: "委外", code: "222", name: "女大衣-高", type: "大衣" },

  // 夹克类
  { id: 44, category: "成采", code: "019", name: "男夹克上衣", type: "夹克" },
  { id: 45, category: "委外", code: "219", name: "男夹克上衣-高", type: "夹克" },
  { id: 46, category: "成采", code: "020", name: "女夹克上衣", type: "夹克" },
  { id: 47, category: "委外", code: "220", name: "女夹克上衣-高", type: "夹克" },
  { id: 48, category: "成采", code: "064", name: "春秋夹克套装", type: "夹克" },
  { id: 49, category: "委外", code: "258", name: "春秋夹克套装-高", type: "夹克" },
  { id: 50, category: "成采", code: "065", name: "夏季夹克套装", type: "夹克" },
  { id: 51, category: "委外", code: "259", name: "夏季夹克套装-高", type: "夹克" },

  // 马甲类
  { id: 52, category: "成采", code: "015", name: "男马甲", type: "马甲" },
  { id: 53, category: "委外", code: "215", name: "男马甲-高", type: "马甲" },
  { id: 54, category: "成采", code: "016", name: "女马甲", type: "马甲" },
  { id: 55, category: "委外", code: "216", name: "女马甲-高", type: "马甲" },

  // 裤子类
  { id: 56, category: "成采", code: "007", name: "男夏裤", type: "西裤" },
  { id: 57, category: "委外", code: "207", name: "男夏裤-高", type: "西裤" },
  { id: 58, category: "成采", code: "008", name: "女夏裤", type: "西裤" },
  { id: 59, category: "委外", code: "208", name: "女夏裤-高", type: "西裤" },
  { id: 60, category: "成采", code: "023", name: "男休闲裤", type: "西裤" },
  { id: 61, category: "委外", code: "223", name: "男休闲裤-高", type: "西裤" },
  { id: 62, category: "成采", code: "024", name: "女休闲裤", type: "西裤" },
  { id: 63, category: "委外", code: "224", name: "女休闲裤-高", type: "西裤" },

  // 风衣/棉服/羽绒服类
  { id: 64, category: "成采", code: "025", name: "男风衣", type: "风衣" },
  { id: 65, category: "委外", code: "225", name: "男风衣-高", type: "风衣" },
  { id: 66, category: "成采", code: "026", name: "女风衣", type: "风衣" },
  { id: 67, category: "委外", code: "226", name: "女风衣-高", type: "风衣" },
  { id: 68, category: "成采", code: "027", name: "男棉服", type: "棉服" },
  { id: 69, category: "委外", code: "227", name: "男棉服-高", type: "棉服" },
  { id: 70, category: "成采", code: "028", name: "女棉服", type: "棉服" },
  { id: 71, category: "委外", code: "228", name: "女棉服-高", type: "棉服" },
  { id: 72, category: "成采", code: "029", name: "男冲锋衣", type: "冲锋衣" },
  { id: 73, category: "委外", code: "229", name: "男冲锋衣-高", type: "冲锋衣" },
  { id: 74, category: "成采", code: "030", name: "女冲锋衣", type: "冲锋衣" },
  { id: 75, category: "委外", code: "230", name: "女冲锋衣-高", type: "冲锋衣" },
  { id: 76, category: "成采", code: "031", name: "男羽绒服", type: "羽绒服" },
  { id: 77, category: "委外", code: "231", name: "男羽绒服-高", type: "羽绒服" },
  { id: 78, category: "成采", code: "032", name: "女羽绒服", type: "羽绒服" },
  { id: 79, category: "委外", code: "232", name: "女羽绒服-高", type: "羽绒服" },

  // 针织类
  { id: 80, category: "成采", code: "035", name: "男羊绒衫", type: "针织" },
  { id: 81, category: "委外", code: "235", name: "男羊绒衫-高", type: "针织" },
  { id: 82, category: "成采", code: "036", name: "女羊绒衫", type: "针织" },
  { id: 83, category: "委外", code: "214", name: "女羊绒衫-高", type: "针织" },
  { id: 84, category: "成采", code: "300", name: "短袖针织衫", type: "针织" },
  { id: 85, category: "成采", code: "301", name: "长袖针织衫", type: "针织" },

  // 连衣裙类
  { id: 86, category: "成采", code: "057", name: "女装连衣裙", type: "连衣裙" },
  { id: 87, category: "委外", code: "249", name: "女装连衣裙-高", type: "连衣裙" },

  // 配饰类
  { id: 88, category: "配饰", code: "037", name: "丝巾", type: "配饰" },
  { id: 89, category: "配饰", code: "038", name: "围巾", type: "配饰" },
  { id: 90, category: "配饰", code: "039", name: "方巾", type: "配饰" },
  { id: 91, category: "配饰", code: "040", name: "领带", type: "配饰" },
  { id: 92, category: "配饰", code: "领带夹", name: "领带夹", type: "配饰" },
  { id: 93, category: "配饰", code: "041", name: "领结", type: "配饰" },
  { id: 94, category: "配饰", code: "01000", name: "领花", type: "配饰" },
  { id: 95, category: "配饰", code: "033", name: "男皮鞋", type: "配饰" },
  { id: 96, category: "配饰", code: "034", name: "女皮鞋", type: "配饰" },
  { id: 97, category: "配饰", code: "PD/皮带", name: "皮带", type: "配饰" },
  { id: 98, category: "配饰", code: "Pijian-披肩", name: "披肩", type: "配饰" },
  { id: 99, category: "配饰", code: "042", name: "袖扣", type: "配饰" },
  { id: 100, category: "配饰", code: "043", name: "袜子", type: "配饰" },
  { id: 101, category: "配饰", code: "044", name: "胸针", type: "配饰" },
  { id: 102, category: "配饰", code: "SH-司徽", name: "司徽", type: "配饰" },
  { id: 103, category: "配饰", code: "手套", name: "手套", type: "配饰" },
  { id: 104, category: "配饰", code: "丝袜", name: "丝袜", type: "配饰" },
  { id: 105, category: "配饰", code: "头花", name: "头花", type: "配饰" }
];

// 工艺选项数据
const CRAFT_OPTIONS = {
  "西服": {
    "衬型": ["全麻衬", "半麻衬", "粘合衬"],
    "里布": ["东丽里布", "宾霸里布", "顺色里布", "撞色里布"],
    "扣子": ["牛角扣", "树脂扣", "金属扣", "装饰扣"],
    "驳头": ["平驳领", "戗驳领", "青果领"],
    "驳头宽度": { type: "input", unit: "cm" },
    "后背": ["弹力背", "无弹力"],
    "开叉": ["单开叉", "双开叉", "无开叉"]
  },
  "西裤": {
    "腰里": ["防滑腰里", "普通腰里"],
    "褶皱": ["犀牛褶", "无褶", "单褶", "双褶"],
    "裤口": ["裤口防磨条", "无防磨条"],
    "里布": ["顺色里布", "东丽里布"]
  },
  "西裙": {
    "裙型": ["直筒裙", "A字裙", "包臀裙"],
    "裙长": { type: "input", unit: "cm" },
    "开叉": ["后开叉", "侧开叉", "无开叉"],
    "开叉长度": { type: "input", unit: "cm" },
    "里布": ["有里布", "无里布"]
  },
  "衬衫": {
    "领型": ["标准领", "温莎领", "立领", "小方领"],
    "领衬": ["有领衬", "无领衬", "可拆卸领撑"],
    "门襟": ["明门襟", "暗门襟"],
    "扣子": ["贝壳扣", "树脂扣"],
    "扣子颜色": { type: "input", unit: "" },
    "袖口": ["单扣袖", "双扣袖", "法式袖"],
    "口袋": ["有胸袋", "无胸袋"]
  },
  "大衣": {
    "里布": ["宾霸里布", "顺色里布", "撞色里布"],
    "扣子": ["牛角扣", "装饰扣", "暗扣"],
    "扣子数量": { type: "input", unit: "粒" },
    "驳头": ["平驳头", "戗驳头"],
    "驳头宽度": { type: "input", unit: "cm" },
    "衣长": { type: "input", unit: "cm", required: true },
    "开叉": ["后开叉", "无开叉"]
  },
  "马甲": {
    "里布": ["顺色里布", "撞色里布"],
    "扣子": ["与西服同款", "单独选择"],
    "后背": ["调节扣", "松紧带", "无调节"]
  },
  "夹克": {
    "里布": ["网眼里", "平纹里", "夹棉里"],
    "拉链": ["YKK拉链", "普通拉链"],
    "领型": ["立领", "翻领", "连帽"],
    "袖口": ["罗纹袖口", "松紧袖口", "扣袢袖口"],
    "下摆": ["罗纹下摆", "松紧下摆", "直摆"]
  }
};

// 存货名称与工艺类型的映射
const INVENTORY_CRAFT_MAP = {
  // 西服上衣类（包含西服和西裤的工艺）
  "男西服套装": ["西服", "西裤"],
  "男西服套装（1衣2裤）": ["西服", "西裤"],
  "男西服套装-高": ["西服", "西裤"],
  "女西服套装": ["西服", "西裤"],
  "女西服套装（1衣1裤1裙）": ["西服", "西裤", "西裙"],
  "女西服套装（1衣2裤）": ["西服", "西裤"],
  "女西服套装（1衣1裙）": ["西服", "西裙"],
  "女西服套装（1衣2裙）": ["西服", "西裙"],
  "女西服套装-高": ["西服", "西裤"],
  "男西服上衣": ["西服"],
  "男西服上衣-高": ["西服"],
  "女西服上衣": ["西服"],
  "女西服上衣-高": ["西服"],

  // 西裤类
  "男西裤": ["西裤"],
  "男西裤-高": ["西裤"],
  "女西裤": ["西裤"],
  "女西裤-高": ["西裤"],
  "男夏裤": ["西裤"],
  "男夏裤-高": ["西裤"],
  "女夏裤": ["西裤"],
  "女夏裤-高": ["西裤"],
  "男休闲裤": ["西裤"],
  "男休闲裤-高": ["西裤"],
  "女休闲裤": ["西裤"],
  "女休闲裤-高": ["西裤"],

  // 西裙类
  "女西裙": ["西裙"],
  "女西裙-高": ["西裙"],

  // 衬衫类
  "男长袖衬衣": ["衬衫"],
  "男长袖衬衣-高": ["衬衫"],
  "男短袖衬衣": ["衬衫"],
  "男短袖衬衣-高": ["衬衫"],
  "女长袖衬衣": ["衬衫"],
  "女长袖衬衣-高": ["衬衫"],
  "女短袖衬衣": ["衬衫"],
  "女短袖衬衣-高": ["衬衫"],
  "男保暖衬衣": ["衬衫"],
  "男保暖衬衣-高": ["衬衫"],
  "女保暖衬衣": ["衬衫"],
  "女保暖衬衣-高": ["衬衫"],

  // 大衣类
  "男大衣": ["大衣"],
  "男大衣-高": ["大衣"],
  "女大衣": ["大衣"],
  "女大衣-高": ["大衣"],

  // 马甲类
  "男马甲": ["马甲"],
  "男马甲-高": ["马甲"],
  "女马甲": ["马甲"],
  "女马甲-高": ["马甲"],

  // 夹克类
  "男夹克上衣": ["夹克"],
  "男夹克上衣-高": ["夹克"],
  "女夹克上衣": ["夹克"],
  "女夹克上衣-高": ["夹克"],
  "春秋夹克套装": ["夹克"],
  "春秋夹克套装-高": ["夹克"],
  "夏季夹克套装": ["夹克"],
  "夏季夹克套装-高": ["夹克"]
};

// 存货名称口语映射（用于AI智能匹配）
const INVENTORY_ALIASES = {
  // 男士西服相关
  "男士西装": "男西服套装",
  "男西装": "男西服套装",
  "西装套装": "男西服套装",
  "男士西装三件套": "男西服套装",
  "男士西服": "男西服套装",
  "男西服两件套": "男西服套装",
  "男士西服两件套": "男西服套装",
  "男西服三件套": "男西服套装",
  "职业套装": "男西服套装",
  "正装": "男西服套装",
  "男正装": "男西服套装",

  // 女士西服相关
  "女士西装": "女西服套装",
  "女西装": "女西服套装",
  "女士职业装": "女西服套装",
  "女职业装": "女西服套装",
  "女正装": "女西服套装",

  // 衬衫相关
  "男衬衫": "男长袖衬衣",
  "男士衬衫": "男长袖衬衣",
  "男长袖衬衫": "男长袖衬衣",
  "女衬衫": "女长袖衬衣",
  "女士衬衫": "女长袖衬衣",
  "女长袖衬衫": "女长袖衬衣",
  "男短袖衬衫": "男短袖衬衣",
  "女短袖衬衫": "女短袖衬衣",

  // 裤子相关
  "西服裤": "男西裤",
  "西装裤": "男西裤",
  "男裤子": "男西裤",
  "女裤子": "女西裤",
  "男士西裤": "男西裤",
  "女士西裤": "女西裤",

  // 大衣相关
  "呢子大衣": "男大衣",
  "羊绒大衣": "男大衣",
  "男士大衣": "男大衣",
  "女士大衣": "女大衣",

  // 夹克相关
  "工装": "春秋夹克套装",
  "工作服": "春秋夹克套装",
  "男夹克": "男夹克上衣",
  "女夹克": "女夹克上衣",

  // 马甲相关
  "男士马甲": "男马甲",
  "女士马甲": "女马甲",
  "西服马甲": "男马甲",

  // T恤相关
  "男T恤": "男短袖T恤",
  "女T恤": "女短袖T恤",
  "文化衫": "男短袖T恤",
  "POLO衫": "男短袖T恤",

  // 配饰相关
  "领带": "领带",
  "丝巾": "丝巾",
  "皮带": "皮带"
};

// 根据存货名称获取对应的存货编码
function getInventoryCode(inventoryName, fabricPurchaser) {
  // 查找存货项
  const items = INVENTORY_DATA.filter(item => {
    // 移除名称中的 "-高" 后缀进行比较
    const baseName = item.name.replace(/-高$/, '');
    const searchName = inventoryName.replace(/-高$/, '');
    return baseName === searchName;
  });

  if (items.length === 0) return '';

  // 根据面料采购方选择对应的编码
  if (fabricPurchaser === '努派采购') {
    // 委外编码（带"高"）
    const highItem = items.find(item => item.category === '委外');
    return highItem ? highItem.code : items[0].code;
  } else {
    // 成采编码（不带"高"）
    const normalItem = items.find(item => item.category === '成采');
    return normalItem ? normalItem.code : items[0].code;
  }
}

// 根据存货名称获取品类
function getInventoryType(inventoryName) {
  const item = INVENTORY_DATA.find(item => item.name === inventoryName);
  return item ? item.type : '';
}

// 搜索存货名称（支持模糊匹配和别名）
function searchInventory(keyword) {
  if (!keyword) return INVENTORY_DATA;

  const lowerKeyword = keyword.toLowerCase().trim();

  // 首先检查别名映射
  const aliasMatch = INVENTORY_ALIASES[keyword] || INVENTORY_ALIASES[lowerKeyword];
  if (aliasMatch) {
    const exactMatch = INVENTORY_DATA.filter(item => item.name === aliasMatch);
    if (exactMatch.length > 0) {
      return exactMatch;
    }
  }

  // 拆分关键词进行多词匹配
  const keywords = extractKeywords(lowerKeyword);

  // 计算每个存货的匹配得分
  const scoredItems = INVENTORY_DATA.map(item => {
    let score = 0;
    const itemName = item.name.toLowerCase();
    const itemType = item.type.toLowerCase();
    const itemCode = item.code.toLowerCase();

    // 完全包含匹配（最高优先级）
    if (itemName.includes(lowerKeyword)) {
      score += 100;
    }

    // 关键词匹配
    keywords.forEach(kw => {
      if (itemName.includes(kw)) score += 20;
      if (itemType.includes(kw)) score += 15;
      if (itemCode.includes(kw)) score += 10;
    });

    // 特殊词汇匹配
    if (lowerKeyword.includes('男') && itemName.includes('男')) score += 10;
    if (lowerKeyword.includes('女') && itemName.includes('女')) score += 10;
    if (lowerKeyword.includes('套') && itemName.includes('套')) score += 5;
    if (lowerKeyword.includes('高') && itemName.includes('高')) score += 5;

    return { item, score };
  });

  // 过滤有得分的项目并排序
  const results = scoredItems
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);

  return results;
}

// 提取关键词（处理中文和英文）
function extractKeywords(input) {
  const keywords = [];

  // 中文关键词映射
  const keywordMap = {
    '西装': '西服',
    '西服': '西服',
    '衬衣': '衬衣',
    '衬衫': '衬衣',
    '裤子': '裤',
    '裤': '裤',
    '裙': '裙',
    '大衣': '大衣',
    '夹克': '夹克',
    '马甲': '马甲',
    'T恤': 'T恤',
    '针织': '针织',
    '羊绒': '羊绒',
    '棉服': '棉服',
    '羽绒': '羽绒',
    '风衣': '风衣',
    '冲锋衣': '冲锋衣',
    '连衣裙': '连衣裙',
    '套装': '套装',
    '上衣': '上衣',
    '长袖': '长袖',
    '短袖': '短袖',
    '男士': '男',
    '男': '男',
    '女士': '女',
    '女': '女',
    '高端': '高',
    '高级': '高'
  };

  // 遍历映射表查找匹配的关键词
  for (const [key, value] of Object.entries(keywordMap)) {
    if (input.includes(key)) {
      if (!keywords.includes(value)) {
        keywords.push(value);
      }
    }
  }

  // 如果没有匹配到任何关键词，返回原始输入
  if (keywords.length === 0) {
    keywords.push(input);
  }

  return keywords;
}

// 根据存货名称获取工艺选项
function getCraftOptions(inventoryName) {
  const craftTypes = INVENTORY_CRAFT_MAP[inventoryName];
  if (!craftTypes) return null;

  const options = {};
  craftTypes.forEach(type => {
    if (CRAFT_OPTIONS[type]) {
      options[type] = CRAFT_OPTIONS[type];
    }
  });

  return Object.keys(options).length > 0 ? options : null;
}

// 导出给其他模块使用
window.INVENTORY_DATA = INVENTORY_DATA;
window.CRAFT_OPTIONS = CRAFT_OPTIONS;
window.INVENTORY_CRAFT_MAP = INVENTORY_CRAFT_MAP;
window.INVENTORY_ALIASES = INVENTORY_ALIASES;
window.getInventoryCode = getInventoryCode;
window.getInventoryType = getInventoryType;
window.searchInventory = searchInventory;
window.extractKeywords = extractKeywords;
window.getCraftOptions = getCraftOptions;
