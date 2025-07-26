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
  LuTable2, // --- (新增) 引入表格图标
} from "react-icons/lu";

const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const LIST_TYPE = "list";

// --- (新增) 表格插入逻辑 ---
const isTableActive = (editor: Editor) => {
  const [table] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "table",
  });
  return !!table;
};

const insertTable = (editor: Editor) => {
  if (isTableActive(editor)) return;

  // 创建一个包含空段落的单元格
  const createTableCell = (): SlateElement => ({
    type: "table-cell",
    children: [{ type: "paragraph", children: [{ text: "" }] }],
  });

  // 根据指定的列数创建一行
  const createTableRow = (cols: number): SlateElement => ({
    type: "table-row",
    children: Array.from({ length: cols }, createTableCell),
  });

  // 创建一个 2x2 的表格节点
  const tableNode: SlateElement = {
    type: "table",
    children: [createTableRow(2), createTableRow(2)],
  };

  Transforms.insertNodes(editor, tableNode);
  // 将光标移动到新创建的第一个单元格中
  const [tableEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table",
  });
  if (tableEntry) {
    Transforms.select(editor, Editor.start(editor, tableEntry[1]));
  }
};

// --- (新增) 表格按钮组件 ---
const TableButton: React.FC = () => {
  const editor = useSlate();
  const isDisabled = isTableActive(editor);

  return (
    <Button
      disabled={isDisabled}
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault();
        insertTable(editor);
      }}
    >
      <LuTable2 size={18} />
    </Button>
  );
};
// --- 结束新增部分 ---

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
      {/* --- (新增) 表格功能组 --- */}
      {divider}
      <div style={groupStyle}>
        <TableButton />
      </div>
    </Toolbar>
  );
};
