import CodeBlock from "render/elements/CodeBlock";
import { ImageElement } from "render/elements/ImageElement";
import { List, ListItem } from "render/elements/List";
import { SafeLink } from "render/elements/SafeLink";
import { Table, TableCell, TableRow } from "render/elements/Table";
import { useSlateStatic } from "slate-react";
import { CodeBlockType, CodeLineType } from "./type";
import { useTheme } from "app/theme";

export const ElementWrapper = (props) => {
  const { attributes, children, element } = props;
  const editor = useSlateStatic();
  const theme = useTheme();
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
      <div {...attributes} style={style}>
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
          style={{
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
            ...style,
          }}
        >
          {children}
        </code>
      );

    // quote
    case "quote":
      return (
        <blockquote
          {...attributes}
          style={{
            position: "relative",
            margin: "1.5em 0",
            padding: "1.5em 2em",
            borderRadius: "12px", // 更圆润的圆角
            background: `linear-gradient(135deg, ${theme.primaryGhost} 0%, transparent 70%)`, // 渐变背景
            border: `1px solid ${theme.border}`,
            borderLeft: `6px solid ${theme.primary}`, // 稍微加粗的左侧边框
            boxShadow: `0 6px 12px -4px ${theme.shadowLight}`, // 更柔和的阴影
            fontStyle: "italic",
            color: theme.textSecondary,
            fontSize: "1.05em",
            lineHeight: 1.6,
            overflow: "hidden", // 确保内容不会溢出
            transition: "all 0.3s ease", // 添加轻微的过渡效果
          }}
        >
          <div
            style={{
              position: "relative",
              paddingRight: "2em",
              display: "flex",
              alignItems: "center",
              gap: "1em",
            }}
          >
            {/* 左侧引号图标 */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "-1em",
                fontSize: "3em",
                color: theme.primary,
                opacity: 0.2,
                lineHeight: 0,
                userSelect: "none", // 防止选中
              }}
            >
              ❝
            </div>

            {/* 引用内容 */}
            <div style={{ flex: 1 }}>{children}</div>
          </div>

          {/* 引用来源 */}
          {element.cite && (
            <div
              style={{
                marginTop: "1em",
                textAlign: "right",
                fontStyle: "normal",
                color: theme.textTertiary,
                fontSize: "0.9em",
                position: "relative",
                paddingRight: "1em",
                opacity: 0.8,
                borderTop: `1px solid ${theme.border}`,
                paddingTop: "0.5em",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-1em",
                  color: theme.primary,
                  opacity: 0.7,
                }}
              >
                —
              </div>
              {element.cite}
            </div>
          )}

          {/* 底部装饰线 */}
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "3px",
              backgroundColor: theme.primary,
              opacity: 0.3,
              borderRadius: "2px",
            }}
          />
        </blockquote>
      );

    // 段落
    case "paragraph":
      return (
        <p {...attributes} style={{ style }}>
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

    // 链接
    case "link":
      return (
        <SafeLink
          href={element.url}
          {...attributes}
          style={{
            ...style,
            color: theme.primary,
          }}
        >
          {children}
        </SafeLink>
      );

    // 图片
    case "image":
      return <ImageElement {...props} style={style} />;

    // 列表
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

    // 表格
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
      return <hr {...attributes} style={style} />;

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
        <Tag {...attributes} style={style}>
          {children}
        </Tag>
      );
  }
};
