import { useAuth } from "auth/useAuth";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { animations } from "render/styles/animations";
import { formatISO } from "date-fns";
import { patchData } from "database/dbSlice";
import Editor from "create/editor/Editor";

import { layout } from "../styles/layout";
import { updateSlate } from "./pageSlice";
import { EditTool } from "./EditTool";
import { sizes } from "../styles/sizes";

const EditPage = () => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);

  const handleSave = async () => {
    const nowISO = formatISO(new Date());
    try {
      // 从slateData中提取第一个heading-one作为标题
      const title =
        pageState.slateData.find((node) => node.type === "heading-one")
          ?.children[0]?.text || "";

      const saveData = {
        updated_at: nowISO,
        slateData: pageState.slateData,
        title,
      };
      console.log("saveData", saveData);

      const result = await dispatch(
        patchData({ id: pageId, changes: saveData })
      ).unwrap();

      if (result) {
        console.log("result", result);
        toast.success("保存成功");
      }
    } catch (error) {
      console.error(error);
      toast.error("保存失败");
    }
  };
  const handleContentChange = (changeValue) => {
    dispatch(updateSlate(changeValue));
  };
  const slateData = pageState.slateData;

  return (
    <div
      style={{
        ...layout.flex,
        ...layout.h100vh,
        ...layout.overflowHidden,
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
            ...layout.flexEnd,
            paddingLeft: sizes.size2,
            paddingRight: sizes.size2,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid rgba(0,0,0,0.03)",
            transition: `all ${animations.duration.fast} ${animations.spring}`,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <EditTool handleSave={handleSave} />
        </div>

        <div
          style={{
            ...layout.flexGrow1,
            ...layout.overflowYAuto,
            padding: sizes.size3,
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              minHeight: "calc(100vh - 200px)",
              backgroundColor: "#ffffff",
              padding: sizes.size2,
            }}
          >
            <Editor initialValue={slateData} onChange={handleContentChange} />
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

export default EditPage;
