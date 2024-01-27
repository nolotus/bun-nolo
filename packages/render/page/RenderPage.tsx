import { useAuth } from "app/hooks";
import { DataType } from "create/types";
import { useDeleteEntryMutation } from "database/services";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { renderContentNode } from "render";

import { markdownToMdast } from "../MarkdownProcessor";
import SurfSpotPage from "../surf/web/SurfSpotPage";

import { RenderJson } from "./RenderJson";
// 导入所需的图标
import { PencilIcon, TrashIcon } from "@primer/octicons-react";

const FloatingEditPanel = ({ onEdit, onDelete, isDeleting }) => {
  return (
    <div className="fixed right-4 top-1/2 flex -translate-y-1/2 transform flex-col items-center space-y-2">
      <button
        type="button"
        onClick={onEdit}
        className="flex transform items-center rounded bg-blue-100 px-4 py-2 font-semibold text-blue-800 shadow transition duration-150 ease-in-out hover:bg-blue-200 hover:shadow-md"
        title="编辑页面"
      >
        <PencilIcon size={16} className="mr-2" />
        编辑
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className={`flex transform items-center rounded bg-red-100 px-4 py-2 font-semibold text-red-800 shadow transition duration-150 ease-in-out hover:bg-red-200 hover:shadow-md ${
          isDeleting ? "cursor-not-allowed opacity-50" : ""
        }`}
        title="删除页面"
      >
        <TrashIcon size={16} className="mr-2" />
        {isDeleting ? "删除中" : "删除"}
      </button>
    </div>
  );
};
const RenderPage = ({ pageId, data }) => {
  const navigate = useNavigate();
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
    <div>
      {allowEdit && (
        <FloatingEditPanel
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {renderedContent}
    </div>
  );
};

export default RenderPage;
