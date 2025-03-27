// render/page/PageIndex.tsx 或类似文件

import { useAppDispatch, useFetchData } from "app/hooks";
import { useEffect } from "react";
// 1. useParams 只用来获取 pageId
//    useSearchParams 用来获取 spaceId 和 edit
import { useParams, useSearchParams } from "react-router-dom";

import DialogPage from "chat/dialog/DialogPage";
import { DataType } from "create/types";
import NoMatch from "../NoMatch";
import RenderPage from "./RenderPage";
import { initPage, resetPage } from "./pageSlice";
import { RenderJson } from "./RenderJson";

const Page = () => {
  // 2. 从 useParams 获取 pageId
  const { pageId } = useParams<{ pageId?: string }>();
  // 3. 从 useSearchParams 获取查询参数
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // 4. 从 searchParams 读取 spaceId 和 isEditMode
  const spaceId = searchParams.get("spaceId"); // <-- 从查询参数获取
  const isEditMode = searchParams.get("edit") === "true";

  useEffect(() => {
    // 你可以在这里使用 spaceId，例如打印日志或用于某些初始化逻辑
    console.log(
      "Current Page:",
      pageId,
      "Space Context (from query):",
      spaceId
    );
    return () => {
      dispatch(resetPage());
    };
    // 如果 effect 依赖 spaceId，加入依赖项
  }, [dispatch, pageId, spaceId]);

  if (!pageId) {
    return <NoMatch message="页面 ID 缺失" />;
  }

  // 5. 检查 useFetchData 是否需要 spaceId (取决于 pageId 是否全局唯一)
  //    假设仍然只需要 pageId
  const { data, isLoading } = useFetchData(pageId);

  // 6. 检查 initPage action 是否需要 spaceId
  //    将从查询参数获取的 spaceId 传递给 action (如果需要的话)
  useEffect(() => {
    if (data) {
      dispatch(
        initPage({
          ...data,
          isReadOnly: !isEditMode,
          // 如果 pageSlice 需要知道当前的 space 上下文，可以在这里传递
          // currentSpaceContext: spaceId
        })
      );
    }
  }, [data, dispatch, isEditMode, spaceId]); // 确保 spaceId 在依赖项中

  if (isLoading) {
    return <div>加载中 请稍等</div>;
  }

  if (data) {
    if (data.type === DataType.PAGE) {
      // RenderPage 可能需要 spaceId 作为上下文
      return <RenderPage isReadOnly={!isEditMode} /* spaceId={spaceId} */ />;
    }
    if (data.type === DataType.DIALOG) {
      // DialogPage 可能需要 spaceId 作为上下文
      return <DialogPage pageKey={pageId} /* spaceId={spaceId} */ />;
    }
    return <RenderJson data={data} />;
  }

  return <NoMatch />;
};

export default Page;
