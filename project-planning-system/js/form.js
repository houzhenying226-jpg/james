/**
 * 北方努派项目规划表智能填写系统 - 表单逻辑模块
 * 处理表单验证、数据收集、工艺选项渲染等
 */

// 表单管理器
const FormManager = {
  // 当前项目数据
  currentProject: null,

  // 当前步骤
  currentStep: 1,

  // 当前编辑的明细索引（-1表示新增）
  editingDetailIndex: -1,

  // 初始化新项目
  initNewProject() {
    this.currentProject = {
      basicInfo: {
        reportDate: this.formatDate(new Date()),
        contractNo: '',
        signingEntity: '',
        customerName: '',
        projectAmount: '',
        totalPeople: '',
        deliveryDate: '',
        salesDepartment: '',
        salesPerson: '',
        productPerson: '',
        productionPerson: '',
        supervisorPerson: ''
      },
      details: [],
      timeline: {
        fabricApplyDate: '',
        fabricArriveDate: '',
        measureCompleteDate: '',
        orderCompleteDate: '',
        productionOrderDate: '',
        productionCompleteDate: '',
        deliveryCompleteDate: ''
      },
      metadata: {
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
    };
    this.currentStep = 1;
    this.editingDetailIndex = -1;
  },

  // 加载已有项目
  loadProject(project) {
    this.currentProject = JSON.parse(JSON.stringify(project)); // 深拷贝
    this.currentStep = 1;
    this.editingDetailIndex = -1;
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 验证基本信息
  validateBasicInfo() {
    const info = this.currentProject.basicInfo;
    const errors = [];

    const requiredFields = {
      reportDate: '报备日期',
      contractNo: '合同号',
      signingEntity: '签订主体',
      customerName: '客户名称',
      projectAmount: '项目金额',
      totalPeople: '制装人数',
      deliveryDate: '项目交期',
      salesDepartment: '销售部门',
      salesPerson: '销售人员',
      productionPerson: '生产人员'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!info[field] || info[field].toString().trim() === '') {
        errors.push(`${label}不能为空`);
      }
    }

    // 数字验证
    if (info.projectAmount && isNaN(Number(info.projectAmount))) {
      errors.push('项目金额必须是数字');
    }
    if (info.totalPeople && isNaN(Number(info.totalPeople))) {
      errors.push('制装人数必须是数字');
    }

    return errors;
  },

  // 验证制作明细
  validateDetail(detail) {
    const errors = [];

    const requiredFields = {
      inventoryName: '存货名称',
      configuration: '配置',
      quantity: '人数',
      fabricPurchaser: '面料采购方',
      fabricNo: '面料号',
      fabricBrand: '面料品牌',
      fabricComposition: '面料成分',
      fabricColor: '面料颜色',
      factory: '制作工厂',
      packagingRequirement: '包装要求',
      styleNo: '款式号',
      craftRequirements: '工艺要求'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!detail[field] || detail[field].toString().trim() === '') {
        errors.push(`${label}不能为空`);
      }
    }

    // 数字验证
    if (detail.quantity && isNaN(Number(detail.quantity))) {
      errors.push('人数必须是数字');
    }
    if (detail.unitPrice && detail.unitPrice !== '' && isNaN(Number(detail.unitPrice))) {
      errors.push('单价必须是数字');
    }

    return errors;
  },

  // 验证整个项目
  validateProject() {
    const errors = {
      basicInfo: this.validateBasicInfo(),
      details: []
    };

    if (this.currentProject.details.length === 0) {
      errors.details.push('至少需要添加一条制作明细');
    }

    this.currentProject.details.forEach((detail, index) => {
      const detailErrors = this.validateDetail(detail);
      if (detailErrors.length > 0) {
        errors.details.push(`第${index + 1}行明细：${detailErrors.join('、')}`);
      }
    });

    const hasErrors = errors.basicInfo.length > 0 || errors.details.length > 0;
    return { isValid: !hasErrors, errors };
  },

  // 创建空白明细
  createEmptyDetail() {
    return {
      level: '',
      inventoryName: '',
      inventoryCode: '',
      category: '',
      configuration: '',
      quantity: '',
      unitPrice: '',
      fabricPurchaser: '努派采购',
      fabricNo: '',
      fabricBrand: '',
      fabricComposition: '',
      fabricYarn: '',
      fabricColor: '',
      factory: '希努尔',
      packagingRequirement: '希努尔大货包装',
      styleNo: '',
      craftRequirements: '',
      customerSpecialRequirements: '',
      needSample: '否',
      needFitting: '否'
    };
  },

  // 添加明细
  addDetail(detail) {
    this.currentProject.details.push(detail);
    return this.currentProject.details.length - 1;
  },

  // 更新明细
  updateDetail(index, detail) {
    if (index >= 0 && index < this.currentProject.details.length) {
      this.currentProject.details[index] = detail;
      return true;
    }
    return false;
  },

  // 删除明细
  deleteDetail(index) {
    if (index >= 0 && index < this.currentProject.details.length) {
      this.currentProject.details.splice(index, 1);
      return true;
    }
    return false;
  },

  // 生成工艺选项HTML
  generateCraftOptionsHTML(inventoryName, selectedValues = {}) {
    const craftTypes = window.INVENTORY_CRAFT_MAP[inventoryName];
    if (!craftTypes || craftTypes.length === 0) {
      return `
        <div class="craft-section">
          <h4>工艺要求</h4>
          <div class="form-group">
            <textarea id="craftOther" class="form-control" rows="3" placeholder="请输入工艺要求...">${selectedValues.other || ''}</textarea>
          </div>
        </div>
      `;
    }

    let html = '';

    craftTypes.forEach(craftType => {
      const options = window.CRAFT_OPTIONS[craftType];
      if (!options) return;

      html += `<div class="craft-section">`;
      html += `<h4>${craftType}工艺</h4>`;

      for (const [optionName, optionValues] of Object.entries(options)) {
        const selectedKey = `${craftType}_${optionName}`;
        const currentValue = selectedValues[selectedKey] || '';

        if (Array.isArray(optionValues)) {
          // 单选选项
          html += `
            <div class="form-group craft-option">
              <label>${optionName}：</label>
              <div class="radio-group">
          `;

          optionValues.forEach(value => {
            const checked = currentValue === value ? 'checked' : '';
            const inputId = `craft_${craftType}_${optionName}_${value}`.replace(/[^a-zA-Z0-9_]/g, '_');
            html += `
              <label class="radio-label">
                <input type="radio" name="craft_${craftType}_${optionName}" value="${value}" ${checked}>
                <span>${value}</span>
              </label>
            `;
          });

          html += `
              </div>
            </div>
          `;
        } else if (optionValues.type === 'input') {
          // 输入框选项
          const required = optionValues.required ? 'required' : '';
          const requiredMark = optionValues.required ? '<span class="required">*</span>' : '';
          html += `
            <div class="form-group craft-option">
              <label>${optionName}${requiredMark}：</label>
              <div class="input-with-unit">
                <input type="text" class="form-control" name="craft_${craftType}_${optionName}" value="${currentValue}" ${required}>
                ${optionValues.unit ? `<span class="unit">${optionValues.unit}</span>` : ''}
              </div>
            </div>
          `;
        }
      }

      html += `</div>`;
    });

    // 添加其他工艺要求文本框
    html += `
      <div class="craft-section">
        <h4>其他工艺要求</h4>
        <div class="form-group">
          <textarea id="craftOther" class="form-control" rows="3" placeholder="请输入其他工艺要求...">${selectedValues.other || ''}</textarea>
        </div>
      </div>
    `;

    return html;
  },

  // 收集工艺选项值
  collectCraftOptions() {
    const values = {};

    // 收集所有单选框的值
    document.querySelectorAll('.craft-option input[type="radio"]:checked').forEach(radio => {
      const name = radio.name.replace('craft_', '');
      values[name] = radio.value;
    });

    // 收集所有输入框的值
    document.querySelectorAll('.craft-option input[type="text"]').forEach(input => {
      const name = input.name.replace('craft_', '');
      if (input.value.trim()) {
        values[name] = input.value.trim();
      }
    });

    // 收集其他工艺要求
    const otherTextarea = document.getElementById('craftOther');
    if (otherTextarea && otherTextarea.value.trim()) {
      values.other = otherTextarea.value.trim();
    }

    return values;
  },

  // 将工艺选项转换为文本描述
  craftOptionsToText(craftOptions) {
    if (!craftOptions || Object.keys(craftOptions).length === 0) {
      return '';
    }

    const parts = [];

    for (const [key, value] of Object.entries(craftOptions)) {
      if (key === 'other') {
        parts.push(value);
      } else {
        // 格式化：西服_衬型 -> 衬型
        const optionName = key.split('_').pop();
        parts.push(`${value}`);
      }
    }

    return parts.join('，');
  },

  // 从文本描述解析工艺选项
  textToCraftOptions(text, inventoryName) {
    // 简单的文本解析，返回空对象让用户手动选择
    return { other: text };
  },

  // 生成存货名称下拉选项HTML
  generateInventoryDropdownHTML(selectedName = '') {
    let html = '<option value="">请选择存货名称</option>';

    // 按类型分组
    const groups = {};
    window.INVENTORY_DATA.forEach(item => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });

    for (const [type, items] of Object.entries(groups)) {
      html += `<optgroup label="${type}">`;
      items.forEach(item => {
        const selected = item.name === selectedName ? 'selected' : '';
        html += `<option value="${item.name}" data-code="${item.code}" data-type="${item.type}" data-category="${item.category}" ${selected}>${item.name}</option>`;
      });
      html += '</optgroup>';
    }

    return html;
  },

  // 计算项目汇总信息
  calculateSummary() {
    const details = this.currentProject.details;
    let totalQuantity = 0;
    let totalAmount = 0;

    details.forEach(detail => {
      const qty = Number(detail.quantity) || 0;
      const price = Number(detail.unitPrice) || 0;
      totalQuantity += qty;
      totalAmount += qty * price;
    });

    return {
      itemCount: details.length,
      totalQuantity,
      totalAmount
    };
  }
};

// 导出给其他模块使用
window.FormManager = FormManager;
