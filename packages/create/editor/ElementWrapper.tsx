import CodeBlock from "render/elements/CodeBlock";
import { ImageElement } from "render/elements/ImageElement";
import { List, ListItem } from "render/elements/List";
import { SafeLink } from "render/elements/SafeLink";
import { Table, TableCell, TableRow } from "web/ui/Table"; // 正确导入Table组件
import { useSlateStatic } from "slate-react";
import { CodeBlockType, CodeLineType } from "./type";
import { useTheme } from "app/theme";

// 定义统一的间距和排版常量
const TYPOGRAPHY = {
  paragraph: {
    margin: "0.75em 0",
    lineHeight: 1.7,
    fontSize: "16px",
  },
  headings: {
    h1: { fontSize: "2em", margin: "0.8em 0 0.6em", lineHeight: 1.3 }, // 减少上边距从1.2em到0.8em
    h2: { fontSize: "1.7em", margin: "0.7em 0 0.5em", lineHeight: 1.35 }, // 相应减少从1.1em到0.7em
    h3: { fontSize: "1.4em", margin: "0.7em 0 0.5em", lineHeight: 1.4 }, // 相应减少从1.0em到0.7em
    h4: { fontSize: "1.2em", margin: "0.6em 0 0.4em", lineHeight: 1.45 }, // 相应减少从0.9em到0.6em
    h5: { fontSize: "1.1em", margin: "0.6em 0 0.4em", lineHeight: 1.5 }, // 相应减少从0.8em到0.6em
    h6: { fontSize: "1em", margin: "0.5em 0 0.4em", lineHeight: 1.6 }, // 相应减少从0.7em到0.5em
  },
};

export const ElementWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const theme = useTheme();

  // 合并基础样式与对齐样式
  const getStyle = (additionalStyle = {}) => ({
    ...(element.align ? { textAlign: element.align } : {}),
    ...additionalStyle,
  });

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
      <div {...attributes} style={getStyle()}>
        {children}
      </div>
    );
  }

  // 处理其他元素类型
  switch (element.type) {
    // code-inline
    case "code-inline":
      return (
        <code
          {...attributes}
          style={getStyle({
            backgroundColor: theme.backgroundSecondary,
            color: theme.primary,
            padding: "0.2em 0.4em",
            borderRadius: "3px",
            fontFamily: "JetBrains Mono, Consolas, monospace",
            fontSize: "0.85em",
            border: `1px solid ${theme.border}`,
            wordBreak: "break-word",
            lineHeight: 1.4,
            fontWeight: 500,
          })}
        >
          {children}
        </code>
      );

    // 极简化的引用块样式
    case "quote":
      return (
        <blockquote
          {...attributes}
          style={getStyle({
            margin: "1.5em 0",
            padding: "0.5em 0 0.5em 1em", // 减少内边距，只保留左侧空间
            borderLeft: `3px solid ${theme.primary}`, // 更细的左侧边框
            color: theme.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.7,
          })}
        >
          {children}

          {/* 极简引用来源 */}
          {element.cite && (
            <div
              style={{
                marginTop: "0.5em",
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

    // 段落
    case "paragraph":
      return (
        <p
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.paragraph,
            color: theme.text,
            margin: element.isNested ? "0.4em 0" : TYPOGRAPHY.paragraph.margin,
          })}
        >
          {children}
        </p>
      );

    // 标题
    case "heading-one":
      return (
        <h1
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h1,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h2,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h3,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h3>
      );
    case "heading-four":
      return (
        <h4
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h4,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h4>
      );
    case "heading-five":
      return (
        <h5
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h5,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h5>
      );
    case "heading-six":
      return (
        <h6
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.headings.h6,
            color: theme.textStrong,
            fontWeight: 600,
          })}
        >
          {children}
        </h6>
      );

    // 链接
    case "link":
      return (
        <SafeLink
          href={element.url}
          {...attributes}
          style={getStyle({
            color: theme.primary,
            textDecoration: "underline",
            textDecorationColor: `${theme.primary}50`,
            textUnderlineOffset: "2px",
          })}
        >
          {children}
        </SafeLink>
      );

    // 图片
    case "image":
      return (
        <ImageElement
          {...props}
          style={getStyle({
            margin: "1.5em 0",
          })}
        />
      );

    // 列表
    case "list":
      return (
        <List
          attributes={attributes}
          element={element}
          theme={theme}
          style={getStyle({
            margin: "1em 0",
            paddingLeft: element.isNested ? "1.5em" : "2em",
          })}
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
          style={getStyle({
            margin: "0.5em 0",
            lineHeight: 1.6,
          })}
        >
          {children}
        </ListItem>
      );

    // 表格 - 使用导入的Table组件
    case "table":
      return (
        <Table
          attributes={attributes}
          theme={theme}
          style={getStyle({
            margin: "1.5em 0", // 增加表格上下间距
          })}
        >
          {children}
        </Table>
      );

    case "table-row":
      return (
        <TableRow attributes={attributes} theme={theme} style={getStyle()}>
          {children}
        </TableRow>
      );

    case "table-cell":
      return (
        <TableCell
          attributes={attributes}
          element={element}
          theme={theme}
          style={getStyle({
            padding: "0.75em 1em", // 自定义单元格内边距
            lineHeight: 1.5, // 自定义行高
          })}
        >
          {children}
        </TableCell>
      );

    // 分割线
    case "thematic-break":
      return (
        <hr
          {...attributes}
          style={getStyle({
            margin: "2em 0",
            border: "none",
            height: "1px",
            backgroundColor: theme.border,
          })}
        />
      );

    // HTML 内容
    case "html-block":
    case "html-inline":
      return (
        <div
          {...attributes}
          style={getStyle({
            margin: element.type === "html-block" ? "1em 0" : 0,
          })}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    // 默认处理
    default:
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag
          {...attributes}
          style={getStyle({
            ...(editor.isInline(element) ? {} : { margin: "0.75em 0" }),
          })}
        >
          {children}
        </Tag>
      );
  }
};
