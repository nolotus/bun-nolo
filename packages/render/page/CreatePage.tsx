import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { useAuth } from "auth/useAuth";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { markdownToMdast, getH1TextFromMdast } from "render/MarkdownProcessor";
import { Button } from "render/ui";
import { VersionsIcon } from "@primer/octicons-react";
import { write } from "database/dbSlice";
import { ToggleSwitch, Text } from "@primer/react";

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
import { MarkdownEdit } from "./MarkdownEdit";
import { RichEdit } from "./RichEdit";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");

  const { data, isLoading, error } = useFetchData(templateId);
  const dispatch = useAppDispatch();
  const saveAsTemplate = useAppSelector((state) => state.page.saveAsTemplate);
  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);
  const mdastFromSlice = pageState.mdast;
  const navigate = useNavigate();
  const [textareaContent, setTextareaContent] = React.useState<string>("");

  useEffect(() => {
    data && dispatch(initPageFromTemplate(data));
  }, [data]);
  const saveData = async (pageData) => {
    try {
      const writePageAction = await dispatch(
        write({
          data: pageData,
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );

      const result = writePageAction.payload;
      if (result) {
        const id = result.id;
        navigate(`/${id}?edit=true`);
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
      <div className="container mx-auto flex items-center justify-between bg-gray-100 p-4">
        {pageState.createdTime}
        {/* <div className="text-gray-600">
          <VersionsIcon size={18} className="mr-2" />
          {pageState.hasVersion ? "Versioned" : "Not Versioned"}
        </div> */}
        <Text id="markdown-toggle" fontWeight="bold" fontSize={1}>
          按Markdown编辑
        </Text>
        <ToggleSwitch
          aria-labelledby="toggle"
          defaultChecked={pageState.showAsMarkdown}
          onChange={toggleShowAsMarkdown}
        />

        <Text id="markdown-toggle" fontWeight="bold" fontSize={1}>
          按模板保存
        </Text>
        <ToggleSwitch
          aria-labelledby="toggle"
          defaultChecked={saveAsTemplate}
          onChange={handleToggleTemplateChange}
        />
        <Button onClick={handleSave} variant="primary" size="medium">
          Save
        </Button>
      </div>
      <div className="container mx-auto flex flex-grow">
        <div className="w-full flex-shrink-0">
          <div className="flex w-full flex-col">
            {pageState.showAsMarkdown ? (
              <MarkdownEdit
                value={pageState.content}
                onChange={handleContentChange}
              />
            ) : (
              <RichEdit
                mdast={mdastFromSlice}
                onKeyDown={handleKeyDown}
                value={textareaContent}
                onChange={setTextareaContent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
