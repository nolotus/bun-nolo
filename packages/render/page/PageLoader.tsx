// render/page/PageLoader.tsx
import React, { lazy, Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "app/store";
import { resetPage } from "./pageSlice";
import { changeSpace } from "create/space/spaceSlice";

// --- 1. 静态导入 DialogPage (不再懒加载) ---
import DialogPage from "chat/dialog/DialogPage";

import NoMatch from "../NoMatch";

// --- 2. 懒加载其他页面 ---
const RenderPage = lazy(() => import("./RenderPage"));
const AgentPage = lazy(() => import("ai/agent/web/AgentPage"));

// --- 3. 优化加载样式组件 ---
const spinKeyframes = `
  @keyframes loaderSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PageLoadingFallback = () => (
  <>
    <style>{spinKeyframes}</style>
    <div
      style={{
        height: "100%",
        minHeight: "60vh", // 保证在空页面时也有高度
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--textSecondary)",
        gap: "16px",
      }}
    >
      {/* 简单的圆环 Loading 动画 */}
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "loaderSpin 0.8s linear infinite",
        }}
      />
      <div style={{ fontSize: "14px", opacity: 0.8 }}>加载资源中...</div>
    </div>
  </>
);

const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();

  // 从 URL 同步 spaceId (如 ?spaceId=xxx)
  useEffect(() => {
    const spaceId = params.get("spaceId");
    if (spaceId) dispatch(changeSpace(spaceId));
  }, [dispatch, params]);

  // 卸载时重置页面状态 (Redux)
  useEffect(
    () => () => {
      dispatch(resetPage());
    },
    [dispatch]
  );

  if (!pageKey) return <NoMatch message="请选择一个页面或对话。" />;

  // 1. DialogPage: 直接渲染，无 Suspense 延迟
  if (pageKey.startsWith("dialog")) {
    return <DialogPage pageKey={pageKey} />;
  }

  // 2. RenderPage (自定义页面): 懒加载 + Suspense
  if (pageKey.startsWith("page")) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <RenderPage pageKey={pageKey} />
      </Suspense>
    );
  }

  // 3. AgentPage (AI 智能体): 懒加载 + Suspense
  if (pageKey.startsWith("cybot")) {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AgentPage agentKey={pageKey} />
      </Suspense>
    );
  }

  return <NoMatch message={`无法识别或处理的页面类型: ${pageKey}`} />;
};

export default PageLoader;
