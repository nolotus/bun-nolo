import { useAppDispatch, useFetchData } from "app/hooks";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { initPage, resetPage } from "./pageSlice";
import RenderPage from "./RenderPage";
import NoMatch from "../NoMatch";
import EditPage from "./EditPage";

const Page = ({ id }) => {
  const { pageId: paramPageId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  useEffect(() => {
    return () => {
      dispatch(resetPage());
    };
  }, [dispatch]);

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
        >
          {renderEdit()}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          fontSize: "1.125rem",
          color: "rgb(31, 41, 55)",
        }}
      >
        加载中 请稍等
      </div>
    );
  } else {
    if (data) {
      dispatch(initPage(data));
      const { layout } = data;
      if (layout === "full") {
        return (
          <div
            style={{
              display: "flex",
              minHeight: "100vh",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "100%",
                flexGrow: 1,
              }}
            >
              {renderEdit()}
            </div>
          </div>
        );
      }

      return (
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              maxWidth: "88rem",
              margin: "0 auto",
              width: "100%",
              flexGrow: 1,
            }}
          >
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
