// components/page/RenderPage.tsx (最终正确版)

import React, { useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import toast from "react-hot-toast";

import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import { selectTheme } from "app/settings/settingSlice";

// 懒加载 Editor 以提升初始加载性能
const Editor = lazy(() => import("create/editor/Editor"));

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

// --- Helper Hooks (保持不变) ---
function useKeyboardSave(onSave: () => void, isReadOnly: boolean) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReadOnly) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, isReadOnly]);
}

function useSaveOnEvents(onSave: () => void, isReadOnly: boolean) {
  useEffect(() => {
    if (isReadOnly) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") onSave();
    };
    const handleBeforeUnload = () => onSave();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onSave, isReadOnly]);
}

function usePageData(pageKey: string, urlEditMode: boolean) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const error = page.error;

  useEffect(() => {
    if (pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
    }
  }, [dispatch, pageKey, urlEditMode]);

  useEffect(() => {
    if (error) {
      toast.error(`加载页面失败: ${error}`);
    }
  }, [error]);

  return { isLoading, isInitialized, page, isReadOnly };
}

function useInitialValue(page: any, isInitialized: boolean): EditorContent {
  return useMemo(() => {
    if (!isInitialized)
      return [{ type: "paragraph", children: [{ text: "" }] }];
    if (Array.isArray(page?.slateData) && page.slateData.length > 0)
      return page.slateData;
    if (page.content) {
      try {
        const converted = markdownToSlate(page.content);
        if (converted.length > 0) return converted;
      } catch {
        return [
          { type: "heading-one", children: [{ text: "新页面 (转换失败)" }] },
          { type: "paragraph", children: [{ text: "请直接编辑此内容。" }] },
        ];
      }
    }
    return [
      { type: "heading-one", children: [{ text: "新页面" }] },
      { type: "paragraph", children: [{ text: "开始编辑..." }] },
    ];
  }, [page, isInitialized]);
}

// --- Helper Components (保持不变) ---
function PageSaveStatus() {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector(selectIsSaving);
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);
  const saveError = useAppSelector(selectSaveError);
  const justSaved = useAppSelector(selectJustSaved);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (justSaved) {
      timer = setTimeout(
        () => dispatch(resetJustSavedStatus()),
        STATUS_RESET_DELAY_MS
      );
    }
    return () => clearTimeout(timer);
  }, [justSaved, dispatch]);

  useEffect(() => {
    if (saveError && saveError !== "内容无变化") {
      toast.error("内容保存失败", { icon: "⚠️" });
    }
  }, [saveError]);

  const getStatus = (): SaveStatus => {
    if (isSaving) return "saving";
    if (saveError && hasPendingChanges) return "error";
    if (justSaved) return "saved";
    return null;
  };

  return (
    <SaveStatusIndicator
      status={getStatus()}
      hasPendingChanges={hasPendingChanges}
    />
  );
}

const Loader = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // 让加载指示器撑满父容器(MainLayout__pageContent)的可见高度
        height: "calc(100dvh - var(--headerHeight))",
        color: theme.textSecondary,
        fontSize: 14,
      }}
    >
      加载中...
    </div>
  );
};

const EditorLoader = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <div
      style={{ padding: 20, textAlign: "center", color: theme.textSecondary }}
    >
      加载编辑器...
    </div>
  );
};

// ======================================================================
// 【核心组件】: RenderPage
// ======================================================================
const RenderPage = ({ pageKey }: { pageKey: string }) => {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const urlEditMode = params.get("edit") === "true";

  const { isLoading, isInitialized, page, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );
  const initialValue = useInitialValue(page, isInitialized);

  const triggerSaveNow = useCallback(() => {
    dispatch(savePage());
  }, [dispatch]);

  const handleChange = useCallback(
    (value: EditorContent) => {
      dispatch(updateSlate(value));
    },
    [dispatch]
  );

  const handleBlur = useCallback(() => {
    if (!isReadOnly) triggerSaveNow();
  }, [isReadOnly, triggerSaveNow]);

  useKeyboardSave(triggerSaveNow, isReadOnly);
  useSaveOnEvents(triggerSaveNow, isReadOnly);

  if (isLoading || !isInitialized) {
    return <Loader />;
  }

  return (
    <>
      <div className="RenderPage-container">
        <div className="RenderPage-editor-wrapper">
          <Suspense fallback={<EditorLoader />}>
            <div key={pageKey}>
              <Editor
                initialValue={initialValue}
                onChange={handleChange}
                readOnly={isReadOnly}
                onBlur={handleBlur}
              />
            </div>
          </Suspense>
        </div>
        {!isReadOnly && <PageSaveStatus />}
      </div>

      <style href="RenderPage-styles" precedence="low">{`
        .RenderPage-container {
          /* [核心修复]
           * 移除所有 height, min-height, 和 overflow 属性。
           * 这个组件不再关心自己的高度或滚动，它只是一个内容容器。
           * 它的高度将由其内部的 .RenderPage-editor-wrapper 的内容自然撑开。
           * 所有的滚动都由父级 MainLayout__pageContent 处理。
           */
          width: 100%;
          background: var(--background);
          color: var(--text);
        }

        .RenderPage-editor-wrapper {
          /* 这个 wrapper 的唯一职责就是限制内容宽度、居中并提供边距。 */
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-5) var(--space-4); /* 20px 16px */
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
            padding: var(--space-4) var(--space-3); /* 16px 12px */
          }
        }
        
        /* 打印时，移除最大宽度限制，让内容填满纸张 */
        @media print {
          .RenderPage-editor-wrapper { 
            max-width: 100%; 
            padding: 0; 
            margin: 0; 
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(RenderPage);
