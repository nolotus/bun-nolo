import React, { useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import toast from "react-hot-toast";

import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

// 懒加载编辑器
const Editor = lazy(() => import("create/editor/Editor"));

// 统一的加载 UI
import PageLoading from "render/web/ui/PageLoading";

import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectIsReadOnly,
  selectIsSaving,
  selectHasPendingChanges,
  selectSaveError,
  selectJustSaved,
  updateSlate,
  savePage,
  resetJustSavedStatus,
} from "./pageSlice";

const STATUS_RESET_DELAY_MS = 2000;

/**
 * 统一的自动保存逻辑：
 * - Ctrl/Cmd + S
 * - 页面失焦（切标签页）
 * - 窗口关闭前
 */
function useAutoSave(onSave: () => void, readOnly: boolean) {
  useEffect(() => {
    if (readOnly) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onSave();
      }
    };

    const handleBeforeUnload = () => {
      onSave();
    };

    window.addEventListener("keydown", handleKeydown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onSave, readOnly]);
}

/**
 * 页面数据装载与错误提示封装
 */
function usePageData(pageKey: string, urlEditMode: boolean) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);

  // 初始化页面
  useEffect(() => {
    if (!pageKey) return;
    dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  // 统一错误提示
  useEffect(() => {
    const err = (page as any)?.error;
    if (err) {
      toast.error(`加载页面失败: ${err}`);
    }
  }, [page]);

  return { isLoading, isInitialized, page, isReadOnly };
}

/**
 * 根据页面数据推导编辑器初始值
 */
function useInitialValue(page: any, ready: boolean): EditorContent {
  return useMemo(() => {
    if (!ready) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }

    // 优先使用已有的 slateData
    if (Array.isArray(page?.slateData) && page.slateData.length) {
      return page.slateData;
    }

    // 否则尝试从 markdown content 转换
    if (page?.content) {
      try {
        const value = markdownToSlate(page.content);
        if (value.length) return value;
      } catch {
        // 转换失败给出友好默认文案
        return [
          {
            type: "heading-one",
            children: [{ text: "新页面（内容转换失败）" }],
          },
          {
            type: "paragraph",
            children: [{ text: "原始内容转换失败，请直接编辑此页面。" }],
          },
        ];
      }
    }

    // 新页面默认内容
    return [
      { type: "heading-one", children: [{ text: "新页面" }] },
      { type: "paragraph", children: [{ text: "开始编辑…" }] },
    ];
  }, [page, ready]);
}

/**
 * 底部保存状态条
 */
function PageSaveStatus() {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector(selectIsSaving);
  const hasPending = useAppSelector(selectHasPendingChanges);
  const saveError = useAppSelector(selectSaveError);
  const justSaved = useAppSelector(selectJustSaved);

  // “已保存” 状态短暂展示后自动复位
  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(
      () => dispatch(resetJustSavedStatus()),
      STATUS_RESET_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [justSaved, dispatch]);

  // 保存失败统一提示（排除“内容无变化”这种非真正错误）
  useEffect(() => {
    if (saveError && saveError !== "内容无变化") {
      toast.error("内容保存失败", { icon: "⚠️" });
    }
  }, [saveError]);

  const status: SaveStatus = isSaving
    ? "saving"
    : saveError && hasPending
      ? "error"
      : justSaved
        ? "saved"
        : null;

  return <SaveStatusIndicator status={status} hasPendingChanges={hasPending} />;
}

/**
 * 页面渲染与编辑主组件
 */
const RenderPage: React.FC<{ pageKey: string }> = ({ pageKey }) => {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();

  const urlEditMode = params.get("edit") === "true";

  const { isLoading, isInitialized, page, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );
  const initialValue = useInitialValue(page, isInitialized);

  // 立刻保存的动作（提供给自动保存和失焦）
  const saveNow = useCallback(() => {
    dispatch(savePage());
  }, [dispatch]);

  // 自动保存
  useAutoSave(saveNow, isReadOnly);

  // 编辑器 onChange 回调
  const handleEditorChange = useCallback(
    (value: EditorContent) => {
      dispatch(updateSlate(value));
    },
    [dispatch]
  );

  // 失焦时保存（仅在可编辑模式下）
  const handleEditorBlur = useCallback(() => {
    if (!isReadOnly) {
      saveNow();
    }
  }, [isReadOnly, saveNow]);

  const isPageLoading = isLoading || !isInitialized;

  // 整个页面加载状态
  if (isPageLoading) {
    return <PageLoading message="正在打开页面，为你准备内容…" />;
  }

  return (
    <Suspense
      // 编辑器懒加载状态
      fallback={<PageLoading message="正在为你准备编辑体验…" />}
    >
      <div className="RenderPage-container">
        <div className="RenderPage-editor-wrapper" key={pageKey}>
          <Editor
            initialValue={initialValue}
            onChange={handleEditorChange}
            onBlur={handleEditorBlur}
            readOnly={isReadOnly}
          />
          {!isReadOnly && <PageSaveStatus />}
        </div>
        <style href="RenderPage-styles" precedence="low">{`
        .RenderPage-container {
          min-height: 100%;
          width: 100%;
          background: var(--background);
          color: var(--text);
        }

        .RenderPage-editor-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-5) var(--space-4);
        }

        [contenteditable="true"] {
          outline: none;
          caret-color: var(--primary);
          padding: var(--space-1);
          font-size: 16px;
          line-height: 1.7;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .RenderPage-editor-wrapper {
            padding: var(--space-4) var(--space-3);
          }
        }
      `}</style>
      </div>
    </Suspense>
  );
};

export default React.memo(RenderPage);
