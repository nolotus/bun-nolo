import { useMemo, useState } from "react";
import { useTheme } from "app/theme";
import copyToClipboard from "utils/clipboard";
import * as docx from "docx";
import { Tooltip } from "render/web/ui/Tooltip";
import MermaidContent from "./MermaidContent";
import ReactECharts from "echarts-for-react";
import ReactLiveBlock, { createLiveScope } from "./ReactLiveBlock";
import JsonBlock from "./JsonBlock";
import { BaseModal } from "render/web/ui/BaseModal";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScreenFullIcon,
} from "@primer/octicons-react";
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
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

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
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const [language, filename] = useMemo(() => {
    const lang = element.language || "";
    const idx = lang.indexOf(":");
    return idx > -1 ? [lang.slice(0, idx), lang.slice(idx + 1)] : [lang, null];
  }, [element.language]);

  const content = useMemo(() => {
    const getText = (nodes) =>
      Array.isArray(nodes)
        ? nodes
            .map((n) => {
              if (!n) return "";
              if (typeof n.text === "string") return n.text;
              if (n.type === "code-line") return getText(n.children) + "\n";
              if (Array.isArray(n.children)) return getText(n.children);
              return "";
            })
            .join("")
        : "";
    try {
      return getText(element.children).replace(/\n$/, "");
    } catch (err) {
      console.error("Extract code error:", err, element);
      return "";
    }
  }, [element.children]);

  const handleCopy = () => {
    copyToClipboard(content, {
      onSuccess: () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      onError: (err) => console.error("Failed to copy:", err),
    });
  };

  const liveScope = useMemo(
    () => ({
      ...createLiveScope(theme),
      ReactECharts,
      docx,
      ...xyFlowUtils,
      THREE,
      Canvas,
      useFrame,
      useThree,
      OrbitControls,
    }),
    [theme]
  );

  const styles = `
    .code-block-wrapper {
      margin: var(--space-6) 0;
      background: var(--background);
      border-radius: var(--space-2);
      overflow: hidden;
    }
    .code-block-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-2);
      background: var(--backgroundGhost);
      height: var(--space-8);
    }
    .language-tag,
    .filename-tag {
      font-size: 12px;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--space-1);
      color: var(--textSecondary);
    }
    .language-tag { background: var(--primaryGhost); text-transform: uppercase; }
    .filename-tag {
      background: var(--backgroundSecondary);
      margin-left: var(--space-2);
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .action-buttons { display: flex; gap: var(--space-1); }
    .action-button {
      border: none;
      background: transparent;
      padding: var(--space-2);
      color: var(--textSecondary);
      border-radius: var(--space-1);
      cursor: pointer;
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
    }
    .preview-content { padding: 0; }
    .fullscreen-preview-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--background);
    }
    .fullscreen-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border);
    }
    .fullscreen-preview-body {
      flex: 1;
      padding: var(--space-4);
      overflow: auto;
    }
    .fullscreen-close-button {
      border: none;
      background: var(--backgroundGhost);
      color: var(--text);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--space-1);
      cursor: pointer;
    }
    .fullscreen-close-button:hover {
      background: var(--primaryGhost);
    }
    .react-flow__attribution { display: none; }
  `;

  const elementId = useMemo(
    () => element.id || `code-${Math.random().toString(36).slice(2, 11)}`,
    [element.id]
  );

  const renderPreview = ({
    previewMode = showPreview,
    collapsed = isCollapsed,
  }: {
    previewMode?: boolean;
    collapsed?: boolean;
  } = {}) => {
    if (language === "json" && previewMode && content && !collapsed) {
      return (
        <div className="preview-content">
          <JsonBlock rawCode={content} showPreview={previewMode} />
        </div>
      );
    }
    if (language === "mermaid") {
      return (
        <div className="preview-content">
          <MermaidContent
            elementId={elementId}
            content={content}
            showPreview={previewMode}
            isCollapsed={collapsed}
            children={children}
            theme={theme}
          />
        </div>
      );
    }
    if (
      (language === "jsx" || language === "tsx") &&
      previewMode &&
      !collapsed
    ) {
      return (
        <div className="preview-content">
          <ReactLiveBlock
            rawCode={content}
            language={language}
            theme={theme}
            showPreview={previewMode}
            liveScope={liveScope}
          />
        </div>
      );
    }
    if (!collapsed) {
      return (
        <pre className={`code-content language-${language || "plaintext"}`}>
          <code>{children}</code>
        </pre>
      );
    }
    return null;
  };

  return (
    <>
      <style href="code-block" precedence="medium">
        {styles}
      </style>
      <div {...attributes} className="code-block-wrapper">
        <div className="code-block-actions">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="language-tag">{language || "text"}</span>
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
            <Tooltip content="全屏预览">
              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="action-button"
              >
                <ScreenFullIcon size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
        {renderPreview()}
      </div>

      <BaseModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        variant="fullscreen"
        closeOnBackdrop
        preventBodyScroll
        className="code-block-fullscreen-modal"
        zIndex={1200}
      >
        <div className="fullscreen-preview-shell">
          <div className="fullscreen-preview-header">
            <div>
              <span style={{ fontWeight: 500 }}>{language || "Preview"}</span>
              {filename && (
                <span style={{ marginLeft: 12, color: "var(--textSecondary)" }}>
                  {filename}
                </span>
              )}
            </div>
            <button
              className="fullscreen-close-button"
              onClick={() => setIsFullscreenOpen(false)}
            >
              退出全屏
            </button>
          </div>
          <div className="fullscreen-preview-body">
            {renderPreview({ previewMode: true, collapsed: false })}
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default CodeBlock;
