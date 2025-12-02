// render/web/DocxPreviewDialog.tsx
import React, { useEffect, useMemo, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { Dialog } from "render/web/ui/modal/Dialog";
import { useTranslation } from "react-i18next";
import { FileIcon } from "@primer/octicons-react"; // 增加图标增加识别度
import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
} from "render/page/pageSlice";
import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";

// 懒加载 Editor
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
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);

  useEffect(() => {
    if (isOpen && pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly: true }));
    }
  }, [dispatch, isOpen, pageKey]);

  const initialValue = useMemo<EditorContent>(() => {
    if (!isInitialized)
      return [{ type: "paragraph", children: [{ text: "" }] }];
    const slate = page?.slateData;
    if (Array.isArray(slate) && slate.length) return slate;
    if (page?.content) {
      try {
        return markdownToSlate(page.content);
      } catch {
        return [{ type: "paragraph", children: [{ text: "Parse Error" }] }];
      }
    }
    return [{ type: "paragraph", children: [{ text: "Loading..." }] }];
  }, [page, isInitialized]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        // 使用图标+标题，更像一个文件浏览器
        title={
          <div className="dialog-title-wrapper">
            <FileIcon size={16} className="title-icon" />
            <span className="title-text" title={fileName}>
              {fileName}
            </span>
          </div>
        }
        size="xlarge" // 关键：使用超大尺寸
        className="docx-preview-modal"
      >
        <div className="preview-body-content">
          {isLoading || !isInitialized ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>{t("loadingContent")}</p>
            </div>
          ) : (
            <div className="editor-paper">
              <Suspense fallback={<div className="spinner" />}>
                <Editor
                  initialValue={initialValue}
                  readOnly={true}
                  className="preview-editor"
                />
              </Suspense>
            </div>
          )}
        </div>
      </Dialog>

      <style href="docx-preview-dialog" precedence="high">{`
        .dialog-title-wrapper {
          display: flex; align-items: center; gap: 8px;
          overflow: hidden; max-width: 100%;
        }
        .title-icon { color: var(--primary); flex-shrink: 0; }
        .title-text { 
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
          font-weight: 500;
        }

        .loading-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 300px; color: var(--textTertiary); gap: 12px;
        }
        .spinner {
          width: 24px; height: 24px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* 模拟 A4/文档纸张效果 */
        .editor-paper {
          /* 可选：如果你想要像 Word 那样在灰色背景上的白纸效果 */
          /* background: white; */
          /* box-shadow: 0 4px 12px rgba(0,0,0,0.05); */
          /* margin: 0 auto; */
          /* max-width: 900px; */
          /* padding: 40px; */
          
          /* 或者：简洁的平铺模式（推荐用于快速预览） */
          min-height: 400px;
        }

        /* 修复 Editor 内部可能自带的 padding */
        .preview-editor {
          padding-bottom: 40px; 
        }

        /* 表格过宽处理 */
        .preview-editor table {
          display: block;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </>
  );
};

export default DocxPreviewDialog;
