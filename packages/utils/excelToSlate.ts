// utils/excelToSlate.ts
import { EditorContent } from "create/editor/utils/slateUtils";

// --- 优化点 1: 使用更精确的类型定义 ---
// Record<string, any> 表示一个键是字符串，值是任意类型的对象。
type ExcelRow = Record<string, any>;

/**
 * 将从 Excel/CSV 等文件解析出的 JSON 数据转换为 Slate.js 格式。
 * @param excelData - 由 sheet_to_json 生成的行数据数组。
 * @param fileName - 用作内容标题的原始文件名。
 * @returns Slate.js 编辑器内容数组 (EditorContent)。
 */
export const convertExcelToSlate = (
  excelData: ExcelRow[],
  fileName: string
): EditorContent => {
  // --- 优化点 2: 对空数据或无效数据提供更明确的早期返回 ---
  if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
    return [
      { type: "heading-one", children: [{ text: fileName }] },
      {
        type: "paragraph",
        children: [{ text: "表格文件为空或无法解析内容。" }],
      },
    ];
  }

  // --- 优化点 3: 遍历所有行以获取完整的表头集合，确保不丢失任何列 ---
  const headerSet = new Set<string>();
  excelData.forEach((row) => {
    // 确保 row 是一个对象
    if (row && typeof row === "object") {
      Object.keys(row).forEach((key) => headerSet.add(key));
    }
  });
  const headers = Array.from(headerSet);

  // 如果遍历后仍然没有表头（例如，数据是 [{}, {}]），也视为无效内容。
  if (headers.length === 0) {
    return [
      { type: "heading-one", children: [{ text: fileName }] },
      {
        type: "paragraph",
        children: [{ text: "表格文件中没有找到有效的列标题。" }],
      },
    ];
  }

  // 构建表格的表头行
  const headerRow = {
    type: "table-row",
    children: headers.map((header) => ({
      type: "table-cell",
      isHeader: true, // 保留这个很好的属性，用于样式区分
      children: [{ text: header || "" }], // header 不会是 null，但保留检查更安全
    })),
  };

  // 构建表格的数据行
  const dataRows = excelData.map((row) => ({
    type: "table-row",
    children: headers.map((header) => {
      // --- 优化点 4: 更安全地访问单元格数据 ---
      // 即使 row 是 null 或者不是对象，也不会导致程序崩溃
      const cellValue =
        row && typeof row === "object" ? row[header] : undefined;
      return {
        type: "table-cell",
        children: [{ text: String(cellValue ?? "") }], // 使用 ?? 确保 null 和 undefined 都转换为空字符串
      };
    }),
  }));

  // 返回 Slate.js 格式的内容，包含文件名作为标题和完整的表格
  return [
    { type: "heading-one", children: [{ text: fileName }] },
    {
      type: "table",
      children: [headerRow, ...dataRows],
    },
  ];
};
