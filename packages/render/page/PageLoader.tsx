// render/page/PageLoader.tsx

import React, { Suspense, lazy, useEffect } from "react"; // 引入 React 相关
import { useAppDispatch } from "app/hooks";
import { useParams, useSearchParams } from "react-router-dom";

// 导入子组件 (保持懒加载或直接导入)
// import DialogPage from "chat/dialog/DialogPage";
// import RenderPage from "./RenderPage";
const DialogPage = lazy(() => import("chat/dialog/DialogPage")); // 示例懒加载
const RenderPage = lazy(() => import("./RenderPage")); // 示例懒加载

// 导入工具和 Action
import NoMatch from "../NoMatch"; // 确认路径正确
import { resetPage } from "./pageSlice"; // 确认路径正确

// 简单的加载提示组件
const LoadingFallback = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>加载页面组件...</div>
);

const PageLoader = () => {
  const { pageKey } = useParams<{ pageKey?: string }>();
  const [searchParams] = useSearchParams(); // 仍然需要 searchParams 来获取 edit 状态
  const dispatch = useAppDispatch();
  const isEditMode = searchParams.get("edit") === "true";

  useEffect(() => {
    console.log(
      "PageLoader: Mounting. Context - pageKey:",
      pageKey,
      "| isEditMode:",
      isEditMode
    );
    return () => {
      console.log("PageLoader: Unmounting, resetting page state for:", pageKey);
      dispatch(resetPage());
    };
  }, [dispatch, pageKey, isEditMode]);

  if (!pageKey) {
    console.error("PageLoader: pageKey is missing in URL parameters.");
    return <NoMatch message="页面 Key 缺失" />;
  }

  // 使用 Suspense 包裹懒加载的组件
  if (pageKey.startsWith("page")) {
    console.log(
      "PageLoader: Delegating rendering to RenderPage for pageKey:",
      pageKey
    );
    return (
      <Suspense fallback={<LoadingFallback />}>
        <RenderPage
          key={pageKey}
          pageKey={pageKey}
          // 不再传递 spaceId
        />
      </Suspense>
    );
  } else if (pageKey.startsWith("dialog")) {
    console.log(
      "PageLoader: Delegating rendering to DialogPage for pageKey:",
      pageKey
    );
    return (
      <Suspense fallback={<LoadingFallback />}>
        <DialogPage
          key={pageKey}
          pageKey={pageKey}
          // 不再传递 spaceId (除非 DialogPage 需要 URL context spaceId)
        />
      </Suspense>
    );
  }

  console.warn("PageLoader: Unrecognized pageKey format or type:", pageKey);
  return <NoMatch message={`无法识别或处理的页面类型: ${pageKey}`} />;
};

export default PageLoader;
