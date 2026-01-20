/**
 * 北方努派项目规划表智能填写系统 V2 - 界面交互模块
 */

const App = {
  // 当前项目数据
  currentProject: null,
  // 当前页面
  currentPage: 'input',

  // 初始化
  init() {
    this.bindEvents();
    this.loadRecentProjects();
    this.checkApiKey();
  },

  // 绑定事件
  bindEvents() {
    // 解析按钮
    document.getElementById('parseBtn').addEventListener('click', () => this.handleParse());

    // 输入框回车
    document.getElementById('userInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.handleParse();
      }
    });

    // 返回按钮
    document.getElementById('backBtn')?.addEventListener('click', () => this.showInputPage());

    // 确认导出按钮
    document.getElementById('exportBtn')?.addEventListener('click', () => this.handleExport());

    // 设置按钮
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettings());

    // 历史记录按钮
    document.getElementById('historyBtn')?.addEventListener('click', () => this.showHistory());

    // 全局委托事件
    document.addEventListener('click', (e) => this.handleGlobalClick(e));

    // 弹窗关闭
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
  },

  // 处理全局点击
  handleGlobalClick(e) {
    const target = e.target;
    const action = target.dataset.action;

    if (!action) return;

    switch (action) {
      case 'edit-basic':
        this.showEditBasicModal();
        break;
      case 'edit-detail':
        const detailIndex = parseInt(target.dataset.index);
        this.showEditDetailModal(detailIndex);
        break;
      case 'delete-detail':
        const deleteIndex = parseInt(target.dataset.index);
        this.deleteDetail(deleteIndex);
        break;
      case 'add-detail':
        this.showAddDetailModal();
        break;
      case 'load-project':
        const projectId = target.dataset.id;
        this.loadProject(projectId);
        break;
      case 'delete-project':
        const deleteProjectId = target.dataset.id;
        this.deleteProject(deleteProjectId);
        break;
      case 'close-warning':
        target.closest('.warning-item')?.remove();
        break;
    }
  },

  // 检查API Key
  checkApiKey() {
    const hasKey = AIParser.hasApiKey();
    const tipEl = document.getElementById('apiTip');

    if (!hasKey && tipEl) {
      tipEl.style.display = 'block';
    }
  },

  // 加载最近项目
  loadRecentProjects() {
    const projects = Storage.getRecentProjects(5);
    const container = document.getElementById('recentProjects');

    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = '<p class="empty-tip">暂无历史项目</p>';
      return;
    }

    container.innerHTML = projects.map(p => `
      <div class="recent-item" data-action="load-project" data-id="${p.id}">
        <span class="customer">${p.basicInfo?.customerName || '未命名'}</span>
        <span class="contract">(${p.basicInfo?.contractNo || '无合同号'})</span>
        <span class="date">${p.metadata?.createTime?.split('T')[0] || ''}</span>
      </div>
    `).join('');
  },

  // 处理AI解析
  async handleParse() {
    const input = document.getElementById('userInput').value.trim();

    if (!input) {
      this.showMessage('请输入项目需求描述', 'error');
      return;
    }

    const btn = document.getElementById('parseBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> 解析中...';
    btn.disabled = true;

    try {
      const result = await AIParser.parse(input);
      result.metadata = {
        rawInput: input,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      };

      this.currentProject = result;
      this.showResultPage();
    } catch (error) {
      this.showMessage(error.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  // 显示输入页面
  showInputPage() {
    document.getElementById('inputPage').classList.add('active');
    document.getElementById('resultPage').classList.remove('active');
    this.currentPage = 'input';
  },

  // 显示结果页面
  showResultPage() {
    document.getElementById('inputPage').classList.remove('active');
    document.getElementById('resultPage').classList.add('active');
    this.currentPage = 'result';

    this.renderResult();
  },

  // 渲染解析结果
  renderResult() {
    if (!this.currentProject) return;

    const project = this.currentProject;

    // 渲染基本信息
    this.renderBasicInfo(project.basicInfo);

    // 渲染明细列表
    this.renderDetails(project.details);

    // 渲染警告
    this.renderWarnings(project.warnings);

    // 显示置信度
    this.renderConfidence(project.confidence);
  },

  // 渲染基本信息
  renderBasicInfo(info) {
    const container = document.getElementById('basicInfoContent');
    if (!container) return;

    container.innerHTML = `
      <div class="info-grid">
        <div class="info-item">
          <label>客户名称</label>
          <span>${info.customerName || '<span class="missing">待补充</span>'}</span>
        </div>
        <div class="info-item">
          <label>合同号</label>
          <span>${info.contractNo || '<span class="missing">待补充</span>'}</span>
        </div>
        <div class="info-item">
          <label>项目金额</label>
          <span>${info.projectAmount ? this.formatAmount(info.projectAmount) : '<span class="missing">待补充</span>'}</span>
        </div>
        <div class="info-item">
          <label>制装人数</label>
          <span>${info.totalPeople ? info.totalPeople + '人' : '<span class="missing">待补充</span>'}</span>
        </div>
        <div class="info-item">
          <label>项目交期</label>
          <span>${info.deliveryDate || '<span class="missing">待补充</span>'}</span>
        </div>
        <div class="info-item">
          <label>报备日期</label>
          <span>${info.reportDate || new Date().toISOString().split('T')[0]}</span>
        </div>
      </div>
    `;
  },

  // 渲染明细列表
  renderDetails(details) {
    const container = document.getElementById('detailsContent');
    const countEl = document.getElementById('detailCount');

    if (countEl) {
      countEl.textContent = `(${details.length}条)`;
    }

    if (!container) return;

    if (details.length === 0) {
      container.innerHTML = '<div class="empty-tip">暂无制作明细</div>';
      return;
    }

    container.innerHTML = details.map((detail, index) => `
      <div class="detail-card">
        <div class="detail-header">
          <span class="detail-title">明细${index + 1}</span>
          <div class="detail-actions">
            <button class="btn btn-sm btn-link" data-action="edit-detail" data-index="${index}">修改</button>
            <button class="btn btn-sm btn-link btn-danger-text" data-action="delete-detail" data-index="${index}">删除</button>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-row">
            <span class="label">存货名称：</span>
            <span class="value">${detail.inventoryName} (${detail.inventoryCode})</span>
          </div>
          <div class="detail-row">
            <span class="label">配置：</span>
            <span class="value">${detail.configuration}</span>
            <span class="label" style="margin-left:24px">人数：</span>
            <span class="value">${detail.quantity}人</span>
          </div>
          <div class="detail-row">
            <span class="label">面料：</span>
            <span class="value">${this.formatFabricInfo(detail)}</span>
          </div>
          <div class="detail-row">
            <span class="label">面料采购：</span>
            <span class="value">${detail.fabricPurchaser}</span>
          </div>
          <div class="detail-row">
            <span class="label">工艺：</span>
            <span class="value craft-value">${detail.craftDescription || detail.craftTemplate || '标准高端'}</span>
          </div>
          <div class="detail-row">
            <span class="label">工厂：</span>
            <span class="value">${detail.factory}</span>
            <span class="label" style="margin-left:24px">包装：</span>
            <span class="value">${detail.packaging}</span>
          </div>
          ${detail.parseStatus?.missingFields?.length > 0 ? `
            <div class="detail-missing">
              <span class="icon">!</span>
              缺少：${detail.parseStatus.missingFields.join('、')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  },

  // 渲染警告
  renderWarnings(warnings) {
    const container = document.getElementById('warningsContent');
    if (!container) return;

    if (!warnings || warnings.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="warnings-header">
        <span class="icon">!</span>
        <span>AI提醒</span>
      </div>
      <ul class="warnings-list">
        ${warnings.map(w => `
          <li class="warning-item">
            <span>${w}</span>
            <button class="warning-close" data-action="close-warning">&times;</button>
          </li>
        `).join('')}
      </ul>
    `;
  },

  // 渲染置信度
  renderConfidence(confidence) {
    const el = document.getElementById('confidenceValue');
    if (!el) return;

    const percent = Math.round((confidence || 0.8) * 100);
    el.textContent = `${percent}%`;
    el.className = percent >= 80 ? 'high' : (percent >= 60 ? 'medium' : 'low');
  },

  // 格式化金额
  formatAmount(amount) {
    if (!amount) return '';
    if (amount >= 10000) {
      return (amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 2) + '万元';
    }
    return amount.toLocaleString() + '元';
  },

  // 格式化面料信息
  formatFabricInfo(detail) {
    const parts = [];
    if (detail.fabricBrand) parts.push(detail.fabricBrand);
    if (detail.fabricComposition) parts.push(detail.fabricComposition);
    if (detail.fabricYarn) parts.push(detail.fabricYarn);
    if (detail.fabricColor) parts.push(detail.fabricColor);

    if (parts.length === 0) {
      return '<span class="missing">待补充</span>';
    }
    return parts.join(' / ');
  },

  // 显示编辑基本信息弹窗
  showEditBasicModal() {
    const info = this.currentProject?.basicInfo || {};
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');

    content.innerHTML = `
      <h3>编辑项目基本信息</h3>
      <form id="editBasicForm">
        <div class="form-row">
          <div class="form-group">
            <label>客户名称 <span class="required">*</span></label>
            <input type="text" name="customerName" class="form-control" value="${info.customerName || ''}" required>
          </div>
          <div class="form-group">
            <label>合同号 <span class="required">*</span></label>
            <input type="text" name="contractNo" class="form-control" value="${info.contractNo || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>项目金额</label>
            <input type="number" name="projectAmount" class="form-control" value="${info.projectAmount || ''}">
          </div>
          <div class="form-group">
            <label>制装人数</label>
            <input type="number" name="totalPeople" class="form-control" value="${info.totalPeople || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>项目交期</label>
            <input type="date" name="deliveryDate" class="form-control" value="${info.deliveryDate || ''}">
          </div>
          <div class="form-group">
            <label>报备日期</label>
            <input type="date" name="reportDate" class="form-control" value="${info.reportDate || new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>销售部门</label>
            <input type="text" name="salesDepartment" class="form-control" value="${info.salesDepartment || ''}">
          </div>
          <div class="form-group">
            <label>销售人员</label>
            <input type="text" name="salesPerson" class="form-control" value="${info.salesPerson || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>生产人员</label>
            <input type="text" name="productionPerson" class="form-control" value="${info.productionPerson || ''}">
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    `;

    // 绑定表单提交
    content.querySelector('#editBasicForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBasicInfo(new FormData(e.target));
    });

    modal.classList.add('show');
  },

  // 保存基本信息
  saveBasicInfo(formData) {
    if (!this.currentProject) return;

    this.currentProject.basicInfo = {
      ...this.currentProject.basicInfo,
      customerName: formData.get('customerName'),
      contractNo: formData.get('contractNo'),
      projectAmount: parseFloat(formData.get('projectAmount')) || 0,
      totalPeople: parseInt(formData.get('totalPeople')) || 0,
      deliveryDate: formData.get('deliveryDate'),
      reportDate: formData.get('reportDate'),
      salesDepartment: formData.get('salesDepartment'),
      salesPerson: formData.get('salesPerson'),
      productionPerson: formData.get('productionPerson')
    };

    this.closeModal();
    this.renderResult();
    this.showMessage('基本信息已更新', 'success');
  },

  // 显示编辑明细弹窗
  showEditDetailModal(index) {
    const detail = this.currentProject?.details?.[index];
    if (!detail) return;

    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');

    content.innerHTML = this.buildDetailForm(detail, index);

    // 绑定表单提交
    content.querySelector('#editDetailForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDetail(index, new FormData(e.target));
    });

    // 绑定存货名称变化
    content.querySelector('[name="inventoryName"]').addEventListener('change', (e) => {
      this.onInventoryChange(e.target.value);
    });

    modal.classList.add('show');
  },

  // 显示添加明细弹窗
  showAddDetailModal() {
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');

    const emptyDetail = {
      inventoryName: '',
      inventoryCode: '',
      configuration: '1衣1裤',
      quantity: '',
      fabricPurchaser: '努派采购',
      fabricNo: '',
      fabricBrand: '',
      fabricComposition: '',
      fabricYarn: '',
      fabricColor: '',
      factory: '希努尔',
      packaging: '希努尔大货包装',
      craftTemplate: '标准高端'
    };

    content.innerHTML = this.buildDetailForm(emptyDetail, -1);

    // 绑定表单提交
    content.querySelector('#editDetailForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addDetail(new FormData(e.target));
    });

    modal.classList.add('show');
  },

  // 构建明细表单
  buildDetailForm(detail, index) {
    const isNew = index === -1;
    const title = isNew ? '添加制作明细' : `修改明细${index + 1}`;

    // 构建存货选项
    const inventoryOptions = INVENTORY_DATA.map(item => {
      const selected = detail.inventoryName?.replace('-高', '') === item.name ? 'selected' : '';
      return `<option value="${item.name}" ${selected}>${item.name}</option>`;
    }).join('');

    return `
      <h3>${title}</h3>
      <form id="editDetailForm">
        <div class="form-row">
          <div class="form-group">
            <label>存货名称 <span class="required">*</span></label>
            <select name="inventoryName" class="form-control" required>
              <option value="">请选择</option>
              ${inventoryOptions}
            </select>
          </div>
          <div class="form-group">
            <label>存货编码</label>
            <input type="text" name="inventoryCode" class="form-control" value="${detail.inventoryCode || ''}" readonly>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>配置</label>
            <select name="configuration" class="form-control">
              <option value="1衣1裤" ${detail.configuration === '1衣1裤' ? 'selected' : ''}>1衣1裤</option>
              <option value="1衣1裤1马甲" ${detail.configuration === '1衣1裤1马甲' ? 'selected' : ''}>1衣1裤1马甲（三件套）</option>
              <option value="1衣2裤" ${detail.configuration === '1衣2裤' ? 'selected' : ''}>1衣2裤</option>
              <option value="1衣1裤1裙" ${detail.configuration === '1衣1裤1裙' ? 'selected' : ''}>1衣1裤1裙</option>
              <option value="1衣" ${detail.configuration === '1衣' ? 'selected' : ''}>单上衣</option>
              <option value="1裤" ${detail.configuration === '1裤' ? 'selected' : ''}>单裤</option>
              <option value="1裙" ${detail.configuration === '1裙' ? 'selected' : ''}>单裙</option>
              <option value="1件" ${detail.configuration === '1件' ? 'selected' : ''}>1件</option>
            </select>
          </div>
          <div class="form-group">
            <label>人数 <span class="required">*</span></label>
            <input type="number" name="quantity" class="form-control" value="${detail.quantity || ''}" required>
          </div>
        </div>

        <div class="form-section-title">面料信息</div>

        <div class="form-row">
          <div class="form-group">
            <label>面料采购方</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="fabricPurchaser" value="努派采购" ${detail.fabricPurchaser === '努派采购' ? 'checked' : ''}>
                <span>努派采购</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="fabricPurchaser" value="工厂包料" ${detail.fabricPurchaser === '工厂包料' ? 'checked' : ''}>
                <span>工厂包料</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>面料号</label>
            <input type="text" name="fabricNo" class="form-control" value="${detail.fabricNo || ''}">
          </div>
          <div class="form-group">
            <label>面料品牌</label>
            <input type="text" name="fabricBrand" class="form-control" value="${detail.fabricBrand || ''}" list="brandList">
            <datalist id="brandList">
              ${FABRIC_BRANDS.map(b => `<option value="${b}">`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>面料成分</label>
            <input type="text" name="fabricComposition" class="form-control" value="${detail.fabricComposition || ''}" list="compositionList">
            <datalist id="compositionList">
              ${FABRIC_COMPOSITIONS.map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>
          <div class="form-group">
            <label>面料纱织</label>
            <input type="text" name="fabricYarn" class="form-control" value="${detail.fabricYarn || ''}" placeholder="如：super130">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>面料颜色</label>
            <input type="text" name="fabricColor" class="form-control" value="${detail.fabricColor || ''}" list="colorList">
            <datalist id="colorList">
              ${FABRIC_COLORS.map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-section-title">工艺与生产</div>

        <div class="form-row">
          <div class="form-group">
            <label>工艺模板</label>
            <select name="craftTemplate" class="form-control">
              <option value="标准高端" ${detail.craftTemplate === '标准高端' ? 'selected' : ''}>标准高端</option>
              <option value="经济实惠" ${detail.craftTemplate === '经济实惠' ? 'selected' : ''}>经济实惠</option>
            </select>
          </div>
          <div class="form-group">
            <label>制作工厂</label>
            <select name="factory" class="form-control">
              ${FACTORIES.map(f => `<option value="${f}" ${detail.factory === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>包装要求</label>
            <select name="packaging" class="form-control">
              ${PACKAGING_OPTIONS.map(p => `<option value="${p}" ${detail.packaging === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>款式号</label>
            <input type="text" name="styleNo" class="form-control" value="${detail.styleNo || '按样衣放版'}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>其他要求</label>
            <textarea name="specialRequirements" class="form-control" rows="2">${detail.specialRequirements || ''}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    `;
  },

  // 存货名称变化处理
  onInventoryChange(inventoryName) {
    const inventory = INVENTORY_DATA.find(i => i.name === inventoryName);
    if (!inventory) return;

    const fabricPurchaser = document.querySelector('[name="fabricPurchaser"]:checked')?.value || '努派采购';
    const code = fabricPurchaser === '努派采购' ? inventory.highCode : inventory.code;

    document.querySelector('[name="inventoryCode"]').value = code || '';
  },

  // 保存明细
  saveDetail(index, formData) {
    if (!this.currentProject) return;

    const inventoryName = formData.get('inventoryName');
    const inventory = INVENTORY_DATA.find(i => i.name === inventoryName);
    const fabricPurchaser = formData.get('fabricPurchaser');
    const craftTemplate = formData.get('craftTemplate');

    // 计算编码和名称
    let finalName = inventoryName;
    let code = '';
    if (inventory) {
      if (fabricPurchaser === '努派采购') {
        finalName = inventoryName + '-高';
        code = inventory.highCode;
      } else {
        code = inventory.code;
      }
    }

    // 获取工艺描述
    const category = inventory?.type || '西服';
    const craftDetails = getCraftTemplateDetails(craftTemplate, category);
    const craftDescription = formatCraftDescription(craftDetails, category);

    const detail = {
      inventoryName: finalName,
      inventoryCode: code,
      category,
      configuration: formData.get('configuration'),
      quantity: parseInt(formData.get('quantity')) || 0,
      fabricPurchaser,
      fabricNo: formData.get('fabricNo'),
      fabricBrand: formData.get('fabricBrand'),
      fabricComposition: formData.get('fabricComposition'),
      fabricYarn: formData.get('fabricYarn'),
      fabricColor: formData.get('fabricColor'),
      factory: formData.get('factory'),
      packaging: formData.get('packaging'),
      styleNo: formData.get('styleNo'),
      craftTemplate,
      craftDetails,
      craftDescription,
      specialRequirements: formData.get('specialRequirements'),
      parseStatus: {
        confidence: 1,
        missingFields: [],
        warnings: []
      }
    };

    this.currentProject.details[index] = detail;

    this.closeModal();
    this.renderResult();
    this.showMessage('明细已更新', 'success');
  },

  // 添加明细
  addDetail(formData) {
    if (!this.currentProject) {
      this.currentProject = {
        basicInfo: {},
        details: [],
        warnings: []
      };
    }

    const inventoryName = formData.get('inventoryName');
    const inventory = INVENTORY_DATA.find(i => i.name === inventoryName);
    const fabricPurchaser = formData.get('fabricPurchaser');
    const craftTemplate = formData.get('craftTemplate');

    let finalName = inventoryName;
    let code = '';
    if (inventory) {
      if (fabricPurchaser === '努派采购') {
        finalName = inventoryName + '-高';
        code = inventory.highCode;
      } else {
        code = inventory.code;
      }
    }

    const category = inventory?.type || '西服';
    const craftDetails = getCraftTemplateDetails(craftTemplate, category);
    const craftDescription = formatCraftDescription(craftDetails, category);

    const detail = {
      inventoryName: finalName,
      inventoryCode: code,
      category,
      configuration: formData.get('configuration'),
      quantity: parseInt(formData.get('quantity')) || 0,
      fabricPurchaser,
      fabricNo: formData.get('fabricNo'),
      fabricBrand: formData.get('fabricBrand'),
      fabricComposition: formData.get('fabricComposition'),
      fabricYarn: formData.get('fabricYarn'),
      fabricColor: formData.get('fabricColor'),
      factory: formData.get('factory'),
      packaging: formData.get('packaging'),
      styleNo: formData.get('styleNo'),
      craftTemplate,
      craftDetails,
      craftDescription,
      specialRequirements: formData.get('specialRequirements'),
      parseStatus: {
        confidence: 1,
        missingFields: [],
        warnings: []
      }
    };

    this.currentProject.details.push(detail);

    this.closeModal();
    this.renderResult();
    this.showMessage('明细已添加', 'success');
  },

  // 删除明细
  deleteDetail(index) {
    if (!this.currentProject?.details) return;

    if (confirm('确定删除这条明细吗？')) {
      this.currentProject.details.splice(index, 1);
      this.renderResult();
      this.showMessage('明细已删除', 'success');
    }
  },

  // 关闭弹窗
  closeModal() {
    document.querySelectorAll('.modal.show').forEach(modal => {
      modal.classList.remove('show');
    });
  },

  // 导出Excel
  handleExport() {
    if (!this.currentProject) {
      this.showMessage('没有可导出的数据', 'error');
      return;
    }

    // 保存项目
    Storage.saveProject(this.currentProject);

    // 导出Excel
    ExcelExport.exportProject(this.currentProject);

    this.showMessage('导出成功', 'success');
  },

  // 加载项目
  loadProject(id) {
    const project = Storage.getProject(id);
    if (!project) {
      this.showMessage('项目不存在', 'error');
      return;
    }

    this.currentProject = project;
    this.showResultPage();
  },

  // 删除项目
  deleteProject(id) {
    if (confirm('确定删除这个项目吗？')) {
      Storage.deleteProject(id);
      this.loadRecentProjects();
      this.showMessage('项目已删除', 'success');
    }
  },

  // 显示设置
  showSettings() {
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');
    const apiKey = AIParser.getApiKey();

    content.innerHTML = `
      <h3>设置</h3>
      <form id="settingsForm">
        <div class="form-group">
          <label>DeepSeek API Key</label>
          <input type="password" name="apiKey" class="form-control" value="${apiKey}" placeholder="请输入API Key">
          <p class="hint">用于AI智能解析功能，<a href="https://platform.deepseek.com/" target="_blank">获取API Key</a></p>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary modal-cancel">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    `;

    content.querySelector('#settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      AIParser.setApiKey(formData.get('apiKey'));
      this.closeModal();
      this.showMessage('设置已保存', 'success');
      this.checkApiKey();
    });

    modal.classList.add('show');
  },

  // 显示历史记录
  showHistory() {
    const modal = document.getElementById('editModal');
    const content = document.getElementById('editModalContent');
    const projects = Storage.getAllProjects();

    let html = '<h3>历史项目</h3>';

    if (projects.length === 0) {
      html += '<p class="empty-tip">暂无历史项目</p>';
    } else {
      html += '<div class="history-list">';
      projects.forEach(p => {
        html += `
          <div class="history-item">
            <div class="history-info" data-action="load-project" data-id="${p.id}">
              <span class="customer">${p.basicInfo?.customerName || '未命名'}</span>
              <span class="contract">${p.basicInfo?.contractNo || ''}</span>
              <span class="date">${p.metadata?.createTime?.split('T')[0] || ''}</span>
            </div>
            <button class="btn btn-sm btn-danger-text" data-action="delete-project" data-id="${p.id}">删除</button>
          </div>
        `;
      });
      html += '</div>';
    }

    html += `
      <div class="form-actions">
        <button type="button" class="btn btn-secondary modal-cancel">关闭</button>
      </div>
    `;

    content.innerHTML = html;
    modal.classList.add('show');
  },

  // 显示消息
  showMessage(text, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `message-toast message-${type}`;
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => App.init());

// 导出
window.App = App;
