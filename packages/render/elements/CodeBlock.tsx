import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "app/theme"; // 假设路径正确
import copyToClipboard from "utils/clipboard"; // 假设路径正确
import CodeBlockActions from "./CodeBlockActions"; // 假设路径正确
import JsonBlock from "./JsonBlock"; // 假设路径正确
import ReactLiveBlock, { createLiveScope } from "./ReactLiveBlock"; // 假设路径正确
import ReactECharts from "echarts-for-react"; // 确保已安装
import MermaidContent from "./MermaidContent"; // <--- 导入新组件
import * as docx from "docx"; // <--- 1. 导入 docx 库

// --- PrismJS Language Imports ---
// (保持不变)
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-mermaid"; // 仍然需要这个用于代码高亮
import "prismjs/components/prism-diff";
// import 'prismjs/themes/prism-okaidia.css'; // 或你选择的主题

// --- Mermaid Initialization (已移至 MermaidContent.jsx 或全局) ---
// 此处不再需要初始化代码

const CodeBlock = ({ attributes, children, element }) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(element.preview === "true");
  const [isCollapsed, setIsCollapsed] = useState(element.collapsed === "true");
  const [showRightPreview, setShowRightPreview] = useState(false);

  // --- 提取文本内容 (保持不变) ---
  const content = useMemo(() => {
    const getTextContent = (nodes) => {
      if (!Array.isArray(nodes)) return "";
      return nodes
        .map((node) => {
          if (!node) return "";
          if (node.text !== undefined) return node.text;
          if (node.type === "code-line" && Array.isArray(node.children)) {
            return getTextContent(node.children) + "\n";
          }
          if (Array.isArray(node.children)) {
            return getTextContent(node.children);
          }
          return "";
        })
        .join("");
    };

    try {
      const rawText = getTextContent(element.children);
      return rawText.replace(/\n$/, "");
    } catch (err) {
      console.error("Error extracting code content:", err, element);
      return "";
    }
  }, [element.children]);

  // --- 复制处理 (保持不变) ---
  const handleCopy = () => {
    copyToClipboard(content, {
      onSuccess: () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      onError: (err) => {
        console.error("Failed to copy:", err);
      },
    });
  };

  // --- 内边距变量 (保持不变) ---
  const CODE_BLOCK_PADDING = theme?.space?.[4] || "16px";
  const CODE_BLOCK_PADDING_COLLAPSED = theme?.space?.[1] || "4px";

  // --- React Live Scope ---
  const liveScope = useMemo(
    () => ({
      ...createLiveScope(theme),
      ReactECharts,
      docx, // <--- 2. 将 docx 添加到 liveScope
    }),
    [theme] // 确保 theme 是唯一的依赖项，如果 docx 不依赖 theme
    // 如果 createLiveScope 返回的内容是稳定的，可以移除 theme 依赖，
    // 但通常它会包含与主题相关的组件或函数
  );

  // --- Styles (保持不变) ---
  const codeBlockStyles = `
    .code-block-wrapper {
      position: relative;
      margin: ${theme?.space?.[4] || "16px"} 0;
      border-radius: ${theme?.space?.[2] || "8px"};
      border: 1px solid ${theme?.border || "#E5E7EB"};
      background: ${theme?.backgroundSecondary || "#F9FAFB"};
      box-shadow: 0 1px 2px ${theme?.shadowLight || "rgba(0, 0, 0, 0.05)"};
      transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
      overflow: hidden;
    }

    .code-block-wrapper:hover {
      border-color: ${theme?.borderHover || "#D1D5DB"};
      box-shadow: 0 2px 4px ${theme?.shadowLight || "rgba(0, 0, 0, 0.07)"};
    }

    .code-block-content-area {
      padding: ${isCollapsed ? CODE_BLOCK_PADDING_COLLAPSED : CODE_BLOCK_PADDING} ${CODE_BLOCK_PADDING};
      transition: padding 0.2s ease-out;
      min-height: ${isCollapsed ? theme?.space?.[10] || "40px" : "auto"};
    }

    .preview-mode {
       background: ${theme?.backgroundGhost || "rgba(249, 250, 251, 0.97)"};
       border-top: 1px solid ${theme?.border || "#E5E7EB"};
       margin-top: -1px;
    }

    .code-content { /* 通用代码样式 */
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme?.text || "#1F2937"};
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
    }

    .line-numbers .code-content { /* Prism 行号支持 */
       padding-left: 3.8em;
       position: relative;
    }
  `;

  // --- Render Logic ---

  const elementId = useMemo(
    () => element.id || `code-${Math.random().toString(36).substr(2, 9)}`,
    [element.id]
  );

  // --- JSON Preview (保持不变) ---
  if (element.language === "json" && showPreview && content && !isCollapsed) {
    return (
      <>
        <style>{codeBlockStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions
            language={element.language}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            isCopied={isCopied}
            onCopy={handleCopy}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            showRightPreview={showRightPreview}
            setShowRightPreview={setShowRightPreview}
            codeBlockPadding={CODE_BLOCK_PADDING}
          />
          <div className="code-block-content-area preview-mode">
            <JsonBlock
              rawCode={content}
              showPreview={showPreview}
              codeBlockPadding={CODE_BLOCK_PADDING}
            />
          </div>
        </div>
      </>
    );
  }

  // --- Mermaid Preview / Code View (保持不变) ---
  if (element.language === "mermaid") {
    return (
      <>
        <style>{codeBlockStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions
            language={element.language}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            isCopied={isCopied}
            onCopy={handleCopy}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            showRightPreview={showRightPreview}
            setShowRightPreview={setShowRightPreview}
            codeBlockPadding={CODE_BLOCK_PADDING}
          />
          <div
            className={`code-block-content-area ${showPreview && !isCollapsed ? "preview-mode" : ""}`}
          >
            <MermaidContent
              elementId={elementId}
              content={content}
              showPreview={showPreview}
              isCollapsed={isCollapsed}
              children={children}
              theme={theme}
              codeBlockPadding={CODE_BLOCK_PADDING}
            />
          </div>
        </div>
      </>
    );
  }

  // --- React Live Preview / Code View (保持不变) ---
  if (
    (element.language === "jsx" || element.language === "tsx") &&
    showPreview &&
    !isCollapsed
  ) {
    return (
      <>
        <style>{codeBlockStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions
            language={element.language}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            isCopied={isCopied}
            onCopy={handleCopy}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            showRightPreview={showRightPreview}
            setShowRightPreview={setShowRightPreview}
            codeBlockPadding={CODE_BLOCK_PADDING}
          />
          <div className="code-block-content-area preview-mode">
            <ReactLiveBlock
              rawCode={content}
              language={element.language}
              theme={theme}
              showPreview={showPreview}
              liveScope={liveScope} // liveScope 现在包含了 docx
              codeBlockPadding={CODE_BLOCK_PADDING}
            />
          </div>
        </div>
      </>
    );
  }

  // --- Default Code Block View (保持不变) ---
  return (
    <>
      <style>{codeBlockStyles}</style>
      <div {...attributes} className="code-block-wrapper">
        <CodeBlockActions
          language={element.language}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          isCopied={isCopied}
          onCopy={handleCopy}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          showRightPreview={showRightPreview}
          setShowRightPreview={setShowRightPreview}
          codeBlockPadding={CODE_BLOCK_PADDING}
        />
        <div className="code-block-content-area">
          {!isCollapsed && (
            <pre
              className={`code-content language-${element.language || "plaintext"}`}
            >
              <code>{children}</code>
            </pre>
          )}
        </div>
      </div>
    </>
  );
};

export default CodeBlock;
