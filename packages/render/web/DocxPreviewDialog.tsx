// web/DocxPreviewDialog.tsx
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { Dialog } from "render/web/ui/modal/Dialog";
import { useTranslation } from "react-i18next";
import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
} from "render/page/pageSlice";
import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";

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
    <>
      <style href="docx-preview-dialog" precedence="high">{`
        .docx-preview-dialog {
          width: 75vw;
          min-width: 600px;
          max-width: 1400px;
          min-height: 400px;
          max-height: 85vh;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: var(--space-4);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 50vh;
          color: var(--textSecondary);
          font-size: 0.875rem;
          gap: var(--space-3);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--borderLight);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .editor-container {
          flex: 1;
          min-height: 400px;
          max-height: calc(85vh - 120px);
          overflow-y: auto;
          padding: var(--space-4);
          border: 1px solid var(--border);
          border-radius: var(--space-2);
          background: var(--background);
        }

        .editor-container::-webkit-scrollbar {
          width: 6px;
        }

        .editor-container::-webkit-scrollbar-thumb {
          background: var(--borderHover);
          border-radius: 3px;
          transition: background-color 0.15s ease;
        }

        .editor-container::-webkit-scrollbar-thumb:hover {
          background: var(--textQuaternary);
        }

        @media (min-width: 1601px) {
          .docx-preview-dialog {
            width: 80vw;
            max-width: 1600px;
            max-height: 88vh;
          }
          .editor-container {
            max-height: calc(88vh - 120px);
          }
        }

        @media (max-width: 1200px) {
          .docx-preview-dialog {
            width: 80vw;
            max-width: 850px;
            max-height: 80vh;
          }
          .editor-container {
            max-height: calc(80vh - 120px);
          }
        }

        @media (max-width: 768px) {
          .docx-preview-dialog {
            width: 90vw;
            max-width: 600px;
            max-height: 75vh;
          }
          .editor-container {
            max-height: calc(75vh - 120px);
            padding: var(--space-3);
          }
        }

        @media (max-width: 480px) {
          .docx-preview-dialog {
            width: 95vw;
            min-width: 320px;
            height: 95vh;
            max-height: 95vh;
            border-radius: 0;
          }
          .editor-container {
            max-height: calc(95vh - 120px);
            padding: var(--space-2);
          }
        }

        @media (min-height: 1000px) {
          .docx-preview-dialog {
            max-height: 90vh;
          }
          .editor-container {
            max-height: calc(90vh - 120px);
          }
        }

        @media (max-height: 600px) {
          .docx-preview-dialog {
            max-height: 80vh;
          }
          .editor-container {
            max-height: calc(80vh - 120px);
          }
        }
      `}</style>

      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={`${t("preview")}: ${fileName}`}
        className="docx-preview-dialog"
      >
        <div className="preview-content">
          {isLoading || !isInitialized ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>{t("loadingContent")}</p>
            </div>
          ) : (
            <div className="editor-container">
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="loading-spinner" />
                    <span>{t("loadingEditor")}</span>
                  </div>
                }
              >
                <Editor
                  initialValue={initialValue}
                  onChange={() => {}}
                  onFocus={() => {}}
                  onBlur={() => {}}
                  readOnly={true}
                />
              </React.Suspense>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default DocxPreviewDialog;
