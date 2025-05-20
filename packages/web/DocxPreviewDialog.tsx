// web/DocxPreviewDialog.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { Dialog } from "render/web/ui/Dialog";
import { useTranslation } from "react-i18next";
import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
} from "render/page/pageSlice";
import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { selectTheme } from "app/theme/themeSlice";
import {
  slateToExcelData,
  convertToCSV,
  convertToJSON,
} from "utils/slateToExcel";
import * as XLSX from "xlsx";

// 懒加载 Editor 组件
const Editor = React.lazy(() => import("create/editor/Editor"));

interface DocxPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageKey: string;
  fileName: string;
}

const DocxPreviewDialog: React.FC<DocxPreviewDialogProps> = ({
  isOpen,
  onClose,
  pageKey,
  fileName,
}) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const [selectedFormat, setSelectedFormat] = useState("csv");

  useEffect(() => {
    if (isOpen && pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly: true }));
    }
  }, [dispatch, isOpen, pageKey]);

  const initialValue = useMemo<EditorContent>(() => {
    if (!isInitialized) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }
    const slate = page?.slateData;
    if (Array.isArray(slate) && slate.length) return slate;
    if (page?.content) {
      try {
        return markdownToSlate(page.content);
      } catch {
        return [
          { type: "heading-one", children: [{ text: "内容加载失败" }] },
          { type: "paragraph", children: [{ text: "无法解析文档内容。" }] },
        ];
      }
    }
    return [
      { type: "heading-one", children: [{ text: fileName }] },
      { type: "paragraph", children: [{ text: "内容为空或正在加载..." }] },
    ];
  }, [page, isInitialized, fileName]);

  const handleDownload = useCallback(() => {
    const excelData = slateToExcelData(initialValue);
    if (!excelData) {
      alert(t("noTableDataToExport"));
      return;
    }

    const { headers, rows } = excelData;
    const baseFileName =
      fileName.split(".").slice(0, -1).join(".") || "exported_data";

    if (selectedFormat === "csv") {
      const csvData = convertToCSV(headers, rows);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (selectedFormat === "json") {
      const jsonData = convertToJSON(headers, rows);
      const blob = new Blob([jsonData], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseFileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (selectedFormat === "xlsx") {
      const jsonData = rows.map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${baseFileName}.xlsx`);
    }
  }, [initialValue, fileName, selectedFormat, t]);

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("preview")}: ${fileName}`}
      className="docx-preview-dialog"
    >
      {isLoading || !isInitialized ? (
        <div className="loading-container">
          <p>{t("loadingContent")}</p>
        </div>
      ) : (
        <>
          <div className="editor-container">
            <React.Suspense
              fallback={
                <div className="editor-loading">{t("loadingEditor")}</div>
              }
            >
              <Editor
                initialValue={initialValue}
                onChange={() => {}} // 只读模式下不需要处理变化
                onFocus={() => {}} // 不需要处理焦点事件
                onBlur={() => {}} // 不需要处理失焦事件
                readOnly={true} // 设置为只读模式
              />
            </React.Suspense>
          </div>
          {(fileName.toLowerCase().includes("xls") ||
            fileName.toLowerCase().includes("csv") ||
            fileName.toLowerCase().includes("excel")) && (
            <div className="export-controls">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">XLSX</option>
              </select>
              <button onClick={handleDownload}>{t("export")}</button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .editor-container {
          height: calc(70vh - 100px);
          min-height: 400px;
          max-height: calc(85vh - 100px);
          overflow-y: auto;
          padding: 15px;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          background: ${theme.background};
        }

        .editor-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .export-controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: 10px;
          gap: 10px;
        }

        .export-controls select {
          padding: 6px 8px;
          border: 1px solid ${theme.borderLight};
          border-radius: 4px;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
        }

        .export-controls button {
          padding: 8px 16px;
          border: none;
          background: ${theme.primary};
          color: white;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-controls button:hover {
          background: ${theme.primaryDark};
        }

        .editor-container::-webkit-scrollbar {
          width: 6px;
        }

        .editor-container::-webkit-scrollbar-thumb {
          background: ${theme.borderHover};
          border-radius: 3px;
        }

        .editor-container::-webkit-scrollbar-thumb:hover {
          background: ${theme.textQuaternary};
        }

        :global(.docx-preview-dialog.dialog-container) {
          width: 75vw;
          min-width: 600px;
          max-width: 1400px;
          min-height: 400px;
          max-height: 85vh;
        }

        @media (min-width: 1601px) {
          :global(.docx-preview-dialog.dialog-container) {
            width: 80vw;
            max-width: 1600px;
            max-height: 88vh;
          }
          .editor-container {
            height: calc(75vh - 100px);
            max-height: calc(88vh - 100px);
          }
        }

        @media (max-width: 1200px) {
          :global(.docx-preview-dialog.dialog-container) {
            width: 80vw;
            max-width: 850px;
            max-height: 80vh;
          }
          .editor-container {
            height: calc(65vh - 100px);
            max-height: calc(80vh - 100px);
          }
        }

        @media (max-width: 768px) {
          :global(.docx-preview-dialog.dialog-container) {
            width: 90vw;
            max-width: 600px;
            max-height: 75vh;
          }
          .editor-container {
            height: calc(60vh - 100px);
            max-height: calc(75vh - 100px);
          }
        }

        @media (max-width: 480px) {
          :global(.docx-preview-dialog.dialog-container) {
            width: 95vw;
            min-width: 320px;
            height: 95vh;
            max-height: 95vh;
            border-radius: 0;
          }
          .editor-container {
            height: calc(80vh - 100px);
            max-height: calc(95vh - 100px);
          }
        }

        @media (min-height: 1000px) {
          :global(.docx-preview-dialog.dialog-container) {
            max-height: 90vh;
          }
          .editor-container {
            height: calc(75vh - 100px);
            max-height: calc(90vh - 100px);
          }
        }

        @media (max-height: 600px) {
          :global(.docx-preview-dialog.dialog-container) {
            max-height: 80vh;
          }
          .editor-container {
            height: calc(60vh - 100px);
            max-height: calc(80vh - 100px);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default DocxPreviewDialog;
