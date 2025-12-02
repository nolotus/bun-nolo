// src/features/chat/web/fileProcessor.ts

import { nanoid } from "nanoid";
import { Descendant } from "slate";
import toast from "react-hot-toast";
import { TFunction } from "i18next";

import { createPageAndAddReference } from "../dialog/dialogSlice";
import { AppDispatch } from "app/store";

interface ProcessDocumentFileArgs {
  file: File;
  fileId: string; // 由调用方生成，用于跟踪整个文件操作
  dispatch: AppDispatch;
  t: TFunction<"chat", undefined>;
}

/**
 * 处理单个文档文件（Excel, Docx, PDF, TXT）。
 * Excel 文件会为每个工作表创建一个单独的页面引用，并为它们附加一个共享的 groupId。
 * 现在内部使用动态 import，对不同类型的文件按需加载各自的解析库。
 * @throws 如果文件类型不受支持或处理过程中发生错误，则会抛出错误。
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
    const name = file.name.toLowerCase();
    const sheetExts = [".xlsx", ".xls", ".csv", ".ods", ".xlsm", ".xlsb"];
    let fileProcessed = false;

    // --- 多工作表 Excel 处理 ---
    if (sheetExts.some((ext) => name.endsWith(ext))) {
      fileProcessed = true;

      // ✅ 按需加载 xlsx 和 convertExcelToSlate
      const XLSX = await import("xlsx");
      const { convertExcelToSlate } = await import("utils/excelToSlate");

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      if (wb.SheetNames.length === 0) {
        throw new Error(t("excelNoSheets", "Excel 文件中没有找到工作表。"));
      }

      // 为整个工作簿创建一个共享的组ID，用于关联所有来自此文件的工作表
      const workbookGroupId = nanoid();

      // 为每个工作表创建一个页面引用
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        // 如果工作表为空，则跳过
        if (jsonData.length === 0) continue;

        const pageTitle = `${file.name} (${sheetName})`;
        const slateData = convertExcelToSlate(jsonData, pageTitle);
        const sheetFileId = nanoid(); // 每个工作表在 Redux 中仍有唯一的 id

        await dispatch(
          createPageAndAddReference({
            slateData,
            jsonData,
            title: pageTitle,
            type: "excel",
            fileId: sheetFileId,
            size: file.size,
            groupId: workbookGroupId, // 共享 groupId
          })
        ).unwrap(); // unwrap 会在 thunk rejected 时抛出错误
      }
    }
    // --- 其他单文件类型处理 (DOCX / PDF / TXT) ---
    else {
      let slateData: Descendant[];
      let fileType: "docx" | "pdf" | "txt" | undefined;

      if (name.endsWith(".docx")) {
        fileType = "docx";

        // ✅ 按需加载 DOCX 解析逻辑
        const { convertDocxToSlate } = await import("./docxToSlate");
        slateData = await convertDocxToSlate(file);
        fileProcessed = true;
      } else if (name.endsWith(".pdf")) {
        fileType = "pdf";

        // ✅ 按需加载 PDF 解析逻辑（内部再按需加载 pdfjs-dist 和 worker）
        const { convertPdfToSlate } = await import(
          "create/editor/utils/pdfToSlate"
        );
        slateData = await convertPdfToSlate(file);
        fileProcessed = true;
      } else if (name.endsWith(".txt") || file.type === "text/plain") {
        fileType = "txt";

        // ✅ 按需加载 TXT 解析逻辑
        const { convertTxtToSlate } = await import(
          "create/editor/utils/txtToSlate"
        );
        slateData = await convertTxtToSlate(await file.text());
        fileProcessed = true;
      }

      if (fileProcessed && fileType) {
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
