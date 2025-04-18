import { useEffect, useMemo, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import { useTheme } from "app/theme";
import mermaid from "mermaid";
import copyToClipboard from "utils/clipboard";
import CodeBlockActions from "./CodeBlockActions";
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

  // 通用代码块样式
  const codeBlockStyles = `
    .code-block {
      position: relative;
      font-family: 'Fira Code', monospace;
      background: ${theme.backgroundSecondary};
      padding: 16px 18px;
      border-radius: 6px;
      margin: 18px 0;
      border: 1px solid ${theme.border};
      box-shadow: 0 1px 2px ${theme.shadowLight};
      transition: all 0.2s ease-out;
    }
    
    .preview-mode {
      background: ${theme.backgroundGhost};
      padding: 18px;
    }

    .code-content {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 14px; /* 略微增大 */
      line-height: 1.6;
      color: ${theme.text};
      overflow-x: auto;
    }
    
    .code-block:hover {
      border-color: ${theme.borderHover};
    }
  `;

  // JSON View
  if (element.language === "json" && content) {
    try {
      const jsonData = JSON.parse(content);
      return (
        <>
          <style>{codeBlockStyles}</style>
          <div
            {...attributes}
            className={`code-block ${showPreview ? "preview-mode" : ""}`}
          >
            <CodeBlockActions
              language={element.language}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              isCopied={isCopied}
              onCopy={handleCopy}
            />
            {showPreview ? (
              <JsonView
                data={jsonData}
                shouldExpandNode={allExpanded}
                style={{
                  ...defaultStyles,
                  container: {
                    ...defaultStyles.container,
                    backgroundColor: "transparent",
                  },
                }}
              />
            ) : (
              <pre className="code-content">{content}</pre>
            )}
          </div>
        </>
      );
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  }

  // Mermaid View
  if (element.language === "mermaid") {
    useEffect(() => {
      if (showPreview) {
        mermaid.contentLoaded();
      }
    }, [showPreview]);

    return (
      <>
        <style>{codeBlockStyles}</style>
        <div
          {...attributes}
          className={`code-block ${showPreview ? "preview-mode" : ""}`}
        >
          <CodeBlockActions
            language={element.language}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            isCopied={isCopied}
            onCopy={handleCopy}
          />
          {showPreview ? (
            <div className="mermaid">{content}</div>
          ) : (
            <pre className="code-content">{content}</pre>
          )}
        </div>
      </>
    );
  }

  // Default Code Block
  return (
    <>
      <style>{codeBlockStyles}</style>
      <div {...attributes} className="code-block">
        <CodeBlockActions
          language={element.language}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          isCopied={isCopied}
          onCopy={handleCopy}
        />
        <pre className="code-content">{children}</pre>
      </div>
    </>
  );
};

export default CodeBlock;
