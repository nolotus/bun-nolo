// create/editor/renderLeaf.tsx
import React from "react";

// 定义 TextLeaf 组件的 props 类型 (如果还没有的话)
interface TextLeafProps {
  attributes: any;
  children: React.ReactNode;
  leaf: {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    // code?: boolean; // 移除了这个，因为内联代码由 ElementWrapper 处理
    subscript?: boolean;
    superscript?: boolean;
    highlight?: boolean;
    // 其他可能的 token 类型，由 Prism decorate 添加
    [key: string]: any;
  };
}

const TextLeaf: React.FC<TextLeafProps> = ({ attributes, children, leaf }) => {
  const { text, ...rest } = leaf; // 使用 rest 来收集 Prism 添加的 token 类型
  let node = children;

  const commonStyle = {
    textDecorationThickness: "0.1em", // 定义通用样式变量
  };

  // 应用标准的 Markdown 格式标记
  if (leaf.bold) {
    node = <strong style={{ fontWeight: 600 }}>{node}</strong>;
  }
  if (leaf.italic) {
    node = <em style={{ fontStyle: "italic" }}>{node}</em>;
  }
  if (leaf.underline) {
    node = (
      <u style={{ ...commonStyle, textUnderlineOffset: "0.2em" }}>{node}</u>
    );
  }
  if (leaf.strikethrough) {
    node = <del style={{ ...commonStyle, opacity: 0.6 }}>{node}</del>;
  }
  // --- 移除了 leaf.code 的处理 ---
  // if (leaf.code) { ... } // 这部分代码被删除

  // 处理其他可能的格式标记
  if (leaf.subscript) {
    node = <sub>{node}</sub>;
  }
  if (leaf.superscript) {
    node = <sup>{node}</sup>;
  }
  if (leaf.highlight) {
    node = <mark style={{ backgroundColor: "#ffeeba" }}>{node}</mark>;
  }

  // 将 Prism 添加的 token 类型作为 className 应用，用于语法高亮样式
  // (假设 prismThemeCss 中定义了对应的类名，如 .token.string, .token.keyword 等)
  const prismClasses = Object.keys(rest)
    .filter((key) => key !== "text" && rest[key] === true) // 提取由 decorate 添加的标记
    .map((type) => `token ${type}`) // 转换为 'token type' 格式的类名
    .join(" ");

  return (
    <span {...attributes} className={prismClasses}>
      {node}
    </span>
  );
};

// 导出 renderLeaf 函数
export const renderLeaf = (props: TextLeafProps) => {
  return <TextLeaf {...props} />;
};
