// create/editor/ElementWrapper.tsx
import React from "react";
import { useSlateStatic } from "slate-react";
import { useTheme } from "app/theme";
import CodeBlock from "render/elements/CodeBlock";
import { ImageElement } from "render/elements/ImageElement";
import { List, ListItem } from "render/elements/List";
import { SafeLink } from "render/elements/SafeLink";
import { Table, TableCell, TableRow } from "web/ui/Table";
import { Heading } from "render/elements/Heading"; // 导入标题组件
import { CodeBlockType, CodeLineType } from "./type";

export const ElementWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const theme = useTheme();

  const getStyle = (additionalStyle = {}) => ({
    ...(element.align ? { textAlign: element.align } : {}),
    ...additionalStyle,
  });

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

    case "quote":
      return (
        <blockquote
          {...attributes}
          style={getStyle({
            margin: `${theme.space[4]} 0`,
            padding: `${theme.space[2]} 0 ${theme.space[2]} ${theme.space[4]}`,
            borderLeft: `3px solid ${theme.primary}`,
            color: theme.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.6,
          })}
        >
          {children}
          {element.cite && (
            <div
              style={{
                marginTop: theme.space[2],
                textAlign: "right",
                fontStyle: "normal",
                fontSize: "0.9em",
                opacity: 0.7,
              }}
            >
              — {element.cite}
            </div>
          )}
        </blockquote>
      );

    case "paragraph":
      return (
        <p
          {...attributes}
          style={getStyle({
            margin: element.isNested
              ? `${theme.space[1]} 0`
              : `${theme.space[2]} 0`,
            lineHeight: 1.6,
            fontSize: "16px",
            color: theme.text,
          })}
        >
          {children}
        </p>
      );

    // 简化的标题处理
    case "heading-one":
      return (
        <Heading attributes={attributes} element={element} level={1}>
          {children}
        </Heading>
      );
    case "heading-two":
      return (
        <Heading attributes={attributes} element={element} level={2}>
          {children}
        </Heading>
      );
    case "heading-three":
      return (
        <Heading attributes={attributes} element={element} level={3}>
          {children}
        </Heading>
      );
    case "heading-four":
      return (
        <Heading attributes={attributes} element={element} level={4}>
          {children}
        </Heading>
      );
    case "heading-five":
      return (
        <Heading attributes={attributes} element={element} level={5}>
          {children}
        </Heading>
      );
    case "heading-six":
      return (
        <Heading attributes={attributes} element={element} level={6}>
          {children}
        </Heading>
      );

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

    case "thematic-break":
      return (
        <hr
          {...attributes}
          style={getStyle({
            margin: `${theme.space[5]} 0`,
            border: "none",
            height: "1px",
            backgroundColor: theme.border,
          })}
        />
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
