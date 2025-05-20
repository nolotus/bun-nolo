// utils/excelToSlate.ts
import { EditorContent } from "create/editor/utils/slateUtils";

// 将 Excel 数据转换为 Slate.js 格式
export const convertExcelToSlate = (
  excelData: any[],
  fileName: string
): EditorContent => {
  if (!excelData || excelData.length === 0) {
    return [
      { type: "heading-one", children: [{ text: fileName }] },
      { type: "paragraph", children: [{ text: "Excel 文件为空或无效。" }] },
    ];
  }

  // 获取表头
  const headers = Object.keys(excelData[0]);

  // 构建表格的表头行
  const headerRow = {
    type: "table-row",
    children: headers.map((header) => ({
      type: "table-cell",
      isHeader: true, // 可选，用于样式区分表头
      children: [{ text: header || "" }],
    })),
  };

  // 构建表格的数据行
  const dataRows = excelData.map((row) => ({
    type: "table-row",
    children: headers.map((header) => ({
      type: "table-cell",
      children: [{ text: String(row[header] || "") }],
    })),
  }));

  // 返回 Slate.js 格式的内容，包含文件名作为标题和表格
  return [
    { type: "heading-one", children: [{ text: fileName }] },
    {
      type: "table",
      children: [headerRow, ...dataRows],
    },
  ];
};
