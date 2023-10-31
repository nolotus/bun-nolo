import React from 'react';
import { useNavigate } from 'react-router-dom';

import { renderButton } from './blocks/renderButton'; // 确保路径是正确的
import { YourTemplates } from './blocks/YourTemplates';
const buttonsInfo = [
  {
    text: '文章',
    route: 'artcile',
    customStyles: 'bg-red-500 text-white hover:bg-red-600',
  },
  {
    text: '预定',
    route: 'booking',
    customStyles: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  {
    text: '聊天机器人',
    route: 'chatrobot',
    customStyles: 'bg-green-500 text-white hover:bg-green-600',
  },
  {
    text: '位置',
    route: 'location',
    customStyles: 'bg-purple-500 text-white hover:bg-purple-600',
  },
  {
    text: '俱乐部',
    route: 'club',
    customStyles: 'bg-indigo-500 text-white hover:bg-indigo-600',
  },
  {
    text: '旅居点',
    route: 'nomadspot',
    customStyles: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  {
    text: '期限物品',
    route: 'nomadspot',
    customStyles: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  {
    text: '记账',
    route: 'nomadspot',
    customStyles: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  {
    text: '任务',
    route: 'nomadspot',
    customStyles: 'bg-teal-500 text-white hover:bg-teal-600',
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
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">创建原始类型</h2>
        <div className="flex flex-wrap space-x-4">
          {renderButton({
            text: '类型',
            route: 'type',
            navigate,
            customStyles: 'bg-blue-500 text-white',
          })}
          {renderButton({
            text: '页面',
            route: 'page',
            navigate,
            customStyles: 'bg-blue-500 text-white',
          })}
          {renderButton({
            text: '图片上传',
            route: '/upload',
            navigate,
            customStyles: 'bg-green-500 text-white',
          })}
        </div>
      </div>
      <YourTemplates />
    </div>
  );
};

export default Create;
