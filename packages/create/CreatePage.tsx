import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { useWriteMutation } from 'database/service';
import React, { useMemo, useEffect, useRef } from 'react';
import { renderContentNode } from 'render';
import { useMarkdownProcessor } from 'render/MarkdownProcessor';
import { Button } from 'ui'; // 请替换为实际的 Button 组件路径

import {
  setContent,
  setTitle,
  setHasVersion,
  setSlug,
  setCreator,
  setCreatedTime,
} from './pageSlice';

const CreatePage = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const pageState = useAppSelector((state) => state.page);
  const [mutate] = useWriteMutation();
  const mdast = useMarkdownProcessor(pageState.content, (title) =>
    dispatch(setTitle(title)),
  );

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast);
  }, [mdast]);

  const handleSave = () => {
    dispatch(setCreatedTime());
    console.log('Submitted Data:', pageState);
    mutate({
      data: pageState.content,
      flags: {}, // 你需要根据实际情况提供适当的flags
      customId: pageState.slug, // 假设 slug 是自定义ID，根据实际情况调整
      userId: auth.user?.userId,
    }).then((result) => {
      if (result.isSuccess) {
        // 成功处理逻辑
        dispatch(setCreatedTime());
        console.log('Submitted Data:', pageState);
      } else {
        // 错误处理逻辑
        console.error('Mutation failed:', result.error);
      }
    });
  };
  const textareaRef = useRef(null);

  // 在组件挂载后自动选中 textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);
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
            <div>{renderedContent}</div>
          </div>
          <textarea
            id="content"
            className="w-full h-auto focus:ring-0 focus:outline-none resize-none bg-transparent"
            value={pageState.content}
            onChange={(e) => dispatch(setContent(e.target.value))}
            style={{ overflow: 'hidden' }}
            ref={textareaRef} // 使用 ref
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
