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
import { FaExclamationCircle } from "react-icons/fa";

// --- 从 slateUtils 文件中导入 ---
import {
  EditorContent,
  hasContentChanged,
  extractTitleFromSlate,
} from "create/editor/utils/slateUtils"; // 确认路径正确
// ----------------------------------

// 组件懒加载
const Editor = React.lazy(() => import("create/editor/Editor"));
import { patchData } from "database/dbSlice";
import {
  initPage,
  selectPageData,
  updateSlate,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageError,
  selectPageDbSpaceId,
  updatePageTitle,
  selectIsReadOnly,
  setReadOnly,
} from "./pageSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { selectTheme } from "app/theme/themeSlice";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import useKeyboardSave from "./useKeyboardSave";

// ================ 类型定义 ================
interface RenderPageProps {
  pageKey: string;
}
// (EditorContent 类型已移至 slateUtils.ts)

// ================ 工具函数 ================
// (hasContentChanged 和 extractTitleFromSlate 函数已移至 slateUtils.ts)

// 页面错误信息组件
const PageError = React.memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => {
    const theme = useAppSelector(selectTheme);

    return (
      <div className="render-page-error">
        <div className="error-container">
          <FaExclamationCircle size={32} color={theme.error} />
          <h3>加载页面时出错</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={onRetry}>
            重新加载
          </button>
        </div>

        <style jsx>{`
          .render-page-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
            color: ${theme.text};
          }

          .error-container {
            max-width: 500px;
            text-align: center;
            padding: 30px;
            background-color: ${theme.background};
            border-radius: 6px;
            box-shadow: 0 4px 12px ${theme.shadowMedium};
          }

          .error-container h3 {
            margin: 16px 0;
            color: ${theme.text};
          }

          .error-container p {
            margin-bottom: 24px;
            color: ${theme.textSecondary};
          }

          .retry-button {
            background-color: ${theme.primary};
            color: ${theme.buttonText || "#ffffff"};
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }

          .retry-button:hover {
            background-color: ${theme.primaryLight};
          }

          .retry-button:active {
            background-color: ${theme.primaryDark};
          }
        `}</style>
      </div>
    );
  }
);

// ================ 主组件 ================

