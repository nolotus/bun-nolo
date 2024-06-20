import {
  PencilIcon,
  TrashIcon,
  ThumbsupIcon,
  HeartIcon,
} from "@primer/octicons-react";
import Sizes from "open-props/src/sizes";

export const ButtonGroup = ({ onEdit, onDelete, isDeleting, allowEdit }) => {
  return (
    <div style={{ gap: Sizes["--size-3"], display: "flex" }}>
      <button type="button" onClick={onEdit} title="编辑页面">
        <HeartIcon size={16} />
      </button>
      <button type="button" onClick={onEdit} title="编辑页面">
        <ThumbsupIcon size={16} />
      </button>
      {allowEdit && (
        <>
          <button type="button" onClick={onEdit} title="编辑页面">
            <PencilIcon size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className={`${isDeleting ? "cursor-not-allowed opacity-50" : ""}`}
            title="删除页面"
          >
            <TrashIcon size={16} />
            {isDeleting && "删除中"}
          </button>
        </>
      )}
    </div>
  );
};
