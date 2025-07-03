// 文件：create/editor/renderLeaf.tsx

import React, { useMemo } from "react";
import { CSSProperties } from "react";

interface TextLeafProps {
  attributes: any;
  children: React.ReactNode;
  leaf: {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    subscript?: boolean;
    superscript?: boolean;
    highlight?: boolean;
    code?: boolean; // 内联代码标记
    token?: boolean; // Prism 语法高亮 token
    [key: string]: any;
  };
}

// 简易样式助手
const getStyle = (style: CSSProperties): CSSProperties => style;

// 其他格式化样式都用 CSS 变量
const useLeafStyles = () =>
  useMemo(
    () => ({
      bold: {
        fontWeight: 600,
        color: "var(--text)",
      },
      italic: {
        fontStyle: "italic",
        color: "var(--textSecondary)",
      },
      underline: {
        textDecorationThickness: "0.1em",
        textUnderlineOffset: "0.2em",
        textDecorationColor: "var(--primary)",
        color: "var(--text)",
      },
      strikethrough: {
        textDecorationThickness: "0.1em",
        textDecorationColor: "var(--textTertiary)",
        opacity: 0.65,
        color: "var(--textTertiary)",
      },
      subscript: {
        fontSize: "0.75em",
        color: "var(--textSecondary)",
      },
      superscript: {
        fontSize: "0.75em",
        color: "var(--textSecondary)",
      },
      highlight: {
        backgroundColor: "var(--primaryLight)",
        color: "var(--text)",
        padding: "var(--space-0) var(--space-1)",
        borderRadius: "var(--space-1)",
        boxShadow: "0 0 0 1px var(--primary)",
      },
    }),
    []
  );

const TextLeaf: React.FC<TextLeafProps> = ({ attributes, children, leaf }) => {
  // 永远在最顶层调用 Hooks，顺序不变
  const styles = useLeafStyles();
  const { text, code, token, ...rest } = leaf;

  // Prism token classes
  const prismClasses = useMemo(() => {
    return Object.keys(rest)
      .filter((key) => key !== "text" && key !== "token" && rest[key] === true)
      .map((type) => `token ${type}`)
      .join(" ");
  }, [rest]);

  // 内联代码优先渲染
  if (code) {
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
  }

  // 其他格式化按顺序包裹
  let node = children;
  if (leaf.bold) node = <strong style={styles.bold}>{node}</strong>;
  if (leaf.italic) node = <em style={styles.italic}>{node}</em>;
  if (leaf.underline) node = <u style={styles.underline}>{node}</u>;
  if (leaf.strikethrough) node = <del style={styles.strikethrough}>{node}</del>;
  if (leaf.subscript) node = <sub style={styles.subscript}>{node}</sub>;
  if (leaf.superscript) node = <sup style={styles.superscript}>{node}</sup>;
  if (leaf.highlight) node = <mark style={styles.highlight}>{node}</mark>;

  return (
    <span {...attributes} className={prismClasses || undefined}>
      {node}
    </span>
  );
};

// 不使用 React.memo，保证渲染一致性
export const renderLeaf = (props: TextLeafProps) => <TextLeaf {...props} />;
