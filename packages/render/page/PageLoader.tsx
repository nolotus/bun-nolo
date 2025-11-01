// render/page/PageLoader.tsx
import React, { lazy, Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "app/store";
import { resetPage } from "./pageSlice";
import { changeSpace } from "create/space/spaceSlice";

// 懒加载子页面，防止同步依赖进入首页
const RenderPage = lazy(() => import("./RenderPage"));
const DialogPage = lazy(() => import("chat/dialog/DialogPage"));
const AgentPage = lazy(() => import("ai/agent/web/AgentPage"));

import NoMatch from "../NoMatch";

const Fallback = (
  <div
    style={{ padding: 40, textAlign: "center", color: "var(--textSecondary)" }}
  >
    加载页面组件...
  </div>
);

const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();

  // 从 URL 同步 spaceId
  useEffect(() => {
    const spaceId = params.get("spaceId");
    if (spaceId) dispatch(changeSpace(spaceId));
  }, [dispatch, params]);

  // 卸载时重置页面状态
  useEffect(
    () => () => {
      dispatch(resetPage());
    },
    [dispatch]
  );

  if (!pageKey) return <NoMatch message="请选择一个页面或对话。" />;

  // 外层 routes 已有 Suspense，这里只做分发
  if (pageKey.startsWith("page")) return <RenderPage pageKey={pageKey} />;
  if (pageKey.startsWith("dialog")) return <DialogPage pageKey={pageKey} />;
  if (pageKey.startsWith("cybot")) return <AgentPage agentKey={pageKey} />;

  return <NoMatch message={`无法识别或处理的页面类型: ${pageKey}`} />;
};

// 若希望此处也提供独立 fallback，可解除注释：
// export default () => <Suspense fallback={Fallback}><PageLoader /></Suspense>;
export default PageLoader;
