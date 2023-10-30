import React, { useMemo } from 'react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { renderContentNode } from 'render';
import { unified } from 'unified';

const getColorClass = (role) => {
  if (role === 'user') {
    return 'text-blue-400'; // 使用 Tailwind 默认的较淡的蓝色
  }
  return 'text-gray-600'; // 使用 Tailwind 默认的较淡的灰色
};

export const MessageContent: React.FC<{ role: string, content: string }> = ({
  role,
  content,
}) => {
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast);
  }, [mdast]);
  //增加闪烁，如果网络卡了
  const colorClass = getColorClass(role);

  return (
    <div
      className={`py-2 px-4 rounded-lg mx-2 bg-gray-100 ${colorClass} whitespace-pre-wrap`}
    >
      {role === 'user' ? content : renderedContent}
    </div>
  );
};
