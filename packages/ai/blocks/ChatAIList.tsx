import { ChatBotBlock } from "ai/blocks/ChatBotBlock";
import { useAppSelector, useQueryData } from "app/hooks";
import { DataType } from "create/types";
import { selectFilteredDataByUserAndType } from "database/selectors";
import React from "react";
import { PageLoading } from "render/blocks/PageLoading";
const ChatAIList = ({ queryUserId, limit = 20 }) => {
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
  const { data, isLoading, isSuccess } = useQueryData(queryConfig);
  // const data = useAppSelector(
  //   selectFilteredDataByUserAndType(queryUserId, DataType.ChatRobot),
  // );
  if (isLoading) {
    return <div>loading ailist</div>;
  }
  return (
    <div className="grid grid-cols-3  gap-4">
      {isSuccess &&
        data?.map((item) => {
          return <ChatBotBlock item={item} key={item.id} />;
        })}
    </div>
  );
};
export default ChatAIList;