const RenderPage: React.FC<RenderPageProps> = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const theme = useAppSelector(selectTheme);

  // Redux 状态
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const fetchError = useAppSelector(selectPageError);
  const pageState = useAppSelector(selectPageData);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const isReadOnly = useAppSelector(selectIsReadOnly);

  // 记录编辑器渲染是否发生，避免重复初始化
  const editorMounted = useRef(false);

  // 本地状态
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // 保持一个稳定的编辑器 key
  const [editorKey] = useState(`editor-instance-${pageKey}`);

  // 初始化 isReadOnly 状态 - 关键修复
  const urlEditMode = searchParams.get("edit") === "true";

  // 仅在初始化时设置一次只读状态
  useEffect(() => {
    if (!editorMounted.current) {
      dispatch(setReadOnly(!urlEditMode));
      editorMounted.current = true;
    }
  }, [dispatch, urlEditMode]);

  // 引用保存
  const lastSavedContent = useRef<EditorContent | null>(null);
  const saveTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorFocused = useRef(false);
  const changesPending = useRef(false);
  const mountedRef = useRef(true); // 组件挂载状态追踪

  // 格式化上次保存时间的函数
  const formatSavedTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "刚刚";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else {
      return date.toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    }
  };

  // 初始化逻辑
  const loadPage = useCallback(() => {
    if (!pageKey) {
      console.error("RenderPage: pageKey prop is missing");
      return;
    }

    // 重置状态
    setSaveStatus(null);
    setLastSavedTime(null);
    lastSavedContent.current = null;
    changesPending.current = false;

    // 清理定时器
    if (saveTimeoutId.current) {
      clearTimeout(saveTimeoutId.current);
      saveTimeoutId.current = null;
    }

    if (statusTimeoutId.current) {
      clearTimeout(statusTimeoutId.current);
      statusTimeoutId.current = null;
    }

    // 使用从 URL 获取的初始只读状态
    dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  // 初始加载
  useEffect(() => {
    loadPage();
    mountedRef.current = true;

    // 组件卸载时清理
    return () => {
      mountedRef.current = false;
      if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
      if (statusTimeoutId.current) clearTimeout(statusTimeoutId.current);
    };
  }, [loadPage]);

  // 保存页面逻辑
  const savePage = useCallback(async () => {
    // 状态和权限检查
    if (saveStatus === "saving" || isReadOnly) return;

    const currentSlateData = pageState.slateData;

    // 内容检查 (避免不必要保存)
    if (
      !changesPending.current &&
      !hasContentChanged(currentSlateData, lastSavedContent.current)
    ) {
      if (saveStatus === "error") setSaveStatus(null);
      return;
    }

    // 清理状态提示计时器
    if (statusTimeoutId.current) {
      clearTimeout(statusTimeoutId.current);
      statusTimeoutId.current = null;
    }

    // 开始保存
    setSaveStatus("saving");
    const saveStartTime = new Date();
    const nowISO = formatISO(saveStartTime);

    try {
      // 提取标题 (使用导入的函数)
      const title = extractTitleFromSlate(currentSlateData);

      // 保存到数据库
      await dispatch(
        patchData({
          dbKey: pageKey,
          changes: {
            updated_at: nowISO,
            slateData: currentSlateData,
            title,
          },
        })
      ).unwrap();

      // 如果有关联空间，更新空间标题
      if (dbSpaceId) {
        try {
          await dispatch(
            updateContentTitle({
              spaceId: dbSpaceId,
              contentKey: pageKey,
              title,
            })
          ).unwrap();
        } catch (spaceError) {
          console.error("更新空间标题失败:", spaceError);
          // 非关键错误，继续执行
        }
      }

      // 更新页面标题
      dispatch(updatePageTitle(title));

      // 更新状态
      lastSavedContent.current = JSON.parse(JSON.stringify(currentSlateData));
      changesPending.current = false;

      // 更新保存时间
      setLastSavedTime(formatSavedTime(saveStartTime));

      // 只有在组件仍然挂载时更新状态
      if (mountedRef.current) {
        setSaveStatus("saved");

        // 3秒后切换到仅显示时间状态
        statusTimeoutId.current = setTimeout(() => {
          if (mountedRef.current) {
            setSaveStatus(null);
          }
          statusTimeoutId.current = null;
        }, 3000);
      }
    } catch (error) {
      console.error(`保存失败:`, error);

      if (mountedRef.current) {
        setSaveStatus("error");
        toast.error("内容保存失败", {
          icon: "⚠️",
          duration: 4000,
        });
      }
    }
  }, [
    saveStatus,
    isReadOnly,
    pageState.slateData,
    dbSpaceId,
    dispatch,
    pageKey,
    // hasContentChanged 和 extractTitleFromSlate 是导入的稳定函数，无需加入依赖
  ]);

  // 内容变化处理
  const handleContentChange = useCallback(
    (changeValue: EditorContent) => {
      if (isReadOnly) return;

      // 如果当前是错误状态，清除
      if (saveStatus === "error") {
        setSaveStatus(null);
      }

      // 检测变化 (使用导入的函数)
      if (hasContentChanged(changeValue, pageState.slateData)) {
        dispatch(updateSlate(changeValue));
        changesPending.current = true;

        // 防抖自动保存
        if (saveTimeoutId.current) {
          clearTimeout(saveTimeoutId.current);
        }

        // 更为明显的自动保存延迟
        saveTimeoutId.current = setTimeout(() => {
          if (mountedRef.current && changesPending.current) {
            savePage();
          }
          saveTimeoutId.current = null;
        }, 2000); // 减少到2秒，让保存更快感知到
      }
    },
    [dispatch, pageState.slateData, savePage, isReadOnly, saveStatus]
    // hasContentChanged 是导入的稳定函数，无需加入依赖
  );

  // 编辑器焦点事件处理
  const handleEditorFocus = useCallback(() => {
    editorFocused.current = true;
  }, []);

  const handleEditorBlur = useCallback(() => {
    editorFocused.current = false;
  }, []);

  // 使用键盘快捷键保存Hook
  useKeyboardSave({
    isReadOnly,
    editorFocusedRef: editorFocused,
    saveTimeoutRef: saveTimeoutId,
    onSave: savePage,
  });

  // 定时更新上次保存时间显示
  useEffect(() => {
    if (!lastSavedTime) return;

    const updateInterval = setInterval(() => {
      if (lastSavedContent.current) {
        // 每分钟更新"多久前"的显示
        setLastSavedTime(formatSavedTime(new Date()));
      }
    }, 60000); // 每分钟更新一次

    return () => clearInterval(updateInterval);
  }, [lastSavedTime]);

  // 离开页面前确认
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        !isReadOnly &&
        changesPending.current &&
        hasContentChanged(pageState.slateData, lastSavedContent.current) // 使用导入的函数
      ) {
        const message = "您有未保存的更改，确定要离开吗？";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isReadOnly, pageState.slateData]); // hasContentChanged 是导入的稳定函数，无需加入依赖

  // 初始值计算
  const initialValue = useMemo(() => {
    if (!isInitialized) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }

    const data = pageState.slateData;
    if (Array.isArray(data) && data.length > 0) {
      lastSavedContent.current = JSON.parse(JSON.stringify(data)); // 深拷贝避免引用问题
      return data;
    }

    if (pageState.content) {
      try {
        const converted = markdownToSlate(pageState.content);
        lastSavedContent.current = JSON.parse(JSON.stringify(converted));
        return converted;
      } catch (e) {
        console.error("转换 markdown 失败:", e);
      }
    }

    const defaultValue = [
      { type: "heading-one", children: [{ text: "新页面" }] },
      { type: "paragraph", children: [{ text: "开始编辑..." }] },
    ];
    lastSavedContent.current = JSON.parse(JSON.stringify(defaultValue));
    return defaultValue;
  }, [isInitialized, pageState.slateData, pageState.content]);

  // 显示错误状态
  if (fetchError) {
    return <PageError error={fetchError} onRetry={loadPage} />;
  }

  // 简单加载提示
  if (!isInitialized && isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            color: theme.textSecondary,
          }}
        >
          加载中...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="render-page-container">
        <main className="render-page-main">
          <div className="render-page-scrollable-area scrollable-editor-area">
            <div className="render-page-editor-wrapper">
              <React.Suspense
                fallback={
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: theme.textSecondary,
                    }}
                  >
                    加载编辑器...
                  </div>
                }
              >
                <div key={editorKey}>
                  <Editor
                    placeholder="开始编辑..."
                    initialValue={initialValue}
                    onChange={handleContentChange}
                    onFocus={handleEditorFocus}
                    onBlur={handleEditorBlur}
                    readOnly={isReadOnly}
                  />
                </div>
              </React.Suspense>
            </div>
          </div>
        </main>

        {/* 工具栏区域 - 只在编辑模式显示 */}
        {!isReadOnly && (
          <>
            {/* 合并后的保存状态指示器 */}
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSavedTime}
              onRetry={savePage}
              hasPendingChanges={changesPending.current}
            />
          </>
        )}
      </div>

      {/* CSS 样式 */}
      <style>{`
        /* ========== 页面容器与布局 ========== */
        .render-page-container {
          display: flex;
          flex-direction: column;
          height: calc(100dvh - 60px);
          background-color: ${theme.background};
          color: ${theme.text};
          overflow: hidden;
          position: relative;
        }

        .render-page-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .render-page-scrollable-area {
          flex: 1;
          overflow-y: auto;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .render-page-editor-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px 16px;
          min-height: 100%;
        }

        /* ========== 编辑器样式 ========== */
        [contenteditable="true"],
        [data-slate-editor="true"] {
          outline: none;
          caret-color: ${theme.primary};
          white-space: pre-wrap;
          word-wrap: break-word;
          padding: 4px;
          font-size: 16px;
          line-height: 1.7;
          color: ${theme.text};
        }

        /* ========== 滚动条样式 ========== */
        .scrollable-editor-area::-webkit-scrollbar {
          width: 6px;
        }

        .scrollable-editor-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollable-editor-area::-webkit-scrollbar-thumb {
          background: ${theme.borderHover};
          border-radius: 3px;
          transition: background 0.2s;
        }

        .scrollable-editor-area::-webkit-scrollbar-thumb:hover {
          background: ${theme.textQuaternary};
        }

        /* ========== 移动设备适配 ========== */
        @media (max-width: 768px) {
          .render-page-editor-wrapper {
            padding: 16px 12px;
          }
        }
        /* ========== 打印样式优化 ========== */
        @media print {
          .render-page-container {
            height: auto;
            overflow: visible;
          }

          .render-page-scrollable-area {
            overflow: visible;
          }

          .page-save-status-indicator {
            display: none !important;
          }

          .render-page-editor-wrapper {
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
