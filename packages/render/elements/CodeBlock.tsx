import { useEffect, useMemo, useState } from "react";
import { useTheme } from "app/theme";
import mermaid from "mermaid";
import copyToClipboard from "utils/clipboard";
import CodeBlockActions from "./CodeBlockActions";
import JsonBlock from "./JsonBlock"; // 假设文件路径正确
import ReactLiveBlock from "./ReactLiveBlock"; // 假设文件路径正确
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

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
  theme: "default",
});

const CodeBlock = ({ attributes, children, element }) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showRightPreview, setShowRightPreview] = useState(false);

  const content = useMemo(() => {
    const getTextContent = (nodes) => {
      return nodes
        .map((node) => {
          if (node.text) return node.text;
          if (node.type === "code-line") {
            return getTextContent(node.children) + "\n";
          }
          return node.children ? getTextContent(node.children) : "";
        })
        .join("");
    };

    try {
      return getTextContent(element.children);
    } catch (err) {
      console.error(err);
      return "";
    }
  }, [element.children]);

  const handleCopy = () => {
    copyToClipboard(content, {
      onSuccess: () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
    });
  };

  // 提取 code-block 的内边距变量
  const CODE_BLOCK_PADDING = theme.space[4]; // 16px，作为标准内边距
  const CODE_BLOCK_PADDING_COLLAPSED = theme.space[1]; // 4px，折叠状态下减少内边距以配合居中

  // 通用代码块样式，使用提取的变量
  const codeBlockStyles = `
    .code-block {
      position: relative;
      font-family: 'Fira Code', monospace;
      background: ${theme.backgroundSecondary};
      padding: ${CODE_BLOCK_PADDING} ${CODE_BLOCK_PADDING};
      border-radius: ${theme.space[2]};
      margin: ${theme.space[4]} 0;
      border: 1px solid ${theme.border};
      box-shadow: 0 1px 2px ${theme.shadowLight};
      transition: all 0.2s ease-out;
    }
    
    .preview-mode {
      background: ${theme.backgroundGhost};
      padding: ${CODE_BLOCK_PADDING};
    }

    .collapsed {
      padding: ${CODE_BLOCK_PADDING_COLLAPSED} ${CODE_BLOCK_PADDING};
      min-height: ${theme.space[10]}; /* 40px，确保 actions 可见 */
      overflow: hidden;
    }

    .code-content {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme.text};
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
    }
    
    .code-block:hover {
      border-color: ${theme.borderHover};
    }
  `;

  // JSON View only when showPreview is true
  if (element.language === "json" && showPreview && content) {
    return (
      <>
        <style>{codeBlockStyles}</style>
        <div
          {...attributes}
          className={`code-block preview-mode ${isCollapsed ? "collapsed" : ""}`}
        >
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
            codeBlockPadding={CODE_BLOCK_PADDING} // 传递给 CodeBlockActions 用于 gap
          />
          {!isCollapsed && (
            <JsonBlock
              rawCode={content}
              showPreview={showPreview}
              codeBlockPadding={CODE_BLOCK_PADDING}
            />
          )}
        </div>
      </>
    );
  }

  // Mermaid View
  if (element.language === "mermaid") {
    useEffect(() => {
      if (showPreview && !isCollapsed) {
        mermaid.contentLoaded();
      }
    }, [showPreview, isCollapsed]);

    return (
      <>
        <style>{codeBlockStyles}</style>
        <div
          {...attributes}
          className={`code-block ${showPreview ? "preview-mode" : ""} ${isCollapsed ? "collapsed" : ""}`}
        >
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
          {!isCollapsed && showPreview ? (
            <div className="mermaid">{content}</div>
          ) : (
            !isCollapsed && <pre className="code-content">{content}</pre>
          )}
        </div>
      </>
    );
  }

  // React Live View for JSX/TSX only when showPreview is true
  if (
    (element.language === "jsx" || element.language === "tsx") &&
    showPreview
  ) {
    return (
      <>
        <style>{codeBlockStyles}</style>
        <div
          {...attributes}
          className={`code-block preview-mode ${isCollapsed ? "collapsed" : ""}`}
        >
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
          {!isCollapsed && (
            <ReactLiveBlock
              rawCode={content}
              language={element.language}
              theme={theme}
              showPreview={showPreview}
              liveScope={{}} // 需要根据你的需求传递 scope
              codeBlockPadding={CODE_BLOCK_PADDING}
            />
          )}
        </div>
      </>
    );
  }

  // Default Code Block (including JSON and JSX/TSX when showPreview is false)
  return (
    <>
      <style>{codeBlockStyles}</style>
      <div
        {...attributes}
        className={`code-block ${isCollapsed ? "collapsed" : ""}`}
      >
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
        {!isCollapsed && (
          <pre
            className={`code-content language-${element.language || "plaintext"}`}
          >
            <code>{children}</code>
          </pre>
        )}
      </div>
    </>
  );
};

export default CodeBlock;
