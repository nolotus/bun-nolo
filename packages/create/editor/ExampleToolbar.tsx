import { Toolbar, Button } from "./components";
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
  return (
    <Toolbar>
      <CodeBlockButton />
      <MarkButton format="bold" Icon={MdFormatBold} />
      <MarkButton format="italic" Icon={MdFormatItalic} />
      <MarkButton format="underline" Icon={MdFormatUnderlined} />
      <MarkButton format="code" Icon={MdCode} />
      <BlockButton format="heading-one" Icon={MdLooksOne} />
      <BlockButton format="heading-two" Icon={MdLooksTwo} />
      <BlockButton format="quote" Icon={MdFormatQuote} />
      <BlockButton format="list" ordered={true} Icon={MdFormatListNumbered} />
      <BlockButton format="list" ordered={false} Icon={MdFormatListBulleted} />
      <BlockButton format="left" Icon={MdFormatAlignLeft} />
      <BlockButton format="center" Icon={MdFormatAlignCenter} />
      <BlockButton format="right" Icon={MdFormatAlignRight} />
      <BlockButton format="justify" Icon={MdFormatAlignJustify} />
    </Toolbar>
  );
};
