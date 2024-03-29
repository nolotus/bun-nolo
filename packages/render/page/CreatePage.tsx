import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";
import { useWriteMutation, useGetEntryQuery } from "database/services";
import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { renderContentNode } from "render";
import { markdownToMdast, getH1TextFromMdast } from "render/MarkdownProcessor";
import { Button, Toggle } from "ui";

import { TextEdit } from "./TextEdit";
import { createPageData } from "./pageDataUtils";
import {
  setHasVersion,
  saveContentAndMdast,
  setShowAsMarkdown,
  updateContent,
  setSaveAsTemplate,
  initPageFromTemplate,
} from "./pageSlice";
import { processContent } from "./processContent";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const { data, isLoading } = useGetEntryQuery({ entryId: templateId });
  console.log("data", data);
  const dispatch = useAppDispatch();
  const saveAsTemplate = useAppSelector((state) => state.page.saveAsTemplate);
  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);
  const mdastFromSlice = pageState.mdast;
  const [mutate] = useWriteMutation();
  const navigate = useNavigate();
  const [textareaContent, setTextareaContent] = React.useState<string>("");

  useEffect(() => {
    data && dispatch(initPageFromTemplate(data));
  }, [data]);
  const saveData = async (pageData) => {
    try {
      const newSlug = nanoid();
      const result = await mutate({
        data: pageData,
        flags: { isJSON: true },
        customId: newSlug,
        userId: auth.user?.userId,
      });

      if (result) {
        const dataId = result.data.dataId; // 假设 dataId 在 result.data.dataId，你需要根据实际响应调整
        navigate(`/${dataId}?edit=true`); // 使用 dataId 进行页面跳转
      }
    } catch (error) {
      // 错误处理逻辑
      console.error("Mutation failed:", error);
    }
  };

  //保存之前检查输入区内容
  const handleSave = async () => {
    let updatedPageState = createPageData(pageState, userId);
    if (textareaContent) {
      const newMdast = markdownToMdast(textareaContent);
      // 更新 pageState
      updatedPageState = {
        ...updatedPageState,
        mdast: {
          ...updatedPageState.mdast,
          children: [...updatedPageState.mdast.children, ...newMdast.children],
        },
        content:
          updatedPageState.content +
          (updatedPageState.content ? "\n\n" : "") +
          textareaContent,
        title: getH1TextFromMdast(newMdast) || updatedPageState.title,
      };

      // 清空 textarea
      setTextareaContent("");
    }

    saveData(updatedPageState);
  };

  const toggleShowAsMarkdown = (value) => {
    dispatch(setShowAsMarkdown(value));
  };
  const handleToggleTemplateChange = (value: boolean) => {
    dispatch(setSaveAsTemplate(value));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      dispatch(saveContentAndMdast(textareaContent));
      setTextareaContent(""); // 清空 textarea
    }
  };

  const handleContentChange = (changeValue: string) => {
    const { content, mdast, metaUpdates } = processContent(changeValue);

    dispatch(updateContent({ content, metaUpdates, mdast }));
  };
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between bg-gray-100 p-4">
        <div className="text-gray-600">
          {pageState.createdTime} |{" "}
          {pageState.hasVersion ? "Versioned" : "Not Versioned"}
        </div>
        <Toggle
          label="Markdown 显示"
          id="markdown-toggle"
          checked={pageState.showAsMarkdown}
          onChange={toggleShowAsMarkdown}
        />
        <Toggle
          id="save-as-template"
          label="保存为模板"
          checked={saveAsTemplate}
          onChange={handleToggleTemplateChange}
        />
        <Button onClick={handleSave} variant="primary" size="medium">
          Save
        </Button>
      </div>
      <div className="flex flex-grow">
        <div className="w-full flex-shrink-0">
          <div className="flex w-full flex-col p-4">
            {pageState.showAsMarkdown ? (
              <TextEdit
                value={pageState.content}
                onChange={handleContentChange}
              />
            ) : (
              <>
                <div>{renderContentNode(mdastFromSlice)}</div>
                <TextEdit
                  onKeyDown={handleKeyDown}
                  value={textareaContent}
                  onChange={(value) => setTextareaContent(value)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
