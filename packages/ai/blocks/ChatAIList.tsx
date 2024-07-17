import { ChatBotBlock } from "ai/blocks/ChatBotBlock";
import { useQueryData } from "app/hooks";
import { DataType } from "create/types";
import React from "react";

const ChatAIList = ({ queryUserId, limit = 20 }) => {
  //todo multi type query
  const queryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.ChatRobot,
      },
    },
  };
  const queryConfig2 = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.Cybot,
      },
    },
  };

  const { data, isLoading, isSuccess } = useQueryData(queryConfig);
  const { data: data2, isSuccess: isSuccess2 } = useQueryData(queryConfig2);
  console.log("data2", data2);

  if (isLoading) {
    return <div>loading AI list</div>;
  }
  return (
    <div className="grid grid-cols-3  gap-4">
      {isSuccess &&
        data?.map((item) => {
          return <ChatBotBlock item={item} key={item.id} />;
        })}
      {isSuccess &&
        data2?.map((item) => {
          return <ChatBotBlock item={item} key={item.id} />;
        })}
    </div>
  );
};
export default ChatAIList;
