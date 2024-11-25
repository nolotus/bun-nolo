import { TextEdit } from "render/page/TextEdit";
import { renderContentNode } from "render";

export const RichEdit = ({ mdast, value, onKeyDown, onChange }) => {
  return (
    <>
      <div>{renderContentNode(mdast)}</div>
      <TextEdit onKeyDown={onKeyDown} value={value} onChange={onChange} />
    </>
  );
};
