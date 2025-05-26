// create/editor/renderLeaf.tsx
import React, { useMemo } from "react";
import { useTheme } from "app/theme";

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
    // Prism token 类型
    token?: boolean;
    [key: string]: any;
  };
}

// 样式缓存 Hook - 简化版本，避免复杂的嵌套
const useLeafStyles = (theme) => {
  return useMemo(
    () => ({
      bold: {
        fontWeight: 600,
        color: theme.text,
      },
      italic: {
        fontStyle: "italic",
        color: theme.textSecondary,
      },
      underline: {
        textDecorationThickness: "0.1em",
        textUnderlineOffset: "0.2em",
        textDecorationColor: theme.primary,
        color: theme.text,
      },
      strikethrough: {
        textDecorationThickness: "0.1em",
        textDecorationColor: theme.textTertiary,
        opacity: 0.65,
        color: theme.textTertiary,
      },
      subscript: {
        fontSize: "0.75em",
        color: theme.textSecondary,
      },
      superscript: {
        fontSize: "0.75em",
        color: theme.textSecondary,
      },
      highlight: {
        backgroundColor: theme.primaryLight || `${theme.primary}20`,
        color: theme.text,
        padding: `${theme.space[0]} ${theme.space[1]}`,
        borderRadius: theme.space[1],
        boxShadow: `0 0 0 1px ${theme.primary}15`,
      },
    }),
    [theme]
  );
};

const TextLeaf: React.FC<TextLeafProps> = ({ attributes, children, leaf }) => {
  const theme = useTheme();
  const styles = useLeafStyles(theme);
  const { text, ...rest } = leaf;
  let node = children;

  // 应用格式化 - 保持原有的顺序和逻辑
  if (leaf.bold) {
    node = <strong style={styles.bold}>{node}</strong>;
  }

  if (leaf.italic) {
    node = <em style={styles.italic}>{node}</em>;
  }

  if (leaf.underline) {
    node = <u style={styles.underline}>{node}</u>;
  }

  if (leaf.strikethrough) {
    node = <del style={styles.strikethrough}>{node}</del>;
  }

  if (leaf.subscript) {
    node = <sub style={styles.subscript}>{node}</sub>;
  }

  if (leaf.superscript) {
    node = <sup style={styles.superscript}>{node}</sup>;
  }

  if (leaf.highlight) {
    node = <mark style={styles.highlight}>{node}</mark>;
  }

  // 处理 Prism 语法高亮 token 类型 - 保持原有逻辑
  const prismClasses = useMemo(() => {
    return Object.keys(rest)
      .filter((key) => key !== "text" && key !== "token" && rest[key] === true)
      .map((type) => `token ${type}`)
      .join(" ");
  }, [rest]);

  return (
    <span {...attributes} className={prismClasses || undefined}>
      {node}
    </span>
  );
};

// 导出 renderLeaf 函数 - 不使用 React.memo 避免可能的问题
export const renderLeaf = (props: TextLeafProps) => {
  return <TextLeaf {...props} />;
};
