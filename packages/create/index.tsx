import { nolotusId } from 'core/init';
import { useGetEntriesQuery } from 'database/services';
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
  const options = {
    isJSON: true,
    condition: {
      $eq: { is_template: true },
    },
    limit: 20,
  };

  const {
    data: templates,
    error,
    isLoading,
    isSuccess,
  } = useGetEntriesQuery({
    userId: nolotusId,
    options,
  });

  console.log('templates', templates);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">从公共模板创建</h2>
        <div className="flex flex-wrap space-x-4">
          {buttonsInfo.map(
            (
              button,
              index, // 添加 index 参数
            ) =>
              renderButton({
                key: index, // 添加 key 属性
                text: button.text,
                route: button.route,
                navigate,
                customStyles: button.customStyles,
              }),
          )}
          {renderButton({
            key: 'blank',
            text: '空白页面',
            route: 'page',
            navigate,
            customStyles: 'bg-blue-500 text-white',
          })}
          {isSuccess &&
            templates &&
            templates.map(
              (
                template,
                index, // 确保templates存在，添加 index 参数
              ) => (
                <div key={index}>
                  {/* 添加 div 和 key 属性 */}
                  {renderButton({
                    // renderButton 应直接调用，不能再次嵌套
                    text: template.title, // 假设template对象有name属性
                    route: `/create/page?id=${template.id}`, // 假设template对象有route属性
                    navigate,
                    customStyles: 'bg-blue-500 text-white',
                  })}
                </div>
              ),
            )}
        </div>
      </div>
      <YourTemplates />
    </div>
  );
};

export default Create;
