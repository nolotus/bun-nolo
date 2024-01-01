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
	return (
		<div
			className={clsx(
				baseCard, // 使用导入的基础卡片样式
				"rounded-lg overflow-hidden",
				"hover:shadow-lg hover:-translate-y-1", // 一致性hover动态效果
				"space-y-4", // 给予元素之间更多垂直空间
				"bg-white", // 白色背景
				"text-gray-700", // 淡灰色系字体，优雅易读
				"transition-all duration-300", // 平滑变换效果
			)}
		>
			<div className="p-6">
				<h3 className="font-semibold text-xl text-gray-900 mb-2">
					<Link to={`/${dataId}`} className="hover:underline">
						{title}
					</Link>
				</h3>
				<p className="text-gray-600 text-sm leading-relaxed truncate">
					{content}
				</p>
			</div>
			<div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
				<Link
					to={`/${dataId}`}
					className="text-blue-500 hover:text-blue-600 transition-colors duration-300"
					aria-label="查看更多"
				>
					<EyeIcon size={16} />
				</Link>
				<Link
					to={`/${dataId}?edit=true`}
					className="text-blue-500 hover:text-blue-600 transition-colors duration-300"
					aria-label="编辑"
				>
					<PencilIcon size={16} />
				</Link>
			</div>
		</div>
	);
};

export default NoteItem;
