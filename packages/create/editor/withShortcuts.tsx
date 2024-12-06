// withShortcuts.ts
import {
  Editor,
  Element as SlateElement,
  Range,
  Point,
  Transforms,
} from "slate";
import { toggleMark } from "./mark";

export const SHORTCUTS = {
  // 列表
  "*": { type: "list-item", wrapper: "list", ordered: false },
  "-": { type: "list-item", wrapper: "list", ordered: false },
  "+": { type: "list-item", wrapper: "list", ordered: false },
  "1.": { type: "list-item", wrapper: "list", ordered: true },

  // 待办列表
  "[]": { type: "list-item", wrapper: "list", ordered: false, checked: false },
  "[x]": { type: "list-item", wrapper: "list", ordered: false, checked: true },

  // 标题
  "#": "heading-one",
  "##": "heading-two",
  "###": "heading-three",

  // 引用和代码
  ">": "block-quote",
  "```": "code-block",

  // 分割线
  "---": "divider",
};

// 热键映射
const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

export const withShortcuts = (editor: Editor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text: string) => {
    const { selection } = editor;

    if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (!block) {
        insertText(text);
        return;
      }

      const path = block[1];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const shortcut = SHORTCUTS[beforeText];

      if (shortcut) {
        Transforms.select(editor, range);
        Transforms.delete(editor);

        // 处理不同类型的快捷方式
        if (typeof shortcut === "string") {
          // 简单块级元素转换
          Transforms.setNodes(editor, { type: shortcut });
        } else {
          // 处理需要包装的列表项
          const { type, wrapper, ordered, checked } = shortcut;

          // 设置节点类型
          Transforms.setNodes(editor, {
            type,
            ...(checked !== undefined ? { checked } : {}),
          });

          // 包装在列表容器中
          Transforms.wrapNodes(
            editor,
            {
              type: wrapper,
              ordered: !!ordered,
              children: [],
            },
            {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === type,
            },
          );
        }
        return;
      }
    }
    insertText(text);
  };

  // 处理退格键 - 转换回普通段落
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== "paragraph" &&
          Point.equals(selection.anchor, start)
        ) {
          // 转换回段落
          Transforms.setNodes(editor, { type: "paragraph" });

          // 如果是列表项,需要解除列表包装
          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === "list",
              split: true,
            });
          }
          return;
        }
      }
    }
    deleteBackward(...args);
  };

  // 处理快捷键
  editor.onKeyDown = (event: KeyboardEvent) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }
  };

  return editor;
};

interface HotkeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
}

const isHotkey = (hotkey): boolean => {
  try {
    const mod = hotkey.startsWith("mod+");
    const key = mod ? hotkey.slice(4) : hotkey;

    // 检查修饰键
    const hasModifier = event.ctrlKey || event.metaKey;

    // 只有当需要修饰键时才检查修饰键
    if (mod && !hasModifier) return false;
    if (!mod && hasModifier) return false;

    // 检查主键
    return event.key.toLowerCase() === key.toLowerCase();
  } catch (error) {
    console.warn("Error checking hotkey:", error);
    return false;
  }
};
