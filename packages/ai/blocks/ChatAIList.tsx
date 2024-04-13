import { ChatBotBlock } from "ai/blocks/ChatBotBlock";

const ChatAIList = ({ data }) => {
  return (
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
  );
};
export default ChatAIList;
