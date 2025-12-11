// render/web/DocxPreviewDialog.tsx - 改进后版本
import React, { useEffect, useMemo, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { Dialog } from "render/web/ui/modal/Dialog";
import { useTranslation } from "react-i18next";
import { LuFileText } from "react-icons/lu"; // 使用 lucide-react 的文件图标
import StreamingIndicator from "render/web/ui/StreamingIndicator";
import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
} from "render/page/pageSlice";
import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";

// 懒加载 Editor 组件
const Editor = React.lazy(() => import("create/editor/Editor"));

/**
 * 文档预览对话框组件属性
 */
interface DocxPreviewDialogProps {
  /** 控制对话框显示/隐藏 */
  isOpen: boolean;
  /** 关闭对话框的回调函数 */
  onClose: () => void;
  /** 要预览的文档页面唯一标识 */
  pageKey: string;
  /** 文档文件名，用于显示 */
  fileName: string;
}

/**
 * 文档预览对话框组件
 * 用于在对话中预览上传的文档内容
 */
const DocxPreviewDialog: React.FC<DocxPreviewDialogProps> = ({
  isOpen,
  onClose,
  pageKey,
  fileName,
}) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();

  // 从 Redux store 获取页面状态
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);

  // 初始化页面数据
  useEffect(() => {
    if (isOpen && pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly: true }));
    }
  }, [dispatch, isOpen, pageKey]);

  /**
   * 根据页面数据生成编辑器初始内容
   * 支持 slate 数据或 markdown 内容
   */
  const initialValue = useMemo<EditorContent>(() => {
    // 如果页面未初始化，返回空内容
    if (!isInitialized) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }

    // 优先使用 slate 数据
    const slate = page?.slateData;
    if (Array.isArray(slate) && slate.length) {
      return slate;
    }

    // 如果有 markdown 内容，尝试转换为 slate 格式
    if (page?.content) {
      try {
        return markdownToSlate(page.content);
      } catch {
        // 转换失败时返回错误信息
        return [{ type: "paragraph", children: [{ text: "Parse Error" }] }];
      }
    }

    // 默认返回加载中状态
    return [{ type: "paragraph", children: [{ text: "Loading..." }] }];
  }, [page, isInitialized]);

  // 如果对话框未打开，不渲染任何内容
  if (!isOpen) {
    return null;
  }

  /**
   * 渲染对话框标题
   */
  const renderTitle = () => (
    <div className="dialog-title-wrapper">
      <LuFileText size={16} className="title-icon" />
      <span className="title-text" title={fileName}>
        {fileName}
      </span>
    </div>
  );

  /**
   * 渲染加载状态
   */
  const renderLoadingState = () => (
    <div className="loading-state">
      <StreamingIndicator />
      <p className="loading-text">{t("loadingContent")}</p>
    </div>
  );

  /**
   * 渲染文档内容
   */
  const renderDocumentContent = () => (
    <div className="editor-paper">
      <Suspense fallback={<StreamingIndicator />}>
        <Editor
          initialValue={initialValue}
          readOnly={true}
          className="preview-editor"
        />
      </Suspense>
    </div>
  );

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={renderTitle()}
        size="xlarge"
        className="docx-preview-modal"
        aria-label={`Preview of ${fileName}`}
      >
        <div className="preview-body-content">
          {isLoading || !isInitialized
            ? renderLoadingState()
            : renderDocumentContent()}
        </div>
      </Dialog>

      <DialogStyles />
    </>
  );
};

/**
 * 对话框样式组件
 * 将样式提取为单独组件以提高可维护性
 */
const DialogStyles = () => (
  <style href="docx-preview-dialog" precedence="high">{`
    /* 标题样式 */
    .dialog-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      max-width: 100%;
    }

    .title-icon {
      color: var(--primary);
      flex-shrink: 0;
    }

    .title-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      font-size: 1rem;
    }

    /* 加载状态样式 */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: var(--textTertiary);
      gap: 12px;
    }

    .loading-text {
      font-size: 0.875rem;
      margin-top: 8px;
    }

    /* 文档内容区域样式 */
    .editor-paper {
      min-height: 400px;
      padding: 16px;
      background-color: var(--background);
    }

    /* 编辑器样式调整 */
    .preview-editor {
      padding-bottom: 40px;
      min-height: 100%;
    }

    /* 表格响应式处理 */
    .preview-editor table {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 16px;
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      .dialog-title-wrapper {
        gap: 6px;
      }

      .title-text {
        font-size: 0.9rem;
      }

      .editor-paper {
        padding: 12px;
        min-height: 300px;
      }
    }

    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .editor-paper {
        background-color: var(--backgroundSecondary);
      }
    }
  `}</style>
);

export default DocxPreviewDialog;
