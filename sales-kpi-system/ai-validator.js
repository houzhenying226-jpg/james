/**
 * 销售考核系统 - AI验证器
 * 使用Gemini API进行内容质量验证
 *
 * AI验证只做JS做不到的事情：
 * 1. 凑数识别 - 判断内容是否拆分凑数
 * 2. 语义质量 - 判断内容是否言之有物（非空话套话）
 * 3. 逻辑匹配 - 判断相关内容是否逻辑一致
 * 4. 专业合理性 - 判断参数/数据是否在行业合理范围
 * 5. 真实性核验 - 判断公司名/人名是否真实可信
 * 6. 遗漏提示 - 基于上下文判断是否有明显遗漏
 */

// ==================== AI验证Prompt配置 ====================
const AI_PROMPTS = {
    // ==================== 1.1 MAN分析与项目立项 ====================
    '1.1': {
        name: 'MAN分析',
        build: (data, related) => `你是服装行业资深销售总监，请审核MAN分析内容的真实性和质量。

【待审核内容】
M(需求)描述：${data.mDescription || data.M_描述 || data.M_需求描述 || '未填写'}
A(资金)描述：${data.aDescription || data.A_描述 || data.A_资金描述 || '未填写'}
N(决策人)描述：${data.nDescription || data.N_描述 || data.N_决策人描述 || '未填写'}

【AI需要判断的（JS做不到）】

1. 内容实质性判断：
   - M描述是否包含具体需求（产品类型+数量+时间），还是只有"有需求"这类空话？
   - A描述是否包含具体金额或范围，还是只有"资金充足"这类空话？
   - N描述是否包含具体人名+职位，还是只有"已对接决策人"这类空话？

2. 信息可信度：
   - 描述的数量级是否合理？（如：500套西服 vs 50000套西服）
   - 预算与需求是否匹配？（如：500套西服预算5万元 → 单价100元，偏低）
   - 决策人职位与采购金额是否匹配？（如：50万采购，决策人是普通专员 → 可疑）

3. 专业性评估：
   - 是否使用了行业术语？
   - 描述是否像实际销售写的，还是像编造的？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "M需求实质性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "A资金可信度",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "N决策人合理性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 1.2 决策链绘制 ====================
    '1.2': {
        name: '决策链绘制',
        build: (data, related) => `你是服装行业资深销售总监，请审核决策链内容的合理性。

【待审核内容】
关键人列表：${data.keyPersonList || '未填写'}

【AI需要判断的】

1. 人员结构合理性：
   - 是否形成决策链条？（有高层→中层→执行层的层级关系）
   - 还是全是平级？（如3个"专员"，明显凑数）
   - 是否有真正的决策人？（部长级以上）

2. 凑数嫌疑检测：
   - 3个人的描述是否雷同？
   - 是否有编造痕迹？（如：张三、李四、王五这类测试名）

3. 影响力描述质量：
   - 是否说明了具体职责和决策权限？
   - 还是只有"重要""关键"这类形容词？

4. 逻辑一致性：
   - 如果有1.1的决策人描述，是否与1.2名单对应？

【关联数据参考】
1.1决策人描述：${related?.['1.1']?.nDescription || related?.['1.1']?.N_描述 || '无'}

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "层级结构",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "凑数嫌疑",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "描述质量",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 1.3 竞争对手分析 ====================
    '1.3': {
        name: '竞争对手分析',
        build: (data, related) => `你是服装行业资深销售总监，请审核竞争对手分析的真实性和质量。

【待审核内容】
竞争对手列表：${data.competitorList || data.competitorAnalysis || '未填写'}
对手分析：${data.competitorStrengths || ''}
${data.competitorWeaknesses || ''}
应对策略：${data.counterStrategy || data.strategy || '未填写'}

【AI需要判断的】

1. 公司真实性：
   - 公司名是否像真实企业？（如"海澜之家"是真实的，"对手A"是编造的）
   - 如果你知道这个公司，描述是否与事实相符？

2. 分析深度：
   - 优势/劣势是否有具体数据或事例？
   - 还是只有"价格低""质量好"这类泛泛而谈？
   - 是否有对比维度？（如：价格高15%、交期快5天）

3. 策略针对性：
   - 应对策略是否针对该对手的具体劣势？
   - 还是通用的"提高质量""加强服务"？
   - 策略是否可执行？（有具体行动而非口号）

4. 凑数嫌疑：
   - 2家对手的分析是否雷同？
   - 策略是否copy-paste只改公司名？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "公司真实性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "分析深度",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "策略针对性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 1.4 标准植入与影响 ====================
    '1.4': {
        name: '标准植入',
        build: (data, related) => `你是服装行业资深销售总监，请审核标准植入内容的专业性和可行性。

【待审核内容】
植入内容：${data.technicalStandards || data.standardContent || data.植入内容 || data.植入标准内容 || '未填写'}
植入方式：${data.influencePlan || data.influenceMethod || data.植入方式 || '未填写'}

【AI需要判断的】

1. 技术参数专业性：
   - 是否有具体可量化的参数？（如：克重150g、色牢度4级）
   - 参数是否在行业合理范围？
     * 西服面料克重：通常120-200g
     * 色牢度：3-5级
     * 缩水率：通常<3%
   - 是否有明显的编造或错误？

2. 植入逻辑：
   - 这些标准是否真的对我方有利？
   - 还是随便写几个参数凑数？

3. 方式可行性：
   - 植入方式是否具体？（通过什么渠道、谁来执行、什么时间）
   - 还是"通过各种渠道""想办法"这类空话？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "参数专业性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "参数合理性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "方式可行性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 2.1 需求调研与确认 ====================
    '2.1': {
        name: '需求调研',
        build: (data, related) => `你是服装行业资深销售总监，请审核需求调研内容的质量。

【待审核内容】
需求列表：${data.requirementList || data.keyRequirements || data.需求列表 || '未填写'}

【AI需要判断的 - 重点：凑数识别】

1. 凑数/拆分检测（最重要）：
   - 5个需求是否真的互相独立？
   - 有没有把一个需求拆成多条的嫌疑？
   举例：
   ❌ 凑数：西服上衣、西服裤子、西服马甲（本质是1套西服）
   ✅ 独立：男士西服套装、女士西服套装、衬衫、领带（4个独立品类）

2. 需求完整性：
   - 每项是否包含：品类+数量+规格+交期？
   - 有没有只写品类没写其他的？

3. 需求合理性：
   - 数量是否在合理范围？
   - 交期是否现实？（如：明天要500套 → 不现实）

4. 与1.1一致性：
   - 总需求量是否与1.1的M描述大致匹配？

【关联数据参考】
1.1 M描述：${related?.['1.1']?.mDescription || related?.['1.1']?.M_描述 || '无'}

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "凑数嫌疑",
      "结论": "通过/警告/不通过",
      "理由": "具体说明哪些项有拆分嫌疑"
    },
    {
      "项目": "需求完整性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "与立项一致",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 2.2 方案设计 ====================
    '2.2': {
        name: '方案设计',
        build: (data, related) => `你是服装行业资深销售总监，请审核方案设计的专业性。

【待审核内容】
技术方案：${data.technicalPlan || data.solutionDescription || data.技术方案 || data.技术方案描述 || '未填写'}
价格方案：${data.pricingPlan || data.价格方案 || data.价格方案描述 || '未填写'}

【AI需要判断的】

1. 技术方案专业性：
   - 是否有具体的面料/工艺/版型描述？
   - 参数是否合理？（克重、成分比例等）
   - 是否像专业方案还是随便写的？

2. 价格合理性：
   - 单价是否在行业范围？
     * 中档西服套装：300-800元
     * 衬衫：80-200元
     * 领带：50-150元
   - 总价与数量是否匹配？

3. 需求响应：
   - 方案是否覆盖了2.1的主要需求？
   - 有没有明显遗漏的品类？

【关联数据参考】
2.1需求列表：${related?.['2.1']?.requirementList || related?.['2.1']?.keyRequirements || '无'}

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "技术专业性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "价格合理性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "需求覆盖",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 2.3 方案讲解与反馈收集 ====================
    '2.3': {
        name: '方案讲解',
        build: (data, related) => `你是服装行业资深销售总监，请审核方案讲解反馈的真实性。

【待审核内容】
参会人员：${data.attendees || data.participants || data.参会关键人 || data.参会人员 || '未填写'}
收集问题：${data.feedbackList || data.feedbackSummary || data.问题列表 || '未填写'}

【AI需要判断的 - 重点：问题真实性】

1. 问题凑数检测：
   - 3个问题是否实质不同？
   - 有没有换个说法重复的？
   举例：
   ❌ 凑数："价格能优惠吗""能便宜点吗""有折扣吗"（本质是1个问题）
   ✅ 独立："价格能优惠吗""交期能提前吗""能提供样品吗"（3个不同问题）

2. 问题真实性：
   - 问题是否像客户真的会问的？
   - 还是销售自己编的？
   - 专业客户通常会问：技术参数、售后服务、交期保障、验收标准等

3. 问题层次：
   - 是否有决策层关心的问题？（预算、效果、风险）
   - 还是全是执行层问题？（规格、交期）

4. 与决策链一致：
   - 提问人是否在1.2决策链中？

【关联数据参考】
1.2关键人：${related?.['1.2']?.keyPersonList || '无'}

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "问题凑数",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "问题真实性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "人员匹配",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 3.1 方案深化 ====================
    '3.1': {
        name: '方案深化',
        build: (data, related) => `你是服装行业资深销售总监，请审核方案深化的响应质量。

【待审核内容】
修改列表：${data.changesDescription || data.modifyList || data.修改列表 || '未填写'}

【关联数据 - 2.3收集的问题】
${related?.['2.3']?.feedbackList || related?.['2.3']?.feedbackSummary || related?.['2.3']?.问题列表 || '无'}

【AI需要判断的 - 重点：响应质量】

1. 问题响应检测：
   - 每个修改是否真正响应了2.3的某个问题？
   - 有没有2.3的问题被遗漏没响应？
   - 修改和问题的对应关系是否合理？

2. 修改实质性：
   - 是实质性改动？（调整参数、增加条款、修改方案）
   - 还是表面改动？（改措辞、改标点）

3. 凑数检测：
   - 3个修改是否实质不同？
   - 有没有把1个修改拆成多条？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "问题响应完整性",
      "结论": "通过/警告/不通过",
      "理由": "第X个问题未被响应..."
    },
    {
      "项目": "修改实质性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "凑数嫌疑",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 3.2 样品准备与展示 ====================
    '3.2': {
        name: '样品展示',
        build: (data, related) => `你是服装行业资深销售总监，请审核样品准备的合理性。

【待审核内容】
样品列表：${data.sampleList || data.samples || data.样品列表 || '未填写'}
展示计划：${data.exhibitionPlan || data.展示计划 || '未填写'}

【关联数据 - 2.2方案推荐】
技术方案：${related?.['2.2']?.technicalPlan || related?.['2.2']?.solutionDescription || related?.['2.2']?.技术方案 || '无'}

【AI需要判断的】

1. 方案一致性：
   - 样品是否来自2.2推荐的方案？
   - 有没有方案里没提到的样品？（可疑）
   - 有没有方案里重点推荐但没准备样品的？（遗漏）

2. 品类覆盖：
   - 是否覆盖客户主要需求品类？
   - 有没有只带了好做的，回避难做的？

3. 凑数检测：
   - 3款样品是否实质不同？
   - 有没有同一款不同颜色算多款的？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "方案一致性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "品类覆盖",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "凑数嫌疑",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 3.3 样品对比展示 ====================
    '3.3': {
        name: '样品对比',
        build: (data, related) => `你是服装行业资深销售总监，请审核样品对比的客观性。

【待审核内容】
对比维度：${data.comparisonDimensions || data.comparisonAnalysis || data.对比维度 || '未填写'}
客户倾向：${data.customerPreference || data.客户倾向 || '未填写'}
对比结论：${data.comparisonConclusion || data.对比结论 || '未填写'}

【AI需要判断的】

1. 对比客观性（重要）：
   - 是否有我方劣势的体现？
   - 还是一边倒全是我方优势？（不可信）
   - 真实对比应该有赢有输

2. 维度专业性：
   - 维度是否专业？（面料、工艺、版型）
   - 还是模糊的"质量好""感觉好"？

3. 结论一致性：
   - 客户倾向与对比结果是否逻辑一致？
   - 如果对比显示竞品多项领先，客户却选我们 → 需解释原因

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "对比客观性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "维度专业性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "结论一致性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 4.0 招标情报与评委布局 ====================
    '4.0': {
        name: '招标情报与评委布局',
        build: (data, related) => `你是服装行业资深销售总监，请审核招标情报与评委布局的完整性和针对性。

【待审核内容】
招标方式：${data.biddingMethod || '未填写'}
技术分占比：${data.technicalScoreRatio || '未填写'}%
商务分占比：${data.commercialScoreRatio || '未填写'}%
评分权重分析：${data.scoringWeightAnalysis || '未填写'}
评委数量：${data.juryCount || '未填写'}
评委名单：${data.juryList || '未填写'}
评委倾向分析：${data.juryTendencyAnalysis || '未填写'}
公关策略：${data.juryPRStrategy || '未填写'}

【关联数据】
1.3竞争对手：${related?.['1.3']?.competitorList || related?.['1.3']?.competitorAnalysis || '无'}

【AI需要判断的 - 全部重要】

1. 评委信息真实性：
   - 评委名单是否有具体姓名？
   - 还是"评委A""评委1"这类编造？
   - 职位信息是否完整？

2. 评委倾向分析质量：
   - 是否针对每个评委分析了关注点？
   - 还是笼统的"技术型""商务型"？
   - 有没有说明与竞争对手的关系？
   举例：
   ❌ 笼统："张主任关注技术"
   ✅ 具体："张主任关注面料质量，曾与海澜之家合作过，对品牌认可度一般，需重点展示我司质检体系"

3. 公关策略可执行性：
   - 策略是否有具体行动？
   - 还是"加强沟通""搞好关系"这类空话？
   - 是否针对评委特点制定？
   举例：
   ❌ 空话："与张主任保持良好沟通"
   ✅ 具体："张主任关注质检，安排工厂参观让其亲眼验证质检流程，时间定在开标前一周"

4. 评分分析深度：
   - 是否分析了我方得分点和失分点？
   - 是否有针对性的应对策略？

5. 凑数嫌疑：
   - 评委分析是否雷同？
   - 公关策略是否千篇一律？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "评委信息真实性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "倾向分析质量",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "公关策略可执行性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "评分分析深度",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 4.1 投标文件准备 ====================
    '4.1': {
        name: '投标文件准备',
        build: (data, related) => `你是服装行业资深销售总监，请审核投标文件的专业性和一致性。

【待审核内容】
技术标说明：${data.technicalBidDescription || data.技术标说明 || '未填写'}
商务标说明：${data.commercialBidDescription || data.商务标说明 || '未填写'}
报价金额：${data.bidPrice || data.报价金额 || '未填写'}

【关联数据】
1.4植入标准：${related?.['1.4']?.technicalStandards || related?.['1.4']?.standardContent || related?.['1.4']?.植入内容 || '无'}
2.2价格方案：${related?.['2.2']?.pricingPlan || related?.['2.2']?.价格方案 || '无'}

【AI需要判断的】

1. 标准植入验证（重要）：
   - 技术标是否包含了1.4植入的标准参数？
   - 如果1.4写了"色牢度4级"，技术标里有没有体现？
   - 植入的优势是否被充分利用？

2. 价格一致性：
   - 报价与2.2方案的价格偏差多少？
   - 如果偏差>15%，是否有合理解释？
   - 偏差方向：报高了还是报低了？

3. 内容专业性：
   - 技术标说明是否专业完整？
   - 还是只有"已完成技术标"这类空话？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "标准植入体现",
      "结论": "通过/警告/不通过",
      "理由": "1.4提到的XX标准在技术标中有/无体现"
    },
    {
      "项目": "价格一致性",
      "结论": "通过/警告/不通过",
      "理由": "与2.2方案偏差约X%，原因..."
    },
    {
      "项目": "内容专业性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 4.2 技术交流会 ====================
    '4.2': {
        name: '技术交流会',
        build: (data, related) => `你是服装行业资深销售总监，请审核技术交流会记录的真实性和质量。

【待审核内容】
客户参会人：${data.customerAttendees || data.客户参会人 || '未填写'}
问答记录：${data.qaRecord || data.technicalQA || data.问答记录 || '未填写'}
技术共识：${data.technicalConsensus || data.技术共识 || '未填写'}

【关联数据】
1.2决策链：${related?.['1.2']?.keyPersonList || '无'}

【AI需要判断的】

1. 问答凑数检测（重要）：
   - 5条问答是否实质不同？
   - 有没有换个说法重复的？
   举例：
   ❌ 凑数："面料是什么材质""用的什么面料""面料成分是什么"（1个问题）
   ✅ 独立：面料成分、生产周期、质检标准、售后服务、验收流程（5个不同问题）

2. 技术深度：
   - 问题是否有技术含量？
   - 客户技术人员通常关心：材质参数、工艺流程、质检标准、生产能力
   - 还是只有"价格能便宜吗"这类非技术问题？

3. 回答专业性：
   - 回答是否专业具体？
   - 还是"可以""没问题""会处理"这类敷衍？

4. 人员匹配：
   - 客户参会人是否包含技术相关的决策人？
   - 还是只有行政人员参加技术交流？（可疑）

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "问答凑数",
      "结论": "通过/警告/不通过",
      "理由": "第X条和第Y条本质重复..."
    },
    {
      "项目": "技术深度",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "回答专业性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 4.3 商务交流会 ====================
    '4.3': {
        name: '商务交流会',
        build: (data, related) => `你是服装行业资深销售总监，请审核商务交流会记录的合理性。

【待审核内容】
商务讨论记录：${data.commercialDiscussion || data.商务讨论 || data.商务讨论记录 || '未填写'}
价格区间确认：${data.priceRange || data.价格区间 || '未填写'}
账期确认：${data.paymentTerms || data.账期 || data.账期确认 || '未填写'}

【关联数据】
1.1 A(资金)描述：${related?.['1.1']?.aDescription || related?.['1.1']?.A_描述 || '无'}
4.1 报价金额：${related?.['4.1']?.bidPrice || related?.['4.1']?.报价金额 || '无'}

【AI需要判断的】

1. 价格逻辑一致性：
   - 价格区间是否与1.1预算范围吻合？
   - 价格区间是否与4.1报价吻合？
   - 如果有较大偏差，是否合理？

2. 讨论实质性：
   - 商务讨论是否有实质内容？（讨论了什么、达成了什么共识）
   - 还是只有"讨论顺利""达成初步意向"这类空话？

3. 账期合理性：
   - 账期条款是否清晰？（付款比例、付款节点）
   - 账期是否在合理范围？
     * 常见：预付30-50%，交货付40-60%，质保期付10%
     * 异常：全款预付 或 全部账期超过6个月

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "价格一致性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "讨论实质性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "账期合理性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 5.1 评分模拟与风险应对（最重要的AI验证）====================
    '5.1': {
        name: '风险应对',
        build: (data, related) => `你是服装行业资深销售总监，请严格审核风险应对内容的质量。这是最容易敷衍的任务，请仔细检查。

【待审核内容】
风险列表：${data.riskList || data.riskDescription || data.风险列表 || '未填写'}
应对措施：${data.countermeasures || data.应对措施 || '未填写'}
预计得分：${data.expectedScore || data.预计得分 || '未填写'}

【关联数据】
1.3竞争对手分析：${related?.['1.3']?.competitorList || related?.['1.3']?.competitorAnalysis || '无'}

【AI需要判断的 - 全部重要】

1. 风险凑数检测：
   - 3个风险是否实质不同？
   - 有没有换个说法重复的？
   举例：
   ❌ 凑数：
      "价格偏高" / "报价超预算" / "成本压力大"（本质是1个风险）
   ✅ 独立：
      "价格比竞品高15%" / "交期只剩20天，正常需25天" / "色牢度指标不达标"（3个不同风险）

2. 风险具体性：
   - 风险是否基于事实？（有数据、有来源）
   - 还是泛泛而谈？
   举例：
   ❌ 泛泛："价格偏高" "竞争激烈" "时间紧张"
   ✅ 具体："色牢度要求4级，我司常规产品3.5级" "竞争对手海澜之家在该客户有3年合作历史"

3. 措施针对性（最重要）：
   - 每个措施是否真正能解决对应风险？
   - 风险和措施是否匹配？
   举例：
   ❌ 不匹配：
      风险"交期紧" → 措施"提高产品质量"（驴唇不对马嘴）
   ❌ 空话：
      风险"价格高" → 措施"加强沟通"
   ✅ 匹配：
      风险"交期紧，只剩20天" → 措施"与生产部协调优先排产，同时联系外协工厂备份，已与张经理确认可加急"

4. 措施可执行性：
   - 措施是否具体可执行？（有时间、有责任人、有具体行动）
   - 还是口号式的？（"加强""提高""做好"）

5. 遗漏检测：
   - 基于前面任务的信息，是否有明显遗漏的风险？
   - 比如：1.3分析了竞争对手优势，有没有在风险中体现？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "风险凑数",
      "结论": "通过/警告/不通过",
      "理由": "第X个和第Y个风险本质相同..."
    },
    {
      "项目": "风险具体性",
      "结论": "通过/警告/不通过",
      "理由": "第X个风险过于泛泛..."
    },
    {
      "项目": "措施针对性",
      "结论": "通过/警告/不通过",
      "理由": "第X个措施与风险不匹配，风险说的是...但措施说的是..."
    },
    {
      "项目": "措施可执行性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 6.1 商务谈判 ====================
    '6.1': {
        name: '商务谈判',
        build: (data, related) => `你是服装行业资深销售总监，请审核商务谈判记录的真实性和合理性。

【待审核内容】
谈判过程描述：${data.concessionRecord || data.谈判过程 || data.谈判过程描述 || '未填写'}
最终价格：${data.finalPrice || data.最终价格 || '未填写'}万
账期条款：${data.paymentTerms || data.账期条款 || data.账期 || '未填写'}
关键谈判点：${data.keyNegotiationPoints || data.关键谈判点 || '未填写'}

【关联数据】
4.1报价：${related?.['4.1']?.bidPrice || related?.['4.1']?.报价金额 || '无'}
4.3价格区间：${related?.['4.3']?.priceRange || related?.['4.3']?.价格区间 || '无'}

【AI需要判断的】

1. 谈判过程真实性：
   - 是否描述了谈判的博弈过程？（客户要求什么、我方如何回应、如何妥协）
   - 还是只有结果没有过程？（"谈判顺利，达成一致"）
   - 真实谈判通常有：客户压价、我方回应、多轮博弈、最终妥协点

2. 价格变化合理性：
   - 最终价格与4.1报价相比，变化了多少？
   - 降价幅度是否合理？
     * 正常：5-15%的商务折扣
     * 可疑：降幅超过20%（为什么报价虚高这么多？）
     * 可疑：完全没降（真的一分没让？）
   - 如果有降价，过程描述中是否说明了原因？

3. 条款完整性：
   - 是否明确了：价格、账期、交期、售后等主要条款？
   - 有没有重要条款遗漏？

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "过程真实性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "价格变化",
      "结论": "通过/警告/不通过",
      "理由": "从报价X降到Y，降幅Z%，..."
    },
    {
      "项目": "条款完整性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    },

    // ==================== 7.1 合同签订 ====================
    '7.1': {
        name: '合同签订',
        build: (data, related) => `你是服装行业资深销售总监，请审核合同签订记录的完整性和一致性。

【待审核内容】
合同编号：${data.contractNumber || data.合同编号 || '未填写'}
签约金额：${data.contractAmount || data.签约金额 || '未填写'}万
签约日期：${data.contractDate || data.签约日期 || '未填写'}
付款条款：${data.paymentTerms || data.付款条款 || '未填写'}
交付条款：${data.deliveryTerms || data.交付条款 || '未填写'}
质保条款：${data.warrantyTerms || data.质保条款 || '未填写'}
客户签署人：${data.signatoryCustomer || data.客户签署人 || '未填写'}

【关联数据】
6.1最终价格：${related?.['6.1']?.finalPrice || related?.['6.1']?.最终价格 || '无'}
6.1账期条款：${related?.['6.1']?.paymentTerms || related?.['6.1']?.账期条款 || '无'}
6.1谈判日期：${related?.['6.1']?.negotiationDate || '无'}

【AI需要判断的】

1. 金额一致性（重要）：
   - 签约金额与6.1谈判最终价格是否一致？
   - 允许小幅调整（尾数取整、税点调整），偏差应<5%
   - 如果偏差>5%，必须有合理解释

2. 合同编号规范性：
   - 编号是否符合规范格式？（如：NPZZ-2024-0125）
   - 还是随意填写？（如：123、001）

3. 条款完整性：
   - 主要条款是否涵盖：标的、价格、交期、付款、验收、售后？
   - 是否与6.1谈判的条款一致？

4. 时间逻辑：
   - 签约日期是否晚于6.1谈判时间？
   - 时间间隔是否合理？（通常谈判后1-2周内签约）

【请返回JSON】
{
  "检测结果": [
    {
      "项目": "金额一致性",
      "结论": "通过/警告/不通过",
      "理由": "签约X万，谈判Y万，偏差Z%..."
    },
    {
      "项目": "编号规范性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "条款完整性",
      "结论": "通过/警告/不通过",
      "理由": "..."
    },
    {
      "项目": "时间逻辑",
      "结论": "通过/警告/不通过",
      "理由": "..."
    }
  ],
  "整体结论": "通过/需复核/不通过",
  "改进建议": "..."
}`
    }
};

// ==================== AI验证器 ====================
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
     * 执行任务专属AI验证（新版）
     * @param {string} taskCode - 任务编号
     * @param {object} taskData - 当前任务数据
     * @param {object} relatedTasksData - 关联任务数据 { '1.1': {...}, '1.2': {...} }
     * @returns {Promise<object>} 验证结果
     */
    async validateTask(taskCode, taskData, relatedTasksData = {}) {
        const promptConfig = AI_PROMPTS[taskCode];
        if (!promptConfig) {
            return {
                error: true,
                message: `任务 ${taskCode} 暂无AI验证配置`
            };
        }

        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { error: true, message: 'API Key未设置' };
        }

        // 构建Prompt
        const prompt = promptConfig.build(taskData, relatedTasksData);

        try {
            const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1, // 低温度，更稳定的判断
                        maxOutputTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API请求失败');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return this.parseTaskResponse(text);
        } catch (error) {
            console.error('AI验证失败:', error);
            return { error: true, message: `AI验证服务暂不可用: ${error.message}` };
        }
    },

    /**
     * 解析任务验证响应
     */
    parseTaskResponse(text) {
        try {
            // 提取JSON部分
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);

                // 转换为标准格式
                const checks = (result.检测结果 || []).map(item => ({
                    label: item.项目,
                    passed: item.结论 === '通过',
                    warning: item.结论 === '警告',
                    message: item.理由
                }));

                const overallPassed = result.整体结论 === '通过';
                const needReview = result.整体结论 === '需复核';

                return {
                    passed: overallPassed,
                    needReview,
                    checks,
                    suggestion: result.改进建议 || '',
                    confidence: overallPassed ? 80 : (needReview ? 50 : 30),
                    rawResult: result
                };
            }
        } catch (e) {
            console.error('AI返回解析失败:', e, text);
        }

        return {
            error: true,
            message: '无法解析AI返回',
            rawText: text.substring(0, 200)
        };
    },

    /**
     * 执行简单AI验证（向后兼容）
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
            return this.parseSimpleResponse(text);
        } catch (error) {
            throw new Error(`AI验证失败: ${error.message}`);
        }
    },

    /**
     * 解析简单AI响应（向后兼容）
     */
    parseSimpleResponse(text) {
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
    },

    /**
     * 获取任务的AI验证配置
     */
    getTaskPromptConfig(taskCode) {
        return AI_PROMPTS[taskCode] || null;
    },

    /**
     * 检查任务是否有AI验证配置
     */
    hasTaskConfig(taskCode) {
        return !!AI_PROMPTS[taskCode];
    },

    /**
     * 渲染AI验证结果HTML
     */
    renderTaskValidationResult(result) {
        if (result.error) {
            return `<div class="ai-validation-error">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${result.message}</span>
            </div>`;
        }

        let html = '<div class="ai-validation-result">';

        // 检测结果列表
        if (result.checks && result.checks.length > 0) {
            html += '<ul class="ai-check-list">';
            result.checks.forEach(check => {
                const icon = check.passed ? '✅' : (check.warning ? '⚠️' : '❌');
                const cls = check.passed ? 'pass' : (check.warning ? 'warning' : 'fail');
                html += `<li class="${cls}">
                    <span class="check-icon">${icon}</span>
                    <span class="check-label">${check.label}</span>
                    <span class="check-message">${check.message}</span>
                </li>`;
            });
            html += '</ul>';
        }

        // 整体结论
        const conclusionIcon = result.passed ? '✅' : (result.needReview ? '⚠️' : '❌');
        const conclusionText = result.passed ? '通过' : (result.needReview ? '需复核' : '不通过');
        const conclusionClass = result.passed ? 'pass' : (result.needReview ? 'warning' : 'fail');

        html += `<div class="ai-conclusion ${conclusionClass}">
            <span class="conclusion-icon">${conclusionIcon}</span>
            <span class="conclusion-text">整体结论：${conclusionText}</span>
            <span class="confidence">置信度：${result.confidence}%</span>
        </div>`;

        // 改进建议
        if (result.suggestion) {
            html += `<div class="ai-suggestion">
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-text">${result.suggestion}</span>
            </div>`;
        }

        html += '</div>';
        return html;
    }
};

// 导出
window.AIValidator = AIValidator;
window.AI_PROMPTS = AI_PROMPTS;
