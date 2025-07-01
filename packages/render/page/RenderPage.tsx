// components/page/RenderPage.tsx

import React, { useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import toast from "react-hot-toast";

import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import { selectTheme } from "app/settings/settingSlice";

const Editor = React.lazy(() => import("create/editor/Editor"));

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
        height: "100%",
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
export default React.memo(function RenderPage({
  pageKey,
}: {
  pageKey: string;
}) {
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
        <main className="RenderPage-main">
          <div className="RenderPage-scrollable">
            <div className="RenderPage-wrapper">
              <React.Suspense fallback={<EditorLoader />}>
                <div key={pageKey}>
                  <Editor
                    initialValue={initialValue}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    onBlur={handleBlur}
                  />
                </div>
              </React.Suspense>
            </div>
          </div>
        </main>
        {!isReadOnly && <PageSaveStatus />}
      </div>
      <style href="RenderPage-styles" precedence="low">{`
        .RenderPage-container {
          display: flex;
          flex-direction: column;
          height: 100%; /* 核心修复：填满 MainLayout__pageContent 提供的空间 */
          background: var(--background);
          color: var(--text);
        }
        .RenderPage-main {
          flex: 1;
          display: flex;
          overflow: hidden; /* 防止内容溢出 */
        }
        .RenderPage-scrollable {
          flex: 1;
          overflow-y: auto; /* 关键：由它自己负责滚动 */
          scroll-behavior: smooth;
        }
        .RenderPage-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px 16px;
        }
        [contenteditable="true"] {
          outline: none;
          caret-color: var(--primary);
          padding: 4px;
          font-size: 16px;
          line-height: 1.7;
          color: var(--text);
        }
        .RenderPage-scrollable::-webkit-scrollbar { width: 6px; }
        .RenderPage-scrollable::-webkit-scrollbar-thumb { background: var(--borderHover); border-radius: 3px; }
        .RenderPage-scrollable::-webkit-scrollbar-thumb:hover { background: var(--textQuaternary); }
        @media (max-width: 768px) {
          .RenderPage-wrapper { padding: 16px 12px; }
        }
        @media print {
          .RenderPage-container, .RenderPage-scrollable { overflow: visible; height: auto; }
          .RenderPage-wrapper { max-width: 100%; padding: 0; margin: 0; }
        }
      `}</style>
    </>
  );
});
