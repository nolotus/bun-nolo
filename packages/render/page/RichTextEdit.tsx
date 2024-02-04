import { useAppSelector } from "app/hooks";

import { TextEdit } from "./TextEdit";
import { renderContentNode } from "render";

export const RichTextEdit = ({ onKeyDown, value, onChange }) => {
  const pageState = useAppSelector((state) => state.page);

  const mdastFromSlice = pageState.mdast;

  return (
    <div className="flex w-full flex-col p-4">
      <div className=" w-full flex-shrink-0">
        <div>{renderContentNode(mdastFromSlice)}</div>
      </div>
      <TextEdit onKeyDown={onKeyDown} value={value} onChange={onChange} />
    </div>
  );
};
