import { useAuth } from "auth/useAuth";
import { DataType } from "create/types";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { renderContentNode } from "render";

import { markdownToMdast } from "../processor/MarkdownProcessor";
import SurfSpotPage from "../surf/web/SurfSpotPage";

import { RenderJson } from "./RenderJson";
import { ButtonGroup } from "./ButtonGroup";
import { extractUserId } from "core";
import { useDispatch } from "react-redux";
import { removeOne } from "database/dbSlice";
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
          {data.mdast
            ? renderContentNode(data.mdast)
            : renderContentNode(markdownToMdast(data.content))}
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
      dispatch(removeOne(pageId));
      alert("Page deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete the page:", error);
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
