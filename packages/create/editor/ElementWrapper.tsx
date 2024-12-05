import React from "react";
import { useSlateStatic } from "slate-react";
import { CodeBlockType, CodeLineType } from "./type";
import { Table, TableRow, TableCell } from "render/elements/Table";
import { List, ListItem } from "render/elements/List";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { SafeLink } from "render/elements/SafeLink";
import { ImageElement } from "render/elements/ImageElement";
import { CodeBlock } from "render/elements/CodeBlock";

export const ElementWrapper = (props) => {
  const { attributes, children, element, isDarkMode } = props;
  const editor = useSlateStatic();
  const theme = useAppSelector(selectTheme);
  // 处理代码块
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
      <div {...attributes} style={{ position: "relative" }}>
        {children}
      </div>
    );
  }

  // 处理其他元素类型
  switch (element.type) {
    case "paragraph":
      return <p {...attributes}>{children}</p>;
    case "heading-1":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-2":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-3":
      return <h3 {...attributes}>{children}</h3>;
    case "quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "link":
      return (
        <SafeLink href={element.url} {...attributes}>
          {children}
        </SafeLink>
      );
    case "image":
      return <ImageElement {...props} />;
    case "list":
      return (
        <List attributes={attributes} element={element} theme={theme}>
          {children}
        </List>
      );
    case "list-item":
      return (
        <ListItem attributes={attributes} element={element} theme={theme}>
          {children}
        </ListItem>
      );
    case "table":
      return (
        <Table attributes={attributes} theme={theme}>
          {children}
        </Table>
      );
    case "table-row":
      return (
        <TableRow attributes={attributes} theme={theme}>
          {children}
        </TableRow>
      );
    case "table-cell":
      return (
        <TableCell attributes={attributes} element={element} theme={theme}>
          {children}
        </TableCell>
      );
    case "thematic-break":
      return <hr {...attributes} />;
    case "html-block":
    case "html-inline":
      return (
        <div
          {...attributes}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );
    default:
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag {...attributes} style={{ position: "relative" }}>
          {children}
        </Tag>
      );
  }
};
