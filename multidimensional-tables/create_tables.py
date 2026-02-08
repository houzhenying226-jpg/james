#!/usr/bin/env python3
"""
钉钉多维表格自动创建脚本
=============================
批次1：4张MVP多维表格自动化建表

使用方式：
1. 安装依赖：pip install requests
2. 配置环境变量：
   export DINGTALK_APP_KEY="your_app_key"
   export DINGTALK_APP_SECRET="your_app_secret"
   export DINGTALK_SPACE_ID="your_space_id"       # 多维表格所在空间ID
3. 运行：python create_tables.py

钉钉开放平台文档：https://open.dingtalk.com/document/
"""

import json
import os
import sys
import time
import requests
from pathlib import Path

# ========== 配置 ==========
DINGTALK_API_BASE = "https://api.dingtalk.com"
APP_KEY = os.environ.get("DINGTALK_APP_KEY", "")
APP_SECRET = os.environ.get("DINGTALK_APP_SECRET", "")
SPACE_ID = os.environ.get("DINGTALK_SPACE_ID", "")

# ========== 字段类型映射（钉钉多维表格 API 字段类型） ==========
FIELD_TYPE_MAP = {
    "text": "Text",
    "multi_line_text": "Text",       # 多行文本
    "number": "Number",
    "single_select": "SingleSelect",
    "multi_select": "MultiSelect",
    "date": "DateTime",
    "member": "Text",                # 成员字段在API中用文本模拟，实际需在UI中配置
    "attachment": "Attachment",
    "auto_number": "AutoNumber",
    "formula": "Text",               # 公式字段需在UI中手动配置
}


# ========== 通用字段定义 ==========
COMMON_FIELDS = [
    {
        "name": "项目编号",
        "type": "text",
        "required": True,
        "description": "格式：PRJ-2026-001（手动填）"
    },
    {
        "name": "提交人",
        "type": "member",
        "required": True,
        "description": "选钉钉通讯录"
    },
    {
        "name": "提交日期",
        "type": "date",
        "required": True,
        "description": "默认今天"
    },
    {
        "name": "审核状态",
        "type": "single_select",
        "required": False,
        "options": ["⏳待审核", "✅已通过", "❌已驳回"],
        "default": "⏳待审核",
        "description": "默认⏳待审核，销售不改，系统回写"
    },
    {
        "name": "审核意见",
        "type": "multi_line_text",
        "required": False,
        "description": "系统回写驳回原因，销售不填"
    }
]


# ========== 表1：成交项目交接表 ==========
TABLE_PROJECT_HANDOVER = {
    "table_name": "成交项目交接表",
    "table_id": "project_handover",
    "fields": [
        {"name": "客户名称", "type": "text", "required": True},
        {"name": "客户行业", "type": "single_select", "required": True,
         "options": ["电力能源", "石油化工", "金融保险", "交通运输", "通信科技",
                     "军工国防", "政府机关", "教育医疗", "建筑地产", "其他"]},
        {"name": "合同编号", "type": "text", "required": True,
         "description": "格式示例：OP26-152"},
        {"name": "合同金额(万元)", "type": "number", "required": True},
        {"name": "付款方式", "type": "single_select", "required": True,
         "options": ["全额预付", "3-7分期", "4-3-3分期", "5-5分期", "货到付款", "其他"]},
        {"name": "结算模式", "type": "single_select", "required": True,
         "options": ["直签模式", "希努尔代签模式"]},
        {"name": "总人数", "type": "number", "required": True},
        {"name": "品类概要", "type": "multi_line_text", "required": True,
         "description": "如\"西服套装200套+衬衫200件+大衣50件\""},
        {"name": "签约日期", "type": "date", "required": True},
        {"name": "要求交货日", "type": "date", "required": True,
         "description": "必须晚于签约日期"},
        {"name": "客户联系人", "type": "text", "required": True,
         "description": "姓名+职务"},
        {"name": "联系电话", "type": "text", "required": True},
        {"name": "收货地址", "type": "text", "required": True},
        {"name": "特殊要求", "type": "multi_line_text", "required": False,
         "description": "如\"需防静电面料\"\"需绣logo\""},
        {"name": "项目负责销售", "type": "member", "required": True},
        {"name": "协作产品经理", "type": "member", "required": False},
        {"name": "备注", "type": "multi_line_text", "required": False},
    ]
}

