import { useAuth } from "auth/useAuth";
import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { animations } from "render/styles/theme";

import { createPageData } from "./pageDataUtils";
import { updateContent } from "./pageSlice";
import { processContent } from "./processContent";
import { EditTool } from "./EditTool";
import { setData } from "database/dbSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import Editor from "create/editor/Editor";

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

  const handleContentChange = (changeValue: string) => {
    const { content, mdast, metaUpdates } = processContent(changeValue);
    dispatch(updateContent({ content, metaUpdates, mdast }));
  };

  const slateData = markdownToSlate(pageState.content);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 24px",
            backgroundColor: "#ffffff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
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
            flex: 1,
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              minHeight: "calc(100vh - 200px)",
              backgroundColor: "#ffffff",
              padding: "20px",
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
