import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { DataType } from 'create/types';
import {
  useUpdateEntryMutation,
  useDeleteEntryMutation,
} from 'database/services';
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { renderContentNode } from 'render';
import { Button, Toggle } from 'ui';
import { Toast } from 'ui/toast/Toast';
import { useToastManager } from 'ui/toast/useToastManager';

import { MarkdownEdit } from './MarkdownEdit';
import {
  setHasVersion,
  setSlug,
  setCreator,
  saveContentAndMdast,
  setShowAsMarkdown,
  updateContent,
} from './pageSlice';

const EditPage = () => {
  const { toasts, addToast, removeToast } = useToastManager();

  const dispatch = useAppDispatch();
  const { pageId } = useParams();

  const auth = useAuth();
  const pageState = useAppSelector((state) => state.page);
  const mdastFromSlice = pageState.mdast;
  const [updateEntry] = useUpdateEntryMutation();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [textareaContent, setTextareaContent] = React.useState<string>('');

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
      const result = await updateEntry({
        entryId: pageId, // 使用 pageId 作为 entryId
        data: pageData, // 将页面数据作为更新内容
      }).unwrap(); // 使用 unwrap 处理响应

      if (result) {
        // 成功处理逻辑
        addToast('保存成功');

        console.log('Submitted Data:', pageState);
        console.log(' result', result);
      }
    } catch (error) {
      // 错误处理逻辑
      console.error('Mutation failed:', error);
    }
  };

  // 在组件挂载后自动选中 textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'; // 重置高度以重新计算
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 设置为滚动高度
    }
  }, [textareaContent]);

  const toggleShowAsMarkdown = (value) => {
    dispatch(setShowAsMarkdown(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      dispatch(saveContentAndMdast(textareaContent));
      setTextareaContent(''); // 清空 textarea

      // handleSave(); // 调用已有的保存逻辑
    }
  };

  const [deleteEntry, { isLoading: isDeleting }] = useDeleteEntryMutation();

  const handleDelete = useCallback(async () => {
    try {
      await deleteEntry({ entryId: pageId }).unwrap();

      // addToast('Page deleted successfully!');
      navigate('/life/notes');
    } catch (error) {
      console.error('Failed to delete the page:', error);
      addToast('Error deleting page. Please try again.');
    }
  }, [deleteEntry, navigate, pageId, addToast]);

  const contentChange = (content) => {
    dispatch(updateContent(content));
  };
  return (
    <div className="flex flex-col h-screen">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
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
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      <div className="flex-grow flex">
        <div className="w-full flex-shrink-0">
          {pageState.showAsMarkdown ? (
            <MarkdownEdit
              initValue={pageState.content}
              onChange={contentChange}
            />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPage;
