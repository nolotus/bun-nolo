import React from "react";
import { Link } from "react-router-dom";
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
  const { item } = props;
  const { value, key } = item;

  return (
    <div className="flex cursor-pointer flex-col bg-white  transition-colors duration-200 hover:bg-gray-100">
      <div className="flex items-center justify-between pb-4">
        <div className="text-lg font-bold">{value.name}</div>
      </div>
      <div className="flex">
        <Link to={`/chat?chatId=${key}`}>
          <button className="mr-2 rounded bg-green-500 px-2 py-1 font-bold text-white hover:bg-green-700">
            对话
          </button>
        </Link>
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
