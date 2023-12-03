import { useAuth } from 'app/hooks';
import { DataType } from 'create/types';
import { useDeleteEntryMutation } from 'database/services';
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderContentNode } from 'render';

import { markdownToMdast } from '../MarkdownProcessor';

import { RenderJson } from './RenderJson';
import SurfSpotPage from './SurfSpotPage';

const RenderPage = ({ pageId, data }) => {
  const navigate = useNavigate();
  const renderedContent = useMemo(() => {
    if (data.type === DataType.SurfSpot) {
      return <SurfSpotPage data={data} />;
    }
    if (data.type === 'page') {
      if (data.mdast) {
        return renderContentNode(data.mdast);
      } else if (data.content) {
        return renderContentNode(markdownToMdast(data.content));
      }
    } else {
      return <RenderJson data={data} />;
    }
  }, [data]);

  const handleEdit = useCallback(() => {
    navigate(`/${pageId}?edit=true`);
  }, [navigate, pageId]);
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteEntryMutation();

  const handleDelete = useCallback(async () => {
    try {
      await deleteEntry({ entryId: pageId }).unwrap();
      alert('Page deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete the page:', error);
      alert('Error deleting page. Please try again.');
    }
  }, [deleteEntry, navigate, pageId]);
  const auth = useAuth();
  const isCreator = data.creator === auth.user?.userId;
  const isNotBelongAnyone = !data.creator;
  const allowEdit = isCreator || isNotBelongAnyone;

  return (
    <div>
      {allowEdit && (
        <>
          <button
            type="button"
            onClick={handleEdit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Edit Page
          </button>
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

      {renderedContent}
    </div>
  );
};

export default RenderPage;
