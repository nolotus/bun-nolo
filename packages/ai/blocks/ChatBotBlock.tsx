import React from "react";
import { useWriteMutation } from "database/services";
import { useNavigate } from "react-router-dom";
import { DataType } from "create/types";
import { noloWriteRequest } from "database/client/writeRequest";
import { useSelector } from "react-redux";

const OMIT_NAME_MAX_LENGTH = 60;

const omitName = (content) => {
  const { name, ...otherProps } = content;
  let jsonString = JSON.stringify(otherProps);
  if (jsonString.length > OMIT_NAME_MAX_LENGTH) {
    jsonString = jsonString.substr(0, OMIT_NAME_MAX_LENGTH) + "...";
  }
  return jsonString;
};
export const ChatBotBlock = (props) => {
  const navigate = useNavigate();
  const state = useSelector((state) => state);
  const { item } = props;
  const { value, key } = item;
  const [write, { isLoading: isWriteLoading }] = useWriteMutation();
  const createNewDialog = async () => {
    const initMessageList = await noloWriteRequest(state, [], { isList: true });
    try {
      // const result = await write(requestBody).unwrap();
      const res = await noloWriteRequest(
        state,
        {
          type: DataType.Dialog,
          llmId: key,
          messageListId: initMessageList.noloId,
        },
        { isJSON: true },
      );
      const result = await res.json();
      navigate(`/chat?chatId=${result.noloId}`);
    } catch (error) {
      // setError(error.data?.message || error.status);
    }
  };
  return (
    <div className="flex cursor-pointer flex-col bg-white  transition-colors duration-200 hover:bg-gray-100">
      <div className="flex items-center justify-between pb-4">
        <div className="text-lg font-bold">{value.name}</div>
      </div>
      <div className="flex">
        <button
          onClick={createNewDialog}
          className="mr-2 rounded bg-green-500 px-2 py-1 font-bold text-white hover:bg-green-700"
        >
          对话
        </button>
        <button className="mr-2 rounded bg-blue-500 px-2 py-1 font-bold text-white hover:bg-blue-700">
          编辑
        </button>
      </div>
      <div>
        <p>{omitName(value)}</p>
      </div>
    </div>
  );
};
