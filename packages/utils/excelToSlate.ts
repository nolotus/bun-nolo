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
   * 用来识别“哪些表头看起来是日期列”的关键字（不区分大小写，使用 includes 匹配）。
   * 例如：["date", "交期", "交货", "发货", "ETD", "ETA"]。
   * 如果未传，将使用 DEFAULT_DATE_KEYWORDS。
   */
  dateKeywords?: string[];

  /**
   * 自定义“某个表头是否是日期列”的判断函数。
   * 如果提供，将优先于 dateKeywords / 默认关键字。
   */
  isDateHeader?: (header: string) => boolean;

  /**
   * 对应 excelData 的“格式化显示数据”（通常来自 sheet_to_json(raw: false)）。
   * - 用来保留百分比 / 货币 / 时间等 Excel 的显示文本。
   * - 数组长度、每行的 key 应该与 excelData 对齐。
   */
  displayData?: ExcelRow[];
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
 * 默认用于识别「日期列」的关键字（不区分大小写，使用 includes 匹配）。
 * 注意：这是启发式规则，只是帮助在用户不配置时尽可能识别常见日期列。
 */
const DEFAULT_DATE_KEYWORDS = [
  "交期",
  "日期",
  "交货",
  "下单",
  "发货",
  "收货",
  "到货",
  "date",
  "delivery",
  "ship",
  "etd",
  "eta",
  "due",
];

/**
 * 根据一组关键字，创建一个默认的“表头是否为日期列”的判断函数。
 * 匹配规则：header.toLowerCase() 中包含任意一个关键字（includes）。
 */
const createIsDateHeaderFromKeywords = (keywords: string[]) => {
  const loweredKeywords = keywords
    .filter(Boolean)
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 0);

  return (header: string): boolean => {
    const lower = (header ?? "").toLowerCase().trim();
    if (!lower) return false;
    return loweredKeywords.some((k) => lower.includes(k));
  };
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
 * 对「日期列」的值进行格式化。
 * - 输入为原始值（Date / Excel 序列号 / string）
 * - 输出为 locale 对应的日期字符串
 */
const formatDateLikeCellValue = (value: any, locale: string): string | null => {
  if (value == null) return null;

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

  if (!date) return null;

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long", // 中文: “12月”；英文: “December”
    day: "numeric",
  });
  return formatter.format(date);
};

/**
 * 非日期列的值格式化逻辑：
 * - 如果提供了 displayValue（来自 raw:false 的 sheet_to_json），优先使用它：
 *   这样可以保留百分比 / 货币 / 时间 等 Excel 的显示样式。
 * - 否则退回到 String(rawValue)。
 */
const formatNonDateCellValue = (rawValue: any, displayValue: any): string => {
  if (displayValue != null && displayValue !== "") {
    return String(displayValue);
  }
  if (rawValue == null) return "";
  return String(rawValue);
};

/**
 * 将单元格的值格式化为字符串。
 * - 日期列：用 Intl.DateTimeFormat 按 locale 输出。
 * - 其他列：优先用 displayValue（Excel 的格式化结果），否则用原始值字符串。
 */
const formatCellValue = (
  header: string,
  rawValue: any,
  displayValue: any,
  locale: string,
  isDateHeader: (header: string) => boolean
): string => {
  // 完全空值
  if (rawValue == null && (displayValue == null || displayValue === "")) {
    return "";
  }

  const headerIsDate = isDateHeader(header);

  // 1. 日期列：优先尝试把各种类型统一转成 Date，再用 locale 格式化
  if (headerIsDate) {
    const formattedDate = formatDateLikeCellValue(rawValue, locale);
    if (formattedDate != null) return formattedDate;

    // 原始值无法解析成日期时，退回 displayValue 或 rawValue
    return formatNonDateCellValue(rawValue, displayValue);
  }

  // 2. 非日期列：优先采用 Excel 的显示文本（displayValue）
  return formatNonDateCellValue(rawValue, displayValue);
};

/**
 * 从 excel 行数据中收集所有表头。
 */
const collectHeaders = (excelData: ExcelRow[]): string[] => {
  const headerSet = new Set<string>();

  excelData.forEach((row) => {
    if (row && typeof row === "object") {
      Object.keys(row).forEach((key) => headerSet.add(key));
    }
  });

  return Array.from(headerSet);
};

/**
 * 构建表头行节点。
 */
const buildHeaderRow = (headers: string[]) => ({
  type: "table-row",
  children: headers.map((header) => ({
    type: "table-cell",
    isHeader: true,
    children: [{ text: header || "" }],
  })),
});

/**
 * 构建数据行节点。
 */
const buildDataRows = (
  excelData: ExcelRow[],
  headers: string[],
  locale: string,
  isDateHeader: (header: string) => boolean,
  displayData?: ExcelRow[]
) =>
  excelData.map((row, rowIndex) => {
    const displayRow = displayData?.[rowIndex];

    return {
      type: "table-row",
      children: headers.map((header) => {
        const rawValue =
          row && typeof row === "object" ? (row as any)[header] : undefined;
        const displayValue =
          displayRow && typeof displayRow === "object"
            ? (displayRow as any)[header]
            : undefined;

        const text = formatCellValue(
          header,
          rawValue,
          displayValue,
          locale,
          isDateHeader
        );

        return {
          type: "table-cell",
          children: [{ text }],
        };
      }),
    };
  });

// --- 主函数 ---

/**
 * 将 Excel/CSV 解析后的 JSON 行数据转换为 Slate.js 格式。
 *
 * @param excelData  - 由 XLSX.utils.sheet_to_json(raw: true) 生成的行数据数组。
 * @param fileName   - 原始文件名，用作标题。
 * @param options    - 配置项，用于控制 locale / 日期列等；
 *                     其中 options.displayData 一般来自 sheet_to_json(raw: false)。
 *
 * @returns 符合 Slate.js 规范的 EditorContent 数组。
 */
export const convertExcelToSlate = (
  excelData: ExcelRow[],
  fileName: string,
  options: ConvertExcelToSlateOptions = {}
): EditorContent => {
  const locale = options.locale ?? getDefaultLocale();

  // 先从配置或默认关键字生成一个“日期列判断函数”
  const keywords = options.dateKeywords ?? DEFAULT_DATE_KEYWORDS;
  const defaultIsDateHeader = createIsDateHeaderFromKeywords(keywords);

  // 如果用户传入了 isDateHeader，则优先使用；否则用默认关键字规则
  const isDateHeader = options.isDateHeader ?? defaultIsDateHeader;

  // 1. 早返回：无效或空数据
  if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
    return buildSimpleInfoContent(fileName, "表格文件为空或无法解析内容。");
  }

  // 2. 收集所有可能出现过的列头，避免丢失列
  const headers = collectHeaders(excelData);

  // 如果没有任何有效表头（例如所有行都是 {}），也视为无效内容
  if (headers.length === 0) {
    return buildSimpleInfoContent(fileName, "表格文件中没有找到有效的列标题。");
  }

  // 3. 构建表头行
  const headerRow = buildHeaderRow(headers);

  // 4. 构建数据行（这里会用到 raw + displayData）
  const dataRows = buildDataRows(
    excelData,
    headers,
    locale,
    isDateHeader,
    options.displayData
  );

  // 5. 返回最终的 Slate 内容：标题 + 表格
  return [
    { type: "heading-one", children: [{ text: fileName }] },
    {
      type: "table",
      children: [headerRow, ...dataRows],
    },
  ];
};
