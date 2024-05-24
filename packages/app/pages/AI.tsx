import React from "react";

import ChatAIList from "ai/blocks/ChatAIList";
import { useAuth } from "auth/useAuth";

const AI = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="container mx-auto ">
      {isLoggedIn && (
        <>
          <h2 className="mb-4">我的 AIs</h2>
          <ChatAIList queryUserId={user?.userId} />
        </>
      )}
    </div>
  );
};
export default AI;
