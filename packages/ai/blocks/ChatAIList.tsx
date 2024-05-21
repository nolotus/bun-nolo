import { ChatBotBlock } from "ai/blocks/ChatBotBlock";
import { useAppSelector, useQueryData } from "app/hooks";
import { DataType } from "create/types";
import { selectFilteredDataByUserAndType } from "database/selectors";

const ChatAIList = ({ queryUserId }) => {
  const queryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit: 20,
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
    return <div>loading</div>;
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
