import React from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { Button } from "render/ui";

export const ChatBotBlock = ({ item }) => {
  const { isLoading, createDialog } = useCreateDialog();
  const createNewDialog = async () => {
    //todo handle click multi
    try {
      const cybotId = item.id;
      await createDialog({ cybots: [cybotId] });
    } catch (error) {
      // setError(error.data?.message || error.status);
    }
  };
  return (
    <div
      className="surface1  flex flex-col"
      style={{ padding: "var(--size-1)" }}
    >
      <div className="flex items-center justify-between pb-4">
        <div className="text-lg font-bold">{item.name}</div>
        <Button loading={isLoading} onClick={createNewDialog}>
          对话
        </Button>
      </div>
      <div>模型名 ：{item.model}</div>
      <div>介绍 ：{item.introduction}</div>
    </div>
  );
};
