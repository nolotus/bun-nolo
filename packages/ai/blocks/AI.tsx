import React from "react";

import { nolotusId } from "core/init";
import ChatAIList from "ai/blocks/ChatAIList";
import { useAuth } from "auth/useAuth";

const AI = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      {isLoggedIn && (
        <>
          <h3 className="mb-4  ">我的 AIs</h3>
          <ChatAIList queryUserId={user?.userId} />
        </>
      )}

      <h3 className="mb-4 ">公共 AIs</h3>
      <ChatAIList queryUserId={nolotusId} />
    </>
  );
};
export default AI;
