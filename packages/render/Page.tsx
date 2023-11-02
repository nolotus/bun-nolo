import { useStore } from 'app';
import { useAppSelector, useAuth } from 'app/hooks';
import { useDeleteEntryMutation } from 'database/service';
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 引入 useHistory 来进行页面跳转
import { renderContentNode } from 'render';

const Page = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const auth = useAuth();
  let navigate = useNavigate(); // 使用 useHistory hook 来控制路由跳转
  let params = useParams();
  const pageId = params.pageId;
  const data = useStore(pageId);

  const { mdast, type } = data;

  const renderedContent = useMemo(() => {
    if (type === 'page') {
      return renderContentNode(mdast);
    }
    if (data) {
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  }, [mdast, type, data]);

  // 使用 useDeleteEntryMutation hook
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteEntryMutation();

  const handleDelete = async () => {
    try {
      // 调用 API 删除条目
      await deleteEntry({ entryId: pageId }).unwrap();
      // 删除成功后的逻辑
      alert('Page deleted successfully!');
      // 使用 navigate 进行页面跳转
      navigate('/'); // 假设跳转到应用的根路由
    } catch (error) {
      // 错误处理逻辑
      console.error('Failed to delete the page:', error);
      alert('Error deleting page. Please try again.');
    }
  };

  const handleEdit = () => {
    // 编辑页面的逻辑，这里假设跳转到编辑页面的路由
    // navigate(`/edit/${pageId}`);
  };

  return (
    <div>
      {renderedContent}
      {isLoggedIn && (
        <>
          {/* 编辑按钮 */}
          <button
            type="button"
            onClick={handleEdit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Edit Page
          </button>
          {/* 删除按钮，加上了登录和loading状态判断 */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete Page'}
          </button>
        </>
      )}
    </div>
  );
};

export default Page;
