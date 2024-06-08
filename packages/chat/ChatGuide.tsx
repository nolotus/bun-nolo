import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import ChatAIList from "ai/blocks/ChatAIList";
import { nolotusId } from "core/init";

export const ChatGuide = () => {
  return (
    <div className="container mt-16">
      <h3>创建自己的</h3>
      <CreateChatAIButton />
      <h3>使用别人的</h3>
      <ChatAIList queryUserId={nolotusId} limit={6} />
    </div>
  );
};
