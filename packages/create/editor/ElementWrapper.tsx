// create/editor/ElementWrapper.tsx
import React from "react";
import { useSlateStatic } from "slate-react";
import { useTheme } from "app/theme"; // 假设的主题 hook
import CodeBlock from "render/elements/CodeBlock"; // 假设的 CodeBlock 组件
import { ImageElement } from "render/elements/ImageElement"; // 假设的 ImageElement 组件
import { List, ListItem } from "render/elements/List"; // 假设的 List/ListItem 组件
import { SafeLink } from "render/elements/SafeLink"; // 假设的 SafeLink 组件
import { Table, TableCell, TableRow } from "web/ui/Table"; // 假设的 Table 组件
import { CodeBlockType, CodeLineType } from "./type"; // 假设的类型定义

// 定义统一的间距和排版常量 (保持不变)
const TYPOGRAPHY = {
  paragraph: {
    margin: "0.75em 0",
    lineHeight: 1.7,
    fontSize: "16px",
  },
  headings: {
    h1: { fontSize: "2em", margin: "0.8em 0 0.6em", lineHeight: 1.3 },
    h2: { fontSize: "1.7em", margin: "0.7em 0 0.5em", lineHeight: 1.35 },
    h3: { fontSize: "1.4em", margin: "0.7em 0 0.5em", lineHeight: 1.4 },
    h4: { fontSize: "1.2em", margin: "0.6em 0 0.4em", lineHeight: 1.45 },
    h5: { fontSize: "1.1em", margin: "0.6em 0 0.4em", lineHeight: 1.5 },
    h6: { fontSize: "1em", margin: "0.5em 0 0.4em", lineHeight: 1.6 },
  },
};

// ElementWrapper 组件
export const ElementWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const theme = useTheme(); // 获取主题

  // 合并基础样式与对齐样式
  const getStyle = (additionalStyle = {}) => ({
    ...(element.align ? { textAlign: element.align } : {}),
    ...additionalStyle,
  });

  // 处理代码块 (保持不变)
  if (element.type === CodeBlockType) {
    return (
      <CodeBlock
        attributes={attributes}
        element={element}
        children={children}
      />
    );
  }

  // 处理代码行 (保持不变)
  if (element.type === CodeLineType) {
    return (
      <div {...attributes} style={getStyle()}>
        {children}
      </div>
    );
  }

  // 处理其他元素类型
  switch (element.type) {
    // 内联代码
    case "code-inline":
      return (
        <code // 使用 code 标签
          {...attributes}
          style={getStyle({
            backgroundColor: theme.backgroundSecondary,
            color: theme.primary, // 使用主色调或特定代码颜色
            padding: "0.2em 0.4em",
            borderRadius: "3px",
            fontFamily: "JetBrains Mono, Consolas, monospace", // 代码字体
            fontSize: "0.85em", // 稍小字体
            border: `1px solid ${theme.border}`, // 边框
            wordBreak: "break-word", // 允许长代码换行
            lineHeight: 1.4, // 调整行高
            fontWeight: 500, // 代码通常不加粗，除非特定语法高亮
            verticalAlign: "middle", // 尝试垂直对齐
          })}
        >
          {children} {/* 直接渲染 Slate 子节点 (通常是 {text: "..."}) */}
        </code>
      );

    // 引用块 (保持不变)
    case "quote":
      return (
        <blockquote
          {...attributes}
          style={getStyle({
            margin: "1.5em 0",
            padding: "0.5em 0 0.5em 1em",
            borderLeft: `3px solid ${theme.primary}`,
            color: theme.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.7,
          })}
        >
          {children}
          {element.cite && ( // 处理引用来源 (如果存在)
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

    // 段落 (保持不变)
    case "paragraph":
      return (
        <p
          {...attributes}
          style={getStyle({
            ...TYPOGRAPHY.paragraph,
            color: theme.text,
            // 处理嵌套段落的边距 (例如在列表项中)
            margin: element.isNested ? "0.4em 0" : TYPOGRAPHY.paragraph.margin,
          })}
        >
          {children}
        </p>
      );

    // 标题 (保持不变)
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

    // 链接 (保持不变)
    case "link":
      return (
        <SafeLink
          href={element.url}
          {...attributes}
          style={getStyle({
            color: theme.primary,
            textDecoration: "underline",
            textDecorationColor: `${theme.primary}50`, // 半透明下划线
            textUnderlineOffset: "2px", // 下划线偏移
          })}
        >
          {children}
        </SafeLink>
      );

    // 图片 (保持不变)
    case "image":
      return (
        <ImageElement
          {...props} // 传递所有 props 给 ImageElement
          style={getStyle({
            margin: "1.5em 0", // 图片上下边距
          })}
        />
      );

    // 列表 (保持不变)
    case "list":
      return (
        <List
          attributes={attributes}
          element={element}
          theme={theme}
          style={getStyle({
            margin: "1em 0",
            paddingLeft: element.isNested ? "1.5em" : "2em", // 嵌套列表缩进
          })}
        >
          {children}
        </List>
      );

    // 列表项 (保持不变)
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

    // 表格 (保持不变)
    case "table":
      return (
        <Table
          attributes={attributes}
          theme={theme}
          style={getStyle({ margin: "1.5em 0" })}
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
          style={getStyle({ padding: "0.75em 1em", lineHeight: 1.5 })}
        >
          {children}
        </TableCell>
      );

    // 分割线 (保持不变)
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

    // --- HTML 内容渲染修改 ---
    case "html-inline": // 内联 HTML
      return (
        <span // <-- 改为 span
          {...attributes}
          style={getStyle()} // 内联元素通常不需要额外边距
          dangerouslySetInnerHTML={{ __html: element.html }}
          // 注意：这里仍然使用 dangerouslySetInnerHTML，忽略了 element.children
          // 如果需要使用 element.children, 则移除 dangerouslySetInnerHTML 并渲染 {children}
        />
      );
    case "html-block": // 块级 HTML
      return (
        <div // <-- 保持 div
          {...attributes}
          style={getStyle({ margin: "1em 0" })} // 块级可以有边距
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    // 默认处理 (保持不变)
    default:
      // 对于未明确处理的类型，根据是否为行内元素选择 span 或 div
      const Tag = editor.isInline(element) ? "span" : "div";
      return (
        <Tag
          {...attributes}
          style={getStyle({
            ...(editor.isInline(element) ? {} : { margin: "0.75em 0" }), // 块级默认边距
          })}
        >
          {children}
        </Tag>
      );
  }
};
