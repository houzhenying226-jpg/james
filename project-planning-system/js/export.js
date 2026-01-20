/**
 * 北方努派项目规划表智能填写系统 - Excel导出模块
 * 使用SheetJS (xlsx) 库生成Excel文件
 */

const ExcelExporter = {
  // 导出项目为Excel文件
  exportToExcel(project) {
    if (!window.XLSX) {
      alert('Excel导出库加载失败，请刷新页面重试');
      return;
    }

    try {
      // 创建工作簿
      const workbook = XLSX.utils.book_new();

      // 创建项目规划表数据
      const sheetData = this.generateSheetData(project);

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 5 },   // 序号
        { wch: 8 },   // 档次
        { wch: 20 },  // 存货名称
        { wch: 15 },  // 存货编码
        { wch: 10 },  // 品类
        { wch: 15 },  // 配置
        { wch: 8 },   // 人数
        { wch: 10 },  // 单价
        { wch: 12 },  // 面料采购方
        { wch: 15 },  // 面料号
        { wch: 12 },  // 面料品牌
        { wch: 15 },  // 面料成分
        { wch: 12 },  // 面料纱织
        { wch: 10 },  // 面料颜色
        { wch: 12 },  // 制作工厂
        { wch: 18 },  // 包装要求
        { wch: 15 },  // 款式号
        { wch: 40 },  // 工艺要求
        { wch: 25 },  // 客户特殊要求
        { wch: 12 },  // 是否下先锋样
        { wch: 12 }   // 是否半成品试衣
      ];

      // 设置合并单元格
      worksheet['!merges'] = this.getMergeRanges(project);

      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '项目规划表');

      // 生成文件名
      const basicInfo = project.basicInfo || {};
      const fileName = `项目规划表_${basicInfo.customerName || '未命名'}_${basicInfo.contractNo || ''}_${this.formatDateForFileName(new Date())}.xlsx`;

      // 导出文件
      XLSX.writeFile(workbook, fileName);

      return { success: true, fileName };
    } catch (e) {
      console.error('导出Excel失败:', e);
      return { success: false, error: e.message };
    }
  },

  // 生成工作表数据
  generateSheetData(project) {
    const basicInfo = project.basicInfo || {};
    const details = project.details || [];
    const timeline = project.timeline || {};

    const data = [];

    // 第1行：标题行
    data.push([
      '项目交接及规划表', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]);

    // 第2行：项目基本信息标题
    data.push([
      '', '', '报备日期', '合同号', '签订主体', '客户名称', '', '', '', '', '', '项目金额（元）', '制装人数（人）', '项目交期', '销售部门', '销售人员', '产品人员', '生产人员', '监管人员', '', ''
    ]);

    // 第3行：项目基本信息数据
    data.push([
      '', '',
      basicInfo.reportDate || '',
      basicInfo.contractNo || '',
      basicInfo.signingEntity || '',
      basicInfo.customerName || '',
      '', '', '', '', '',
      basicInfo.projectAmount || '',
      basicInfo.totalPeople || '',
      basicInfo.deliveryDate || '',
      basicInfo.salesDepartment || '',
      basicInfo.salesPerson || '',
      basicInfo.productPerson || '',
      basicInfo.productionPerson || '',
      basicInfo.supervisorPerson || '',
      '', ''
    ]);

    // 第4行：空行
    data.push([]);

    // 第5行：制作明细标题
    data.push([
      '序号', '档次', '存货名称', '存货编码', '品类', '配置', '人数', '单价',
      '面料采购方', '面料号', '面料品牌', '面料成分', '面料纱织', '面料颜色',
      '制作工厂', '包装要求', '款式号', '工艺要求', '客户特殊要求',
      '是否下先锋样', '是否半成品试衣'
    ]);

    // 制作明细数据
    details.forEach((detail, index) => {
      data.push([
        index + 1,
        detail.level || '',
        detail.inventoryName || '',
        detail.inventoryCode || '',
        detail.category || '',
        detail.configuration || '',
        detail.quantity || '',
        detail.unitPrice || '',
        detail.fabricPurchaser || '',
        detail.fabricNo || '',
        detail.fabricBrand || '',
        detail.fabricComposition || '',
        detail.fabricYarn || '',
        detail.fabricColor || '',
        detail.factory || '',
        detail.packagingRequirement || '',
        detail.styleNo || '',
        detail.craftRequirements || '',
        detail.customerSpecialRequirements || '',
        detail.needSample || '',
        detail.needFitting || ''
      ]);
    });

    // 空行
    data.push([]);
    data.push([]);

    // 执行规划时间标题
    data.push(['执行规划时间']);

    // 时间规划表头
    data.push([
      '预计面辅料申请日期', '预计面辅料入库日期', '预计量体完成日期',
      '预计下单完成日期', '预计生产下单日期', '预计生产入库日期', '预计交货完成日期'
    ]);

    // 时间规划数据
    data.push([
      timeline.fabricApplyDate || '',
      timeline.fabricArriveDate || '',
      timeline.measureCompleteDate || '',
      timeline.orderCompleteDate || '',
      timeline.productionOrderDate || '',
      timeline.productionCompleteDate || '',
      timeline.deliveryCompleteDate || ''
    ]);

    return data;
  },

  // 获取合并单元格范围
  getMergeRanges(project) {
    const details = project.details || [];
    const detailRowCount = details.length;

    return [
      // 标题行合并
      { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } },
      // 客户名称合并
      { s: { r: 1, c: 5 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 5 }, e: { r: 2, c: 10 } },
      // 执行规划时间标题合并
      { s: { r: 6 + detailRowCount, c: 0 }, e: { r: 6 + detailRowCount, c: 6 } }
    ];
  },

  // 格式化日期用于文件名
  formatDateForFileName(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  // 导出项目列表为Excel（用于批量导出）
  exportProjectList(projects) {
    if (!window.XLSX) {
      alert('Excel导出库加载失败，请刷新页面重试');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // 创建项目列表工作表
      const listData = [
        ['序号', '客户名称', '合同号', '签订主体', '项目金额', '制装人数', '项目交期', '销售人员', '创建时间']
      ];

      projects.forEach((project, index) => {
        const info = project.basicInfo || {};
        const meta = project.metadata || {};
        listData.push([
          index + 1,
          info.customerName || '',
          info.contractNo || '',
          info.signingEntity || '',
          info.projectAmount || '',
          info.totalPeople || '',
          info.deliveryDate || '',
          info.salesPerson || '',
          meta.createTime ? new Date(meta.createTime).toLocaleString() : ''
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(listData);

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, '项目列表');

      const fileName = `项目规划表列表_${this.formatDateForFileName(new Date())}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return { success: true, fileName };
    } catch (e) {
      console.error('导出项目列表失败:', e);
      return { success: false, error: e.message };
    }
  }
};

// 导出给其他模块使用
window.ExcelExporter = ExcelExporter;
