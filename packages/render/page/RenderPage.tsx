import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";

import {
  EditorContent,
  extractTitleFromSlate,
  compareSlateContent,
} from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import useKeyboardSave from "./useKeyboardSave";
import { selectTheme } from "app/theme/themeSlice";

// Editor 懒加载
const Editor = React.lazy(() => import("create/editor/Editor"));

// patch 来自 database/dbSlice，其它 action/selectors 来自 pageSlice
import { patch } from "database/dbSlice";
import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageDbSpaceId,
  selectIsReadOnly,
  updateSlate,
  updatePageTitle,
  selectPageError,
} from "./pageSlice";
import { updateContentTitle } from "create/space/spaceSlice";

interface RenderPageProps {
  pageKey: string;
}

export default React.memo(function RenderPage({ pageKey }: RenderPageProps) {
  const [params] = useSearchParams();
  const urlEditMode = params.get("edit") === "true";
  const theme = useAppSelector(selectTheme);

  const { isLoading, isInitialized, page, dbSpaceId, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );

  const initialValue = useInitialValue(page, isInitialized);

  const {
    saveStatus,
    lastSavedTime,
    handleChange,
    handleRetry,
    handleFocus,
    handleBlur,
    hasPendingChanges,
  } = useAutoSave({ pageKey, page, dbSpaceId, isReadOnly });

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
                  placeholder="开始编辑..."
                  initialValue={initialValue}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  readOnly={isReadOnly}
                />
              </div>
            </React.Suspense>
          </div>
        </div>
      </main>

      {!isReadOnly && (
        <SaveStatusIndicator
          status={saveStatus}
          lastSaved={lastSavedTime}
          onRetry={handleRetry}
          hasPendingChanges={hasPendingChanges}
        />
      )}

      <style>{styles.css(theme)}</style>
    </div>
  );
});

/*——————— Hook: 装载并选择 Page 数据 ———————*/
function usePageData(pageKey: string, urlEditMode: boolean) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const page = useAppSelector(selectPageData);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const error = useAppSelector(selectPageError);

  useEffect(() => {
    if (!pageKey) console.error("RenderPage: missing pageKey");
    else dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  useEffect(() => {
    if (error) console.error("加载页面失败:", error);
  }, [error]);

  return { isLoading, isInitialized, page, dbSpaceId, isReadOnly };
}

/*——————— Hook: 计算 Slate 编辑器的初始值 ———————*/
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

/*——————— Hook: 自动保存 & 状态管理 ———————*/
function useAutoSave({
  pageKey,
  page,
  dbSpaceId,
  isReadOnly,
}: {
  pageKey: string;
  page: any;
  dbSpaceId: string | null;
  isReadOnly: boolean;
}) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = React.useState<SaveStatus>(null);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  const lastSavedDate = React.useRef<Date | null>(
    page.updatedAt ? new Date(page.updatedAt) : null
  );
  const lastContent = React.useRef<EditorContent>(
    JSON.parse(JSON.stringify(page?.slateData || []))
  );
  const saveTimer = React.useRef<number>();
  const statusTimer = React.useRef<number>();
  const editorFocus = React.useRef(false);

  const formatSaved = React.useCallback((d: Date | null) => {
    if (!d) return null;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "刚刚";
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return d.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, []);

  // 初始化、定时格更新时间
  useEffect(() => {
    if (lastSavedDate.current) setLastSaved(formatSaved(lastSavedDate.current));
    const id = setInterval(() => {
      if (lastSavedDate.current)
        setLastSaved(formatSaved(lastSavedDate.current));
    }, 60000);
    return () => clearInterval(id);
  }, [formatSaved]);

  // 离开前提示未保存
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const changed = compareSlateContent(page?.slateData, lastContent.current);
      if (!isReadOnly && changed) {
        const msg = "您有未保存的更改，确定要离开吗？";
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isReadOnly, page?.slateData]);

  // Ctrl+S / Cmd+S 保存
  useKeyboardSave({
    isReadOnly,
    editorFocusedRef: editorFocus,
    saveTimeoutRef: saveTimer,
    onSave: savePage,
  });

  async function savePage() {
    if (status === "saving" || isReadOnly) return;
    const slateData = page?.slateData;
    if (!slateData) return;

    const changed = compareSlateContent(slateData, lastContent.current);
    if (!changed) {
      if (status === "error") setStatus(null);
      return;
    }
    clearTimeout(statusTimer.current);
    setStatus("saving");
    const now = new Date();
    lastSavedDate.current = now;
    const iso = formatISO(now);

    try {
      const title = extractTitleFromSlate(slateData);
      await dispatch(
        patch({
          dbKey: pageKey,
          changes: { updatedAt: iso, slateData, title },
        })
      ).unwrap();

      if (dbSpaceId) {
        dispatch(
          updateContentTitle({
            spaceId: dbSpaceId,
            contentKey: pageKey,
            title,
          })
        )
          .unwrap()
          .catch(console.error);
      }
      dispatch(updatePageTitle(title));

      lastContent.current = JSON.parse(JSON.stringify(slateData));
      setLastSaved(formatSaved(now));
      setStatus("saved");

      statusTimer.current = window.setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      console.error("保存失败:", e);
      setStatus("error");
      toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
    }
  }

  function handleChange(v: EditorContent) {
    if (isReadOnly) return;
    clearTimeout(saveTimer.current);
    if (status === "error") setStatus(null);
    const changed = compareSlateContent(v, page?.slateData);
    if (changed) {
      dispatch(updateSlate(v));
      saveTimer.current = window.setTimeout(savePage, 2000);
    }
  }

  return {
    saveStatus: status,
    lastSavedTime: lastSaved,
    handleChange,
    handleRetry: savePage,
    handleFocus: () => (editorFocus.current = true),
    handleBlur: () => (editorFocus.current = false),
    hasPendingChanges: compareSlateContent(
      page?.slateData,
      lastContent.current
    ),
  };
}

/*——————— Loader / EditorLoader / 样式 ———————*/
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
  <div
    style={{
      padding: 20,
      textAlign: "center",
      color: theme.textSecondary,
    }}
  >
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
    [contenteditable="true"] { outline:none; caret-color:${t.primary};
      padding:4px; font-size:16px; line-height:1.7; color:${t.text} }
    .scrollable::-webkit-scrollbar { width:6px }
    .scrollable::-webkit-scrollbar-thumb {
      background:${t.borderHover}; border-radius:3px }
    .scrollable::-webkit-scrollbar-thumb:hover {
      background:${t.textQuaternary} }
    @media (max-width:768px) {
      .wrapper { padding:16px 12px }
    }
    @media print {
      .container, .scrollable { overflow:visible }
      .container { height:auto }
      .wrapper { max-width:100%; padding:0; margin:0 }
      .page-save-status-indicator, .toolbar-container { display:none!important }
      body { -webkit-print-color-adjust:exact; color-adjust:exact }
    }
  `,
};
