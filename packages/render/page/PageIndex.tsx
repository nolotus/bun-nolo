import { useAppDispatch, useFetchData } from "app/hooks";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { initPage } from "./pageSlice";
import RenderPage from "./RenderPage";

// import { Header } from "../layout/Header";

import NoMatch from "../NoMatch";

import EditPage from "./EditPage";

//id is for special page such as price
//todo custom path
const Page = ({ id }) => {
  const { pageId: paramPageId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const pageId = id || paramPageId;
  const isEditMode = searchParams.get("edit") === "true";

  const { data, isLoading, error } = useFetchData(pageId);
  const renderEdit = () => {
    if (isEditMode) {
      return <EditPage />;
    }
    if (!isEditMode) {
      return <RenderPage pageId={pageId} data={data} />;
    }
  };

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pageId}
          initial={{ opacity: 0, visibility: "hidden" }}
          animate={{ opacity: 1, visibility: "visible" }}
          exit={{ opacity: 0, visibility: "hidden" }}
          transition={{ duration: 0.3, when: "beforeChildren" }}
        />
        {renderEdit()}
      </AnimatePresence>
    );
  };
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-lg text-gray-800">
        加载中 请稍等
      </div>
    );
  } else {
    if (data) {
      dispatch(initPage(data));
      const { layout } = data;
      if (layout === "full") {
        return (
          <div className="flex min-h-screen flex-col">
            {/* <Header /> */}
            <div className="w-full flex-grow">{renderEdit()}</div>
          </div>
        );
      }
      return (
        <div className="flex min-h-screen flex-col">
          {/* <Header /> */}
          <div className="max-w-8xl  mx-auto w-full flex-grow">
            {renderContent()}
          </div>
        </div>
      );
    }
    if (!data) {
      return <NoMatch />;
    }
  }
};

export default Page;
