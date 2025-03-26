import { useAuth } from "auth/hooks/useAuth";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import Editor from "create/editor/Editor";
import { layout } from "../styles/layout";
import { selectPageData, updateSlate } from "./pageSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { patchData } from "database/dbSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";

// 智能布局常量 - 同时适应侧边栏和聊天窗口
const PAGE_LAYOUT = {
  container: {
    width: "100%",
    maxWidth: "860px", // 基准宽度
    margin: "0 auto",
    padding: "24px 0px", // 仅保留垂直间距
    minHeight: "calc(100vh - 140px)",
    transition: "max-width 0.3s ease, margin 0.3s ease", // 平滑过渡
  },
  editor: {
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

// 简化的性能监控
const PERF = {
  changes: 0,
  lastSaveTime: Date.now(),
  methods: { length: 0, shallow: 0 },
};

// 精简版日志
const logPerf =
  process.env.NODE_ENV !== "production"
    ? (action, data) => console.log(`[Editor:${action}]`, data)
    : () => {};

/**
 * 优化的内容比较函数 - 基于日志分析结果精简
 */
const hasContentChanged = (newContent, oldContent) => {
  // 引用相等快速检查
  if (newContent === oldContent) return false;
  if (!newContent || !oldContent) return true;

  // 长度检查 (日志显示这是常用路径)
  if (newContent.length !== oldContent.length) {
    PERF.methods.length++;
    return true;
  }

  // 对于小文档，使用浅比较
  if (newContent.length < 20) {
    PERF.methods.shallow++;

    // 检查节点类型和文本内容
    for (let i = 0; i < newContent.length; i++) {
      if (
        newContent[i].type !== oldContent[i].type ||
        newContent[i].children?.[0]?.text !== oldContent[i].children?.[0]?.text
      ) {
        return true;
      }
    }
    return false;
  }

  // 对于大文档，仅比较第一个和最后一个节点
  return (
    JSON.stringify(newContent[0]) !== JSON.stringify(oldContent[0]) ||
    JSON.stringify(newContent[newContent.length - 1]) !==
      JSON.stringify(oldContent[oldContent.length - 1])
  );
};

const RenderPage = ({ isReadOnly = true, hasChatEnabled = false }) => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();
  const pageState = useAppSelector(selectPageData);

  // 检测侧边栏状态
  const isSidebarOpen =
    useAppSelector((state) => state.layout?.isSidebarOpen) || false;

  // 状态管理
  const [saveStatus, setSaveStatus] = useState(null);
  const lastSavedContent = useRef(null);
  const saveTimeoutId = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 智能响应式布局计算 - 考虑侧边栏和聊天窗口
  const containerStyle = useMemo(() => {
    // 基础样式
    const style = {
      ...PAGE_LAYOUT.container,
      maxWidth: PAGE_LAYOUT.container.maxWidth,
      padding: PAGE_LAYOUT.container.padding,
    };

    // 是否在移动设备
    const isMobile = windowWidth <= 768;
    // 是否是大屏幕
    const isLargeScreen = windowWidth >= 1440;

    // 移动设备特殊处理
    if (isMobile) {
      style.padding = "16px 12px";
      style.maxWidth = "100%";
      return style;
    }

    // 对不同屏幕尺寸的基础宽度调整
    if (windowWidth <= 1024) {
      style.maxWidth = "760px"; // 小屏幕窄一些
    } else if (isLargeScreen) {
      style.maxWidth = "880px"; // 大屏幕可以稍宽
    }

    // 侧边栏和聊天窗口的布局调整
    if (isSidebarOpen && hasChatEnabled) {
      // 两侧都有元素 - 窄化编辑区
      style.maxWidth = isLargeScreen ? "780px" : "680px";

      // 始终居中，给两侧留空间
      style.margin = "0 auto";
    } else if (isSidebarOpen && !hasChatEnabled) {
      // 仅有侧边栏 - 居中
      style.margin = "0 auto";
    } else if (!isSidebarOpen && hasChatEnabled) {
      // 仅有聊天窗口 - 向左偏移
      style.margin = "0 auto 0 calc((100% - 860px) / 3)";

      // 如果屏幕不够宽，还是居中显示
      if (windowWidth < 1200) {
        style.margin = "0 auto";
      }
    }

    return style;
  }, [windowWidth, isSidebarOpen, hasChatEnabled]);

  // 初始化上次保存的内容
  useEffect(() => {
    if (pageState.slateData) {
      lastSavedContent.current = pageState.slateData;
      PERF.changes = 0;
      PERF.lastSaveTime = Date.now();
    }
  }, [pageId]);

  // 处理内容变化
  const handleContentChange = useCallback(
    (changeValue) => {
      // 使用优化的比较函数检查内容是否真正变化
      if (hasContentChanged(changeValue, pageState.slateData)) {
        PERF.changes++;
        dispatch(updateSlate(changeValue));

        // 计划保存
        scheduleSave();
      }
    },
    [dispatch, pageState.slateData]
  );

  // 基于日志优化的保存计划函数
  const scheduleSave = useCallback(() => {
    if (saveTimeoutId.current) {
      clearTimeout(saveTimeoutId.current);
    }

    if (saveStatus === "saving" || isReadOnly) return;

    // 修复timeSinceLastSave计算，使用相对时间而非绝对时间戳
    const timeSinceLastSave = Date.now() - PERF.lastSaveTime;

    // 基于日志分析简化的延迟计算
    const delay = PERF.changes > 5 || timeSinceLastSave > 5000 ? 1000 : 2000;

    saveTimeoutId.current = setTimeout(() => {
      if (hasContentChanged(pageState.slateData, lastSavedContent.current)) {
        logPerf("保存", { changes: PERF.changes, delay });
        savePage();
      }
    }, delay);
  }, [saveStatus, isReadOnly, pageState.slateData]);

  // 保存页面函数
  const savePage = useCallback(async () => {
    if (saveStatus === "saving" || isReadOnly) return;

    setSaveStatus("saving");
    const nowISO = formatISO(new Date());

    try {
      // 提取页面标题
      const title =
        pageState.slateData?.find((node) => node.type === "heading-one")
          ?.children?.[0]?.text || "新页面";

      // 保存到数据库
      await dispatch(
        patchData({
          dbKey: pageId,
          changes: {
            updated_at: nowISO,
            slateData: pageState.slateData,
            title,
          },
        })
      ).unwrap();

      // 更新空间中的标题
      const spaceId = pageState.spaceId;
      if (spaceId) {
        await dispatch(
          updateContentTitle({
            spaceId,
            contentKey: pageId,
            title,
          })
        ).unwrap();
      }

      // 更新状态
      PERF.lastSaveTime = Date.now();
      PERF.changes = 0;
      lastSavedContent.current = pageState.slateData;

      setSaveStatus("saved");

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      toast.error("内容保存失败，请检查网络连接");
    }
  }, [
    saveStatus,
    isReadOnly,
    pageState.slateData,
    pageState.spaceId,
    dispatch,
    pageId,
  ]);

  // 初始值计算
  const initialValue = useMemo(() => {
    return pageState.slateData
      ? pageState.slateData
      : markdownToSlate(pageState.content);
  }, [pageId, pageState.slateData, pageState.content]);

  // 支持Ctrl+S手动保存
  useEffect(() => {
    if (isReadOnly) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        savePage();
        toast.success("已保存");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, savePage]);

  // 页面卸载前保存
  useEffect(() => {
    if (isReadOnly) return;

    const handleBeforeUnload = () => {
      if (PERF.changes > 0) savePage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isReadOnly, savePage]);

  return (
    <div
      style={{
        ...layout.flex,
        ...layout.overflowHidden,
        height: "calc(100dvh - 60px)",
        backgroundColor: "#ffffff",
      }}
    >
      <main
        style={{
          ...layout.flexGrow1,
          ...layout.flexColumn,
          ...layout.h100,
          ...layout.overflowHidden,
        }}
      >
        <div
          style={{
            ...layout.flexGrow1,
            ...layout.overflowYAuto,
          }}
        >
          <div style={containerStyle}>
            <Editor
              placeholder="开始编辑..."
              key={pageId}
              initialValue={initialValue || []}
              onChange={handleContentChange}
              readOnly={isReadOnly}
              style={PAGE_LAYOUT.editor}
            />
          </div>
        </div>
      </main>

      {/* 状态指示器 */}
      {!isReadOnly && saveStatus && (
        <div className={`subtle-status-indicator ${saveStatus}`}>
          <div className="indicator-dot"></div>
        </div>
      )}

      <style>
        {`
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.08);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.12);
          }
          
          [contenteditable], [data-slate-editor] {
            outline: none !important;
            caret-color: #1890ff;
          }
          
          .subtle-status-indicator {
            position: fixed;
            right: 14px;
            bottom: 14px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            z-index: 99;
            opacity: 0.6;
            transition: all 0.3s;
          }
          
          .subtle-status-indicator.saving {
            background-color: #1890ff;
          }
          
          .subtle-status-indicator.saving .indicator-dot {
            position: absolute;
            top: -2px;
            left: -2px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 1px solid #1890ff;
            opacity: 0.4;
            animation: pulseRing 2s infinite;
          }
          
          .subtle-status-indicator.saved {
            background-color: #52c41a;
            animation: fadeOut 3s forwards;
          }
          
          .subtle-status-indicator.error {
            background-color: #f5222d;
          }
          
          @keyframes pulseRing {
            0% { transform: scale(0.8); opacity: 0.4; }
            80% { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(2); opacity: 0; }
          }
          
          @keyframes fadeOut {
            0% { opacity: 0.6; }
            70% { opacity: 0.6; }
            100% { opacity: 0; }
          }
          
          /* 优化编辑器聚焦反馈 */
          [data-slate-editor]:focus {
            background-color: rgba(248, 249, 250, 0.4);
            transition: background-color 0.3s ease;
            border-radius: 4px;
          }
          
          /* 在侧边栏和聊天窗口状态变化时平滑过渡 */
          .main-content, .app-main {
            transition: all 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          }
        `}
      </style>
    </div>
  );
};

export default RenderPage;
