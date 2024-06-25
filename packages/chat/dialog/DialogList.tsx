import React from "react";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import { extractUserId } from "core/prefix";
import { DialogGroup } from "./DialogGroup";

export const DialogList = ({ dialogList, source }) => {
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  const currentDialogId = searchParams.get("dialogId");

  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };

  const dialogGroups = dialogList.reduce((acc, dialog) => {
    const llmId = dialog.llmId;
    if (!acc[llmId]) {
      acc[llmId] = [];
    }
    acc[llmId].push(dialog);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(dialogGroups).map(([llmId, dialogs]) => (
        <DialogGroup
          key={llmId}
          llmId={llmId}
          dialogs={dialogs}
          currentDialogId={currentDialogId}
          isCreator={isCreator}
          source={source} // 传递source
        />
      ))}
    </>
  );
};
