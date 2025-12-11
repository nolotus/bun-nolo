// src/features/chat/web/fileProcessor.ts

import { nanoid } from "nanoid";
import { Descendant } from "slate";
import toast from "react-hot-toast";
import { TFunction } from "i18next";

import { createPageAndAddReference } from "../dialog/dialogSlice";
import { AppDispatch } from "app/store";

// ========= 常量 & 类型 =========

/**
 * 认为是“表格类文件”的扩展名集合
 */
const EXCEL_LIKE_EXTENSIONS = [
  ".xlsx",
  ".xls",
  ".csv",
  ".ods",
  ".xlsm",
  ".xlsb",
] as const;

/**
 * 认为是“纯文本类文件”的扩展名集合
 * - 这些文件不需要特殊结构解析，只需要按纯文本展示即可
 * - JSON 单独处理（见下方 isJsonFile），这里不要包含 .json
 */
const PLAIN_TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".mdx",
  ".log",
  ".ini",
  ".cfg",
  ".yaml",
  ".yml",
] as const;

interface ProcessDocumentFileArgs {
  file: File;
  /**
   * 由调用方生成，用于跟踪整个文件操作；
   * Excel 多 sheet 的情况会为每个 sheet 单独生成 sheetFileId。
   */
  fileId: string;
  dispatch: AppDispatch;
  t: TFunction<"chat", undefined>;
}

// ========= 工具函数 =========

/**
 * 是否为表格类文件（Excel / CSV / ODS 等）。
 */
const isExcelLikeFile = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return EXCEL_LIKE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

/**
 * 是否为 JSON 文件
 * - 通过扩展名 .json 或 常见 JSON MIME 判断
 */
const isJsonFile = (file: File, fileNameLower: string): boolean => {
  return (
    fileNameLower.endsWith(".json") ||
    file.type === "application/json" ||
    file.type === "application/ld+json" ||
    file.type === "application/jsonl"
  );
};

/**
 * 是否为“纯文本类文件”
 *
 * 注意：
 * - 这里不包含 JSON，JSON 有单独的处理逻辑
 * - 只要是 text/* 都认为可以按纯文本展示
 */
const isPlainTextFile = (file: File, fileNameLower: string): boolean => {
  // JSON 单独处理
  if (fileNameLower.endsWith(".json")) return false;

  if (file.type && file.type.startsWith("text/")) return true;

  return PLAIN_TEXT_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
};

/**
 * Excel -> JSON 的通用配置：
 * - raw: true     保留原始值（日期用 Date 或数字表示），不做字符串格式化
 * - cellDates: true  尽量把日期单元格解析成 JS Date 对象
 *
 * 具体的「显示格式」在 convertExcelToSlate 里处理（其中 displayData 会带有 Excel 的显示文本）。
 */
const getSheetToJsonOptions = () => ({
  raw: true,
  cellDates: true,
});

/**
 * JSON 文本 -> Slate 数据
 * - 若解析成功，则以缩进 2 的格式美化 JSON 字符串
 * - 若解析失败，则原样作为纯文本展示，不抛出异常
 */
const createSlateFromJsonText = (text: string): Descendant[] => {
  let prettyJson = text;

  try {
    const parsed = JSON.parse(text);
    prettyJson = JSON.stringify(parsed, null, 2);
  } catch {
    // 忽略解析错误，按原始文本展示
  }

  return [
    {
      // 如果你的编辑器有专门的 code-block 类型，可以改成 'code-block'
      type: "paragraph",
      children: [{ text: prettyJson }],
    } as any,
  ];
};

// ========= 主函数 =========

/**
 * 处理单个文档文件：
 *
 * - Excel / CSV / ODS 等多工作表文件：
 *   为每个工作表创建一个页面引用，并为它们附加一个共享的 groupId。
 * - 其他单文件类型（DOCX / PDF / TXT / JSON / 其他纯文本）：
 *   解析后直接生成一个页面引用。
 *
 * 内部使用动态 import，对不同类型文件按需加载各自解析库。
 * 若文件类型不受支持或解析失败会抛出错误。
 */
