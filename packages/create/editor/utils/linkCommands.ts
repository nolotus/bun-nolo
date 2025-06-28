// utils/editor/linkCommands.ts
import { Editor, Transforms, Element, Range } from "slate";
import { LinkElement } from "../types"; // 假设你的类型定义在 a/types.ts

// 检查当前选区是否已存在链接
const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
  });
  return !!link;
};

// 移除链接（将 link 元素扁平化为纯文本）
const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
  });
};

// 包裹链接
const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

// 主入口函数，用于切换链接状态
export const toggleLink = (editor: Editor, url?: string) => {
  if (!url) {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    }
    return;
  }

  // 如果有选区，则直接包裹
  const { selection } = editor;
  if (!selection) return;

  wrapLink(editor, url);
};

export const LinkCommands = {
  isLinkActive,
  toggleLink,
};
