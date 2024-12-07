import React, { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import { EyeIcon, CopyIcon, CheckIcon, CodeIcon } from "@primer/octicons-react";
import copyToClipboard from "utils/clipboard";

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
import { zIndex } from "../styles/zIndex";

// Mermaid 配置
mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
  theme: "default",
});

const styles = {
  codeBlock: {
    position: "relative",
    fontFamily: "'Fira Code', monospace",
    background: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "8px",
    margin: "16px 0",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  previewMode: {
    background: "#ffffff",
    padding: "2rem",
  },
  actions: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    zIndex: zIndex.codeBlockActions,
    background: "rgba(255,255,255,0.9)",
    padding: "4px 8px",
    borderRadius: "6px",
    backdropFilter: "blur(4px)",
  },
  button: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#6c757d",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(0,0,0,0.05)",
      color: "#000",
    },
  },
  activeButton: {
    background: "#e9ecef",
    color: "#000",
  },
  languageTag: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6c757d",
    padding: "4px 8px",
    background: "rgba(0,0,0,0.05)",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};

export const CodeBlock = ({ attributes, children, element }) => {
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
      setError(err);
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

  const ActionButtons = (
    <div style={styles.actions}>
      <span style={styles.languageTag}>{element.language}</span>
      <button
        onClick={() => setShowPreview(!showPreview)}
        style={{
          ...styles.button,
          ...(showPreview ? styles.activeButton : {}),
        }}
        title={showPreview ? "Show Code" : "Show Preview"}
      >
        {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
      </button>
      <button
        onClick={handleCopy}
        style={styles.button}
        title={isCopied ? "Copied!" : "Copy code"}
      >
        {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </button>
    </div>
  );

  // JSON View
  if (element.language === "json" && content) {
    try {
      const jsonData = JSON.parse(content);
      return (
        <div
          {...attributes}
          style={{
            ...styles.codeBlock,
            ...(showPreview ? styles.previewMode : {}),
          }}
        >
          {ActionButtons}
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
            <pre style={styles.pre}>{content}</pre>
          )}
        </div>
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
      <div
        {...attributes}
        style={{
          ...styles.codeBlock,
          ...(showPreview ? styles.previewMode : {}),
        }}
      >
        {ActionButtons}
        {showPreview ? (
          <div className="mermaid">{content}</div>
        ) : (
          <pre style={styles.pre}>{content}</pre>
        )}
      </div>
    );
  }

  // Default Code Block
  return (
    <div {...attributes} style={styles.codeBlock}>
      {ActionButtons}
      <pre style={styles.pre}>{children}</pre>
    </div>
  );
};
