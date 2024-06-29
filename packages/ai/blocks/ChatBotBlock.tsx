import React from "react";
import { extractCustomId } from "core";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { Button } from "render/ui";

const OMIT_NAME_MAX_LENGTH = 60;

const omitName = (content) => {
  const { name, ...otherProps } = content;
  let jsonString = JSON.stringify(otherProps);
  if (jsonString.length > OMIT_NAME_MAX_LENGTH) {
    jsonString = jsonString.substr(0, OMIT_NAME_MAX_LENGTH) + "...";
  }
  return jsonString;
};
export const ChatBotBlock = ({ item }) => {
  const { isLoading, createDialog } = useCreateDialog();
  const displayId = extractCustomId(item.id);
  const createNewDialog = async () => {
    //todo handle click multi
    try {
      const llmId = item.id;
      await createDialog(llmId);
    } catch (error) {
      console.log("errror", error);
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
      <div>使用模型 ：{item.model}</div>
      <div>{/* <p>{omitName(item)}</p> */}</div>
    </div>
  );
};
