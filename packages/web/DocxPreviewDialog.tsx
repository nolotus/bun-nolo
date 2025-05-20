// web/DocxPreviewDialog.tsx
import React, { useEffect, useMemo } from "react";
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

  useEffect(() => {
    if (isOpen && pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly: true }));
    }
  }, [dispatch, isOpen, pageKey]);

  const initialValue = useMemo<EditorContent>(() => {
    // ... 初始值计算逻辑保持不变
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

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("preview")}: ${fileName}`}
      className="docx-preview-dialog" // 添加自定义类名用于样式覆盖
    >
      {isLoading || !isInitialized ? (
        <div className="loading-container">
          <p>{t("loadingContent")}</p>
        </div>
      ) : (
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

        /* 覆盖 Dialog 的默认样式，调整宽高 */
        :global(.docx-preview-dialog.dialog-container) {
          width: 75vw;
          min-width: 600px;
          max-width: 1400px;
          min-height: 400px;
          max-height: 85vh;
        }

        /* 响应式调整 */
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
