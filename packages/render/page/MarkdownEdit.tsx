import { TextEdit } from "./TextEdit";

export const MarkdownEdit = ({ value, onChange }) => {
  return <TextEdit value={value} onChange={onChange} />;
};
