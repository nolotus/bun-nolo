import { useAppDispatch } from 'app/hooks';
import { useGetEntryQuery } from 'database/services';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from 'web/Header';

import NoMatch from '../NoMatch';

import EditPage from './EditPage';
import { initPage } from './pageSlice';
import RenderPage from './RenderPage';

const Page = ({ id }) => {
  const { pageId: paramPageId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const pageId = id || paramPageId;
  const isEditMode = searchParams.get('edit') === 'true';
  const renderEdit = () => {
    if (isEditMode) {
      return <EditPage />;
    }
    if (!isEditMode) {
      return <RenderPage pageId={pageId} data={data} />;
    }
  };

  const { data, isLoading } = useGetEntryQuery({ entryId: pageId });
  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pageId}
          initial={{ opacity: 0, visibility: 'hidden' }}
          animate={{ opacity: 1, visibility: 'visible' }}
          exit={{ opacity: 0, visibility: 'hidden' }}
          transition={{ duration: 0.3, when: 'beforeChildren' }}
        />
        {renderEdit()}
      </AnimatePresence>
    );
  };

  if (isLoading) {
    return <div>loading</div>;
  }
  if (data) {
    dispatch(initPage(data));
    const { layout } = data;
    if (layout === 'full') {
      return (
        <div className="bg-neutral-200 flex flex-col min-h-screen">
          <Header />
          <div className="w-full  flex-grow">{renderEdit()}</div>
        </div>
      );
    } else {
      return (
        <div className="bg-neutral-200 flex flex-col min-h-screen">
          <Header />
          <div className="max-w-8xl w-full mx-auto p-8 md:p-16 flex-grow">
            {renderContent()}
          </div>
          {/* <Footer /> */}
        </div>
      );
    }
  }

  if (!data) {
    return <NoMatch />;
  }
};

export default Page;
