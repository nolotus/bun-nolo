// create/editor/EditorToolbar.tsx

import React, { useState, useCallback } from "react";
import { useSlate, ReactEditor } from "slate-react";
import { Editor, Element as SlateElement, Transforms } from "slate";

import { Button, Menu } from "./components";
import { CodeBlockButton } from "./CodeBlockButton";
import { isMarkActive, toggleMark } from "./mark";
import { LinkCommands } from "./utils/linkCommands";
import { LinkModal } from "render/web/ui/LinkModal";

// 从 react-icons/lu 引入 Lucide 图标
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuCode,
  LuQuote,
  LuHeading1,
  LuHeading2,
  LuListOrdered,
  LuList,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuLink,
} from "react-icons/lu";

const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const LIST_TYPE = "list";

// 工具栏容器
export const Toolbar: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "", style = {}, ...props }) => (
  <Menu
    {...props}
    className={`editor-toolbar ${className}`}
    style={{
      position: "relative",
      padding: "var(--space-2) var(--space-3)",
      backgroundColor: "var(--backgroundSecondary)",
      borderRadius: "var(--space-1)",
      boxShadow: "0 1px 3px var(--shadowMedium)",
      marginBottom: "var(--space-4)",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-2)",
      ...style,
    }}
  />
);

const toggleBlock = (editor: Editor, format: string, ordered?: boolean) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = format === LIST_TYPE;

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === LIST_TYPE &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  const newProps: Partial<SlateElement> = TEXT_ALIGN_TYPES.includes(format)
    ? { align: isActive ? undefined : format }
    : { type: isActive ? "paragraph" : isList ? "list-item" : format };

  Transforms.setNodes<SlateElement>(editor, newProps);

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {
      type: LIST_TYPE,
      ordered: ordered === true,
      children: [],
    });
  }
};

const isBlockActive = (
  editor: Editor,
  format: string,
  blockType: "type" | "align" = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType] === format,
    })
  );
  return !!match;
};

const BlockButton: React.FC<{
  format: string;
  Icon: React.ElementType;
  ordered?: boolean;
}> = ({ format, Icon, ordered }) => {
  const editor = useSlate();
  const active = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  return (
    <Button
      active={active}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format, ordered);
      }}
    >
      <Icon size={18} />
    </Button>
  );
};

const MarkButton: React.FC<{ format: string; Icon: React.ElementType }> = ({
  format,
  Icon,
}) => {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <Button
      active={active}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon size={18} />
    </Button>
  );
};

const LinkButton: React.FC = () => {
  const editor = useSlate();
  const [isModalOpen, setModalOpen] = useState(false);
  const isActive = LinkCommands.isLinkActive(editor);

  const getActiveLinkUrl = useCallback(() => {
    if (!isActive) return "";
    const [link] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
    return link ? (link[0] as any).url : "";
  }, [editor, isActive]);

  const handleConfirm = (url: string) => {
    LinkCommands.toggleLink(editor, url);
    setModalOpen(false);
  };
  const handleRemove = () => {
    LinkCommands.toggleLink(editor);
    setModalOpen(false);
  };

  return (
    <>
      <Button
        active={isActive}
        onMouseDown={(e) => {
          e.preventDefault();
          if (!ReactEditor.isFocused(editor)) {
            ReactEditor.focus(editor);
          }
          setModalOpen(true);
        }}
      >
        <LuLink size={18} />
      </Button>
      {isModalOpen && (
        <LinkModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          onRemove={handleRemove}
          initialUrl={getActiveLinkUrl()}
        />
      )}
    </>
  );
};

export const EditorToolbar: React.FC = () => {
  const groupStyle: React.CSSProperties = {
    display: "flex",
    gap: "var(--space-1)",
  };

  const divider = (
    <div
      style={{
        borderLeft: "1px solid var(--border)",
        height: "var(--space-5)",
      }}
    />
  );

  return (
    <Toolbar>
      {/* 文本样式组 */}
      <div style={groupStyle}>
        <MarkButton format="bold" Icon={LuBold} />
        <MarkButton format="italic" Icon={LuItalic} />
        <MarkButton format="underline" Icon={LuUnderline} />
        <MarkButton format="code" Icon={LuCode} />
        <LinkButton />
      </div>
      {divider}
      {/* 标题/引用组 */}
      <div style={groupStyle}>
        <BlockButton format="heading-one" Icon={LuHeading1} />
        <BlockButton format="heading-two" Icon={LuHeading2} />
        <BlockButton format="quote" Icon={LuQuote} />
      </div>
      {divider}
      {/* 列表组 */}
      <div style={groupStyle}>
        <BlockButton format="list" ordered={true} Icon={LuListOrdered} />
        <BlockButton format="list" ordered={false} Icon={LuList} />
      </div>
      {divider}
      {/* 对齐组 */}
      <div style={groupStyle}>
        <BlockButton format="left" Icon={LuAlignLeft} />
        <BlockButton format="center" Icon={LuAlignCenter} />
        <BlockButton format="right" Icon={LuAlignRight} />
        <BlockButton format="justify" Icon={LuAlignJustify} />
      </div>
      {divider}
      {/* 代码块组 */}
      <div style={groupStyle}>
        <CodeBlockButton />
      </div>
    </Toolbar>
  );
};
