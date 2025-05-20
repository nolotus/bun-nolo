// utils/slateToExcel.ts
import { EditorContent } from "create/editor/utils/slateUtils";

// 从 Slate.js 内容中提取表格数据
export const slateToExcelData = (
  slateContent: EditorContent
): { headers: string[]; rows: string[][] } | null => {
  // 查找表格节点
  const tableNode = slateContent.find((node) => node.type === "table");
  if (!tableNode || !tableNode.children || tableNode.children.length === 0) {
    return null;
  }

  const rows = tableNode.children;
  // 假设第一行是表头
  const headerRow = rows[0].children || [];
  const headers = headerRow.map((cell) => {
    const text = cell.children?.[0]?.text || "";
    return text;
  });

  // 提取数据行（从第二行开始）
  const dataRows = rows.slice(1).map((row) => {
    return (
      row.children?.map((cell) => {
        return cell.children?.[0]?.text || "";
      }) || []
    );
  });

  return { headers, rows: dataRows };
};

// 将提取的数据转换为 CSV 格式
export const convertToCSV = (headers: string[], rows: string[][]): string => {
  const csvRows = [];
  csvRows.push(headers.join(","));
  rows.forEach((row) => {
    const values = row.map((cell) => {
      cell = typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell;
      return cell;
    });
    csvRows.push(values.join(","));
  });
  return csvRows.join("\n");
};

// 将提取的数据转换为 JSON 格式
export const convertToJSON = (headers: string[], rows: string[][]): string => {
  const jsonData = rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
  return JSON.stringify(jsonData, null, 2);
};
