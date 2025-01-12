import { useAuth } from "auth/useAuth";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { deleteData } from "database/dbSlice";
import { extractUserId } from "core/prefix";

import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";

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
      await dispatch(deleteData(pageId));
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

  const initialValue = useMemo(() => {
    return data.slateData ? data.slateData : markdownToSlate(data.content);
  }, [data.slateData, data.content]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ fontSize: "16px", color: "#666" }}>{createId}</div>
        <ButtonGroup
          onEdit={handleEdit}
          onDelete={handleDelete}
          allowEdit={allowEdit}
        />
      </div>
      <Editor
        initialValue={initialValue}
        readOnly={true}
        style={{ minHeight: "300px" }}
      />
    </div>
  );
};

export default RenderPage;
