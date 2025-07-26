import React from "react";
import { useSlateStatic, ReactEditor } from "slate-react"; // <--- 引入 ReactEditor

// 您的类型定义导入
import { CodeBlockType, CodeLineType } from "./types";

// 您的 UI 组件导入
import { Table, TableRow, TableCell } from "render/web/ui/Table";

import CodeBlock from "render/web/elements/CodeBlock";
import { ImageElement } from "render/web/elements/ImageElement";
import { List, ListItem } from "render/web/elements/List";
import {
  SafeLink,
  TextBlockRenderer,
} from "render/web/elements/TextBlockRenderer";

const TEXT_BLOCK_TYPES = [
  "paragraph",
  "heading-one",
  "heading-two",
  "heading-three",
  "heading-four",
  "heading-five",
  "heading-six",
  "quote",
  "thematic-break",
];

export const ElementWrapper: React.FC<any> = (props) => {
  // 核心修正：不再从 props 解构 path，因为它不存在
  const { attributes, children, element } = props;
  const editor = useSlateStatic();

  const getStyle = (additionalStyle: React.CSSProperties = {}) => ({
    ...(element.align ? { textAlign: element.align } : {}),
    ...additionalStyle,
  });

  if (TEXT_BLOCK_TYPES.includes(element.type)) {
    return (
      <TextBlockRenderer attributes={attributes} element={element}>
        {children}
      </TextBlockRenderer>
    );
  }

  if (element.type === CodeBlockType) {
    return (
      <CodeBlock attributes={attributes} element={element}>
        {children}
      </CodeBlock>
    );
  }

  if (element.type === CodeLineType) {
    return (
      <div {...attributes} style={getStyle()}>
        {children}
      </div>
    );
  }

  switch (element.type) {
    case "code-inline":
      return (
        <code
          {...attributes}
          style={getStyle({
            backgroundColor: "var(--backgroundSecondary)",
            color: "var(--primary)",
            padding: "var(--space-1) var(--space-2)",
            borderRadius: "var(--space-1)",
            fontFamily: "JetBrains Mono, Consolas, monospace",
            fontSize: "0.85em",
            border: "1px solid var(--border)",
            wordBreak: "break-word",
            lineHeight: 1.3,
            fontWeight: 500,
          })}
        >
          {children}
        </code>
      );

    case "link":
      return (
        <SafeLink
          href={element.url}
          {...attributes}
          style={getStyle({
            color: "var(--primary)",
            textDecoration: "underline",
            textDecorationColor: "var(--primary)",
            textUnderlineOffset: "1px",
          })}
        >
          {children}
        </SafeLink>
      );

    case "image":
      return (
        <ImageElement
          {...props}
          style={getStyle({
            margin: "var(--space-4) 0",
          })}
        />
      );

    case "list":
      return (
        <List attributes={attributes} element={element}>
          {children}
        </List>
      );

    case "list-item":
      return (
        <ListItem attributes={attributes} element={element}>
          {children}
        </ListItem>
      );

    // --- vvvv 以下是核心修正 vvvv ---
    case "table":
      // 核心修正：在这里按需查找 path
      const tablePath = ReactEditor.findPath(editor, element);
      return (
        <Table
          {...props}
          path={tablePath} // 传递查找到的 path
          style={getStyle({ margin: "var(--space-4) 0" })}
        >
          {children}
        </Table>
      );

    case "table-row":
      return (
        <TableRow attributes={attributes} style={getStyle()}>
          {children}
        </TableRow>
      );

    case "table-cell":
      // 核心修正：在这里按需查找 path
      const cellPath = ReactEditor.findPath(editor, element);
      const isFirstRow = cellPath[cellPath.length - 2] === 0;
      return (
        <TableCell
          {...props}
          path={cellPath} // 传递查找到的 path
          isFirstRow={isFirstRow} // 传递计算出的 isFirstRow
          style={getStyle({
            padding: "var(--space-2) var(--space-3)",
            lineHeight: 1.4,
          })}
        >
          {children}
        </TableCell>
      );
    // --- ^^^^ 以上是核心修正 ^^^^ ---

    case "html-inline":
      return (
        <span
          {...attributes}
          style={getStyle()}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    case "html-block":
      return (
        <div
          {...attributes}
          style={getStyle({ margin: "var(--space-3) 0" })}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    default:
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag
          {...attributes}
          style={getStyle({
            ...(editor.isInline(element) ? {} : { margin: "var(--space-2) 0" }),
          })}
        >
          {children}
        </Tag>
      );
  }
};
