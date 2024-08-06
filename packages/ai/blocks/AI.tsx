import React from "react";

import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";
import { useAuth } from "auth/useAuth";

const AI = () => {
  const { isLoggedIn, user } = useAuth();
  return (
    <>
      {isLoggedIn && (
        <>
          <h3 className="mb-4  ">我的 AIs</h3>
          <Cybots queryUserId={user?.userId} />
        </>
      )}

      <h3 className="mb-4 ">公共 AIs</h3>
      <Cybots queryUserId={nolotusId} />
    </>
  );
};
export default AI;
