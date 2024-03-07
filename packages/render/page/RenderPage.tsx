import { useAuth } from "app/hooks";
import { DataType } from "create/types";
import { useDeleteEntryMutation } from "database/services";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { renderContentNode } from "render";

import { markdownToMdast } from "../MarkdownProcessor";
import SurfSpotPage from "../surf/web/SurfSpotPage";

import { RenderJson } from "./RenderJson";
import { ButtonGroup } from "./ButtonGroup";
import { extractUserId } from "core";
const RenderPage = ({ pageId, data }) => {
  const navigate = useNavigate();
  const createId = extractUserId(pageId);
  const renderedContent = useMemo(() => {
    if (data.type === DataType.SurfSpot) {
      return <SurfSpotPage data={data} />;
    }
    if (data.type === "page") {
      if (data.mdast) {
        return renderContentNode(data.mdast);
      }
      return renderContentNode(markdownToMdast(data.content));
    }
    return <RenderJson data={data} />;
  }, [data]);

  const handleEdit = useCallback(() => {
    navigate(`/${pageId}?edit=true`);
  }, [navigate, pageId]);
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteEntryMutation();

  const handleDelete = useCallback(async () => {
    try {
      await deleteEntry({ entryId: pageId }).unwrap();
      alert("Page deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete the page:", error);
      alert("Error deleting page. Please try again.");
    }
  }, [deleteEntry, navigate, pageId]);
  const auth = useAuth();
  const isCreator = data.creator === auth.user?.userId;
  const isNotBelongAnyone = !data.creator;
  const allowEdit = isCreator || isNotBelongAnyone;

  return (
    <div className="mx-auto max-w-full p-0 sm:p-2 md:p-4 lg:p-6 xl:p-8">
      <div className="container flex justify-between ">
        <div>{createId}</div>

        <ButtonGroup
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          allowEdit={allowEdit}
        />
      </div>

      {renderedContent}
    </div>
  );
};

export default RenderPage;
