import { useAuth } from "auth/useAuth";
import { DataType } from "create/types";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { deleteData } from "database/dbSlice";
import { extractUserId } from "core";
import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";
import DialogPage from "chat/dialog/DialogPage";
import SurfSpotPage from "../surf/web/SurfSpotPage";

import { RenderJson } from "./RenderJson";
import { ButtonGroup } from "./ButtonGroup";

const RenderPage = ({ pageId, data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createId = extractUserId(pageId);
  const handleEdit = useCallback(() => {
    navigate(`/${pageId}?edit=true`);
  }, [navigate, pageId]);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteData({ id: pageId }));
      toast.success("Page deleted successfully!");
      navigate("/");
    } catch (error) {
      alert("Error deleting page. Please try again.");
    }
  }, [navigate, pageId]);
  const auth = useAuth();

  const isCreator = data.creator === auth.user?.userId;

  const isNotBelongAnyone = !data.creator;

  const allowEdit = isCreator || isNotBelongAnyone;

  const renderedContent = useMemo(() => {
    if (data.type === DataType.Dialog) {
      return <DialogPage />;
    }
    if (data.type === DataType.SurfSpot) {
      return (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{createId}</div>
            <ButtonGroup
              onEdit={handleEdit}
              onDelete={handleDelete}
              allowEdit={allowEdit}
            />
          </div>
          <SurfSpotPage id={pageId} source={data.source} />
        </>
      );
    }
    if (data.type === "page") {
      let initialValue;
      if (data.slateData) {
        initialValue = markdownToSlate(data.content);
        console.log("slateData", initialValue);
      } else {
        initialValue = markdownToSlate(data.content);
      }
      return (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10ch",
            }}
          >
            <div>{createId}</div>
            <ButtonGroup
              onEdit={handleEdit}
              onDelete={handleDelete}
              allowEdit={allowEdit}
            />
          </div>
          <Editor initialValue={initialValue} readOnly={true} />
        </div>
      );
    }
    return <RenderJson data={data} />;
  }, [data]);

  return <div>{renderedContent}</div>;
};

export default RenderPage;
