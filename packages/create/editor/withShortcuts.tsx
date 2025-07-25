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

  // 标题 (已扩展至6级)
  "#": "heading-one",
  "##": "heading-two",
  "###": "heading-three",
  "####": "heading-four",
  "#####": "heading-five",
  "######": "heading-six",

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

interface HotkeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
}

const isHotkey = (hotkey: string, event: HotkeyEvent): boolean => {
  try {
    // 检查是否需要 mod (Ctrl/Cmd)
    const mod = hotkey.startsWith("mod+");
    const key = mod ? hotkey.slice(4) : hotkey;

    // 检查修饰键
    const hasModifier = event.ctrlKey || event.metaKey;

    // 如果热键需要修饰键，但用户没按，则不匹配
    if (mod && !hasModifier) return false;
    // 如果热键不需要修饰键，但用户按了，则不匹配 (避免误触发)
    if (!mod && hasModifier) return false;

    // 检查主键是否匹配
    return event.key.toLowerCase() === key.toLowerCase();
  } catch (error) {
    console.warn("Error checking hotkey:", error);
    return false;
  }
};

export const withShortcuts = (editor: Editor) => {
  const { deleteBackward, insertText, onKeyDown } = editor;

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

      // 注意：这里需要从长到短匹配，或者确保 SHORTCUTS 对象键的唯一性
      // 当前实现是精确匹配，所以顺序不影响
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
            }
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
          const newProperties: Partial<SlateElement> = { type: "paragraph" };
          // 转换回段落
          Transforms.setNodes(editor, newProperties);

          // 如果是列表项,需要解除列表包装
          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === "list", // 假设列表容器类型为 'list'
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
        return; // 匹配到一个后即可返回
      }
    }
    // 如果没有匹配到自定义热键，则调用原始的 onKeyDown
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return editor;
};
