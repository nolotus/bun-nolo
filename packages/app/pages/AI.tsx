import React from "react";
import { useGetEntriesQuery } from "database/services";

import { nolotusId } from "core/init";
import ChatAIList from "ai/blocks/ChatAIList";
import { chatAIOptions } from "ai/request";
import { useAuth } from "../hooks";

const AI = () => {
  const auth = useAuth();

  const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
    userId: nolotusId,
    options: chatAIOptions,
  });
  const currentUserId = auth.user?.userId;
  const { data: myData } = useGetEntriesQuery({
    userId: currentUserId,
    options: chatAIOptions,
  });
  return (
    <div className="container mx-auto ">
      <h2 className="mb-4 text-2xl font-bold text-gray-700">我的 AIs</h2>
      <ChatAIList data={myData} />
      <h2 className="mb-4 text-2xl font-bold text-gray-700">公共 AIs</h2>
      <ChatAIList data={data} />
    </div>
  );
};
export default AI;
