import { useAuth } from "auth/hooks/useAuth";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import Editor from "create/editor/Editor";
import { layout } from "../styles/layout";
import { selectPageData, updateSlate } from "./pageSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useMemo, useEffect } from "react"; // 添加 useEffect
import { patchData } from "database/dbSlice"; // 添加 patchData
import { updateContentTitle } from "create/space/spaceSlice"; // 添加 updateContentTitle
import { formatISO } from "date-fns"; // 添加 formatISO
import toast from "react-hot-toast"; // 添加 toast

// 注意：此页面同时支持编辑和预览两种模式。
// - 当 isReadOnly 为 true 时，显示预览模式，仅渲染内容不可编辑。
// - 当 isReadOnly 为 false 时，显示编辑模式，允许用户实时编辑内容。
const RenderPage = ({ isReadOnly = true }) => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector(selectPageData);

  const handleContentChange = (changeValue) => {
    dispatch(updateSlate(changeValue));
  };

  const initialValue = useMemo(() => {
    return pageState.slateData
      ? pageState.slateData
      : markdownToSlate(pageState.content);
  }, [pageId, pageState.slateData, pageState.content]);

  // 自动保存逻辑，仅在编辑模式下触发
  useEffect(() => {
    if (isReadOnly) return; // 如果是只读模式，不执行自动保存

    const autoSavePage = async () => {
      const nowISO = formatISO(new Date());
      try {
        const title =
          pageState.slateData?.find((node) => node.type === "heading-one")
            ?.children[0]?.text || "新页面";

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

        // 如果页面属于某个空间，更新空间中的标题
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

        toast.success("自动保存成功");
      } catch (error) {
        console.error("Autosave failed:", error);
        toast.error("自动保存失败");
      }
    };

    // 防抖：延迟 2 秒保存，避免频繁触发
    const timer = setTimeout(() => {
      autoSavePage();
    }, 2000);

    // 清理定时器，防止内存泄漏
    return () => clearTimeout(timer);
  }, [pageState.slateData, isReadOnly, pageId, dispatch]); // 依赖 slateData 和 isReadOnly

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
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              minHeight: "calc(100vh - 200px)",
            }}
          >
            <Editor
              placeholder="开始编辑..."
              key={pageId}
              initialValue={initialValue || []}
              onChange={handleContentChange}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </main>

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
        `}
      </style>
    </div>
  );
};

export default RenderPage;
