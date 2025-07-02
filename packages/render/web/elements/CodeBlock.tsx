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

// --- React Flow / XY Flow Imports ---
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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

const xyFlowUtils = {
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
};

const CodeBlock = ({ attributes, children, element }) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(element.preview === "true");
  const [isCollapsed, setIsCollapsed] = useState(element.collapsed === "true");
  const [showRightPreview, setShowRightPreview] = useState(false);

  const [language, filename] = useMemo(() => {
    const lang = element.language || "";
    const idx = lang.indexOf(":");
    if (idx > -1) {
      return [lang.substring(0, idx), lang.substring(idx + 1)];
    }
    return [lang, null];
  }, [element.language]);

  const content = useMemo(() => {
    const getText = (nodes) => {
      if (!Array.isArray(nodes)) return "";
      return nodes
        .map((n) => {
          if (!n) return "";
          if (n.text !== undefined) return n.text;
          if (n.type === "code-line" && Array.isArray(n.children)) {
            return getText(n.children) + "\n";
          }
          if (Array.isArray(n.children)) {
            return getText(n.children);
          }
          return "";
        })
        .join("");
    };
    try {
      const txt = getText(element.children);
      return txt.replace(/\n$/, "");
    } catch (err) {
      console.error("Error extracting code content:", err, element);
      return "";
    }
  }, [element.children]);

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

  const liveScope = useMemo(
    () => ({
      ...createLiveScope(theme),
      ReactECharts,
      docx,
      ...xyFlowUtils,
    }),
    [theme]
  );

  const styles = `
    .code-block-wrapper {
      margin: var(--space-6) 0;
      background: var(--background);
      border-radius: var(--space-2);
      overflow: hidden;
      position: relative;
    }
    .code-block-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: var(--space-8);
      background: var(--backgroundGhost);
      padding: 0 var(--space-2);
    }
    .language-tag {
      font-size: 12px;
      color: var(--textSecondary);
      padding: var(--space-1) var(--space-2);
      background: var(--primaryGhost);
      border-radius: var(--space-1);
      text-transform: uppercase;
    }
    .filename-tag {
      font-size: 12px;
      color: var(--textSecondary);
      padding: var(--space-1) var(--space-2);
      margin-left: var(--space-2);
      background: var(--backgroundSecondary);
      border-radius: var(--space-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
    .action-buttons {
      display: flex;
      gap: var(--space-1);
    }
    .action-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: var(--space-2);
      color: var(--textSecondary);
      border-radius: var(--space-1);
      transition: color 0.2s;
    }
    .action-button:hover,
    .action-button.active {
      color: var(--text);
      background: var(--primaryGhost);
    }
    .code-content {
      margin: 0;
      padding: var(--space-4);
      font-family: 'SF Mono', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text);
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
    }
    .preview-content {
      padding: 0;
      margin: 0;
    }
    .react-flow__pane {
      cursor: grab;
    }
    .react-flow__attribution {
      display: none;
    }
    .react-live-preview {
      min-height: 300px;
    }
  `;

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

        {language === "json" && showPreview && content && !isCollapsed ? (
          <div className="preview-content">
            <JsonBlock rawCode={content} showPreview={showPreview} />
          </div>
        ) : language === "mermaid" ? (
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
        ) : (language === "jsx" || language === "tsx") &&
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
        ) : !isCollapsed ? (
          <pre className={`code-content language-${language || "plaintext"}`}>
            <code>{children}</code>
          </pre>
        ) : null}
      </div>
    </>
  );
};

export default CodeBlock;
