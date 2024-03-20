// DataItem.js
import { ChatBotBlock } from "ai/blocks/ChatBotBlock";
import TokenStatisticsItem from "ai/blocks/TokenStatisticsItem";
import { Link } from "react-router-dom";
import { PencilIcon, EyeIcon } from "@primer/octicons-react";
import { PayBlock } from "render/pay/Payblock";

import { DataType } from "create/types";

const DataItem = ({ dataId, content, source }) => {
  if (content?.type === "chatRobot") {
    return (
      <ChatBotBlock
        item={{ value: content, source, key: dataId }}
        key={dataId}
      />
    );
  }
  if (content?.type === "tokenStatistics") {
    return <TokenStatisticsItem dataId={dataId} content={content} />;
  }
  if (content?.type === DataType.pay) {
    return <PayBlock data={content} />;
  }
  const displayContent =
    typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const text =
    displayContent.length > 188
      ? displayContent.substring(0, 188) + "..."
      : displayContent;

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="mr-4 text-base  font-semibold text-blue-500">
          <Link to={`/${dataId}`} className="flex items-center hover:underline">
            {content.title}
          </Link>
        </h3>
        <Link
          to={`/${dataId}?edit=true`}
          className="flex items-center text-blue-500 transition-colors duration-300 hover:text-blue-600"
          aria-label="编辑"
        >
          <PencilIcon size={16} className="mr-1" />
          编辑
        </Link>
      </div>
      <p className="overflow-hidden text-ellipsis text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </>
  );
};

export default DataItem;
