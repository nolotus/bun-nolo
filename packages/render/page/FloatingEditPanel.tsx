import { PencilIcon, TrashIcon } from "@primer/octicons-react";
import zIndex from "app/styles/z-index"; // 导入 zIndex

export const FloatingEditPanel = ({ onEdit, onDelete, isDeleting }) => {
  return (
    <div
      className="fixed right-4 top-1/2 flex -translate-y-1/2 transform flex-col items-center space-y-2"
      style={{ zIndex: zIndex.floatingEditPanel }} // 应用新的 zIndex
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex transform items-center rounded bg-blue-100 px-4 py-2 font-semibold text-blue-800 shadow transition duration-150 ease-in-out hover:bg-blue-200 hover:shadow-md"
        title="编辑页面"
      >
        <PencilIcon size={16} className="mr-2" />
        编辑
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className={`flex transform items-center rounded bg-red-100 px-4 py-2 font-semibold text-red-800 shadow transition duration-150 ease-in-out hover:bg-red-200 hover:shadow-md ${
          isDeleting ? "cursor-not-allowed opacity-50" : ""
        }`}
        title="删除页面"
      >
        <TrashIcon size={16} className="mr-2" />
        {isDeleting ? "删除中" : "删除"}
      </button>
    </div>
  );
};
