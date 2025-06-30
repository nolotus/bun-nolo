// 文件: components/page/RenderPage.tsx
// (假设文件路径)

import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
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

// ======================================================================
// 【新增 Hook】: 封装基于事件的保存触发器
// ======================================================================
function useSaveOnEvents(onSave: () => void, isReadOnly: boolean) {
  useEffect(() => {
    if (isReadOnly) return;

    // 1. 当用户切换标签页或最小化窗口时保存
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onSave();
      }
    };

    // 2. 当用户尝试关闭标签页时保存
    // 注意: 现代浏览器对 beforeunload 中的操作有严格限制，
    // dispatch thunk 是一个可行的同步操作。
    // 我们不在这里使用 navigator.sendBeacon，因为 RTK 的 thunk 机制更统一。
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // onSave() 内部的 condition 会检查是否有未保存的更改
      onSave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onSave, isReadOnly]);
}

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
  const theme = useAppSelector(selectTheme);

  const { isLoading, isInitialized, page, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );
  const initialValue = useInitialValue(page, isInitialized);

  // 统一的保存触发函数
  const triggerSaveNow = useCallback(() => {
    // dispatch(savePage()) 会由 thunk 的 condition 自动处理
    // 是否需要保存，无需在组件中判断。
    dispatch(savePage());
  }, [dispatch]);

  // 编辑器内容变化回调
  const handleChange = useCallback(
    (value: EditorContent) => {
      dispatch(updateSlate(value));
    },
    [dispatch]
  );

  // 编辑器失焦时回调
  const handleBlur = useCallback(() => {
    if (!isReadOnly) {
      triggerSaveNow();
    }
  }, [isReadOnly, triggerSaveNow]);

  // 注册所有保存事件
  useKeyboardSave(triggerSaveNow, isReadOnly);
  useSaveOnEvents(triggerSaveNow, isReadOnly);

  if (isLoading || !isInitialized) {
    return <Loader theme={theme} />;
  }

  return (
    <div className="container" style={styles.container(theme)}>
      <main className="main">
        <div className="scrollable">
          <div className="wrapper">
            <React.Suspense fallback={<EditorLoader theme={theme} />}>
              <div key={pageKey}>
                <Editor
                  initialValue={initialValue}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  onBlur={handleBlur} // <-- 新增 onBlur 属性
                />
              </div>
            </React.Suspense>
          </div>
        </div>
      </main>

      {!isReadOnly && <PageSaveStatus />}

      <style>{styles.css(theme)}</style>
    </div>
  );
});

/*——————— Hook: 装载并选择 Page 数据 (维持不变) ———————*/
function usePageData(pageKey: string, urlEditMode: boolean) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const error = page.error;

  useEffect(() => {
    if (!pageKey) console.error("RenderPage: missing pageKey");
    else dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  useEffect(() => {
    if (error) console.error("加载页面失败:", error);
  }, [error]);

  return { isLoading, isInitialized, page, isReadOnly };
}

/*——————— Hook: 计算 Slate 编辑器的初始值 (维持不变) ———————*/
function useInitialValue(page: any, isInitialized: boolean): EditorContent {
  return useMemo<EditorContent>(() => {
    if (!isInitialized) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }
    const slate = page?.slateData;
    if (Array.isArray(slate) && slate.length) return slate;
    if (page.content) {
      try {
        return markdownToSlate(page.content);
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

/*——————— 组件: 页面保存状态指示器 (维持不变) ———————*/
function PageSaveStatus() {
  const dispatch = useAppDispatch();
  const isSaving = useAppSelector(selectIsSaving);
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);
  const saveError = useAppSelector(selectSaveError);
  const justSaved = useAppSelector(selectJustSaved);

  useEffect(() => {
    if (justSaved) {
      const timer = setTimeout(() => {
        dispatch(resetJustSavedStatus());
      }, STATUS_RESET_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [justSaved, dispatch]);

  useEffect(() => {
    if (saveError && saveError !== "内容无变化") {
      toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
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

/*—————— Loader / EditorLoader / 样式 (维持不变) ———————*/
const Loader = ({ theme }: any) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.textSecondary,
      fontSize: 14,
    }}
  >
    加载中...
  </div>
);

const EditorLoader = ({ theme }: any) => (
  <div style={{ padding: 20, textAlign: "center", color: theme.textSecondary }}>
    加载编辑器...
  </div>
);

const styles = {
  container: (t: any) => ({
    display: "flex",
    flexDirection: "column",
    height: "calc(100dvh - 60px)",
    background: t.background,
    color: t.text,
  }),
  css: (t: any) => `
    .main { flex:1; display:flex; overflow:hidden }
    .scrollable { flex:1; overflow-y:auto; scroll-behavior:smooth }
    .wrapper { max-width:800px; margin:0 auto; padding:20px 16px }
    [contenteditable="true"] { outline:none; caret-color:${t.primary}; padding:4px; font-size:16px; line-height:1.7; color:${t.text} }
    .scrollable::-webkit-scrollbar { width:6px }
    .scrollable::-webkit-scrollbar-thumb { background:${t.borderHover}; border-radius:3px }
    .scrollable::-webkit-scrollbar-thumb:hover { background:${t.textQuaternary} }
    @media (max-width:768px) { .wrapper { padding:16px 12px } }
    @media print {
      .container, .scrollable { overflow:visible }
      .container { height:auto }
      .wrapper { max-width:100%; padding:0; margin:0 }
      .page-save-status-indicator, .tools-container { display:none!important }
      body { -webkit-print-color-adjust:exact; color-adjust:exact }
    }
  `,
};
