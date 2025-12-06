// utils/excelToSlate.ts

import { EditorContent } from "create/editor/utils/slateUtils";

// --- 类型定义 ---

/**
 * 从 XLSX.utils.sheet_to_json 生成的每一行数据。
 * key 为列标题（字符串），值为任意类型（字符串、数字、日期等）。
 */
export type ExcelRow = Record<string, any>;

/**
 * 转换配置：用于控制日期格式、本地化等。
 */
export interface ConvertExcelToSlateOptions {
  /**
   * 国际化 locale，如 "zh-CN" / "en-US"。
   * 如果不传，则优先尝试浏览器语言，否则回退到 "en-US"。
   */
  locale?: string;

  /**
   * 需要按「日期」渲染的列名（不区分大小写）。
   * 默认包含：交期 / 日期 / 交货日期 / date / delivery date 等。
   */
  dateHeaders?: string[];
}

// --- 工具函数 ---

/**
 * 生成一段「文件为空 / 无有效列」的 Slate 内容。
 */
const buildSimpleInfoContent = (
  fileName: string,
  message: string
): EditorContent => [
  { type: "heading-one", children: [{ text: fileName }] },
  {
    type: "paragraph",
    children: [{ text: message }],
  },
];

/**
 * 默认需要按日期处理的列名（不区分大小写）。
 */
const DEFAULT_DATE_HEADERS = [
  "交期",
  "日期",
  "交货日期",
  "date",
  "delivery date",
  "delivery_date",
  "ship date",
];

/**
 * 判断某个表头是否是「日期列」。
 */
const isDateHeader = (header: string, dateHeaders: string[]): boolean => {
  const lower = header.toLowerCase();
  return dateHeaders.some((h) => h.toLowerCase() === lower);
};

/**
 * 是否是「看起来像 Excel 日期序列号」的数字。
 * Excel 的日期序列号大致在 20000 ~ 60000 之间（对应 1950~2130 年）。
 */
const isLikelyExcelDateNumber = (value: number): boolean =>
  value > 20000 && value < 60000;

/**
 * 将 Excel 序列号转换成 JS Date。
 * 这里用 1899-12-30 作为基准（SheetJS / 常见实现的写法），
 * 可以满足一般业务场景。
 */
const excelSerialToDate = (serial: number): Date => {
  const millis = (serial - 25569) * 86400 * 1000; // 25569 为 1970-01-01 相对 1899-12-30 的天数
  return new Date(millis);
};

/**
 * 获取默认 locale：优先使用浏览器语言，其次 en-US。
 */
const getDefaultLocale = (): string => {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "en-US";
};

/**
 * 将单元格的值格式化为字符串。
 * - 对「日期列」优先尝试用 Intl.DateTimeFormat 按 locale 输出：
 *   中文：2025年12月30日
 *   英文：December 30, 2025
 * - 其他类型直接转 String。
 */
const formatCellValue = (
  header: string,
  value: any,
  locale: string,
  dateHeaders: string[]
): string => {
  if (value == null) return "";

  const headerIsDate = isDateHeader(header, dateHeaders);

  // 如果是日期列，尽量把各种类型统一转成 Date 再格式化
  if (headerIsDate) {
    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "number" && isLikelyExcelDateNumber(value)) {
      // Excel 日期序列号
      date = excelSerialToDate(value);
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    if (date) {
      // 用 Intl.DateTimeFormat 按当前语言输出「包含年、月、日」的格式
      const formatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long", // 在中文下会是 “12月”，在英文下是 “December”
        day: "numeric",
      });
      return formatter.format(date);
    }
  }

  // 非日期列或者无法成功解析为 Date 的情况，直接字符串化
  return String(value);
};

// --- 主函数 ---

/**
 * 将 Excel/CSV 解析后的 JSON 行数据转换为 Slate.js 格式。
 *
 * @param excelData - 由 XLSX.utils.sheet_to_json 生成的行数据数组。
 * @param fileName  - 原始文件名，用作标题。
 * @param options   - 配置项，用于控制 locale / 日期列等。
 * @returns 符合 Slate.js 规范的 EditorContent 数组。
 */
export const convertExcelToSlate = (
  excelData: ExcelRow[],
  fileName: string,
  options: ConvertExcelToSlateOptions = {}
): EditorContent => {
  const locale = options.locale ?? getDefaultLocale();
  const dateHeaders = options.dateHeaders ?? DEFAULT_DATE_HEADERS;

  // 1. 早返回：无效或空数据
  if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
    return buildSimpleInfoContent(fileName, "表格文件为空或无法解析内容。");
  }

  // 2. 收集所有可能出现过的列头，避免丢失列
  const headerSet = new Set<string>();
  excelData.forEach((row) => {
    if (row && typeof row === "object") {
      Object.keys(row).forEach((key) => headerSet.add(key));
    }
  });

  const headers = Array.from(headerSet);

  // 如果没有任何有效表头（例如所有行都是 {}），也视为无效内容
  if (headers.length === 0) {
    return buildSimpleInfoContent(fileName, "表格文件中没有找到有效的列标题。");
  }

  // 3. 构建表头行
  const headerRow = {
    type: "table-row",
    children: headers.map((header) => ({
      type: "table-cell",
      isHeader: true, // 表头单元格，可用于样式区分
      children: [{ text: header || "" }],
    })),
  };

  // 4. 构建数据行
  const dataRows = excelData.map((row) => ({
    type: "table-row",
    children: headers.map((header) => {
      const rawValue =
        row && typeof row === "object" ? (row as any)[header] : undefined;

      const text = formatCellValue(header, rawValue, locale, dateHeaders);

      return {
        type: "table-cell",
        children: [{ text }],
      };
    }),
  }));

  // 5. 返回最终的 Slate 内容：标题 + 表格
  return [
    { type: "heading-one", children: [{ text: fileName }] },
    {
      type: "table",
      children: [headerRow, ...dataRows],
    },
  ];
};
