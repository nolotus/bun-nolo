import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react";
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
  selectIsReadOnly,
  selectIsSaving,
  selectHasPendingChanges,
  selectSaveError,
  updateSlate,
  savePage,
} from "./pageSlice";

const AUTO_SAVE_DELAY_MS = 2000; // 自动保存防抖时长

// 内置 Ctrl+S / Cmd+S 保存 Hook
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

// 核心组件
export default React.memo(function RenderPage({
  pageKey,
}: {
  pageKey: string;
}) {
  const [params] = useSearchParams();
  const urlEditMode = params.get("edit") === "true";
  const theme = useAppSelector(selectTheme);

  const { isLoading, isInitialized, page, isReadOnly } = usePageData(
    pageKey,
    urlEditMode
  );
  const initialValue = useInitialValue(page, isInitialized);

  const { handleChange, triggerSaveNow } = usePageSaveManager(isReadOnly);
  useKeyboardSave(triggerSaveNow, isReadOnly);

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

/*——————— Hook: 装载并选择 Page 数据 ———————*/
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

/*——————— 新 Hook: 页面保存管理器 ———————*/
function usePageSaveManager(isReadOnly: boolean) {
  const dispatch = useAppDispatch();
  const page = useAppSelector(selectPageData);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 自动保存逻辑: 监听 Redux state 的变化
  useEffect(() => {
    if (isReadOnly) return;

    // 清除上一个定时器
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    // 设置新的定时器
    saveTimer.current = setTimeout(() => {
      dispatch(savePage());
    }, AUTO_SAVE_DELAY_MS);

    // 组件卸载时清除定时器
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [page.slateData, isReadOnly, dispatch]); // 依赖 slateData

  // 编辑器内容变化时的回调
  const handleChange = useCallback(
    (value: EditorContent) => {
      dispatch(updateSlate(value));
    },
    [dispatch]
  );

  // 手动/快捷键触发保存的回调
  const triggerSaveNow = useCallback(() => {
    if (isReadOnly) return;
    // 取消可能存在的自动保存定时器，并立即保存
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    dispatch(savePage());
  }, [dispatch, isReadOnly]);

  return { handleChange, triggerSaveNow };
}

/*——————— 新组件: 页面保存状态指示器 ———————*/
const STATUS_RESET_DELAY_MS = 3000;

function PageSaveStatus() {
  const isSaving = useAppSelector(selectIsSaving);
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);
  const saveError = useAppSelector(selectSaveError);
  const [showSaved, setShowSaved] = useState(false);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 这个 effect 用于在合适的时机触发 "已保存" 状态的显示和隐藏
  useEffect(() => {
    // 每次保存成功（即：不在保存中、没有待定更改、也没有错误），就显示“已保存”状态
    if (!isSaving && !hasPendingChanges && !saveError) {
      // 检查是否是从 isSaving=true 状态过来的，避免页面加载时就显示“已保存”
      if (statusTimer.current === null) {
        // 如果不是刚保存完，什么都不做
      } else {
        clearTimeout(statusTimer.current);
      }

      setShowSaved(true);
      statusTimer.current = setTimeout(() => {
        setShowSaved(false);
        statusTimer.current = null; // 重置 timer 引用
      }, STATUS_RESET_DELAY_MS);
    }
    // 如果开始编辑，则立即隐藏“已保存”
    if (hasPendingChanges) {
      if (statusTimer.current) clearTimeout(statusTimer.current);
      setShowSaved(false);
    }

    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [isSaving, hasPendingChanges, saveError]);

  // 这个 effect 只用于在出现保存错误时弹出 toast
  useEffect(() => {
    if (saveError) {
      toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
    }
  }, [saveError]);

  const getStatus = (): SaveStatus => {
    if (isSaving) return "saving";
    if (saveError && hasPendingChanges) return "error"; // 保存失败且有改动
    if (showSaved) return "saved";
    return null; // 默认空闲状态
  };

  return (
    <SaveStatusIndicator
      status={getStatus()}
      hasPendingChanges={hasPendingChanges}
    />
  );
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
