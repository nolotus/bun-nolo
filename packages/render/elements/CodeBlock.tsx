import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "app/theme";
import copyToClipboard from "utils/clipboard";
import * as docx from "docx";
import { Tooltip } from "render/web/ui/Tooltip";
import MermaidContent from "./MermaidContent";
import ReactECharts from "echarts-for-react";
import ReactLiveBlock, { createLiveScope } from "./ReactLiveBlock";
import JsonBlock from "./JsonBlock";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScreenFullIcon,
} from "@primer/octicons-react";

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

  // 解析语言和文件名
  const [language, filename] = useMemo(() => {
    const lang = element.language || "";
    const colonIndex = lang.indexOf(":");
    if (colonIndex > -1) {
      return [lang.substring(0, colonIndex), lang.substring(colonIndex + 1)];
    }
    return [lang, null];
  }, [element.language]);

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

  // --- 更新样式 ---
  const styles = `
    .code-block-wrapper {
      margin: ${theme.space[6]} 0;
      background: ${theme.background};
      border-radius: ${theme.space[2]};
      overflow: hidden;
    }

    .code-block-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: ${theme.space[8]};
      background: ${theme.backgroundGhost};
      padding: 0 ${theme.space[2]};
    }

    .language-tag {
      font-size: 12px;
      color: ${theme.textSecondary}; 
      padding: ${theme.space[1]} ${theme.space[2]};
      background: ${theme.primaryGhost};
      border-radius: ${theme.space[1]};
      text-transform: uppercase;
    }

    .filename-tag {
      font-size: 12px;
      color: ${theme.textSecondary};
      padding: ${theme.space[1]} ${theme.space[2]};
      margin-left: ${theme.space[2]};
      background: ${theme.secondaryGhost};
      border-radius: ${theme.space[1]};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    .action-buttons {
      display: flex;
      gap: ${theme.space[1]};
    }

    .action-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: ${theme.space[2]};
      color: ${theme.textSecondary};
      border-radius: ${theme.space[1]};
      transition: color 0.2s;
    }

    .action-button:hover,
    .action-button.active {
      color: ${theme.text};
      background: ${theme.primaryGhost};
    }

    .code-content {
      margin: 0;
      padding: ${theme.space[4]};
      font-family: 'SF Mono', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme.text};
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
    }

    .preview-content {
      padding: 0;
      margin: 0;
    }
  `;

  // --- 内联操作栏组件 ---
  const CodeBlockActions = () => (
    <div className="code-block-actions">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="language-tag">{language}</span>
        {filename && (
          <Tooltip content={filename}>
            <span className="filename-tag">{filename}</span>
          </Tooltip>
        )}
      </div>
      <div className="action-buttons">
        <Tooltip content={showPreview ? "显示代码" : "显示预览"}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`action-button ${showPreview ? "active" : ""}`}
          >
            {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </Tooltip>
        <Tooltip content={isCopied ? "已复制!" : "复制代码"}>
          <button onClick={handleCopy} className="action-button">
            {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
        </Tooltip>
        <Tooltip content={isCollapsed ? "展开代码" : "折叠代码"}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`action-button ${isCollapsed ? "active" : ""}`}
          >
            {isCollapsed ? (
              <ChevronUpIcon size={16} />
            ) : (
              <ChevronDownIcon size={16} />
            )}
          </button>
        </Tooltip>
        <Tooltip content={showRightPreview ? "关闭右侧预览" : "打开右侧预览"}>
          <button
            onClick={() => setShowRightPreview(!showRightPreview)}
            className={`action-button ${showRightPreview ? "active" : ""}`}
          >
            <ScreenFullIcon size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );

  const elementId = useMemo(
    () => element.id || `code-${Math.random().toString(36).substr(2, 9)}`,
    [element.id]
  );

  return (
    <>
      <style href="code-block" precedence="medium">
        {styles}
      </style>
      <div {...attributes} className="code-block-wrapper">
        <CodeBlockActions />

        {/* JSON Preview */}
        {language === "json" && showPreview && content && !isCollapsed ? (
          <div className="preview-content">
            <JsonBlock rawCode={content} showPreview={showPreview} />
          </div>
        ) : /* Mermaid Preview */
        language === "mermaid" ? (
          <div className="preview-content">
            <MermaidContent
              elementId={elementId}
              content={content}
              showPreview={showPreview}
              isCollapsed={isCollapsed}
              children={children}
              theme={theme}
            />
          </div>
        ) : /* React Live Preview */
        (language === "jsx" || language === "tsx") &&
          showPreview &&
          !isCollapsed ? (
          <div className="preview-content">
            <ReactLiveBlock
              rawCode={content}
              language={language}
              theme={theme}
              showPreview={showPreview}
              liveScope={liveScope}
            />
          </div>
        ) : /* Default Code View */
        !isCollapsed ? (
          <pre className={`code-content language-${language || "plaintext"}`}>
            <code>{children}</code>
          </pre>
        ) : null}
      </div>
    </>
  );
};

export default CodeBlock;
