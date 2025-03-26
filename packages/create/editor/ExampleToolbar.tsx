import { Button, Menu } from "./components";

export const Toolbar = ({ className, style, ...props }) => (
  <Menu
    {...props}
    className={`editor-toolbar ${className || ""}`}
    style={{
      position: "relative",
      padding: "8px 12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      marginBottom: "16px",
      ...style,
    }}
  />
);

import { CodeBlockButton } from "./CodeBlockButton";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
} from "slate";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
  MdFormatQuote,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdLooksOne,
  MdLooksTwo,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
} from "react-icons/md";
import { isMarkActive, toggleMark } from "./mark";

const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const LIST_TYPE = "list";

const toggleBlock = (editor, format, ordered = undefined) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );

  const isList = format === LIST_TYPE;

  // 处理列表
  if (isList) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === LIST_TYPE,
      split: true,
    });

    const newProperties = {
      type: isActive ? "paragraph" : "list-item",
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive) {
      const block = {
        type: LIST_TYPE,
        ordered: ordered,
        children: [],
      };
      Transforms.wrapNodes(editor, block);
    }
    return;
  }

  // 处理其他块级元素
  if (TEXT_ALIGN_TYPES.includes(format)) {
    const newProperties = {
      align: isActive ? undefined : format,
    };
    Transforms.setNodes(editor, newProperties);
  } else {
    const newProperties = {
      type: isActive ? "paragraph" : format,
    };
    Transforms.setNodes(editor, newProperties);
  }
};

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const BlockButton = ({ format, Icon, ordered = undefined }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format, ordered);
      }}
    >
      <Icon size={18} />
    </Button>
  );
};

const MarkButton = ({ format, Icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon size={18} />
    </Button>
  );
};

export const ExampleToolbar = () => {
  // 样式常量
  const groupStyle = {
    display: "flex",
    gap: "4px",
    marginRight: "8px",
  };

  const dividerStyle = {
    borderLeft: "1px solid #ddd",
    paddingLeft: "8px",
  };

  return (
    <Toolbar>
      {/* 文本样式组 */}
      <div style={groupStyle}>
        <MarkButton format="bold" Icon={MdFormatBold} />
        <MarkButton format="italic" Icon={MdFormatItalic} />
        <MarkButton format="underline" Icon={MdFormatUnderlined} />
      </div>

      {/* 标题和引用组 */}
      <div style={{ ...groupStyle, ...dividerStyle }}>
        <BlockButton format="heading-one" Icon={MdLooksOne} />
        <BlockButton format="heading-two" Icon={MdLooksTwo} />
        <BlockButton format="quote" Icon={MdFormatQuote} />
      </div>

      {/* 列表组 */}
      <div style={{ ...groupStyle, ...dividerStyle }}>
        <BlockButton format="list" ordered={true} Icon={MdFormatListNumbered} />
        <BlockButton
          format="list"
          ordered={false}
          Icon={MdFormatListBulleted}
        />
      </div>

      {/* 对齐组 */}
      <div style={{ ...groupStyle, ...dividerStyle }}>
        <BlockButton format="left" Icon={MdFormatAlignLeft} />
        <BlockButton format="center" Icon={MdFormatAlignCenter} />
        <BlockButton format="right" Icon={MdFormatAlignRight} />
        <BlockButton format="justify" Icon={MdFormatAlignJustify} />
      </div>

      {/* 代码组 */}
      <div style={{ ...groupStyle, ...dividerStyle, marginRight: 0 }}>
        <CodeBlockButton />
        <MarkButton format="code" Icon={MdCode} />
      </div>
    </Toolbar>
  );
};
