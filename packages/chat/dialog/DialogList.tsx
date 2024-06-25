import React from "react";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import { extractUserId } from "core/prefix";

import { DialogItem } from "./DialogItem";

export const DialogList = ({ dialogList }) => {
  const [searchParams] = useSearchParams();

  const auth = useAuth();

  const currentDialogId = searchParams.get("dialogId");
  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };
  return (
    <>
      {dialogList?.map((dialog) => (
        <DialogItem
          key={dialog.id}
          dialog={dialog}
          isSelected={currentDialogId === dialog.id}
          allowEdit={isCreator(dialog.id)}
        />
      ))}
    </>
  );
};