export const processDocumentFile = async ({
  file,
  fileId,
  dispatch,
  t,
}: ProcessDocumentFileArgs): Promise<void> => {
  const toastId = toast.loading(
    t("processingFile", "正在处理 {{fileName}}...", { fileName: file.name })
  );

  try {
    const fileNameLower = file.name.toLowerCase();
    let fileProcessed = false;

    // 当前语言，用于日期本地化（优先 i18next，其次浏览器语言，最后 en-US）
    const currentLocale =
      // @ts-expect-error: 运行时 t 上通常有 i18n
      (t as any)?.i18n?.language ||
      (typeof navigator !== "undefined" && navigator.language) ||
      "en-US";

    // ========= 1. Excel / CSV / ODS 等表格类文件 =========
    if (isExcelLikeFile(fileNameLower)) {
      fileProcessed = true;

      // 按需加载 xlsx 与 Excel -> Slate 转换工具
      const XLSX = await import("xlsx");
      const { convertExcelToSlate } = await import("utils/excelToSlate");

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error(t("excelNoSheets", "Excel 文件中没有找到工作表。"));
      }

      // 一个工作簿共享一个 groupId，用于在 UI / 业务上进行分组
      const workbookGroupId = nanoid();

      // 为每个工作表创建一个独立页面
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        // 原始数据（raw:true）—— 用来做日期解析等逻辑
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
          worksheet,
          getSheetToJsonOptions()
        );

        // Excel 显示数据（raw:false）—— 用来保留百分比 / 货币 / 时间等格式化文本
        const displayJsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
          worksheet,
          {
            ...getSheetToJsonOptions(),
            raw: false, // 关键：让 SheetJS 使用单元格格式生成文本，比如“30%”
          }
        );

        // 空表略过（完全没有有效数据行）
        if (!jsonData.length) continue;

        const pageTitle = `${file.name} (${sheetName})`;

        // 传入 locale + displayData，让日期和数字都按期望格式显示
        const slateData = convertExcelToSlate(jsonData, pageTitle, {
          locale: currentLocale,
          displayData: displayJsonData,
        });

        // 每个工作表在 Redux 状态中仍然有自己的 fileId
        const sheetFileId = nanoid();

        await dispatch(
          createPageAndAddReference({
            slateData,
            jsonData, // 原始数据保留
            title: pageTitle,
            type: "excel",
            fileId: sheetFileId,
            size: file.size,
            groupId: workbookGroupId,
          })
        ).unwrap(); // thunk rejected 时抛错，交由下面 catch 处理
      }
    }

    // ========= 2. 其他单文件类型：DOCX / PDF / TXT / JSON / 其他纯文本 =========
    else {
      let slateData: Descendant[] | undefined;
      // 目前明确区分 docx / pdf / txt / json，其他纯文本统一归为 txt
      let fileType: "docx" | "pdf" | "txt" | "json" | undefined;

      // DOCX
      if (fileNameLower.endsWith(".docx")) {
        fileType = "docx";

        const { convertDocxToSlate } = await import("./docxToSlate");
        slateData = await convertDocxToSlate(file);
      }
      // PDF
      else if (fileNameLower.endsWith(".pdf")) {
        fileType = "pdf";

        // 内部再按需加载 pdfjs-dist & worker
        const { convertPdfToSlate } = await import(
          "create/editor/utils/pdfToSlate"
        );
        slateData = await convertPdfToSlate(file);
      }
      // JSON（通过扩展名或 MIME 类型识别，按“格式化文本”展示）
      else if (isJsonFile(file, fileNameLower)) {
        fileType = "json";

        const textContent = await file.text();
        slateData = createSlateFromJsonText(textContent);
      }
      // 纯文本类文件（txt / md / log / yaml / 以及 text/* 等）
      else if (isPlainTextFile(file, fileNameLower)) {
        fileType = "txt";

        const { convertTxtToSlate } = await import(
          "create/editor/utils/txtToSlate"
        );
        const textContent = await file.text();
        slateData = await convertTxtToSlate(textContent);
      }

      if (fileType && slateData) {
        fileProcessed = true;

        await dispatch(
          createPageAndAddReference({
            slateData,
            title: file.name,
            type: fileType,
            fileId,
            size: file.size,
          })
        ).unwrap();
      }
    }

    // ========= 3. 文件类型不支持 =========
    if (!fileProcessed) {
      throw new Error(t("unsupportedFileType", "不支持的文件类型"));
    }

    toast.success(
      t("fileProcessedSuccess", "{{fileName}} 处理成功!", {
        fileName: file.name,
      }),
      { id: toastId }
    );
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : t("fileProcessDefaultError", "处理文件时发生未知错误");

    toast.error(
      t("fileProcessedError", "处理 {{fileName}} 时出错: {{error}}", {
        fileName: file.name,
        error: msg,
      }),
      { id: toastId }
    );

    // 重新抛出错误，以便调用方可以更新其状态（例如 fileErrors）
    throw new Error(msg);
  }
};
