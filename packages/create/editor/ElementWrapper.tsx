// create/editor/ElementWrapper.tsx
import React from "react";
import { useSlateStatic } from "slate-react";
import { useTheme } from "app/theme";
import CodeBlock from "render/elements/CodeBlock";
import { ImageElement } from "render/elements/ImageElement";
import { List, ListItem } from "render/elements/List";
import { SafeLink } from "render/elements/SafeLink";
import { Table, TableCell, TableRow } from "web/ui/Table";
import { TextBlockRenderer } from "render/web/elements/TextBlockRenderer";
import { CodeBlockType, CodeLineType } from "./types";

// 定义所有由 TextBlockRenderer 处理的元素类型
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

export const ElementWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const theme = useTheme();

  const getStyle = (additionalStyle = {}) => ({
    ...(element.align ? { textAlign: element.align } : {}),
    ...additionalStyle,
  });

  // 统一处理所有文本块
  if (TEXT_BLOCK_TYPES.includes(element.type)) {
    return (
      <TextBlockRenderer attributes={attributes} element={element}>
        {children}
      </TextBlockRenderer>
    );
  }

  if (element.type === CodeBlockType) {
    return (
      <CodeBlock
        attributes={attributes}
        element={element}
        children={children}
      />
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
            backgroundColor: theme.backgroundSecondary,
            color: theme.primary,
            padding: `${theme.space[1]} ${theme.space[2]}`,
            borderRadius: theme.space[1],
            fontFamily: "JetBrains Mono, Consolas, monospace",
            fontSize: "0.85em",
            border: `1px solid ${theme.border}`,
            wordBreak: "break-word",
            lineHeight: 1.3,
            fontWeight: 500,
          })}
        >
          {children}
        </code>
      );

    // 段落、标题、引用、分割线已移至 TextBlockRenderer

    case "link":
      return (
        <SafeLink
          href={element.url}
          {...attributes}
          style={getStyle({
            color: theme.primary,
            textDecoration: "underline",
            textDecorationColor: `${theme.primary}80`,
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
            margin: `${theme.space[4]} 0`,
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

    case "table":
      return (
        <Table
          attributes={attributes}
          style={getStyle({ margin: `${theme.space[4]} 0` })}
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
      return (
        <TableCell
          attributes={attributes}
          element={element}
          style={getStyle({
            padding: `${theme.space[2]} ${theme.space[3]}`,
            lineHeight: 1.4,
          })}
        >
          {children}
        </TableCell>
      );

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
          style={getStyle({ margin: `${theme.space[3]} 0` })}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    default:
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag
          {...attributes}
          style={getStyle({
            ...(editor.isInline(element)
              ? {}
              : { margin: `${theme.space[2]} 0` }),
          })}
        >
          {children}
        </Tag>
      );
  }
};
