import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { useAuth } from "auth/useAuth";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  markdownToMdast,
  getH1TextFromMdast,
} from "render/processor/MarkdownProcessor";
import { Button } from "render/ui";
import { VersionsIcon } from "@primer/octicons-react";
import { write } from "database/dbSlice";
import ToggleSwitch from "render/ui/ToggleSwitch";
import OpenProps from "open-props";

import { createPageData } from "./pageDataUtils";
import {
  setHasVersion,
  updateContent,
  setSaveAsTemplate,
  initPageFromTemplate,
} from "./pageSlice";
import { processContent } from "./processContent";
import Editor from "create/editor/Editor";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");

  const { data, isLoading, error } = useFetchData(templateId);
  const dispatch = useAppDispatch();
  const saveAsTemplate = useAppSelector((state) => state.page.saveAsTemplate);
  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);
  const navigate = useNavigate();
  const [textareaContent, setTextareaContent] = React.useState<string>("");

  useEffect(() => {
    data && dispatch(initPageFromTemplate(data));
  }, [data]);
  const save = async (pageData) => {
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
    }
  };

  //保存之前检查输入区内容
  const handleSave = async () => {
    return;
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
    }

    save(updatedPageState);
  };

  const handleToggleTemplateChange = (value: boolean) => {
    dispatch(setSaveAsTemplate(value));
  };

  const handleContentChange = (changeValue: string) => {
    const { content, mdast, metaUpdates } = processContent(changeValue);

    dispatch(updateContent({ content, metaUpdates, mdast }));
  };
  return (
    <div className="flex min-h-screen flex-row">
      <div className="container mx-auto flex flex-grow">
        <div className="w-full flex-shrink-0">
          <div className="flex w-full flex-col">
            <Editor />
          </div>
        </div>
      </div>
      <div className="mx-auto  items-center">
        {pageState.createdTime}
        {/* <div className="text-gray-600">
          <VersionsIcon size={18} className="mr-2" />
          {pageState.hasVersion ? "Versioned" : "Not Versioned"}
        </div> */}

        <div
          style={{
            display: "flex",
            gap: OpenProps.sizeFluid1,
            alignItems: "center",
          }}
        >
          <span>按模板保存</span>
          <ToggleSwitch
            defaultChecked={saveAsTemplate}
            onChange={handleToggleTemplateChange}
          />
        </div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

export default CreatePage;
