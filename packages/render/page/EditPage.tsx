import { useAuth } from "auth/useAuth";
import React from "react";
import { useParams } from "react-router-dom";
import OpenProps from "open-props";
import toast from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "app/hooks";

import { TextEdit } from "./TextEdit";
import { createPageData } from "./pageDataUtils";
import { setHasVersion, saveContentAndMdast, updateContent } from "./pageSlice";
import { processContent } from "./processContent";
import { EditTool } from "./EditTool";
import { RichEdit } from "./RichEdit";
import { setData } from "database/dbSlice";

const EditPage = () => {
  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;

  const pageState = useAppSelector((state) => state.page);
  const [currentEditText, setTextareaContent] = React.useState<string>("");

  //保存之前检查输入区内容
  const handleSave = async () => {
    const hasNoSubmitContent = !!currentEditText;
    if (hasNoSubmitContent) {
      dispatch(saveContentAndMdast(currentEditText));
      setTextareaContent(""); // 清空 textarea
    }
    try {
      const pageData = createPageData(pageState, userId);

      const result = await setData({
        id: pageId,
        data: pageData,
      });

      if (result) {
        toast.success("保存成功");
      }
    } catch (error) {
      // 错误处理逻辑
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      dispatch(saveContentAndMdast(currentEditText));
      setTextareaContent(""); // 清空 textarea
    }
  };

  const handleContentChange = (changeValue: string) => {
    const { content, mdast, metaUpdates } = processContent(changeValue);
    dispatch(updateContent({ content, metaUpdates, mdast }));
  };

  return (
    <>
      <div
        className="container mx-auto flex  min-h-screen"
        style={{ gap: OpenProps.sizeFluid5 }}
      >
        <div className="flex flex-grow">
          <div className="w-full flex-shrink-0">
            {pageState.showAsMarkdown ? (
              <TextEdit
                value={pageState.content}
                onChange={handleContentChange}
              />
            ) : (
              <RichEdit
                mdast={pageState.mdast}
                onKeyDown={handleKeyDown}
                value={currentEditText}
                onChange={setTextareaContent}
              />
            )}
          </div>
        </div>
        <EditTool handleSave={handleSave} />
      </div>
    </>
  );
};

export default EditPage;
