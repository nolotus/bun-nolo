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
 * Excel -> JSON 的通用配置：
 * - raw: true     保留原始值（日期用 Date 或数字表示），不做字符串格式化
 * - cellDates: true  尽量把日期单元格解析成 JS Date 对象
 *
 * 具体的「显示格式」在 convertExcelToSlate 里，用 Intl.DateTimeFormat +
 * 当前语言来统一控制，这样可以做到多语言兼容。
 */
const getSheetToJsonOptions = () => ({
  raw: true,
  cellDates: true,
});

// ========= 主函数 =========

/**
 * 处理单个文档文件（Excel, Docx, PDF, TXT）。
 *
 * - Excel / CSV / ODS 等多工作表文件：
 *   为每个工作表创建一个页面引用，并为它们附加一个共享的 groupId。
 * - 其他单文件类型（DOCX / PDF / TXT）：
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

        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
          worksheet,
          getSheetToJsonOptions()
        );

        // 空表略过（完全没有有效数据行）
        if (!jsonData.length) continue;

        const pageTitle = `${file.name} (${sheetName})`;

        // 关键点：在这里传入 locale，让日期格式按用户语言本地化
        const slateData = convertExcelToSlate(jsonData, pageTitle, {
          locale: currentLocale,
        });

        // 每个工作表在 Redux 状态中仍然有自己的 fileId
        const sheetFileId = nanoid();

        await dispatch(
          createPageAndAddReference({
            slateData,
            jsonData,
            title: pageTitle,
            type: "excel",
            fileId: sheetFileId,
            size: file.size,
            groupId: workbookGroupId,
          })
        ).unwrap(); // thunk rejected 时抛错，交由下面 catch 处理
      }
    }

    // ========= 2. 其他单文件类型：DOCX / PDF / TXT =========
    else {
      let slateData: Descendant[] | undefined;
      let fileType: "docx" | "pdf" | "txt" | undefined;

      // DOCX
      if (fileNameLower.endsWith(".docx")) {
        fileType = "docx";

        const { convertDocxToSlate } = await import("./docxToSlate");
        slateData = await convertDocxToSlate(file);
        fileProcessed = true;
      }
      // PDF
      else if (fileNameLower.endsWith(".pdf")) {
        fileType = "pdf";

        // 内部再按需加载 pdfjs-dist & worker
        const { convertPdfToSlate } = await import(
          "create/editor/utils/pdfToSlate"
        );
        slateData = await convertPdfToSlate(file);
        fileProcessed = true;
      }
      // TXT（通过扩展名或 MIME 类型识别）
      else if (fileNameLower.endsWith(".txt") || file.type === "text/plain") {
        fileType = "txt";

        const { convertTxtToSlate } = await import(
          "create/editor/utils/txtToSlate"
        );
        const textContent = await file.text();
        slateData = await convertTxtToSlate(textContent);
        fileProcessed = true;
      }

      if (fileProcessed && fileType && slateData) {
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
