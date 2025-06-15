// render/page/RenderPage.tsx
import React, { useEffect, useMemo, useRef, MutableRefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import toast from "react-hot-toast";

import {
  EditorContent,
  compareSlateContent,
} from "create/editor/utils/slateUtils";
import { markdownToSlate } from "create/editor/markdownToSlate";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
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

// 内置 Ctrl+S / Cmd+S 保存 Hook
interface KeyboardSaveProps {
  isReadOnly: boolean;
  editorFocusedRef: MutableRefObject<boolean>;
  saveTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  onSave: () => void;
}
function useKeyboardSave({
  isReadOnly,
  editorFocusedRef,
  saveTimeoutRef,
  onSave,
}: KeyboardSaveProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReadOnly) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, onSave, saveTimeoutRef, editorFocusedRef]);
}

export default React.memo(function RenderPage({
  pageKey,
}: {
  pageKey: string;
}) {
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
    handleChange,
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
  const error = page.error;

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

  const lastContent = useRef<EditorContent>(
    JSON.parse(JSON.stringify(page?.slateData || []))
  );

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorFocus = useRef(false);

  useKeyboardSave({
    isReadOnly,
    editorFocusedRef: editorFocus,
    saveTimeoutRef: saveTimer,
    onSave: triggerSave,
  });

  function handleChange(v: EditorContent) {
    if (isReadOnly) return;
    dispatch(updateSlate(v));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(triggerSave, AUTO_SAVE_DELAY_MS);
  }

  async function triggerSave() {
    if (status === "saving" || isReadOnly) return;
    const slateData = page?.slateData;
    if (!slateData) return;

    const changed = compareSlateContent(slateData, lastContent.current);
    if (!changed) {
      if (status === "error") setStatus(null);
      return;
    }

    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus("saving");

    try {
      const result = await dispatch(savePage()).unwrap();
      lastContent.current = JSON.parse(JSON.stringify(slateData));
      setStatus("saved");
      statusTimer.current = setTimeout(
        () => setStatus(null),
        STATUS_RESET_DELAY_MS
      );
    } catch (e) {
      console.error("保存失败:", e);
      setStatus("error");
      toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
    }
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  return {
    saveStatus: status,
    handleChange,
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