# ========== 表2：量体申请 ==========
TABLE_MEASUREMENT_APPLY = {
    "table_name": "量体申请",
    "table_id": "measurement_apply",
    "fields": [
        {"name": "关联合同编号", "type": "text", "required": True,
         "description": "与交接表的合同编号一致"},
        {"name": "量体类型", "type": "single_select", "required": True,
         "options": ["首次量体", "补量", "售后量体"]},
        {"name": "量体人数", "type": "number", "required": True},
        {"name": "量体日期", "type": "date", "required": True},
        {"name": "量体时间段", "type": "single_select", "required": True,
         "options": ["上午(9-12)", "下午(13-17)", "全天"]},
        {"name": "量体地址", "type": "text", "required": True},
        {"name": "现场联系人", "type": "text", "required": True,
         "description": "客户方对接人"},
        {"name": "联系电话", "type": "text", "required": True},
        {"name": "量体品类", "type": "multi_select", "required": True,
         "options": ["西服上衣", "西裤", "衬衫", "大衣", "马甲", "连衣裙", "制式衬衫", "其他"]},
        {"name": "是否需要样衣展示", "type": "single_select", "required": True,
         "options": ["是", "否"]},
        {"name": "特殊注意事项", "type": "multi_line_text", "required": False,
         "description": "如\"客户只有午休可量\"\"需带面料样本\""},
        {"name": "申请销售", "type": "member", "required": True},
    ]
}

# ========== 表3：制作明细表 ==========
TABLE_ORDER_DETAIL = {
    "table_name": "制作明细表",
    "table_id": "order_detail",
    "fields": [
        {"name": "关联合同编号", "type": "text", "required": True},
        {"name": "序号", "type": "auto_number", "required": False,
         "description": "系统自动"},
        {"name": "存货名称", "type": "single_select", "required": True,
         "options": [
             "男西服上衣", "男西裤", "男衬衫长袖", "男衬衫短袖", "男大衣",
             "男马甲", "男T恤", "男夹克",
             "女西服上衣", "女西裤", "女衬衫长袖", "女衬衫短袖", "女大衣",
             "女马甲", "女连衣裙", "女半裙",
             "领带", "丝巾", "皮带"
         ]},
        {"name": "面料品牌", "type": "single_select", "required": True,
         "options": ["如意", "阳光", "海澜", "南山", "华芳", "其他"]},
        {"name": "面料编号", "type": "text", "required": True,
         "description": "供应商面料编号"},
        {"name": "面料颜色", "type": "text", "required": True,
         "description": "如\"藏青色\"\"深灰色\""},
        {"name": "款式说明", "type": "multi_line_text", "required": True,
         "description": "如\"两粒扣平驳领、双开衩\""},
        {"name": "数量(件)", "type": "number", "required": True},
        {"name": "单价(元)", "type": "number", "required": True},
        {"name": "小计金额(元)", "type": "formula", "required": False,
         "formula": "数量(件) * 单价(元)",
         "description": "=数量×单价（自动计算）"},
        {"name": "生产商家", "type": "single_select", "required": True,
         "options": ["希努尔", "大杨", "报喜鸟", "顺美", "自有工厂", "其他"]},
        {"name": "要求交货日", "type": "date", "required": True},
        {"name": "尺码范围", "type": "multi_line_text", "required": True,
         "description": "如\"165A-185B，具体见量体数据\""},
        {"name": "工艺要求", "type": "multi_line_text", "required": False,
         "description": "如\"绣花logo左胸口\"\"特殊纽扣\""},
        {"name": "备注", "type": "multi_line_text", "required": False},
    ]
}

