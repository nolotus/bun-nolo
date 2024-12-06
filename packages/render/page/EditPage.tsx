import { useAuth } from "auth/useAuth";
import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { animations } from "render/styles/theme";

import { createPageData } from "./pageDataUtils";
// import { updateContent } from "./pageSlice";
// import { processContent } from "./processContent";
import { EditTool } from "./EditTool";
import { setData } from "database/dbSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import Editor from "create/editor/Editor";
import { sp } from "render/styles/sp";
import { layout } from "../styles/layout";
const EditPage = () => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);

  const handleSave = async () => {
    try {
      console.log("pageState", pageState);
      const pageData = createPageData(pageState, userId);
      console.log("pageData", pageData);

      const result = await setData({
        Data: pageData,
      });

      if (result) {
        toast.success("保存成功");
      }
    } catch (error) {
      console.error(error);
      toast.error("保存失败");
    }
  };

  const handleContentChange = (changeValue) => {
    console.log("changeValue", changeValue);
    // const { content,  metaUpdates } = processContent(changeValue);
    // dispatch(updateContent({ content, metaUpdates, }));
  };

  const slateData = markdownToSlate(pageState.content);

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
            ...sp.px2,
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
            ...sp.p3,
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              minHeight: "calc(100vh - 200px)",
              backgroundColor: "#ffffff",
              ...sp.p2,
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
