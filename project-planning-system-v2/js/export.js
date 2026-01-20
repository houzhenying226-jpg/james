/**
 * 北方努派项目规划表智能填写系统 V2 - Excel导出模块
 */

const ExcelExport = {
  // 导出项目到Excel
  exportProject(project) {
    if (!window.XLSX) {
      alert('Excel导出库未加载，请检查网络连接');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // 创建主工作表
    const mainSheet = this.createMainSheet(project);
    XLSX.utils.book_append_sheet(workbook, mainSheet, '项目规划表');

    // 生成文件名
    const fileName = this.generateFileName(project);

    // 导出
    XLSX.writeFile(workbook, fileName);
  },

  // 创建主工作表
  createMainSheet(project) {
    const data = [];
    const info = project.basicInfo;

    // 标题
    data.push(['北方努派 - 项目规划表']);
    data.push([]);

    // 基本信息区域
    data.push(['项目基本信息']);
    data.push(['报备日期', info.reportDate, '', '合同号', info.contractNo]);
    data.push(['客户名称', info.customerName, '', '签订主体', info.signingEntity || '']);
    data.push(['项目金额', info.projectAmount, '', '制装人数', info.totalPeople]);
    data.push(['项目交期', info.deliveryDate, '', '销售部门', info.salesDepartment || '']);
    data.push(['销售人员', info.salesPerson || '', '', '生产人员', info.productionPerson || '']);
    data.push([]);

    // 制作明细区域
    data.push(['制作明细']);
    data.push([
      '序号', '级别', '存货名称', '存货编码', '品类', '配置', '人数',
      '单价', '面料采购方', '面料号', '面料品牌', '面料成分', '面料纱织', '面料颜色',
      '制作工厂', '包装要求', '款式号', '工艺要求', '客户特殊要求'
    ]);

    // 明细数据
    project.details.forEach((detail, index) => {
      data.push([
        index + 1,
        detail.level || '',
        detail.inventoryName,
        detail.inventoryCode,
        detail.category,
        detail.configuration,
        detail.quantity,
        detail.unitPrice || '',
        detail.fabricPurchaser,
        detail.fabricNo || '',
        detail.fabricBrand || '',
        detail.fabricComposition || '',
        detail.fabricYarn || '',
        detail.fabricColor || '',
        detail.factory,
        detail.packaging,
        detail.styleNo || '',
        detail.craftDescription || '',
        detail.specialRequirements || ''
      ]);
    });

    data.push([]);

    // 汇总
    const totalQuantity = project.details.reduce((sum, d) => sum + (d.quantity || 0), 0);
    data.push(['合计', '', '', '', '', '', totalQuantity]);

    // 创建工作表
    const sheet = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    sheet['!cols'] = [
      { wch: 5 },   // 序号
      { wch: 8 },   // 级别
      { wch: 18 },  // 存货名称
      { wch: 10 },  // 存货编码
      { wch: 8 },   // 品类
      { wch: 12 },  // 配置
      { wch: 6 },   // 人数
      { wch: 8 },   // 单价
      { wch: 12 },  // 面料采购方
      { wch: 15 },  // 面料号
      { wch: 15 },  // 面料品牌
      { wch: 15 },  // 面料成分
      { wch: 12 },  // 面料纱织
      { wch: 10 },  // 面料颜色
      { wch: 10 },  // 制作工厂
      { wch: 15 },  // 包装要求
      { wch: 15 },  // 款式号
      { wch: 40 },  // 工艺要求
      { wch: 30 }   // 客户特殊要求
    ];

    // 合并标题单元格
    sheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }, // 标题
      { s: { r: 2, c: 0 }, e: { r: 2, c: 18 } }  // 项目基本信息
    ];

    return sheet;
  },

  // 生成文件名
  generateFileName(project) {
    const customerName = project.basicInfo.customerName || '未命名';
    const contractNo = project.basicInfo.contractNo || '';
    const date = new Date().toISOString().split('T')[0];

    // 清理文件名中的非法字符
    const safeName = `${customerName}_${contractNo}_${date}`.replace(/[\\/:*?"<>|]/g, '_');
    return `项目规划表_${safeName}.xlsx`;
  },

  // 导出项目列表
  exportProjectList(projects) {
    if (!window.XLSX) {
      alert('Excel导出库未加载，请检查网络连接');
      return;
    }

    const data = [
      ['项目列表导出'],
      [],
      ['序号', '客户名称', '合同号', '项目金额', '制装人数', '项目交期', '创建时间']
    ];

    projects.forEach((project, index) => {
      data.push([
        index + 1,
        project.basicInfo?.customerName || '',
        project.basicInfo?.contractNo || '',
        project.basicInfo?.projectAmount || 0,
        project.basicInfo?.totalPeople || 0,
        project.basicInfo?.deliveryDate || '',
        project.metadata?.createTime?.split('T')[0] || ''
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, '项目列表');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `项目列表_${date}.xlsx`);
  }
};

// 导出
window.ExcelExport = ExcelExport;
