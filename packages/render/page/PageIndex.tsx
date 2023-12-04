import { useAppDispatch } from 'app/hooks';
import { useGetEntryQuery } from 'database/services';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import NoMatch from '../NoMatch';

import EditPage from './EditPage';
import { initPage } from './pageSlice';
import RenderPage from './RenderPage';

const Page = ({ id }) => {
  const { pageId: paramPageId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const isEditMode = searchParams.get('edit') === 'true';
  const pageId = id || paramPageId;
  const { data, isLoading } = useGetEntryQuery({ entryId: pageId });
  if (isLoading) {
    return <div>loading</div>;
  }
  if (data) {
    dispatch(initPage(data));
    if (isEditMode) {
      return <EditPage />;
    }
    if (!isEditMode) {
      return <RenderPage pageId={pageId} data={data} />;
    }
  }

  if (!data) {
    return <NoMatch />;
  }
};

export default Page;
