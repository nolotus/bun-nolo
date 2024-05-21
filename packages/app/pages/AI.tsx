import React from "react";

import { nolotusId } from "core/init";
import ChatAIList from "ai/blocks/ChatAIList";
import { useAuth } from "auth/useAuth";

const AI = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="container mx-auto ">
      {isLoggedIn && (
        <>
          <h2 className="mb-4 text-2xl font-bold text-gray-700">我的 AIs</h2>
          <ChatAIList queryUserId={user?.userId} />
        </>
      )}

      <h2 className="mb-4 text-2xl font-bold text-gray-700">公共 AIs</h2>
      <ChatAIList queryUserId={nolotusId} />
    </div>
  );
};
export default AI;