# ========== 表4：签收单 ==========
TABLE_DELIVERY_RECEIPT = {
    "table_name": "签收单",
    "table_id": "delivery_receipt",
    "fields": [
        {"name": "关联合同编号", "type": "text", "required": True},
        {"name": "发货批次号", "type": "text", "required": True,
         "description": "如 SHIP-2026-001-01"},
        {"name": "签收日期", "type": "date", "required": True},
        {"name": "签收人姓名", "type": "text", "required": True,
         "description": "客户方签收人"},
        {"name": "签收人电话", "type": "text", "required": True},
        {"name": "品类名称", "type": "text", "required": True,
         "description": "与制作明细对应"},
        {"name": "应发数量", "type": "number", "required": True},
        {"name": "实收数量", "type": "number", "required": True},
        {"name": "签收状态", "type": "single_select", "required": True,
         "options": ["全部签收", "部分签收", "拒收"]},
        {"name": "差异说明", "type": "multi_line_text", "required": False,
         "description": "部分签收/拒收时必填"},
        {"name": "签收照片", "type": "attachment", "required": False,
         "description": "拍照上传"},
        {"name": "经办商务", "type": "member", "required": True},
        {"name": "备注", "type": "multi_line_text", "required": False},
    ]
}

ALL_TABLES = [
    TABLE_PROJECT_HANDOVER,
    TABLE_MEASUREMENT_APPLY,
    TABLE_ORDER_DETAIL,
    TABLE_DELIVERY_RECEIPT,
]

# ========== 测试数据 ==========
TEST_DATA = {
    "project_handover": {
        "项目编号": "PRJ-2026-001",
        "提交日期": "2026-02-08",
        "审核状态": "⏳待审核",
        "客户名称": "国网山东电力公司",
        "客户行业": "电力能源",
        "合同编号": "OP26-152",
        "合同金额(万元)": 85.5,
        "付款方式": "3-7分期",
        "结算模式": "直签模式",
        "总人数": 200,
        "品类概要": "西服套装200套+衬衫200件+大衣50件",
        "签约日期": "2026-02-05",
        "要求交货日": "2026-05-15",
        "客户联系人": "张经理 采购部主任",
        "联系电话": "13800138001",
        "收货地址": "山东省济南市历下区经十路18号",
        "特殊要求": "需防静电面料，需绣公司logo",
    },
    "measurement_apply": {
        "项目编号": "PRJ-2026-001",
        "提交日期": "2026-02-08",
        "审核状态": "⏳待审核",
        "关联合同编号": "OP26-152",
        "量体类型": "首次量体",
        "量体人数": 200,
        "量体日期": "2026-02-20",
        "量体时间段": "全天",
        "量体地址": "山东省济南市历下区经十路18号 3号楼会议室",
        "现场联系人": "李主管",
        "联系电话": "13900139001",
        "量体品类": ["西服上衣", "西裤", "衬衫", "大衣"],
        "是否需要样衣展示": "是",
        "特殊注意事项": "客户只有午休和下班后可量，需带面料样本",
    },
    "order_detail": {
        "项目编号": "PRJ-2026-001",
        "提交日期": "2026-02-08",
        "审核状态": "⏳待审核",
        "关联合同编号": "OP26-152",
        "存货名称": "男西服上衣",
        "面料品牌": "如意",
        "面料编号": "RY-W2026-003",
        "面料颜色": "藏青色",
        "款式说明": "两粒扣平驳领、双开衩、4个内袋",
        "数量(件)": 200,
        "单价(元)": 1580,
        "生产商家": "希努尔",
        "要求交货日": "2026-04-30",
        "尺码范围": "165A-185B，具体见量体数据",
        "工艺要求": "绣花logo左胸口，特殊防静电里衬",
    },
    "delivery_receipt": {
        "项目编号": "PRJ-2026-001",
        "提交日期": "2026-02-08",
        "审核状态": "⏳待审核",
        "关联合同编号": "OP26-152",
        "发货批次号": "SHIP-2026-001-01",
        "签收日期": "2026-05-10",
        "签收人姓名": "王收货员",
        "签收人电话": "13700137001",
        "品类名称": "男西服上衣",
        "应发数量": 200,
        "实收数量": 200,
        "签收状态": "全部签收",
    },
}


