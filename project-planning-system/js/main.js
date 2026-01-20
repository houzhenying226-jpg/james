/**
 * 北方努派项目规划表智能填写系统 - 主逻辑模块
 * 处理页面导航、事件绑定、UI更新等
 */

// 应用状态管理
const App = {
  // 当前页面
  currentPage: 'home',

  // 存货搜索定时器
  searchTimer: null,

  // 初始化应用
  init() {
    this.bindEvents();
    this.showPage('home');
    this.checkDraft();
  },

  // 绑定事件
  bindEvents() {
    // 导航事件
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (target) {
        const action = target.dataset.action;
        this.handleAction(action, target);
      }
    });

    // 表单变化事件
    document.addEventListener('change', (e) => {
      this.handleFormChange(e);
    });

    // 存货名称搜索
    document.addEventListener('input', (e) => {
      if (e.target.id === 'inventorySearch') {
        this.handleInventorySearch(e.target.value);
      }
    });
  },

  // 处理动作
  handleAction(action, target) {
    switch (action) {
      case 'new-project':
        this.startNewProject();
        break;
      case 'view-history':
        this.showHistoryPage();
        break;
      case 'go-home':
        this.showPage('home');
        break;
      case 'next-step':
        this.goToNextStep();
        break;
      case 'prev-step':
        this.goToPrevStep();
        break;
      case 'add-detail':
        this.addDetailToList();
        break;
      case 'edit-detail':
        const editIndex = parseInt(target.dataset.index);
        this.editDetail(editIndex);
        break;
      case 'delete-detail':
        const deleteIndex = parseInt(target.dataset.index);
        this.deleteDetail(deleteIndex);
        break;
      case 'save-project':
        this.saveProject();
        break;
      case 'export-excel':
        this.exportToExcel();
        break;
      case 'view-project':
        const viewId = target.dataset.id;
        this.viewProject(viewId);
        break;
      case 'edit-project':
        const editId = target.dataset.id;
        this.editProject(editId);
        break;
      case 'delete-project':
        const deleteId = target.dataset.id;
        this.deleteProject(deleteId);
        break;
      case 'export-project':
        const exportId = target.dataset.id;
        this.exportProject(exportId);
        break;
      case 'clear-detail-form':
        this.clearDetailForm();
        break;
      case 'show-settings':
        this.showSettingsModal();
        break;
      case 'close-modal':
        this.closeModal();
        break;
      case 'save-settings':
        this.saveSettings();
        break;
      // AI功能
      case 'ai-match-inventory':
        this.aiMatchInventory();
        break;
      case 'ai-suggest-craft':
        this.aiSuggestCraft();
        break;
      case 'ai-check-project':
        this.aiCheckProject();
        break;
      // 历史记录增强
      case 'search-history':
        this.searchHistory();
        break;
      case 'batch-delete':
        this.batchDeleteProjects();
        break;
      case 'batch-export':
        this.batchExportProjects();
        break;
      case 'toggle-select-all':
        this.toggleSelectAll(target);
        break;
      case 'copy-project':
        const copyId = target.dataset.id;
        this.copyProject(copyId);
        break;
    }
  },

  // 处理表单变化
  handleFormChange(e) {
    const target = e.target;

    // 存货名称变化
    if (target.id === 'inventoryName') {
      this.onInventoryNameChange(target.value);
    }

    // 面料采购方变化
    if (target.name === 'fabricPurchaser') {
      this.onFabricPurchaserChange();
    }

    // 自动保存草稿
    if (FormManager.currentProject && target.closest('#basicInfoForm, #detailForm, #timelineForm')) {
      this.autoSaveDraft();
    }
  },

  // 显示页面
  showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageName;
    }
  },

  // 检查草稿
  checkDraft() {
    const draft = StorageManager.getDraft();
    if (draft && draft.basicInfo) {
      const lastSaved = new Date(draft.lastSaved).toLocaleString();
      if (confirm(`发现未完成的草稿（${lastSaved}保存），是否继续编辑？`)) {
        FormManager.loadProject(draft);
        this.showPage('form');
        this.renderStep1();
      }
    }
  },

  // 开始新项目
  startNewProject() {
    StorageManager.clearDraft();
    FormManager.initNewProject();
    this.showPage('form');
    this.renderStep1();
  },

  // 渲染步骤1：基本信息
  renderStep1() {
    FormManager.currentStep = 1;
    this.updateStepIndicator(1);

    const container = document.getElementById('formContent');
    const info = FormManager.currentProject.basicInfo;

    container.innerHTML = `
      <div class="form-section">
        <h3>项目基本信息</h3>
        <form id="basicInfoForm">
          <div class="form-row">
            <div class="form-group">
              <label>报备日期 <span class="required">*</span></label>
              <input type="date" id="reportDate" class="form-control" value="${info.reportDate}" required>
            </div>
            <div class="form-group">
              <label>合同号 <span class="required">*</span></label>
              <input type="text" id="contractNo" class="form-control" value="${info.contractNo}" placeholder="如：OP25-152" required>
            </div>
            <div class="form-group">
              <label>签订主体 <span class="required">*</span></label>
              <input type="text" id="signingEntity" class="form-control" value="${info.signingEntity}" placeholder="如：山东希努尔" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group form-group-large">
              <label>客户名称 <span class="required">*</span></label>
              <input type="text" id="customerName" class="form-control" value="${info.customerName}" placeholder="如：交银金融租赁有限责任公司" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>项目金额（元）<span class="required">*</span></label>
              <input type="number" id="projectAmount" class="form-control" value="${info.projectAmount}" placeholder="如：2000000" required>
            </div>
            <div class="form-group">
              <label>制装人数（人）<span class="required">*</span></label>
              <input type="number" id="totalPeople" class="form-control" value="${info.totalPeople}" placeholder="如：260" required>
            </div>
            <div class="form-group">
              <label>项目交期 <span class="required">*</span></label>
              <input type="date" id="deliveryDate" class="form-control" value="${info.deliveryDate}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>销售部门 <span class="required">*</span></label>
              <input type="text" id="salesDepartment" class="form-control" value="${info.salesDepartment}" placeholder="如：上海大区部" required>
            </div>
            <div class="form-group">
              <label>销售人员 <span class="required">*</span></label>
              <input type="text" id="salesPerson" class="form-control" value="${info.salesPerson}" placeholder="姓名及手机号" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>产品人员</label>
              <input type="text" id="productPerson" class="form-control" value="${info.productPerson}" placeholder="选填">
            </div>
            <div class="form-group">
              <label>生产人员 <span class="required">*</span></label>
              <input type="text" id="productionPerson" class="form-control" value="${info.productionPerson}" required>
            </div>
            <div class="form-group">
              <label>监管人员</label>
              <input type="text" id="supervisorPerson" class="form-control" value="${info.supervisorPerson}" placeholder="选填">
            </div>
          </div>
        </form>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="go-home">返回首页</button>
        <button type="button" class="btn btn-primary" data-action="next-step">下一步</button>
      </div>
    `;
  },

  // 渲染步骤2：制作明细
  renderStep2() {
    FormManager.currentStep = 2;
    this.updateStepIndicator(2);

    const container = document.getElementById('formContent');
    const details = FormManager.currentProject.details;

    container.innerHTML = `
      <div class="form-section">
        <h3>制作明细</h3>

        <!-- 已添加的明细列表 -->
        <div class="detail-list-section">
          <h4>已添加的明细 <span class="detail-count">(${details.length}条)</span></h4>
          <div id="detailList" class="detail-list">
            ${this.renderDetailList(details)}
          </div>
        </div>

        <!-- 明细编辑表单 -->
        <div class="detail-form-section">
          <h4 id="detailFormTitle">添加新明细</h4>
          <form id="detailForm">
            <div class="form-row">
              <div class="form-group">
                <label>档次</label>
                <input type="text" id="level" class="form-control" placeholder="如：A档、B档">
              </div>
              <div class="form-group form-group-large">
                <label>存货名称 <span class="required">*</span></label>
                <div class="searchable-select">
                  <div class="search-with-ai">
                    <input type="text" id="inventorySearch" class="form-control" placeholder="输入口语描述，如：男士西装三件套..." autocomplete="off">
                    <button type="button" class="btn btn-sm btn-ai" data-action="ai-match-inventory" title="AI智能匹配">AI匹配</button>
                  </div>
                  <select id="inventoryName" class="form-control" required>
                    ${FormManager.generateInventoryDropdownHTML()}
                  </select>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>存货编码</label>
                <input type="text" id="inventoryCode" class="form-control" readonly>
              </div>
              <div class="form-group">
                <label>品类</label>
                <input type="text" id="category" class="form-control" readonly>
              </div>
              <div class="form-group">
                <label>配置 <span class="required">*</span></label>
                <input type="text" id="configuration" class="form-control" placeholder="如：1衣1裤、1衣1裤1马甲" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>人数 <span class="required">*</span></label>
                <input type="number" id="quantity" class="form-control" required>
              </div>
              <div class="form-group">
                <label>单价</label>
                <input type="number" id="unitPrice" class="form-control" placeholder="选填">
              </div>
              <div class="form-group">
                <label>面料采购方 <span class="required">*</span></label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="fabricPurchaser" value="努派采购" checked>
                    <span>努派采购</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="fabricPurchaser" value="工厂包料">
                    <span>工厂包料</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>面料号 <span class="required">*</span></label>
                <input type="text" id="fabricNo" class="form-control" placeholder="如：ZTR00402" required>
              </div>
              <div class="form-group">
                <label>面料品牌 <span class="required">*</span></label>
                <input type="text" id="fabricBrand" class="form-control" placeholder="如：杰尼亚、VBC、1881" required>
              </div>
              <div class="form-group">
                <label>面料成分 <span class="required">*</span></label>
                <input type="text" id="fabricComposition" class="form-control" placeholder="如：100%羊毛" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>面料纱织</label>
                <input type="text" id="fabricYarn" class="form-control" placeholder="如：super150">
              </div>
              <div class="form-group">
                <label>面料颜色 <span class="required">*</span></label>
                <input type="text" id="fabricColor" class="form-control" placeholder="如：深灰、藏青" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>制作工厂 <span class="required">*</span></label>
                <input type="text" id="factory" class="form-control" value="希努尔" required>
              </div>
              <div class="form-group form-group-large">
                <label>包装要求 <span class="required">*</span></label>
                <input type="text" id="packagingRequirement" class="form-control" value="希努尔大货包装" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-large">
                <label>款式号 <span class="required">*</span></label>
                <input type="text" id="styleNo" class="form-control" placeholder="如：按样衣放版、SME051" required>
              </div>
            </div>

            <!-- 工艺要求区域 -->
            <div id="craftOptionsContainer" class="craft-options-container">
              <div class="craft-section">
                <div class="craft-header">
                  <h4>工艺要求 <span class="required">*</span></h4>
                  <button type="button" class="btn btn-sm btn-ai" data-action="ai-suggest-craft" title="AI智能补全工艺要求">AI补全工艺</button>
                </div>
                <p class="hint">请先选择存货名称，系统将自动显示对应的工艺选项</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-large">
                <label>客户特殊要求</label>
                <textarea id="customerSpecialRequirements" class="form-control" rows="2" placeholder="选填"></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>是否下先锋样</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="needSample" value="是">
                    <span>是</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="needSample" value="否" checked>
                    <span>否</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>是否半成品试衣</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" name="needFitting" value="是">
                    <span>是</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="needFitting" value="否" checked>
                    <span>否</span>
                  </label>
                </div>
              </div>
            </div>
          </form>

          <div class="detail-form-actions">
            <button type="button" class="btn btn-secondary" data-action="clear-detail-form">清空表单</button>
            <button type="button" class="btn btn-primary" data-action="add-detail" id="addDetailBtn">添加到列表</button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="prev-step">上一步</button>
        <button type="button" class="btn btn-primary" data-action="next-step">下一步</button>
      </div>
    `;

    // 重置编辑状态
    FormManager.editingDetailIndex = -1;
  },

  // 渲染明细列表
  renderDetailList(details) {
    if (!details || details.length === 0) {
      return '<div class="empty-list">暂无明细，请在下方添加</div>';
    }

    let html = `
      <table class="detail-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>档次</th>
            <th>存货名称</th>
            <th>配置</th>
            <th>人数</th>
            <th>面料</th>
            <th>工厂</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    details.forEach((detail, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${detail.level || '-'}</td>
          <td>${detail.inventoryName || '-'}</td>
          <td>${detail.configuration || '-'}</td>
          <td>${detail.quantity || '-'}</td>
          <td>${detail.fabricBrand || '-'} / ${detail.fabricColor || '-'}</td>
          <td>${detail.factory || '-'}</td>
          <td class="actions">
            <button type="button" class="btn btn-sm btn-secondary" data-action="edit-detail" data-index="${index}">编辑</button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete-detail" data-index="${index}">删除</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  },

  // 渲染步骤3：执行规划时间
  renderStep3() {
    FormManager.currentStep = 3;
    this.updateStepIndicator(3);

    const container = document.getElementById('formContent');
    const timeline = FormManager.currentProject.timeline;

    container.innerHTML = `
      <div class="form-section">
        <h3>执行规划时间</h3>
        <form id="timelineForm">
          <div class="form-row">
            <div class="form-group">
              <label>预计面辅料申请日期</label>
              <input type="date" id="fabricApplyDate" class="form-control" value="${timeline.fabricApplyDate || ''}">
            </div>
            <div class="form-group">
              <label>预计面辅料入库日期</label>
              <input type="date" id="fabricArriveDate" class="form-control" value="${timeline.fabricArriveDate || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>预计量体完成日期</label>
              <input type="date" id="measureCompleteDate" class="form-control" value="${timeline.measureCompleteDate || ''}">
            </div>
            <div class="form-group">
              <label>预计下单完成日期</label>
              <input type="date" id="orderCompleteDate" class="form-control" value="${timeline.orderCompleteDate || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>预计生产下单日期</label>
              <input type="date" id="productionOrderDate" class="form-control" value="${timeline.productionOrderDate || ''}">
            </div>
            <div class="form-group">
              <label>预计生产入库日期</label>
              <input type="date" id="productionCompleteDate" class="form-control" value="${timeline.productionCompleteDate || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>预计交货完成日期</label>
              <input type="date" id="deliveryCompleteDate" class="form-control" value="${timeline.deliveryCompleteDate || ''}">
            </div>
          </div>
        </form>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="prev-step">上一步</button>
        <button type="button" class="btn btn-primary" data-action="next-step">预览</button>
      </div>
    `;
  },

  // 渲染步骤4：预览
  renderStep4() {
    FormManager.currentStep = 4;
    this.updateStepIndicator(4);

    const container = document.getElementById('formContent');
    const project = FormManager.currentProject;
    const info = project.basicInfo;
    const details = project.details;
    const timeline = project.timeline;

    // 验证项目
    const validation = FormManager.validateProject();

    container.innerHTML = `
      <div class="form-section">
        <h3>预览项目规划表</h3>

        ${!validation.isValid ? `
          <div class="validation-warnings">
            <h4>待完善项</h4>
            <ul>
              ${validation.errors.basicInfo.map(e => `<li>${e}</li>`).join('')}
              ${validation.errors.details.map(e => `<li>${e}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="preview-section">
          <h4>项目基本信息</h4>
          <table class="preview-table">
            <tr>
              <th>报备日期</th><td>${info.reportDate || '-'}</td>
              <th>合同号</th><td>${info.contractNo || '-'}</td>
              <th>签订主体</th><td>${info.signingEntity || '-'}</td>
            </tr>
            <tr>
              <th>客户名称</th><td colspan="5">${info.customerName || '-'}</td>
            </tr>
            <tr>
              <th>项目金额</th><td>${info.projectAmount ? Number(info.projectAmount).toLocaleString() + ' 元' : '-'}</td>
              <th>制装人数</th><td>${info.totalPeople ? info.totalPeople + ' 人' : '-'}</td>
              <th>项目交期</th><td>${info.deliveryDate || '-'}</td>
            </tr>
            <tr>
              <th>销售部门</th><td>${info.salesDepartment || '-'}</td>
              <th>销售人员</th><td>${info.salesPerson || '-'}</td>
              <th>产品人员</th><td>${info.productPerson || '-'}</td>
            </tr>
            <tr>
              <th>生产人员</th><td>${info.productionPerson || '-'}</td>
              <th>监管人员</th><td>${info.supervisorPerson || '-'}</td>
              <td colspan="2"></td>
            </tr>
          </table>
        </div>

        <div class="preview-section">
          <h4>制作明细 (${details.length}条)</h4>
          ${details.length > 0 ? `
            <div class="preview-details-wrapper">
              <table class="preview-table preview-details">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>档次</th>
                    <th>存货名称</th>
                    <th>存货编码</th>
                    <th>品类</th>
                    <th>配置</th>
                    <th>人数</th>
                    <th>单价</th>
                    <th>面料采购方</th>
                    <th>面料号</th>
                    <th>面料品牌</th>
                    <th>面料成分</th>
                    <th>面料颜色</th>
                    <th>制作工厂</th>
                    <th>工艺要求</th>
                  </tr>
                </thead>
                <tbody>
                  ${details.map((d, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${d.level || '-'}</td>
                      <td>${d.inventoryName || '-'}</td>
                      <td>${d.inventoryCode || '-'}</td>
                      <td>${d.category || '-'}</td>
                      <td>${d.configuration || '-'}</td>
                      <td>${d.quantity || '-'}</td>
                      <td>${d.unitPrice || '-'}</td>
                      <td>${d.fabricPurchaser || '-'}</td>
                      <td>${d.fabricNo || '-'}</td>
                      <td>${d.fabricBrand || '-'}</td>
                      <td>${d.fabricComposition || '-'}</td>
                      <td>${d.fabricColor || '-'}</td>
                      <td>${d.factory || '-'}</td>
                      <td class="craft-cell">${d.craftRequirements || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p class="empty-notice">暂无制作明细</p>'}
        </div>

        <div class="preview-section">
          <h4>执行规划时间</h4>
          <table class="preview-table">
            <tr>
              <th>预计面辅料申请日期</th><td>${timeline.fabricApplyDate || '-'}</td>
              <th>预计面辅料入库日期</th><td>${timeline.fabricArriveDate || '-'}</td>
            </tr>
            <tr>
              <th>预计量体完成日期</th><td>${timeline.measureCompleteDate || '-'}</td>
              <th>预计下单完成日期</th><td>${timeline.orderCompleteDate || '-'}</td>
            </tr>
            <tr>
              <th>预计生产下单日期</th><td>${timeline.productionOrderDate || '-'}</td>
              <th>预计生产入库日期</th><td>${timeline.productionCompleteDate || '-'}</td>
            </tr>
            <tr>
              <th>预计交货完成日期</th><td>${timeline.deliveryCompleteDate || '-'}</td>
              <td colspan="2"></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="prev-step">返回修改</button>
        <button type="button" class="btn btn-ai" data-action="ai-check-project">AI智能检查</button>
        <button type="button" class="btn btn-secondary" data-action="save-project">保存到本地</button>
        <button type="button" class="btn btn-primary" data-action="export-excel">导出Excel</button>
      </div>
    `;
  },

  // 更新步骤指示器
  updateStepIndicator(step) {
    document.querySelectorAll('.step').forEach((el, index) => {
      el.classList.remove('active', 'completed');
      if (index + 1 < step) {
        el.classList.add('completed');
      } else if (index + 1 === step) {
        el.classList.add('active');
      }
    });
  },

  // 下一步
  goToNextStep() {
    const currentStep = FormManager.currentStep;

    // 保存当前步骤数据
    if (currentStep === 1) {
      this.saveBasicInfo();
      const errors = FormManager.validateBasicInfo();
      if (errors.length > 0) {
        this.showMessage(errors.join('\n'), 'error');
        return;
      }
      this.renderStep2();
    } else if (currentStep === 2) {
      if (FormManager.currentProject.details.length === 0) {
        this.showMessage('请至少添加一条制作明细', 'error');
        return;
      }
      this.renderStep3();
    } else if (currentStep === 3) {
      this.saveTimeline();
      this.renderStep4();
    }
  },

  // 上一步
  goToPrevStep() {
    const currentStep = FormManager.currentStep;

    if (currentStep === 2) {
      this.renderStep1();
    } else if (currentStep === 3) {
      this.renderStep2();
    } else if (currentStep === 4) {
      this.saveTimeline();
      this.renderStep3();
    }
  },

  // 保存基本信息
  saveBasicInfo() {
    const info = FormManager.currentProject.basicInfo;
    const fields = [
      'reportDate', 'contractNo', 'signingEntity', 'customerName',
      'projectAmount', 'totalPeople', 'deliveryDate',
      'salesDepartment', 'salesPerson', 'productPerson',
      'productionPerson', 'supervisorPerson'
    ];

    fields.forEach(field => {
      const input = document.getElementById(field);
      if (input) {
        info[field] = input.value.trim();
      }
    });
  },

  // 保存时间规划
  saveTimeline() {
    const timeline = FormManager.currentProject.timeline;
    const fields = [
      'fabricApplyDate', 'fabricArriveDate', 'measureCompleteDate',
      'orderCompleteDate', 'productionOrderDate', 'productionCompleteDate',
      'deliveryCompleteDate'
    ];

    fields.forEach(field => {
      const input = document.getElementById(field);
      if (input) {
        timeline[field] = input.value;
      }
    });
  },

  // 存货名称变化处理
  onInventoryNameChange(inventoryName) {
    // 处理"显示全部存货"特殊选项
    if (inventoryName === '__show_all__') {
      const select = document.getElementById('inventoryName');
      select.innerHTML = FormManager.generateInventoryDropdownHTML();
      // 清空搜索框
      const searchInput = document.getElementById('inventorySearch');
      if (searchInput) searchInput.value = '';
      return;
    }

    if (!inventoryName) {
      document.getElementById('inventoryCode').value = '';
      document.getElementById('category').value = '';
      document.getElementById('craftOptionsContainer').innerHTML = `
        <div class="craft-section">
          <div class="craft-header">
            <h4>工艺要求 <span class="required">*</span></h4>
            <button type="button" class="btn btn-sm btn-ai" data-action="ai-suggest-craft" title="AI智能补全工艺要求">AI补全工艺</button>
          </div>
          <p class="hint">请先选择存货名称，系统将自动显示对应的工艺选项</p>
        </div>
      `;
      return;
    }

    // 获取面料采购方
    const fabricPurchaser = document.querySelector('input[name="fabricPurchaser"]:checked').value;

    // 更新存货编码
    const code = getInventoryCode(inventoryName, fabricPurchaser);
    document.getElementById('inventoryCode').value = code;

    // 更新品类
    const type = getInventoryType(inventoryName);
    document.getElementById('category').value = type;

    // 更新工艺选项
    const craftOptionsHTML = FormManager.generateCraftOptionsHTML(inventoryName);
    document.getElementById('craftOptionsContainer').innerHTML = craftOptionsHTML;
  },

  // 面料采购方变化处理
  onFabricPurchaserChange() {
    const inventoryName = document.getElementById('inventoryName').value;
    if (inventoryName) {
      const fabricPurchaser = document.querySelector('input[name="fabricPurchaser"]:checked').value;
      const code = getInventoryCode(inventoryName, fabricPurchaser);
      document.getElementById('inventoryCode').value = code;
    }
  },

  // 存货名称搜索
  handleInventorySearch(keyword) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const select = document.getElementById('inventoryName');
      const results = searchInventory(keyword);

      // 重新生成下拉选项
      let html = '';

      if (!keyword) {
        // 无搜索词：显示全部（按类型分组）
        html = FormManager.generateInventoryDropdownHTML();
      } else if (results.length > 0) {
        // 有搜索结果：显示匹配项
        html = '<option value="">请选择存货名称</option>';
        results.forEach(item => {
          html += `<option value="${item.name}" data-code="${item.code}" data-type="${item.type}" data-category="${item.category}">${item.name}</option>`;
        });
        // 添加查看全部选项
        html += `<option value="" disabled>───────────</option>`;
        html += `<option value="__show_all__">显示全部存货...</option>`;
      } else {
        // 无匹配结果：显示提示和全部选项
        html = '<option value="">未找到匹配项，请查看全部</option>';
        html += `<option value="__show_all__">显示全部存货...</option>`;
        html += `<option value="" disabled>───────────</option>`;
        // 显示所有选项供用户选择
        window.INVENTORY_DATA.forEach(item => {
          html += `<option value="${item.name}" data-code="${item.code}" data-type="${item.type}" data-category="${item.category}">${item.name}</option>`;
        });
      }

      select.innerHTML = html;
    }, 200);
  },

  // 添加明细到列表
  addDetailToList() {
    const detail = this.collectDetailData();

    // 验证
    const errors = FormManager.validateDetail(detail);
    if (errors.length > 0) {
      this.showMessage(errors.join('\n'), 'error');
      return;
    }

    if (FormManager.editingDetailIndex >= 0) {
      // 更新现有明细
      FormManager.updateDetail(FormManager.editingDetailIndex, detail);
      FormManager.editingDetailIndex = -1;
      document.getElementById('detailFormTitle').textContent = '添加新明细';
      document.getElementById('addDetailBtn').textContent = '添加到列表';
    } else {
      // 添加新明细
      FormManager.addDetail(detail);
    }

    // 刷新列表
    const listContainer = document.getElementById('detailList');
    listContainer.innerHTML = this.renderDetailList(FormManager.currentProject.details);

    // 更新计数
    document.querySelector('.detail-count').textContent = `(${FormManager.currentProject.details.length}条)`;

    // 清空表单
    this.clearDetailForm();

    this.showMessage('明细已添加', 'success');
  },

  // 收集明细表单数据
  collectDetailData() {
    // 收集工艺选项
    const craftOptions = FormManager.collectCraftOptions();
    const craftText = FormManager.craftOptionsToText(craftOptions);

    return {
      level: document.getElementById('level').value.trim(),
      inventoryName: document.getElementById('inventoryName').value,
      inventoryCode: document.getElementById('inventoryCode').value,
      category: document.getElementById('category').value,
      configuration: document.getElementById('configuration').value.trim(),
      quantity: document.getElementById('quantity').value,
      unitPrice: document.getElementById('unitPrice').value,
      fabricPurchaser: document.querySelector('input[name="fabricPurchaser"]:checked').value,
      fabricNo: document.getElementById('fabricNo').value.trim(),
      fabricBrand: document.getElementById('fabricBrand').value.trim(),
      fabricComposition: document.getElementById('fabricComposition').value.trim(),
      fabricYarn: document.getElementById('fabricYarn').value.trim(),
      fabricColor: document.getElementById('fabricColor').value.trim(),
      factory: document.getElementById('factory').value.trim(),
      packagingRequirement: document.getElementById('packagingRequirement').value.trim(),
      styleNo: document.getElementById('styleNo').value.trim(),
      craftRequirements: craftText,
      craftOptions: craftOptions, // 保存原始选项用于编辑
      customerSpecialRequirements: document.getElementById('customerSpecialRequirements').value.trim(),
      needSample: document.querySelector('input[name="needSample"]:checked').value,
      needFitting: document.querySelector('input[name="needFitting"]:checked').value
    };
  },

  // 编辑明细
  editDetail(index) {
    const detail = FormManager.currentProject.details[index];
    if (!detail) return;

    FormManager.editingDetailIndex = index;
    document.getElementById('detailFormTitle').textContent = `编辑明细 #${index + 1}`;
    document.getElementById('addDetailBtn').textContent = '更新明细';

    // 填充表单
    document.getElementById('level').value = detail.level || '';
    document.getElementById('inventoryName').value = detail.inventoryName || '';
    document.getElementById('configuration').value = detail.configuration || '';
    document.getElementById('quantity').value = detail.quantity || '';
    document.getElementById('unitPrice').value = detail.unitPrice || '';
    document.getElementById('fabricNo').value = detail.fabricNo || '';
    document.getElementById('fabricBrand').value = detail.fabricBrand || '';
    document.getElementById('fabricComposition').value = detail.fabricComposition || '';
    document.getElementById('fabricYarn').value = detail.fabricYarn || '';
    document.getElementById('fabricColor').value = detail.fabricColor || '';
    document.getElementById('factory').value = detail.factory || '希努尔';
    document.getElementById('packagingRequirement').value = detail.packagingRequirement || '希努尔大货包装';
    document.getElementById('styleNo').value = detail.styleNo || '';
    document.getElementById('customerSpecialRequirements').value = detail.customerSpecialRequirements || '';

    // 设置单选框
    document.querySelector(`input[name="fabricPurchaser"][value="${detail.fabricPurchaser || '努派采购'}"]`).checked = true;
    document.querySelector(`input[name="needSample"][value="${detail.needSample || '否'}"]`).checked = true;
    document.querySelector(`input[name="needFitting"][value="${detail.needFitting || '否'}"]`).checked = true;

    // 触发存货名称变化以更新编码和工艺选项
    this.onInventoryNameChange(detail.inventoryName);

    // 恢复工艺选项值
    if (detail.craftOptions) {
      setTimeout(() => {
        for (const [key, value] of Object.entries(detail.craftOptions)) {
          if (key === 'other') {
            const otherTextarea = document.getElementById('craftOther');
            if (otherTextarea) otherTextarea.value = value;
          } else {
            const radio = document.querySelector(`input[name="craft_${key}"][value="${value}"]`);
            if (radio) radio.checked = true;

            const input = document.querySelector(`input[name="craft_${key}"]`);
            if (input && input.type === 'text') input.value = value;
          }
        }
      }, 100);
    }

    // 滚动到表单
    document.getElementById('detailForm').scrollIntoView({ behavior: 'smooth' });
  },

  // 删除明细
  deleteDetail(index) {
    if (confirm(`确定要删除第 ${index + 1} 条明细吗？`)) {
      FormManager.deleteDetail(index);

      // 刷新列表
      const listContainer = document.getElementById('detailList');
      listContainer.innerHTML = this.renderDetailList(FormManager.currentProject.details);

      // 更新计数
      document.querySelector('.detail-count').textContent = `(${FormManager.currentProject.details.length}条)`;

      // 如果正在编辑的是被删除的项，重置编辑状态
      if (FormManager.editingDetailIndex === index) {
        FormManager.editingDetailIndex = -1;
        document.getElementById('detailFormTitle').textContent = '添加新明细';
        document.getElementById('addDetailBtn').textContent = '添加到列表';
        this.clearDetailForm();
      } else if (FormManager.editingDetailIndex > index) {
        // 调整编辑索引
        FormManager.editingDetailIndex--;
      }

      this.showMessage('明细已删除', 'success');
    }
  },

  // 清空明细表单
  clearDetailForm() {
    FormManager.editingDetailIndex = -1;

    const form = document.getElementById('detailForm');
    if (form) {
      form.reset();

      // 重置默认值
      document.getElementById('factory').value = '希努尔';
      document.getElementById('packagingRequirement').value = '希努尔大货包装';
      document.querySelector('input[name="fabricPurchaser"][value="努派采购"]').checked = true;
      document.querySelector('input[name="needSample"][value="否"]').checked = true;
      document.querySelector('input[name="needFitting"][value="否"]').checked = true;

      // 清空自动填充的字段
      document.getElementById('inventoryCode').value = '';
      document.getElementById('category').value = '';

      // 重置工艺选项
      document.getElementById('craftOptionsContainer').innerHTML = `
        <div class="craft-section">
          <h4>工艺要求 <span class="required">*</span></h4>
          <p class="hint">请先选择存货名称，系统将自动显示对应的工艺选项</p>
        </div>
      `;

      // 重置表单标题和按钮
      document.getElementById('detailFormTitle').textContent = '添加新明细';
      document.getElementById('addDetailBtn').textContent = '添加到列表';
    }
  },

  // 保存项目
  saveProject() {
    // 先保存当前步骤的数据
    if (FormManager.currentStep === 1) {
      this.saveBasicInfo();
    } else if (FormManager.currentStep === 3) {
      this.saveTimeline();
    }

    const result = StorageManager.saveProject(FormManager.currentProject);
    if (result.success) {
      StorageManager.clearDraft();
      this.showMessage('项目已保存', 'success');
    } else {
      this.showMessage('保存失败：' + result.error, 'error');
    }
  },

  // 导出Excel
  exportToExcel() {
    const result = ExcelExporter.exportToExcel(FormManager.currentProject);
    if (result.success) {
      this.showMessage(`已导出：${result.fileName}`, 'success');
    } else {
      this.showMessage('导出失败：' + result.error, 'error');
    }
  },

  // 自动保存草稿
  autoSaveDraft() {
    // 保存当前步骤数据
    if (FormManager.currentStep === 1) {
      this.saveBasicInfo();
    } else if (FormManager.currentStep === 3) {
      this.saveTimeline();
    }

    StorageManager.saveDraft(FormManager.currentProject);
  },

  // 显示历史记录页面
  showHistoryPage() {
    this.showPage('history');
    this.renderHistoryList();
  },

  // 渲染历史记录列表
  renderHistoryList() {
    const container = document.getElementById('historyList');
    const projects = StorageManager.getAllProjects();

    if (projects.length === 0) {
      container.innerHTML = '<div class="empty-list">暂无历史记录</div>';
      return;
    }

    let html = `
      <table class="history-table">
        <thead>
          <tr>
            <th>客户名称</th>
            <th>合同号</th>
            <th>项目金额</th>
            <th>制装人数</th>
            <th>保存时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    projects.forEach(project => {
      const info = project.basicInfo || {};
      const meta = project.metadata || {};
      html += `
        <tr>
          <td>${info.customerName || '未命名'}</td>
          <td>${info.contractNo || '-'}</td>
          <td>${info.projectAmount ? Number(info.projectAmount).toLocaleString() + ' 元' : '-'}</td>
          <td>${info.totalPeople ? info.totalPeople + ' 人' : '-'}</td>
          <td>${meta.updateTime ? new Date(meta.updateTime).toLocaleString() : '-'}</td>
          <td class="actions">
            <button type="button" class="btn btn-sm btn-secondary" data-action="view-project" data-id="${project.id}">查看</button>
            <button type="button" class="btn btn-sm btn-secondary" data-action="edit-project" data-id="${project.id}">编辑</button>
            <button type="button" class="btn btn-sm btn-secondary" data-action="export-project" data-id="${project.id}">导出</button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete-project" data-id="${project.id}">删除</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  },

  // 查看项目
  viewProject(id) {
    const project = StorageManager.getProjectById(id);
    if (project) {
      FormManager.loadProject(project);
      this.showPage('form');
      this.renderStep4();
    }
  },

  // 编辑项目
  editProject(id) {
    const project = StorageManager.getProjectById(id);
    if (project) {
      FormManager.loadProject(project);
      this.showPage('form');
      this.renderStep1();
    }
  },

  // 删除项目
  deleteProject(id) {
    if (confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      const result = StorageManager.deleteProject(id);
      if (result.success) {
        this.renderHistoryList();
        this.showMessage('项目已删除', 'success');
      } else {
        this.showMessage('删除失败', 'error');
      }
    }
  },

  // 导出项目
  exportProject(id) {
    const project = StorageManager.getProjectById(id);
    if (project) {
      const result = ExcelExporter.exportToExcel(project);
      if (result.success) {
        this.showMessage(`已导出：${result.fileName}`, 'success');
      } else {
        this.showMessage('导出失败：' + result.error, 'error');
      }
    }
  },

  // 显示消息提示
  showMessage(message, type = 'info') {
    // 移除现有消息
    const existingMsg = document.querySelector('.message-toast');
    if (existingMsg) existingMsg.remove();

    const toast = document.createElement('div');
    toast.className = `message-toast message-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // 显示设置弹窗
  showSettingsModal() {
    const settings = StorageManager.getSettings();
    const modal = document.getElementById('settingsModal');
    document.getElementById('apiKey').value = settings.apiKey || '';
    modal.classList.add('show');
  },

  // 关闭弹窗
  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  },

  // 保存设置
  saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    StorageManager.saveSettings({ apiKey });
    this.closeModal();
    this.showMessage('设置已保存', 'success');
  },

  // ========== AI功能 ==========

  // AI智能匹配存货名称
  async aiMatchInventory() {
    if (!AIService.isAvailable()) {
      this.showMessage('请先在设置中配置DeepSeek API Key', 'error');
      return;
    }

    const searchInput = document.getElementById('inventorySearch');
    const userInput = searchInput ? searchInput.value.trim() : '';

    if (!userInput) {
      this.showMessage('请先输入存货描述', 'error');
      return;
    }

    // 显示加载状态
    const btn = document.querySelector('[data-action="ai-match-inventory"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.textContent = '匹配中...';
      btn.disabled = true;
    }

    try {
      const result = await AIService.matchInventoryName(userInput);

      if (result.success && result.data.matchedName) {
        // 设置下拉框值
        const select = document.getElementById('inventoryName');
        if (select) {
          select.value = result.data.matchedName;
          this.onInventoryNameChange(result.data.matchedName);
        }

        // 如果有配置建议，填充配置字段
        if (result.data.suggestedConfiguration) {
          const configInput = document.getElementById('configuration');
          if (configInput && !configInput.value) {
            configInput.value = result.data.suggestedConfiguration;
          }
        }

        this.showMessage(`已匹配：${result.data.matchedName}（${result.data.confidence}置信度）`, 'success');
      } else {
        this.showMessage(result.data?.reason || result.error || '未找到匹配的存货', 'error');
      }
    } catch (e) {
      this.showMessage('AI匹配失败：' + e.message, 'error');
    } finally {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  },

  // AI智能补全工艺要求
  async aiSuggestCraft() {
    if (!AIService.isAvailable()) {
      this.showMessage('请先在设置中配置DeepSeek API Key', 'error');
      return;
    }

    const inventoryName = document.getElementById('inventoryName').value;
    if (!inventoryName) {
      this.showMessage('请先选择存货名称', 'error');
      return;
    }

    const level = document.getElementById('level').value || '标准';
    const fabricBrand = document.getElementById('fabricBrand').value || '';

    // 显示加载状态
    const btn = document.querySelector('[data-action="ai-suggest-craft"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.textContent = '生成中...';
      btn.disabled = true;
    }

    try {
      const result = await AIService.suggestCraftRequirements(inventoryName, level, fabricBrand);

      if (result.success && result.data) {
        // 填充工艺选项
        if (result.data.recommendations) {
          for (const [key, value] of Object.entries(result.data.recommendations)) {
            const radio = document.querySelector(`input[name="craft_${key}"][value="${value}"]`);
            if (radio) {
              radio.checked = true;
            }

            const input = document.querySelector(`input[name="craft_${key}"]`);
            if (input && input.type === 'text') {
              input.value = value;
            }
          }
        }

        // 填充其他工艺要求
        if (result.data.craftText) {
          const otherTextarea = document.getElementById('craftOther');
          if (otherTextarea && !otherTextarea.value) {
            otherTextarea.value = result.data.craftText;
          }
        }

        this.showMessage('工艺要求已智能补全', 'success');

        // 显示推荐理由
        if (result.data.reason) {
          this.showAITip(result.data.reason);
        }
      } else {
        this.showMessage(result.error || '工艺补全失败', 'error');
      }
    } catch (e) {
      this.showMessage('AI补全失败：' + e.message, 'error');
    } finally {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  },

  // AI检查项目完整性
  async aiCheckProject() {
    if (!AIService.isAvailable()) {
      this.showMessage('请先在设置中配置DeepSeek API Key', 'error');
      return;
    }

    // 显示加载状态
    const btn = document.querySelector('[data-action="ai-check-project"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.textContent = 'AI检查中...';
      btn.disabled = true;
    }

    try {
      const result = await AIService.checkProjectCompleteness(FormManager.currentProject);

      if (result.success && result.data) {
        this.showAICheckResult(result.data);
      } else {
        this.showMessage(result.error || 'AI检查失败', 'error');
      }
    } catch (e) {
      this.showMessage('AI检查失败：' + e.message, 'error');
    } finally {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  },

  // 显示AI检查结果
  showAICheckResult(data) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'aiCheckModal';

    const scoreClass = data.score >= 80 ? 'score-good' : (data.score >= 60 ? 'score-medium' : 'score-bad');

    let issuesHtml = '';
    if (data.issues && data.issues.length > 0) {
      issuesHtml = `
        <div class="ai-check-section">
          <h4>发现的问题</h4>
          <ul class="ai-issues-list">
            ${data.issues.map(issue => `
              <li class="issue-${issue.type}">
                <span class="issue-field">${issue.field}</span>
                <span class="issue-type">${issue.type}</span>
                <span class="issue-message">${issue.message}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    let suggestionsHtml = '';
    if (data.suggestions && data.suggestions.length > 0) {
      suggestionsHtml = `
        <div class="ai-check-section">
          <h4>改进建议</h4>
          <ul class="ai-suggestions-list">
            ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>AI智能检查结果</h3>
          <button type="button" class="modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="ai-check-score ${scoreClass}">
            <div class="score-circle">
              <span class="score-value">${data.score || 0}</span>
              <span class="score-label">完整度评分</span>
            </div>
            <div class="score-status">
              ${data.isComplete ? '<span class="status-complete">表格完整</span>' : '<span class="status-incomplete">待完善</span>'}
            </div>
          </div>
          ${issuesHtml}
          ${suggestionsHtml}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-action="close-modal">知道了</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  // 显示AI提示
  showAITip(tip) {
    const tipEl = document.createElement('div');
    tipEl.className = 'ai-tip';
    tipEl.innerHTML = `
      <div class="ai-tip-icon">AI</div>
      <div class="ai-tip-content">${tip}</div>
      <button class="ai-tip-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    const container = document.getElementById('craftOptionsContainer');
    if (container) {
      const existingTip = container.querySelector('.ai-tip');
      if (existingTip) existingTip.remove();
      container.insertBefore(tipEl, container.firstChild);
    }
  },

  // ========== 历史记录增强功能 ==========

  // 渲染增强的历史记录列表
  renderHistoryList(searchKeyword = '') {
    const container = document.getElementById('historyList');
    const projects = searchKeyword ?
      StorageManager.searchProjects(searchKeyword) :
      StorageManager.getAllProjects();

    const storageInfo = StorageManager.getStorageInfo();

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="history-toolbar">
          <div class="search-box">
            <input type="text" id="historySearch" class="form-control" placeholder="搜索客户名称、合同号..." value="${searchKeyword}">
            <button type="button" class="btn btn-primary" data-action="search-history">搜索</button>
          </div>
          <div class="storage-info">
            已存储 ${storageInfo.projectCount} 个项目，占用 ${storageInfo.usedMB} MB
          </div>
        </div>
        <div class="empty-list">${searchKeyword ? '未找到匹配的项目' : '暂无历史记录'}</div>
      `;
      return;
    }

    let html = `
      <div class="history-toolbar">
        <div class="search-box">
          <input type="text" id="historySearch" class="form-control" placeholder="搜索客户名称、合同号..." value="${searchKeyword}">
          <button type="button" class="btn btn-primary" data-action="search-history">搜索</button>
        </div>
        <div class="batch-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="batch-export">批量导出</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="batch-delete">批量删除</button>
        </div>
        <div class="storage-info">
          已存储 ${storageInfo.projectCount} 个项目，占用 ${storageInfo.usedMB} MB
        </div>
      </div>
      <table class="history-table">
        <thead>
          <tr>
            <th class="check-col">
              <input type="checkbox" id="selectAll" data-action="toggle-select-all">
            </th>
            <th>客户名称</th>
            <th>合同号</th>
            <th>项目金额</th>
            <th>制装人数</th>
            <th>明细数</th>
            <th>保存时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    projects.forEach(project => {
      const info = project.basicInfo || {};
      const meta = project.metadata || {};
      const detailCount = project.details ? project.details.length : 0;

      html += `
        <tr data-id="${project.id}">
          <td class="check-col">
            <input type="checkbox" class="project-checkbox" value="${project.id}">
          </td>
          <td>${info.customerName || '未命名'}</td>
          <td>${info.contractNo || '-'}</td>
          <td>${info.projectAmount ? Number(info.projectAmount).toLocaleString() + ' 元' : '-'}</td>
          <td>${info.totalPeople ? info.totalPeople + ' 人' : '-'}</td>
          <td>${detailCount} 条</td>
          <td>${meta.updateTime ? new Date(meta.updateTime).toLocaleString() : '-'}</td>
          <td class="actions">
            <button type="button" class="btn btn-sm btn-secondary" data-action="view-project" data-id="${project.id}">查看</button>
            <button type="button" class="btn btn-sm btn-secondary" data-action="edit-project" data-id="${project.id}">编辑</button>
            <button type="button" class="btn btn-sm btn-secondary" data-action="copy-project" data-id="${project.id}">复制</button>
            <button type="button" class="btn btn-sm btn-secondary" data-action="export-project" data-id="${project.id}">导出</button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete-project" data-id="${project.id}">删除</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // 绑定搜索框回车事件
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchHistory();
        }
      });
    }
  },

  // 搜索历史记录
  searchHistory() {
    const keyword = document.getElementById('historySearch').value.trim();
    this.renderHistoryList(keyword);
  },

  // 全选/取消全选
  toggleSelectAll(checkbox) {
    const isChecked = checkbox.checked;
    document.querySelectorAll('.project-checkbox').forEach(cb => {
      cb.checked = isChecked;
    });
  },

  // 获取选中的项目ID
  getSelectedProjectIds() {
    const ids = [];
    document.querySelectorAll('.project-checkbox:checked').forEach(cb => {
      ids.push(cb.value);
    });
    return ids;
  },

  // 批量删除
  batchDeleteProjects() {
    const ids = this.getSelectedProjectIds();
    if (ids.length === 0) {
      this.showMessage('请先选择要删除的项目', 'error');
      return;
    }

    if (confirm(`确定要删除选中的 ${ids.length} 个项目吗？此操作不可恢复。`)) {
      let successCount = 0;
      ids.forEach(id => {
        const result = StorageManager.deleteProject(id);
        if (result.success) successCount++;
      });

      this.renderHistoryList();
      this.showMessage(`已删除 ${successCount} 个项目`, 'success');
    }
  },

  // 批量导出
  batchExportProjects() {
    const ids = this.getSelectedProjectIds();
    if (ids.length === 0) {
      this.showMessage('请先选择要导出的项目', 'error');
      return;
    }

    const projects = ids.map(id => StorageManager.getProjectById(id)).filter(p => p);

    if (projects.length === 1) {
      // 单个项目直接导出
      const result = ExcelExporter.exportToExcel(projects[0]);
      if (result.success) {
        this.showMessage(`已导出：${result.fileName}`, 'success');
      }
    } else {
      // 多个项目导出列表
      const result = ExcelExporter.exportProjectList(projects);
      if (result.success) {
        this.showMessage(`已导出 ${projects.length} 个项目的汇总表`, 'success');
      }
    }
  },

  // 复制项目
  copyProject(id) {
    const project = StorageManager.getProjectById(id);
    if (project) {
      // 创建副本
      const copy = JSON.parse(JSON.stringify(project));
      delete copy.id;
      copy.basicInfo.customerName = (copy.basicInfo.customerName || '') + ' (副本)';
      copy.metadata = {
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      };

      const result = StorageManager.saveProject(copy);
      if (result.success) {
        this.renderHistoryList();
        this.showMessage('项目已复制', 'success');
      } else {
        this.showMessage('复制失败：' + result.error, 'error');
      }
    }
  },

  // ========== 增强的表单验证 ==========

  // 实时验证表单字段
  validateFieldRealtime(input) {
    const fieldId = input.id;
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');

    // 移除之前的错误状态
    input.classList.remove('error');
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();

    // 检查必填
    if (isRequired && !value) {
      this.showFieldError(input, '此字段为必填项');
      return false;
    }

    // 特定字段验证
    if (fieldId === 'projectAmount' || fieldId === 'totalPeople' || fieldId === 'quantity') {
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        this.showFieldError(input, '请输入有效的数字');
        return false;
      }
    }

    if (fieldId === 'contractNo' && value) {
      // 合同号格式验证（可选）
      if (!/^[A-Z]{2}\d{2}-\d{1,4}$/i.test(value) && !value.includes('-')) {
        this.showFieldHint(input, '建议格式：OP25-152');
      }
    }

    return true;
  },

  // 显示字段错误
  showFieldError(input, message) {
    input.classList.add('error');
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    input.parentElement.appendChild(error);
  },

  // 显示字段提示
  showFieldHint(input, message) {
    const existingHint = input.parentElement.querySelector('.field-hint');
    if (existingHint) existingHint.remove();

    const hint = document.createElement('div');
    hint.className = 'field-hint';
    hint.textContent = message;
    input.parentElement.appendChild(hint);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出给其他模块使用
window.App = App;
