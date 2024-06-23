import { useAuth } from "auth/useAuth";
import { useUpdateEntryMutation } from "database/services";
import React from "react";
import { useParams } from "react-router-dom";
import { Toast, useToastManager } from "render/ui/Toast";

import { TextEdit } from "./TextEdit";
import { createPageData } from "./pageDataUtils";
import { setHasVersion, saveContentAndMdast, updateContent } from "./pageSlice";
import { processContent } from "./processContent";
import { EditTool } from "./EditTool";
import { RichEdit } from "./RichEdit";
import { useAppSelector, useAppDispatch } from "app/hooks";

const EditPage = () => {
  const { toasts, addToast, removeToast } = useToastManager();

  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const userId = auth.user?.userId;

  const pageState = useAppSelector((state) => state.page);
  const [updateEntry] = useUpdateEntryMutation();
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
      console.log("before save:", pageData);

      const result = await updateEntry({
        entryId: pageId, // 使用 pageId 作为 entryId
        data: pageData, // 将页面数据作为更新内容
      }).unwrap(); // 使用 unwrap 处理响应

      if (result) {
        // 成功处理逻辑
        addToast(
          <div className="text-black">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              保存成功
            </a>
          </div>,
        );
      }
    } catch (error) {
      // 错误处理逻辑
      console.error("Mutation failed:", error);
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
    <div className="container mx-auto flex min-h-screen flex-col p-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          content={toast.content}
          onClose={removeToast}
        />
      ))}

      <EditTool handleSave={handleSave} />

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
    </div>
  );
};

export default EditPage;
