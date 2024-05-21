import React from "react";
import { useNavigate } from "react-router-dom";
import { DataType } from "create/types";
import { useDispatch, useSelector } from "react-redux";
import { write } from "database/dbSlice";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

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
  const dispatch = useDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { item } = props;
  const { name, id } = item;
  const createNewDialog = async () => {
    // const initMessageList = await noloWriteRequest(state, [], { isList: true });
    const messageListConfig = {
      data: [],
      flags: { isList: true },
      userId: currentUserId,
    };
    dispatch(write(messageListConfig)).then((action) => {
      const initMessageList = action.payload;
      const dialogConfig = {
        data: {
          type: DataType.Dialog,
          llmId: id,
          messageListId: initMessageList.noloId,
        },
        flags: { isJSON: true },
        userId: currentUserId,
      };
      dispatch(write(dialogConfig)).then(async (action) => {
        const result = action.payload;
        navigate(`/chat?dialogId=${result.noloId}`);
      });
    });
    // console.log("initMessageList", initMessageList);
    return;
    try {
      // const result = await write(requestBody).unwrap();
    } catch (error) {
      // setError(error.data?.message || error.status);
    }
  };
  return (
    <div className="flex cursor-pointer flex-col bg-white  transition-colors duration-200 hover:bg-gray-100">
      <div className="flex items-center justify-between pb-4">
        <div className="text-lg font-bold">{item.name}</div>
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
        <p>{omitName(item)}</p>
      </div>
    </div>
  );
};
