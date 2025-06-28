// create/editor/withLinks.ts
import { Editor, Element, Range, Transforms } from "slate";

export const withLinks = (editor: Editor) => {
  const { isInline } = editor;

  // 扩展现有的 isInline 方法，而不是覆盖它
  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };

  return editor;
};
