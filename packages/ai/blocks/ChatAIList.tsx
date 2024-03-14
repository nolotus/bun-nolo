import { useGetEntriesQuery } from "database/services";
import { nolotusId } from "core/init";
import { chatAIOptions } from "ai/request";
import { ChatBotBlock } from "ai/blocks/ChatBotBlock";

const ChatAIList = () => {
  const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
    userId: nolotusId,
    options: chatAIOptions,
  });
  return (
    <div>
      {isLoading ? (
        "加载中"
      ) : (
        <div className="grid grid-cols-3  gap-4">
          {data?.map((item) => {
            return (
              <ChatBotBlock
                item={{ value: item, source: item.source, key: item.id }}
                key={item.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ChatAIList;
