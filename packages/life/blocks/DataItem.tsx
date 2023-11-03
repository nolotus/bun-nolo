// DataItem.js
import { ChatBotBlock } from 'ai/blocks/ChatBotBlock';
import { useAuth } from 'app/hooks';
import { useDeleteEntryMutation } from 'database/service';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { handleOperations } from '../operations';
const truncateContent = (content) => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
};
const DataItem = ({ dataId, content, refreshData, source }) => {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [deleteEntry] = useDeleteEntryMutation();

  if (content?.type === 'chatRobot') {
    return (
      <ChatBotBlock
        item={{ value: content, source, key: dataId }}
        key={dataId}
      />
    );
  }
  if (content?.type === 'tokenStatistics') {
    return (
      <Link
        to={`/${dataId}`}
        key={dataId}
        className="p-2 w-full sm:w-1/2 lg:w-1/3"
      >
        <div className="p-4 border border-gray-300 bg-white rounded-lg shadow-sm">
          <h3 className="text-md font-semibold text-gray-700">{dataId}</h3>
          <p className="mt-2 text-sm text-gray-500">
            {truncateContent(JSON.stringify(content))}
          </p>
        </div>
      </Link>
    );
  }

  const displayContent =
    typeof content === 'string' ? content : JSON.stringify(content);

  const handleButtonClick = (operation) => {
    if (operation === 'edit') {
      setIsEditing(true);
      return;
    }
    if (operation === 'save') {
      setIsEditing(false);
    }
    handleOperations(
      operation,
      dataId,
      editedContent,
      refreshData,
      auth.user?.userId,
    );
  };
  const deleteItem = async () => {
    await deleteEntry({ entryId: dataId });
    console.log('Data deleted successfully');
    refreshData();
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
            onClick={() => handleButtonClick('save')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => handleButtonClick('edit')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={deleteItem}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
        {source === 'local' && (
          <button
            onClick={() => handleButtonClick('syncToNolotus')}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Sync to Nolotus
          </button>
        )}
        {source === 'nolotus' && (
          <button
            onClick={() => handleButtonClick('syncFromNolotus')}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Sync from Nolotus
          </button>
        )}
        {source === 'both' && (
          <>
            <button
              onClick={() => handleButtonClick('syncToNolotus')}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Sync to Nolotus
            </button>
            <button
              onClick={() => handleButtonClick('syncFromNolotus')}
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
