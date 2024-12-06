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
  const style = { textAlign: element.align }; // 添加基础样式对象

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
      <div {...attributes} style={{ position: "relative", ...style }}>
        {children}
      </div>
    );
  }

  // 处理其他元素类型
  switch (element.type) {
    case "paragraph":
      return (
        <p {...attributes} style={style}>
          {children}
        </p>
      );

    // 标题
    case "heading-one":
      return (
        <h1 {...attributes} style={style}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} style={style}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 {...attributes} style={style}>
          {children}
        </h3>
      );
    case "heading-four":
      return (
        <h4 {...attributes} style={style}>
          {children}
        </h4>
      );
    case "heading-five":
      return (
        <h5 {...attributes} style={style}>
          {children}
        </h5>
      );
    case "heading-six":
      return (
        <h6 {...attributes} style={style}>
          {children}
        </h6>
      );

    // 引用
    case "quote":
      return (
        <blockquote
          {...attributes}
          style={{
            borderLeft: `4px solid ${theme.borderColor}`,
            margin: "1.5em 0",
            padding: "0.5em 0 0.5em 1em",
            backgroundColor: theme.surface2,
            textAlign: element.align,
          }}
        >
          {children}
        </blockquote>
      );

    // 链接和图片
    case "link":
      return (
        <SafeLink href={element.url} {...attributes} style={style}>
          {children}
        </SafeLink>
      );
    case "image":
      return <ImageElement {...props} style={style} />;

    // 列表相关
    case "list":
      return (
        <List
          attributes={attributes}
          element={element}
          theme={theme}
          style={style}
        >
          {children}
        </List>
      );

    case "list-item":
      return (
        <ListItem
          attributes={attributes}
          element={element}
          theme={theme}
          editor={editor}
          style={style}
        >
          {children}
        </ListItem>
      );

    // 表格相关
    case "table":
      return (
        <Table attributes={attributes} theme={theme} style={style}>
          {children}
        </Table>
      );
    case "table-row":
      return (
        <TableRow attributes={attributes} theme={theme} style={style}>
          {children}
        </TableRow>
      );
    case "table-cell":
      return (
        <TableCell
          attributes={attributes}
          element={element}
          theme={theme}
          style={style}
        >
          {children}
        </TableCell>
      );

    // 分割线
    case "thematic-break":
      return (
        <hr
          {...attributes}
          style={{
            border: "none",
            borderBottom: `1px solid #000`,
            margin: "1em 0",
            ...style,
          }}
        />
      );

    // HTML 内容
    case "html-block":
    case "html-inline":
      return (
        <div
          {...attributes}
          style={style}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    // 默认处理
    default:
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag {...attributes} style={{ position: "relative", ...style }}>
          {children}
        </Tag>
      );
  }
};