class DingTalkClient:
    """钉钉多维表格 API 客户端"""

    def __init__(self, app_key: str, app_secret: str):
        self.app_key = app_key
        self.app_secret = app_secret
        self.access_token = None
        self.token_expires = 0

    def get_access_token(self) -> str:
        """获取钉钉 access_token"""
        if self.access_token and time.time() < self.token_expires:
            return self.access_token

        url = f"{DINGTALK_API_BASE}/v1.0/oauth2/accessToken"
        resp = requests.post(url, json={
            "appKey": self.app_key,
            "appSecret": self.app_secret,
        })
        resp.raise_for_status()
        data = resp.json()
        self.access_token = data["accessToken"]
        self.token_expires = time.time() + data.get("expireIn", 7200) - 60
        return self.access_token

    def _headers(self) -> dict:
        return {
            "x-acs-dingtalk-access-token": self.get_access_token(),
            "Content-Type": "application/json",
        }

    def create_sheet(self, space_id: str, name: str) -> dict:
        """在多维表格空间中创建工作表"""
        url = f"{DINGTALK_API_BASE}/v1.0/doc/spaces/{space_id}/sheets"
        resp = requests.post(url, headers=self._headers(), json={"name": name})
        resp.raise_for_status()
        return resp.json()

    def add_field(self, space_id: str, sheet_id: str, field_def: dict) -> dict:
        """向工作表添加字段"""
        url = f"{DINGTALK_API_BASE}/v1.0/doc/spaces/{space_id}/sheets/{sheet_id}/fields"
        resp = requests.post(url, headers=self._headers(), json=field_def)
        resp.raise_for_status()
        return resp.json()

    def add_record(self, space_id: str, sheet_id: str, record: dict) -> dict:
        """向工作表添加记录"""
        url = f"{DINGTALK_API_BASE}/v1.0/doc/spaces/{space_id}/sheets/{sheet_id}/records"
        resp = requests.post(url, headers=self._headers(), json={"fields": record})
        resp.raise_for_status()
        return resp.json()


def build_field_payload(field: dict) -> dict:
    """将本地字段定义转换为钉钉 API 请求体"""
    field_type = FIELD_TYPE_MAP.get(field["type"], "Text")
    payload = {
        "name": field["name"],
        "type": field_type,
    }

    # 单选/多选字段添加选项
    if field["type"] in ("single_select", "multi_select") and "options" in field:
        payload["property"] = {
            "options": [{"name": opt} for opt in field["options"]]
        }

    return payload


def create_all_tables(client: DingTalkClient, space_id: str):
    """创建所有4张表"""
    for table_def in ALL_TABLES:
        table_name = table_def["table_name"]
        table_id = table_def["table_id"]
        print(f"\n{'='*60}")
        print(f"创建表: {table_name} ({table_id})")
        print(f"{'='*60}")

        # 1. 创建工作表
        try:
            sheet = client.create_sheet(space_id, table_name)
            sheet_id = sheet.get("sheetId", "unknown")
            print(f"  [OK] 工作表已创建, sheetId={sheet_id}")
        except Exception as e:
            print(f"  [ERROR] 创建工作表失败: {e}")
            continue

        # 2. 添加通用字段
        all_fields = COMMON_FIELDS + table_def["fields"]
        for i, field in enumerate(all_fields, 1):
            try:
                payload = build_field_payload(field)
                client.add_field(space_id, sheet_id, payload)
                required_mark = " *" if field.get("required") else ""
                print(f"  [{i:02d}] {field['name']} ({field['type']}){required_mark}")
            except Exception as e:
                print(f"  [{i:02d}] {field['name']} - ERROR: {e}")

        # 3. 插入测试数据
        test_row = TEST_DATA.get(table_id, {})
        if test_row:
            try:
                client.add_record(space_id, sheet_id, test_row)
                print(f"  [OK] 测试数据已插入")
            except Exception as e:
                print(f"  [WARN] 插入测试数据失败: {e}")

        field_count = len(COMMON_FIELDS) + len(table_def["fields"])
        print(f"  总字段数: {field_count}")


