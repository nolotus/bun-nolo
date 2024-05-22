import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import ChatAIList from "ai/blocks/ChatAIList";
import { nolotusId } from "core/init";

export const ChatGuide = () => {
  return (
    <div className="container mx-auto mt-16">
      <h2>创建自己的=》</h2>
      <CreateChatAIButton />
      <h2>使用别人的=》</h2>
      <ChatAIList queryUserId={nolotusId} limit={6} />
    </div>
  );
};
