import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";
// **** 不再引入 Ramda ****

import Editor from "create/editor/Editor"; // 确认路径
import { patchData } from "database/dbSlice"; // 确认路径
import {
  initPage,
  selectPageData,
  updateSlate,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageError,
  selectPageDbSpaceId,
  updatePageTitle,
} from "./pageSlice"; // 确认路径
import { updateContentTitle } from "create/space/spaceSlice"; // 确认路径
import NoMatch from "../NoMatch"; // 确认路径
import { markdownToSlate } from "create/editor/markdownToSlate"; // 确认路径

// Props 定义
interface RenderPageProps {
  pageKey: string;
}

// 内容比较函数 (恢复使用 JSON.stringify)
const hasContentChanged = (newContent: any, oldContent: any): boolean => {
  if (newContent === oldContent) return false; // 优化：同一引用则无需比较
  try {
    // 注意: JSON.stringify 对某些类型（如 Date, undefined, 函数）处理不佳
    return JSON.stringify(newContent) !== JSON.stringify(oldContent);
  } catch (e) {
    console.warn(
      "hasContentChanged: JSON.stringify comparison failed, assuming content changed.",
      e
    );
    return true; // 出错时保守地认为内容已改变
  }
};

// RenderPage 组件
const RenderPage: React.FC<RenderPageProps> = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const isReadOnly = !isEditMode;

  // 从 slice 获取状态
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const fetchError = useAppSelector(selectPageError);
  const pageState = useAppSelector(selectPageData);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);

  // 初始化 Effect
  useEffect(() => {
    if (pageKey) {
      dispatch(initPage({ pageId: pageKey, isReadOnly }));
    } else {
      console.error("[RenderPage] Error: pageKey prop is missing.");
    }
    // 重置保存状态和引用
    setSaveStatus(null);
    lastSavedContent.current = null;
    if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
    saveTimeoutId.current = null;
  }, [dispatch, pageKey, isReadOnly]);

  // 保存状态 Ref等
  const [saveStatus, setSaveStatus] = useState<
    "saving" | "saved" | "error" | null
  >(null);
  const lastSavedContent = useRef<any>(null);
  const saveTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // **** savePage 使用 useCallback 记忆化 ****
  // 这个 lambda 函数 (箭头函数) 的引用将在其依赖项不变时保持稳定
  const savePage = useCallback(async () => {
    if (saveStatus === "saving" || isReadOnly) return;
    const currentSlateData = pageState.slateData;
    const pageOwnedSpaceId = dbSpaceId;

    // **** 恢复使用 hasContentChanged 函数 (内部是 JSON.stringify) ****
    if (!hasContentChanged(currentSlateData, lastSavedContent.current)) {
      console.log("[RenderPage] Save skipped: No change");
      setSaveStatus(null);
      return;
    }

    console.log("[RenderPage] Saving page", { pageKey });
    setSaveStatus("saving");
    const nowISO = formatISO(new Date());

    try {
      const titleNode = currentSlateData?.find(
        (node: any) => node.type === "heading-one"
      );
      const title = titleNode?.children?.[0]?.text || "新页面";

      // ... (数据库和 space title 更新逻辑不变) ...
      await dispatch(
        patchData({
          dbKey: pageKey,
          changes: { updated_at: nowISO, slateData: currentSlateData, title },
        })
      ).unwrap();
      if (pageOwnedSpaceId) {
        try {
          await dispatch(
            updateContentTitle({
              spaceId: pageOwnedSpaceId,
              contentKey: pageKey,
              title,
            })
          ).unwrap();
        } catch (spaceError) {
          console.error(
            `[RenderPage] Failed to update space title for page ${pageKey}:`,
            spaceError
          );
        }
      }
      dispatch(updatePageTitle(title));

      // 更新本地状态
      lastSavedContent.current = currentSlateData;
      setSaveStatus("saved");
      console.log("[RenderPage] Save successful", { pageKey });
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error(`[RenderPage] Save failed for ${pageKey}:`, error);
      setSaveStatus("error");
      toast.error("内容保存失败");
      setTimeout(() => setSaveStatus(null), 3000);
    }
    // 依赖项保持不变，确保 useCallback 正确工作
  }, [
    saveStatus,
    isReadOnly,
    pageState.slateData,
    dbSpaceId,
    dispatch,
    pageKey,
  ]);

  // **** handleContentChange 使用 useCallback 记忆化 ****
  // 这个传递给 Editor 的回调函数 (lambda) 将被稳定引用
  const handleContentChange = useCallback(
    (changeValue: any) => {
      if (isReadOnly) return;

      // 检查传入值与 Redux 状态值是否不同 (使用 stringify)
      // 避免因编辑器内部更新触发不必要的 dispatch 和 savePage 调用
      if (hasContentChanged(changeValue, pageState.slateData)) {
        dispatch(updateSlate(changeValue)); // 更新 Redux 状态

        // 清除旧的定时器，设置新的定时器（防抖）
        if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
        saveTimeoutId.current = setTimeout(() => {
          savePage(); // 调用记忆化后的 savePage
        }, 3000); // 自动保存延迟 3 秒
      }
      // 依赖项包含 dispatch, pageState.slateData, savePage, isReadOnly
    },
    [dispatch, pageState.slateData, savePage, isReadOnly]
  );

  // 编辑器初始值计算 (逻辑不变)
  const initialValue = useMemo(() => {
    if (!isInitialized)
      return [{ type: "paragraph", children: [{ text: "" }] }];
    const data = pageState.slateData;
    if (Array.isArray(data) && data.length > 0) {
      lastSavedContent.current = data;
      return data;
    }
    if (pageState.content) {
      const converted = markdownToSlate(pageState.content);
      lastSavedContent.current = converted;
      return converted;
    }
    const defaultInitial = [
      { type: "paragraph", children: [{ text: "开始编辑..." }] },
    ];
    lastSavedContent.current = defaultInitial;
    return defaultInitial;
  }, [isInitialized, pageState.slateData, pageState.content]);

  // --- 副作用 Hooks (Ctrl+S, beforeunload, cleanup - 逻辑不变，但 beforeunload 比较也用 hasContentChanged) ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      /* ... Ctrl+S ... */
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, savePage]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // **** 使用 hasContentChanged 进行比较 ****
      if (
        !isReadOnly &&
        hasContentChanged(pageState.slateData, lastSavedContent.current)
      ) {
        event.preventDefault();
        event.returnValue = "您有未保存的更改，确定要离开吗？";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isReadOnly, pageState.slateData]); // 依赖 pageState.slateData

  useEffect(() => {
    /* ... cleanup timeout ... */
  }, []);

  // --- 条件渲染 (逻辑不变) ---
  if (isLoading) {
    return <div className="render-page-message">页面加载中...</div>;
  }
  if (fetchError) {
    return <NoMatch message={fetchError} />;
  }
  if (!isInitialized || !initialValue) {
    return <div className="render-page-message">正在初始化编辑器...</div>;
  }

  // --- 最终渲染 (结构和类名不变) ---
  return (
    <>
      <div className="render-page-container">
        <main className="render-page-main">
          <div className="render-page-scrollable-area scrollable-editor-area">
            <div className="render-page-editor-wrapper">
              <Editor
                placeholder="开始编辑..."
                key={pageKey}
                initialValue={initialValue}
                onChange={handleContentChange} // **** 传递记忆化后的回调 ****
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </main>
        {/* ... 保存状态指示器 ... */}
      </div>

      {/* **** 样式保持不变，仍在 style 标签内 **** */}
      <style>{`
        /* ... 所有样式规则和之前一样 ... */
        .render-page-container { display: flex; flex-direction: column; height: calc(100dvh - 60px); background-color: #fff; overflow: hidden; }
        .render-page-main { flex-grow: 1; display: flex; overflow: hidden; }
        .render-page-scrollable-area { flex-grow: 1; overflow-y: auto; padding: 20px 0; }
        .render-page-editor-wrapper { max-width: 800px; margin: 0 auto; padding: 0 16px; }
        .render-page-message { padding: 40px; text-align: center; font-size: 16px; color: #666; }
        .render-page-save-status { position: fixed; bottom: 10px; right: 10px; padding: 4px 8px; background-color: rgba(0, 0, 0, 0.6); color: white; border-radius: 4px; font-size: 12px; z-index: 100; pointer-events: none; transition: opacity 0.3s ease; }
        [contenteditable="true"], [data-slate-editor="true"] { outline: none !important; caret-color: #1890ff; white-space: pre-wrap; word-wrap: break-word; padding: 4px; font-size: 16px; line-height: 1.7; }
        .scrollable-editor-area::-webkit-scrollbar { width: 6px; }
        .scrollable-editor-area::-webkit-scrollbar-track { background: transparent; }
        .scrollable-editor-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        .scrollable-editor-area::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
      `}</style>
    </>
  );
};

export default RenderPage;
