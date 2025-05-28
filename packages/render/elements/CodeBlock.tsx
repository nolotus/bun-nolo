import React, { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScreenFullIcon,
} from "@primer/octicons-react";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";
import copyToClipboard from "utils/clipboard";
import JsonBlock from "./JsonBlock";
import ReactLiveBlock, { createLiveScope } from "./ReactLiveBlock";
import ReactECharts from "echarts-for-react";
import MermaidContent from "./MermaidContent";
import * as docx from "docx";

// --- PrismJS Language Imports ---
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
import "prismjs/components/prism-mermaid";
import "prismjs/components/prism-diff";

const CodeBlock = ({ attributes, children, element }) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(element.preview === "true");
  const [isCollapsed, setIsCollapsed] = useState(element.collapsed === "true");
  const [showRightPreview, setShowRightPreview] = useState(false);

  // --- 提取文本内容 ---
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

  // --- 复制处理 ---
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

  // --- React Live Scope ---
  const liveScope = useMemo(
    () => ({
      ...createLiveScope(theme),
      ReactECharts,
      docx,
    }),
    [theme]
  );

  // 提取 code-block-actions 的高度变量
  const CODE_BLOCK_ACTIONS_HEIGHT = theme.space[8]; // 32px

  // --- 合并的样式 ---
  const combinedStyles = `
    .code-block-wrapper {
      position: relative;
      margin: ${theme?.space?.[6] || "24px"} 0;
      border-radius: ${theme?.space?.[3] || "12px"};
      background: ${theme?.background || "#FFFFFF"};
      box-shadow: 0 1px 3px ${theme?.shadowLight || "rgba(0, 0, 0, 0.05)"};
      transition: all 0.2s ease-out;
      overflow: hidden;
      border: none;
    }

    .code-block-wrapper:hover {
      box-shadow: 0 4px 8px ${theme?.shadowMedium || "rgba(0, 0, 0, 0.07)"};
      transform: translateY(-1px);
    }

    .code-block-actions {
      position: sticky;
      top: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: ${CODE_BLOCK_ACTIONS_HEIGHT};
      z-index: ${zIndex.codeBlockActions};
      background: ${theme.backgroundGhost};
      padding: 0 ${theme.space[2]};
      border-radius: ${theme.space[2]};
      backdrop-filter: blur(4px);
    }

    .language-tag {
      font-size: 12px;
      font-weight: 500;
      color: ${theme.textSecondary};
      padding: ${theme.space[1]} ${theme.space[2]};
      background: ${theme.primaryGhost};
      border-radius: ${theme.space[1]};
      text-transform: uppercase;
    }

    .action-buttons {
      display: flex;
      gap: ${theme.space[2]};
      align-items: center;
    }

    .action-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: ${theme.space[2]};
      color: ${theme.textSecondary};
      border-radius: ${theme.space[1]};
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background: ${theme.primaryGhost};
      color: ${theme.text};
      transform: scale(1.05);
    }

    .action-button:active {
      transform: scale(0.95);
    }

    .action-button.active {
      background: ${theme.primaryGhost};
      color: ${theme.text};
    }

    .code-block-content-area {
      padding: 0;
      transition: all 0.2s ease-out;
      min-height: ${isCollapsed ? theme?.space?.[10] || "40px" : "auto"};
      backdrop-filter: blur(10px);
      background: ${theme?.backgroundGhost || "rgba(255, 255, 255, 0.8)"};
    }

    .preview-mode {
      background: ${theme?.backgroundGhost || "rgba(249, 250, 251, 0.8)"};
      backdrop-filter: blur(10px);
      margin-top: ${theme?.space?.[1] || "4px"};
      border-radius: 0 0 ${theme?.space?.[3] || "12px"} ${theme?.space?.[3] || "12px"};
    }

    .code-content {
      margin: 0;
      padding: ${theme?.space?.[4] || "16px"};
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme?.text || "#1F2937"};
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
      font-weight: 400;
      letter-spacing: 0.025em;
    }

    .line-numbers .code-content {
      padding-left: 3.8em;
      position: relative;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .code-block-wrapper {
        margin: ${theme?.space?.[4] || "16px"} 0;
        border-radius: ${theme?.space?.[2] || "8px"};
      }
      
      .code-content {
        font-size: 13px;
        padding: ${theme?.space?.[3] || "12px"};
      }
    }

    /* 暗色模式适配 */
    @media (prefers-color-scheme: dark) {
      .code-block-wrapper {
        background: ${theme?.backgroundSecondary || "#1F2937"};
        box-shadow: 0 1px 3px ${theme?.shadowHeavy || "rgba(0, 0, 0, 0.3)"};
      }

      .code-block-wrapper:hover {
        box-shadow: 0 4px 8px ${theme?.shadowHeavy || "rgba(0, 0, 0, 0.4)"};
      }

      .code-block-content-area {
        background: ${theme?.backgroundGhost || "rgba(31, 41, 55, 0.8)"};
      }

      .preview-mode {
        background: ${theme?.backgroundTertiary || "rgba(55, 65, 81, 0.8)"};
      }

      .code-content {
        color: ${theme?.text || "#F9FAFB"};
      }

      .action-button:hover {
        background: ${theme?.backgroundHover || "rgba(255, 255, 255, 0.1)"};
      }
    }
  `;

  // --- 内联操作栏组件 ---
  const CodeBlockActions = () => (
    <div className="code-block-actions">
      <span className="language-tag">{element.language}</span>

      <div className="action-buttons">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`action-button ${showPreview ? "active" : ""}`}
          title={showPreview ? "显示代码" : "显示预览"}
        >
          {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
        </button>

        <button
          onClick={handleCopy}
          className="action-button"
          title={isCopied ? "已复制!" : "复制代码"}
        >
          {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`action-button ${isCollapsed ? "active" : ""}`}
          title={isCollapsed ? "展开代码" : "折叠代码"}
        >
          {isCollapsed ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )}
        </button>

        <button
          onClick={() => setShowRightPreview(!showRightPreview)}
          className={`action-button ${showRightPreview ? "active" : ""}`}
          title={showRightPreview ? "关闭右侧预览" : "打开右侧预览"}
        >
          <ScreenFullIcon size={16} />
        </button>
      </div>
    </div>
  );

  // --- Render Logic ---
  const elementId = useMemo(
    () => element.id || `code-${Math.random().toString(36).substr(2, 9)}`,
    [element.id]
  );

  // --- JSON Preview ---
  if (element.language === "json" && showPreview && content && !isCollapsed) {
    return (
      <>
        <style>{combinedStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions />
          <div className="code-block-content-area preview-mode">
            <JsonBlock rawCode={content} showPreview={showPreview} />
          </div>
        </div>
      </>
    );
  }

  // --- Mermaid Preview / Code View ---
  if (element.language === "mermaid") {
    return (
      <>
        <style>{combinedStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions />
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
            />
          </div>
        </div>
      </>
    );
  }

  // --- React Live Preview / Code View ---
  if (
    (element.language === "jsx" || element.language === "tsx") &&
    showPreview &&
    !isCollapsed
  ) {
    return (
      <>
        <style>{combinedStyles}</style>
        <div {...attributes} className="code-block-wrapper">
          <CodeBlockActions />
          <div className="code-block-content-area preview-mode">
            <ReactLiveBlock
              rawCode={content}
              language={element.language}
              theme={theme}
              showPreview={showPreview}
              liveScope={liveScope}
            />
          </div>
        </div>
      </>
    );
  }

  // --- Default Code Block View ---
  return (
    <>
      <style>{combinedStyles}</style>
      <div {...attributes} className="code-block-wrapper">
        <CodeBlockActions />
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
