import { PencilIcon, TrashIcon, ThumbsupIcon } from "@primer/octicons-react";

export const ButtonGroup = ({ onEdit, onDelete, isDeleting, allowEdit }) => {
  return (
    <div className="right-4 flex transform items-center space-x-2">
      <button
        type="button"
        onClick={onEdit}
        className="flex transform items-center rounded bg-blue-100 px-4 py-2 font-semibold text-blue-800 shadow transition duration-150 ease-in-out hover:bg-blue-200 hover:shadow-md"
        title="编辑页面"
      >
        <PencilIcon size={16} className="mr-2" />
        收藏
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex transform items-center rounded bg-blue-100 px-4 py-2 font-semibold text-blue-800 shadow transition duration-150 ease-in-out hover:bg-blue-200 hover:shadow-md"
        title="编辑页面"
      >
        <ThumbsupIcon size={16} className="mr-2" />
        点赞
      </button>
      {allowEdit && (
        <>
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
        </>
      )}
    </div>
  );
};
