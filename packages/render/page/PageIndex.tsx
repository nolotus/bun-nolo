import { useAppDispatch, useFetchData } from "app/hooks";
import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { initPage, resetPage } from "./pageSlice";
import RenderPage from "render/page/RenderPage";
import NoMatch from "../NoMatch";
import EditPage from "./EditPage";
import { DataType } from "create/types";
import { SurfPage } from "../surf/web/SurfPage";
import DialogPage from "chat/dialog/DialogPage";

import { RenderJson } from "./RenderJson";

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
  //maybe need id from props
  const isEditMode = searchParams.get("edit") === "true";

  const { data, isLoading, error } = useFetchData(pageId);

  //edit page not need data
  if (isEditMode) {
    return <EditPage />;
  }

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
  } else if (data) {
    dispatch(initPage(data));
    if (data.type === DataType.Dialog) {
      return <DialogPage dialogId={pageId} />;
    }
    if (data.type === DataType.SurfSpot) {
      return <SurfPage pageId={pageId} data={data} />;
    }
    if (data.type === DataType.Page) {
      return <RenderPage pageId={pageId} data={data} />;
    }
    return <RenderJson data={data} />;
  }
  return <NoMatch />;
};

export default Page;