def print_summary():
    """打印表结构摘要（无需 API 连接）"""
    print("\n" + "=" * 70)
    print("  批次1：4张MVP多维表格 - 结构摘要")
    print("=" * 70)

    for table_def in ALL_TABLES:
        table_name = table_def["table_name"]
        table_id = table_def["table_id"]
        all_fields = COMMON_FIELDS + table_def["fields"]
        total = len(all_fields)

        print(f"\n{'─'*60}")
        print(f"  {table_name} ({table_id}) - 共 {total} 个字段")
        print(f"{'─'*60}")

        # 通用字段
        print("  [通用字段]")
        for i, f in enumerate(COMMON_FIELDS, 1):
            req = " *必填" if f.get("required") else ""
            print(f"    {i:2d}. {f['name']:15s} | {f['type']:15s}{req}")

        # 业务字段
        print("  [业务字段]")
        for i, f in enumerate(table_def["fields"], len(COMMON_FIELDS) + 1):
            req = " *必填" if f.get("required") else ""
            opts = ""
            if "options" in f:
                opt_list = f["options"]
                if len(opt_list) > 4:
                    opts = f" [{', '.join(opt_list[:4])}...]"
                else:
                    opts = f" [{', '.join(opt_list)}]"
            print(f"    {i:2d}. {f['name']:15s} | {f['type']:15s}{req}{opts}")

    # 完成标准
    print(f"\n{'='*70}")
    print("  完成标准检查:")
    print(f"{'='*70}")
    for table_def in ALL_TABLES:
        total = len(COMMON_FIELDS) + len(table_def["fields"])
        biz = len(table_def["fields"])
        print(f"  [{'OK' if total > 0 else 'FAIL'}] {table_def['table_name']}: "
              f"{total}个字段 (5通用+{biz}业务)")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="钉钉多维表格批量创建工具")
    parser.add_argument("--summary", action="store_true",
                        help="仅打印表结构摘要（不调用API）")
    parser.add_argument("--export-json", type=str,
                        help="导出完整表结构到JSON文件")
    args = parser.parse_args()

    if args.summary:
        print_summary()
        return

    if args.export_json:
        export = []
        for table_def in ALL_TABLES:
            entry = {
                "table_name": table_def["table_name"],
                "table_id": table_def["table_id"],
                "fields": [build_field_payload(f) for f in COMMON_FIELDS + table_def["fields"]],
                "test_data": TEST_DATA.get(table_def["table_id"], {}),
            }
            export.append(entry)
        with open(args.export_json, "w", encoding="utf-8") as f:
            json.dump(export, f, ensure_ascii=False, indent=2)
        print(f"已导出到 {args.export_json}")
        return

    # API 模式 - 需要配置钉钉凭证
    if not APP_KEY or not APP_SECRET:
        print("错误: 请设置环境变量 DINGTALK_APP_KEY 和 DINGTALK_APP_SECRET")
        print("  export DINGTALK_APP_KEY='your_app_key'")
        print("  export DINGTALK_APP_SECRET='your_app_secret'")
        print("  export DINGTALK_SPACE_ID='your_space_id'")
        print("\n提示: 使用 --summary 查看表结构摘要，无需API凭证")
        sys.exit(1)

    if not SPACE_ID:
        print("错误: 请设置环境变量 DINGTALK_SPACE_ID")
        sys.exit(1)

    client = DingTalkClient(APP_KEY, APP_SECRET)
    create_all_tables(client, SPACE_ID)
    print_summary()
    print("\n全部完成!")


if __name__ == "__main__":
    main()
