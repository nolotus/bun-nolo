// render/page/PageLoader.tsx

import React, { Suspense, lazy, useEffect } from "react";
import { useAppDispatch } from "app/store";
import { useParams, useLocation } from "react-router-dom";

// 导入 Action
import { resetPage } from "./pageSlice";
import { changeSpace } from "create/space/spaceSlice";
import DialogPage from "chat/dialog/DialogPage";
import AgentPage from "ai/agent/web/AgentPage";
// 懒加载子组件
const RenderPage = lazy(() => import("./RenderPage"));

// 导入工具
import NoMatch from "../NoMatch";

// 加载提示组件
const LoadingFallback = () => (
  <div
    style={{
      padding: "40px",
      textAlign: "center",
      color: "var(--textSecondary)",
    }}
  >
    加载页面组件...
  </div>
);

/**
 * 页面加载器组件
 * 根据 URL 中的 pageKey 加载不同的页面组件 (RenderPage 或 DialogPage)
 * 并处理 URL searchParams 中的 spaceId
 */
const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const location = useLocation(); // 获取 location 对象以访问 searchParams
  const dispatch = useAppDispatch();

  // 处理 URL searchParams 中的 spaceId
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const spaceId = searchParams.get("spaceId");

    // 如果 spaceId 存在，则 dispatch changeSpace action
    if (spaceId) {
      dispatch(changeSpace(spaceId));
    }
  }, [dispatch, location.search]);

  // 组件卸载时清理页面状态
  useEffect(() => {
    return () => {
      dispatch(resetPage());
    };
  }, [dispatch]);

  // 根据 pageKey 前缀渲染不同的组件
  if (pageKey?.startsWith("page")) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <RenderPage pageKey={pageKey} />
      </Suspense>
    );
  } else if (pageKey?.startsWith("dialog")) {
    return <DialogPage pageKey={pageKey} />;
  } else if (pageKey?.startsWith("cybot")) {
    return <AgentPage agentKey={pageKey} />;
  }

  // 如果 pageKey 为空或未匹配，可以显示一个默认页面或 NoMatch
  if (!pageKey) {
    return <NoMatch message="请选择一个页面或对话。" />;
  }

  return <NoMatch message={`无法识别或处理的页面类型: ${pageKey}`} />;
};

export default PageLoader;
