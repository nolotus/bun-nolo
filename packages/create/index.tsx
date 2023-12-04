import React from 'react';
import { useNavigate } from 'react-router-dom';

import { renderButton } from './blocks/renderButton'; // 确保路径是正确的
import { YourTemplates } from './blocks/YourTemplates';
const buttonsInfo = [
  {
    text: '聊天机器人',
    route: 'chat-robot',
    customStyles: 'bg-green-500 text-white hover:bg-green-600',
  },
];

const Create = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">从公共模板创建</h2>
        <div className="flex flex-wrap space-x-4">
          {buttonsInfo.map((button) =>
            renderButton({
              text: button.text,
              route: button.route,
              navigate,
              customStyles: button.customStyles,
            }),
          )}
          {renderButton({
            text: '空白页面',
            route: 'page',
            navigate,
            customStyles: 'bg-blue-500 text-white',
          })}
        </div>
      </div>
      <YourTemplates />
    </div>
  );
};

export default Create;
