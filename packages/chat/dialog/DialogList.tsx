import React from "react";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import { extractUserId } from "core/prefix";
import OpenProps from "open-props";

import { DialogGroup } from "./DialogGroup";

export const DialogList = ({ dialogList, source }) => {
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  const currentDialogId = searchParams.get("dialogId");

  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };
  //todo handle cybots
  const dialogGroups = dialogList.reduce((acc, dialog) => {
    const groupKey =
      dialog.cybots && Array.isArray(dialog.cybots)
        ? dialog.cybots.sort().join(",") // 使用排序后的 cybots 数组作为 key
        : dialog.llmId; // 如果没有 cybots 或不是数组，则使用 llmId

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(dialog);
    return acc;
  }, {});

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: OpenProps.size2 }}
    >
      {Object.entries(dialogGroups).map(([groupKey, dialogs]) => (
        <DialogGroup
          key={groupKey}
          cybotId={groupKey} // 这里可能需要根据实际情况调整
          dialogs={dialogs}
          currentDialogId={currentDialogId}
          isCreator={isCreator}
          source={source}
        />
      ))}
    </div>
  );
};
