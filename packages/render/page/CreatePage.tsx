import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { DataType } from 'create/types';
import { useWriteMutation } from 'database/services';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderContentNode } from 'render';
import { Button } from 'ui'; // 请替换为实际的 Button 组件路径

import {
  setTitle,
  setHasVersion,
  setSlug,
  setCreator,
  setCreatedTime,
  saveContentAndMdast,
} from './pageSlice';

const CreatePage = ({}) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const pageState = useAppSelector((state) => state.page);
  const mdastFromSlice = pageState.mdast;
  const [mutate] = useWriteMutation();
  const navigate = useNavigate();
  //保存之前检查输入区内容
  const handleSave = async () => {
    try {
      const pageData = {
        content: pageState.content,
        title: pageState.title,
        has_version: pageState.hasVersion,
        creator: auth.user?.userId, // 确保与auth状态同步
        created_at: pageState.createdTime,
        mdast: pageState.mdast,
        type: DataType.Page,
      };
      const newSlug = nanoid();
      const result = await mutate({
        data: pageData,
        flags: { isJSON: true },
        customId: newSlug,
        userId: auth.user?.userId,
      });

      if (result) {
        // 成功处理逻辑
        dispatch(setCreatedTime());
        console.log('Submitted Data:', pageState);
        console.log(' result', result);

        const dataId = result.data.dataId; // 假设 dataId 在 result.data.dataId，你需要根据实际响应调整
        dispatch(setCreatedTime());

        navigate(`/${dataId}`); // 使用 dataId 进行页面跳转
      }
    } catch (error) {
      // 错误处理逻辑
      console.error('Mutation failed:', error);
    }
  };
  const textareaRef = useRef(null);

  // 在组件挂载后自动选中 textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);
  const [textareaContent, setTextareaContent] = React.useState<string>('');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'; // 重置高度以重新计算
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 设置为滚动高度
    }
  }, [textareaContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      dispatch(saveContentAndMdast(textareaContent));
      setTextareaContent(''); // 清空 textarea

      // handleSave(); // 调用已有的保存逻辑
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center bg-gray-100 p-4">
        <div className="text-gray-600">
          {pageState.createdTime} |{' '}
          {pageState.hasVersion ? 'Versioned' : 'Not Versioned'}
        </div>
        <Button onClick={handleSave} variant="primary" size="medium">
          Save
        </Button>
      </div>
      <div className="flex-grow flex">
        <div className="w-full p-4 flex flex-col">
          <div className=" w-full flex-shrink-0">
            <div>{renderContentNode(mdastFromSlice)}</div>
          </div>
          <textarea
            id="content"
            className="w-full h-auto focus:ring-0 focus:outline-none resize-none bg-transparent"
            value={textareaContent} // 使用本地状态
            onChange={(e) => setTextareaContent(e.target.value)} // 使用本地状态
            onKeyDown={handleKeyDown} // 添加键盘事件处理器
            ref={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
