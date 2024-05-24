import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createDialog } from "chat/dialog/dialogSlice";
import { extractCustomId } from "core";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const displayId = extractCustomId(item.id);
  const createNewDialog = async () => {
    try {
      const llmId = item.id;
      const writeDialogAction = await dispatch(createDialog(llmId));
      console.log("writeDialogAction", writeDialogAction);
      const result = writeDialogAction.payload;
      navigate(`/chat?dialogId=${result.id}`);
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
        <div className="flex">
          <button onClick={createNewDialog} className="mr-2">
            对话
          </button>
          <button className="mr-2">编辑</button>
        </div>
      </div>

      <div>{/* <p>{omitName(item)}</p> */}</div>
    </div>
  );
};
