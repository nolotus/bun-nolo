// render/page/PageLoader.tsx

import React, { Suspense, lazy, useEffect } from "react";
import { useAppDispatch } from "app/hooks";
import { useParams } from "react-router-dom";

// 懒加载子组件
const DialogPage = lazy(() => import("chat/dialog/DialogPage"));
const RenderPage = lazy(() => import("./RenderPage"));

// 导入工具和 Action
import NoMatch from "../NoMatch";
import { resetPage } from "./pageSlice";

// 简单的加载提示组件
const LoadingFallback = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>加载页面组件...</div>
);

const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const dispatch = useAppDispatch();

  // 移除 searchParams 和 isEditMode 的使用，让 RenderPage 自己处理

  // 仅在组件卸载时清理状态
  useEffect(() => {
    return () => {
      dispatch(resetPage());
    };
  }, [dispatch]);

  if (!pageKey) {
    console.error("PageLoader: pageKey is missing in URL parameters.");
    return <NoMatch message="页面 Key 缺失" />;
  }

  // 简化组件渲染，只依赖 pageKey
  if (pageKey.startsWith("page")) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <RenderPage pageKey={pageKey} />
      </Suspense>
    );
  } else if (pageKey.startsWith("dialog")) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <DialogPage pageKey={pageKey} />
      </Suspense>
    );
  }

  return <NoMatch message={`无法识别或处理的页面类型: ${pageKey}`} />;
};

export default PageLoader;
