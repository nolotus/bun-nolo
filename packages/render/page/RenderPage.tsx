import { useAuth } from "auth/hooks/useAuth";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";

import Editor from "create/editor/Editor";

import { layout } from "../styles/layout";
import { updateSlate } from "./pageSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useMemo } from "react";

const RenderPage = ({ isReadOnly = true }) => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);

  const handleContentChange = (changeValue) => {
    dispatch(updateSlate(changeValue));
  };
  const initialValue = useMemo(() => {
    return pageState.slateData
      ? pageState.slateData
      : markdownToSlate(pageState.content);
  }, [pageId, pageState.slateData, pageState.content]);
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
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
              minHeight: "calc(100vh - 200px)",
              backgroundColor: "#ffffff",
              padding: ".5rem",
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

