import React from "react";
import { Link } from "react-router-dom";
import { PencilIcon, EyeIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { baseCard } from "render/styles";

interface NoteItemProps {
  dataId: string;
  content: {
    title: string;
    content: string;
  };
  source?: any; // 根据实际情况替换类型
}

const NoteItem: React.FC<NoteItemProps> = ({
  dataId,
  content: { title, content },
}) => {
  // 限制内容显示长度
  const displayContent =
    content.length > 100 ? content.substring(0, 100) + "..." : content;

  return (
    <div
      className={clsx(
        baseCard, // 使用导入的基础卡片样式
        "overflow-hidden rounded",
        "bg-white",
        "text-gray-700",
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="mr-4 text-xl font-semibold text-gray-900">
          <Link to={`/${dataId}`} className="flex items-center hover:underline">
            {title}
          </Link>
        </h3>
        <div className="flex items-center">
          <Link
            to={`/${dataId}`}
            className="mr-4 flex items-center text-blue-500 transition-colors duration-300 hover:text-blue-600"
            aria-label="查看更多"
          >
            <EyeIcon size={16} className="mr-1" />
            查看
          </Link>
          <Link
            to={`/${dataId}?edit=true`}
            className="flex items-center text-blue-500 transition-colors duration-300 hover:text-blue-600"
            aria-label="编辑"
          >
            <PencilIcon size={16} className="mr-1" />
            编辑
          </Link>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-relaxed text-gray-600">
          {displayContent}
        </p>
      </div>
    </div>
  );
};

export default NoteItem;
