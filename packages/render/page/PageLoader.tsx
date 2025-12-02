import React, { lazy, Suspense, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "app/store";
import { resetPage } from "./pageSlice";
import { changeSpace } from "create/space/spaceSlice";
import PageLoading from "render/web/ui/PageLoading";
import NoMatch from "../NoMatch";

// 静态导入核心页面 (提升体验)
import DialogPage from "chat/dialog/DialogPage";

// 懒加载其他类型页面
const RenderPage = lazy(() => import("./RenderPage"));
const AgentPage = lazy(() => import("ai/agent/web/AgentPage"));

const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const spaceId = params.get("spaceId");
    if (spaceId) dispatch(changeSpace(spaceId));
  }, [dispatch, params]);

  useEffect(
    () => () => {
      dispatch(resetPage());
    },
    [dispatch]
  );

  if (!pageKey) return <NoMatch message="请选择一个页面或对话。" />;

  // 1. 核心对话页面：无延迟直接渲染
  if (pageKey.startsWith("dialog")) return <DialogPage pageKey={pageKey} />;

  // 2. 动态/代理页面：统一使用 PageLoading
  let Component: React.ReactNode = null;

  if (pageKey.startsWith("page")) {
    Component = <RenderPage pageKey={pageKey} />;
  } else if (pageKey.startsWith("cybot")) {
    Component = <AgentPage agentKey={pageKey} />;
  } else {
    return <NoMatch message={`无法识别的页面类型: ${pageKey}`} />;
  }

  return <Suspense fallback={<PageLoading />}>{Component}</Suspense>;
};

export default PageLoader;
