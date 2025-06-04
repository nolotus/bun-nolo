import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import toast from "react-hot-toast";

import {
  EditorContent,
  compareSlateContent,
} from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import useKeyboardSave from "./useKeyboardSave";
import { selectTheme } from "app/theme/themeSlice";

// 编辑器懒加载
const Editor = React.lazy(() => import("create/editor/Editor"));

import {
  initPage,
  selectPageData,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageDbSpaceId,
  selectIsReadOnly,
  updateSlate,
  savePage,
} from "./pageSlice";

const AUTO_SAVE_DELAY_MS = 2000; // 自动保存防抖时长
const STATUS_RESET_DELAY_MS = 3000; // “已保存”状态保留时长
const TIME_UPDATE_INTERVAL_MS = 60000; // 更新时间戳的间隔

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
  const error = useAppSelector(selectPageData).error;

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
          {
            type: "heading-one",
            children: [{ text: "新页面 (转换失败)" }],
          },
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

  // 本地快照与时间
  const lastSavedDate = React.useRef<Date | null>(
    page.updatedAt ? new Date(page.updatedAt) : null
  );
  const lastContent = React.useRef<EditorContent>(
    JSON.parse(JSON.stringify(page?.slateData || []))
  );

  const saveTimer = React.useRef<number>();
  const statusTimer = React.useRef<number>();
  const editorFocus = React.useRef(false);

  // 格式化“刚刚/几分钟前”
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

  // 初始化 & 定时刷新 lastSaved
  useEffect(() => {
    if (lastSavedDate.current) {
      setLastSaved(formatSaved(lastSavedDate.current));
    }
    const id = window.setInterval(() => {
      if (lastSavedDate.current) {
        setLastSaved(formatSaved(lastSavedDate.current));
      }
    }, TIME_UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [formatSaved]);

  // 离开前提醒
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

  // Ctrl+S / Cmd+S
  useKeyboardSave({
    isReadOnly,
    editorFocusedRef: editorFocus,
    saveTimeoutRef: saveTimer,
    onSave: triggerSave,
  });

  // 每次输入
  function handleChange(v: EditorContent) {
    if (isReadOnly) return;
    dispatch(updateSlate(v));
    clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(triggerSave, AUTO_SAVE_DELAY_MS);
  }

  // 真正的保存
  async function triggerSave() {
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

    try {
      const result = await dispatch(savePage()).unwrap();
      const now = new Date(result.updatedAt);
      lastSavedDate.current = now;
      lastContent.current = JSON.parse(JSON.stringify(slateData));

      setLastSaved(formatSaved(now));
      setStatus("saved");

      statusTimer.current = window.setTimeout(
        () => setStatus(null),
        STATUS_RESET_DELAY_MS
      );
    } catch (e) {
      console.error("保存失败:", e);
      setStatus("error");
      toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
    }
  }

  // —— 新增：组件卸载时清理所有定时器 ——
  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
    };
  }, []);

  return {
    saveStatus: status,
    lastSavedTime: lastSaved,
    handleChange,
    handleRetry: triggerSave,
    handleFocus: () => (editorFocus.current = true),
    handleBlur: () => (editorFocus.current = false),
    hasPendingChanges: compareSlateContent(
      page?.slateData,
      lastContent.current
    ),
  };
}

/*—————— Loader / EditorLoader / 样式 ———————*/
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
      .page-save-status-indicator, .tools-container { display:none!important }
      body { -webkit-print-color-adjust:exact; color-adjust:exact }
    }
  `,
};
