import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import ChatAIList from "ai/blocks/ChatAIList";
import { nolotusId } from "core/init";
import { chatAIOptions } from "ai/request";
import { useGetEntriesQuery } from "database/services";

export const ChatGuide = () => {
  const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
    userId: nolotusId,
    options: chatAIOptions,
  });
  return (
    <div className="container mx-auto mt-16">
      <h2>创建自己的=》</h2>
      <CreateChatAIButton />
      <h2>使用别人的=》</h2>
      {isSuccess && <ChatAIList data={data} />}
    </div>
  );
};
