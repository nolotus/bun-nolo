// create/editor/EditorToolbar.tsx (已修复)

import React, { useState, useCallback } from "react";
import { useSlate, ReactEditor } from "slate-react"; // --- 修复: 导入 ReactEditor ---
import { Editor, Element as SlateElement, Transforms } from "slate"; // --- 修复: 导入 Transforms ---
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
  MdLink,
} from "react-icons/md";

import { Button, Menu } from "./components";
import { CodeBlockButton } from "./CodeBlockButton";
import { isMarkActive, toggleMark } from "./mark";
import { LinkCommands } from "./utils/linkCommands";
import { LinkModal } from "render/web/ui/LinkModal"; // 确认路径正确

// 常量定义 (保持不变)
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const LIST_TYPE = "list";

// 工具栏组件样式 (保持不变)
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
      display: "flex", // 使用 flex 布局以更好地控制分组和分割线
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8px",
      ...style,
    }}
  />
);

// 切换块级元素状态的函数 (保持不变)
const toggleBlock = (
  editor: Editor,
  format: string,
  ordered: boolean | undefined = undefined
) => {
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

  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: LIST_TYPE, ordered: ordered === true, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

// 检查块级元素是否激活 (保持不变)
const isBlockActive = (
  editor: Editor,
  format: string,
  blockType: string = "type"
) => {
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

// 块级元素按钮组件 (保持不变)
const BlockButton = ({
  format,
  Icon,
  ordered = undefined,
}: {
  format: string;
  Icon: any;
  ordered?: boolean;
}) => {
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

// 标记按钮组件 (保持不变)
const MarkButton = ({ format, Icon }: { format: string; Icon: any }) => {
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

// --- 新增: 链接按钮组件 (已修复) ---
const LinkButton = () => {
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
    LinkCommands.toggleLink(editor); // 不带url参数即为移除链接
    setModalOpen(false);
  };

  return (
    <>
      <Button
        active={isActive}
        onMouseDown={(event) => {
          event.preventDefault();
          // 如果编辑器没有焦点，先聚焦，确保有选区
          if (!ReactEditor.isFocused(editor)) {
            Transforms.focus(editor);
          }
          setModalOpen(true);
        }}
      >
        <MdLink size={18} />
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

// 编辑器工具栏主组件 (已优化布局)
export const EditorToolbar = () => {
  const groupStyle = {
    display: "flex",
    gap: "4px",
  };

  const divider = (
    <div style={{ borderLeft: "1px solid #ddd", height: "20px" }} />
  );

  return (
    <Toolbar>
      {/* 文本样式组 */}
      <div style={groupStyle}>
        <MarkButton format="bold" Icon={MdFormatBold} />
        <MarkButton format="italic" Icon={MdFormatItalic} />
        <MarkButton format="underline" Icon={MdFormatUnderlined} />
        <MarkButton format="code" Icon={MdCode} />
        <LinkButton />
      </div>

      {divider}

      {/* 标题和引用组 */}
      <div style={groupStyle}>
        <BlockButton format="heading-one" Icon={MdLooksOne} />
        <BlockButton format="heading-two" Icon={MdLooksTwo} />
        <BlockButton format="quote" Icon={MdFormatQuote} />
      </div>

      {divider}

      {/* 列表组 */}
      <div style={groupStyle}>
        <BlockButton format="list" ordered={true} Icon={MdFormatListNumbered} />
        <BlockButton
          format="list"
          ordered={false}
          Icon={MdFormatListBulleted}
        />
      </div>

      {divider}

      {/* 对齐组 */}
      <div style={groupStyle}>
        <BlockButton format="left" Icon={MdFormatAlignLeft} />
        <BlockButton format="center" Icon={MdFormatAlignCenter} />
        <BlockButton format="right" Icon={MdFormatAlignRight} />
        <BlockButton format="justify" Icon={MdFormatAlignJustify} />
      </div>

      {divider}

      {/* 代码块组 */}
      <div style={groupStyle}>
        <CodeBlockButton />
      </div>
    </Toolbar>
  );
};
