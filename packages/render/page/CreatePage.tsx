import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { useWriteMutation } from 'database/services';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { renderContentNode } from 'render';
import { markdownToMdast, getH1TextFromMdast } from 'render/MarkdownProcessor';
import { Button, Toggle } from 'ui';

import { MarkdownEdit } from './MarkdownEdit';
import { createPageData } from './pageDataUtils';
import {
  setHasVersion,
  setSlug,
  setCreator,
  saveContentAndMdast,
  setShowAsMarkdown,
  updateContent,
} from './pageSlice';
const CreatePage = () => {
  const dispatch = useAppDispatch();

  const auth = useAuth();
  const userId = auth.user?.userId;
  const pageState = useAppSelector((state) => state.page);
  const mdastFromSlice = pageState.mdast;
  const [mutate] = useWriteMutation();
  const navigate = useNavigate();
  const [textareaContent, setTextareaContent] = React.useState<string>('');

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
      console.error('Mutation failed:', error);
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
          (updatedPageState.content ? '\n\n' : '') +
          textareaContent,
        title: getH1TextFromMdast(newMdast) || updatedPageState.title,
      };

      // 清空 textarea
      setTextareaContent('');
    }

    saveData(updatedPageState);
  };




  const toggleShowAsMarkdown = (value) => {
    dispatch(setShowAsMarkdown(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      dispatch(saveContentAndMdast(textareaContent));
      setTextareaContent(''); // 清空 textarea

    }
  };
  const contentChange = (content) => {
    dispatch(updateContent(content));
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center bg-gray-100 p-4">
        <div className="text-gray-600">
          {pageState.createdTime} |{' '}
          {pageState.hasVersion ? 'Versioned' : 'Not Versioned'}
        </div>
        <Toggle
          label="Markdown 显示" // 简洁的标签
          id="markdown-toggle" // 唯一的 ID
          checked={pageState.showAsMarkdown}
          onChange={toggleShowAsMarkdown}
        />

        <Button onClick={handleSave} variant="primary" size="medium">
          Save
        </Button>
      </div>
      <div className="flex-grow flex">
        <div className="w-full flex-shrink-0">
          <div className="w-full p-4 flex flex-col">
            {pageState.showAsMarkdown ? (
              <MarkdownEdit
              value={pageState.content}
                onChange={contentChange}
              />
            ) : (
              <>
                <div>{renderContentNode(mdastFromSlice)}</div>
                <MarkdownEdit
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
