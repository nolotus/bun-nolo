// DataItem.js
import { ChatBotBlock } from 'ai/blocks/ChatBotBlock';
import React from 'react';
import { Link } from 'react-router-dom';

import { PageBlock } from './PageBlock';
const truncateContent = (content) => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
};
const DataItem = ({ dataId, content, source }) => {
  if (content?.type === 'chatRobot') {
    return (
      <ChatBotBlock
        item={{ value: content, source, key: dataId }}
        key={dataId}
      />
    );
  }
  if (content?.type === 'page') {
    return (
      <PageBlock value={content} id={dataId} key={dataId} source={source} />
    );
  }
  if (content?.type === 'tokenStatistics') {
    return (
      <Link
        to={`/${dataId}`}
        key={dataId}
        className="p-2 w-full sm:w-1/2 lg:w-1/3"
      >
        <h3 className="text-md font-semibold text-gray-700">{dataId}</h3>
        <p className="mt-2 text-sm text-gray-500">
          {truncateContent(JSON.stringify(content))}
        </p>
      </Link>
    );
  }

  const displayContent =
    typeof content === 'string' ? content : JSON.stringify(content);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Link to={`/${dataId}`} className="text-blue-500 hover:underline">
          {displayContent}
        </Link>
      </div>
    </div>
  );
};

export default DataItem;
