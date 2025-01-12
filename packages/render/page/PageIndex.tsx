import { useAppDispatch, useFetchData } from "app/hooks";
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import DialogPage from "chat/dialog/DialogPage";
import { DataType } from "create/types";
import RenderPage from "render/page/RenderPage";
import NoMatch from "../NoMatch";
import EditPage from "./EditPage";
import { initPage, resetPage } from "./pageSlice";

import { RenderJson } from "./RenderJson";

const Page = () => {
  const { pageId } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(resetPage());
    };
  }, [dispatch]);

  //maybe need id from props
  const isEditMode = searchParams.get("edit") === "true";

  const { data, isLoading, error } = useFetchData(pageId);

  //edit page not need data

  // render page need data
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
  }
  if (data) {
    dispatch(initPage(data));
    if (isEditMode) {
      return <EditPage />;
    }
    if (data.type === DataType.DIALOG) {
      return <DialogPage pageId={pageId} />;
    }
    if (data.type === DataType.PAGE) {
      return <RenderPage pageId={pageId} data={data} />;
    }
    return <RenderJson data={data} />;
  }
  return <NoMatch />;
};

export default Page;
