// DataItem.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { handleOperations } from "../operations";
import { useAuth } from "app/hooks";

const DataItem = ({ dataId, content, refreshData, source }) => {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const displayContent =
    typeof content === "string" ? content : JSON.stringify(content);

  const handleButtonClick = (operation) => {
    if (operation === "edit") {
      setIsEditing(true);
      return;
    }
    if (operation === "save") {
      setIsEditing(false);
    }
    handleOperations(
      operation,
      dataId,
      editedContent,
      refreshData,
      auth.user?.userId
    );
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">{source}</span>
        {isEditing ? (
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 rounded"
          />
        ) : (
          <Link to={`/${dataId}`} className="text-blue-500 hover:underline">
            {displayContent}
          </Link>
        )}
      </div>
      <div>
        {isEditing ? (
          <button
            onClick={() => handleButtonClick("save")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => handleButtonClick("edit")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleButtonClick("delete")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
        {source === "local" && (
          <button
            onClick={() => handleButtonClick("syncToNolotus")}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Sync to Nolotus
          </button>
        )}
        {source === "nolotus" && (
          <button
            onClick={() => handleButtonClick("syncFromNolotus")}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Sync from Nolotus
          </button>
        )}
        {source === "both" && (
          <>
            <button
              onClick={() => handleButtonClick("syncToNolotus")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Sync to Nolotus
            </button>
            <button
              onClick={() => handleButtonClick("syncFromNolotus")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Sync from Nolotus
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DataItem;
