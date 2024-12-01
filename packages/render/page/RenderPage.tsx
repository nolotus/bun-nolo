import { useAuth } from "auth/useAuth";
import { DataType } from "create/types";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Editor from "create/editor/Editor";

import SurfSpotPage from "../surf/web/SurfSpotPage";

import { RenderJson } from "./RenderJson";
import { ButtonGroup } from "./ButtonGroup";
import { extractUserId } from "core";
import { useDispatch } from "react-redux";
import { deleteData } from "database/dbSlice";
import toast from "react-hot-toast";
const RenderPage = ({ pageId, data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createId = extractUserId(pageId);
  const renderedContent = useMemo(() => {
    if (data.type === DataType.SurfSpot) {
      return <SurfSpotPage id={pageId} source={data.source} />;
    }
    if (data.type === "page") {
      return (
        <div>
          <Editor markdown={data.content} />
        </div>
      );
    }
    return <RenderJson data={data} />;
  }, [data]);

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between ">
        <div>{createId}</div>
        <ButtonGroup
          onEdit={handleEdit}
          onDelete={handleDelete}
          allowEdit={allowEdit}
        />
      </div>
      {renderedContent}
    </div>
  );
};

export default RenderPage;
