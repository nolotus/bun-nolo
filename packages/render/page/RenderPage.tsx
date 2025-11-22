// render/page/RenderPage.tsx
import React, { useEffect, useMemo, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import toast from "react-hot-toast";

import { EditorContent } from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

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

// 统一的自动保存钩子：快捷键/失焦/切页/关闭前
function useAutoSave(onSave: () => void, readOnly: boolean) {
  useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };
    const onVis = () => document.visibilityState === "hidden" && onSave();
    const onUnload = () => onSave();

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [onSave, readOnly]);
}

// 页面数据装载与错误提示
function usePageData(pageKey: string, urlEditMode: boolean) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);

  useEffect(() => {
    if (pageKey)
      dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  useEffect(() => {
    const err = (page as any)?.error;
    if (err) toast.error(`加载页面失败: ${err}`);
  }, [page]);

  return { isLoading, isInitialized, page, isReadOnly };
}

// 初始 Slate 值推导
function useInitialValue(page: any, ready: boolean): EditorContent {
  return useMemo(() => {
    if (!ready) return [{ type: "paragraph", children: [{ text: "" }] }];

    if (Array.isArray(page?.slateData) && page.slateData.length)
      return page.slateData;

    if (page?.content) {
      try {
        const v = markdownToSlate(page.content);
        if (v.length) return v;
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
  }, [page, ready]);
}

// 保存状态条
function PageSaveStatus() {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector(selectIsSaving);
  const hasPending = useAppSelector(selectHasPendingChanges);
  const saveError = useAppSelector(selectSaveError);
  const justSaved = useAppSelector(selectJustSaved);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(
      () => dispatch(resetJustSavedStatus()),
      STATUS_RESET_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [justSaved, dispatch]);

  useEffect(() => {
    if (saveError && saveError !== "内容无变化")
      toast.error("内容保存失败", { icon: "⚠️" });
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

const RenderPage = ({ pageKey }: { pageKey: string }) => {
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const urlEditMode = params.get("edit") === "true";

  const { isLoading, isInitialized, page, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );
  const initialValue = useInitialValue(page, isInitialized);

  const saveNow = () => dispatch(savePage());
  useAutoSave(saveNow, isReadOnly);

  if (isLoading || !isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100dvh - var(--headerHeight))",
          fontSize: 14,
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <>
      <div className="RenderPage-container">
        <div className="RenderPage-editor-wrapper">
          <Suspense
            fallback={
              <div style={{ padding: 20, textAlign: "center" }}>
                加载编辑器...
              </div>
            }
          >
            <div key={pageKey}>
              <Editor
                initialValue={initialValue}
                onChange={(v) => dispatch(updateSlate(v))}
                onBlur={() => !isReadOnly && saveNow()}
                readOnly={isReadOnly}
              />
            </div>
          </Suspense>
        </div>
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
          .RenderPage-editor-wrapper { padding: var(--space-4) var(--space-3); }
        }
      `}</style>
    </>
  );
};

export default React.memo(RenderPage);
