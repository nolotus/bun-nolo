import React, { useState, useEffect } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

// --- Code Processing Helper ---
const processCodeForLivePreview = (rawCode: string): string | null => {
  if (!rawCode?.trim()) return null;

  // 1. Basic Cleanup
  let processedCode = rawCode
    .replace(/import React(?:,?\s*{[^}]*})?\s*from\s*['"]react['"];?/g, "")
    .replace(/import\s*{\s*useTheme\s*}\s*from\s*['"]app\/theme['"];?/g, "")
    .replace(/export\s+default\s+\w+;?/g, "")
    .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
    .trim();

  // Check if render() call already exists
  if (processedCode.includes("render(")) {
    return processedCode;
  }

  // 2. Identify Component Name
  const componentNameMatch = processedCode.match(
    /(?:function|const|class)\s+([A-Z]\w*)|React\.forwardRef\s*<[^>]*,\s*([^>]*)>\s*\(\s*({?[\s\S]*?}?)\s*,\s*ref\s*\)/g
  );

  let componentNameToRender: string | null = null;

  if (componentNameMatch && componentNameMatch.length > 0) {
    const lastMatch = componentNameMatch[componentNameMatch.length - 1];
    let name: string | undefined;

    const funcClassConstMatch = lastMatch.match(
      /(?:function|const|class)\s+([A-Z]\w*)/
    );

    if (funcClassConstMatch && funcClassConstMatch[1]) {
      name = funcClassConstMatch[1];
    } else {
      const displayNameMatch = processedCode.match(
        /(\w+)\.displayName\s*=\s*['"](\w+)['"];/
      );
      if (displayNameMatch && displayNameMatch[1] === displayNameMatch[2]) {
        name = displayNameMatch[1];
      }
    }

    if (name) {
      componentNameToRender = name;
    }
  }

  // 3. Append render call if component identified
  if (componentNameToRender) {
    return (
      processedCode +
      `\n\n// Auto-added for preview\nrender(<${componentNameToRender} />);`
    );
  }

  return null;
};

// --- Create Live Scope Helper ---
export const createLiveScope = (theme: any) => ({
  React,
  useState,
  useEffect,
  theme,
  LoadingSpinner: () => (
    <svg
      style={{ animation: "spin 0.8s linear infinite", marginRight: "2px" }}
      width="1em"
      height="1em"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.2"
      />
      <path
        d="M13 7A6 6 0 111 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
});

// --- Types ---
interface ReactLiveBlockProps {
  rawCode: string;
  language: "jsx" | "tsx";
  theme: any;
  showPreview: boolean;
  liveScope: Record<string, unknown>;
  codeBlockPadding: string;
  className?: string;
}

// --- ReactLiveBlock Component ---
const ReactLiveBlock: React.FC<ReactLiveBlockProps> = ({
  rawCode,
  language,
  theme,
  showPreview,
  liveScope,
  codeBlockPadding,
  className,
}) => {
  const [processedCode, setProcessedCode] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // --- Process Code Effect ---
  useEffect(() => {
    if (showPreview) {
      try {
        const processed = processCodeForLivePreview(rawCode);
        setProcessedCode(processed);
        setProcessingError(
          processed === null && rawCode?.trim()
            ? "无法自动准备预览。请确认组件定义或包含render()调用。"
            : null
        );
      } catch (error: any) {
        console.error("处理代码出错:", error);
        setProcessingError(`准备预览失败: ${error.message}`);
        setProcessedCode(null);
      }
    } else {
      setProcessedCode(null);
      setProcessingError(null);
    }
  }, [showPreview, rawCode]);

  // --- Styles ---
  const commonStyles = `
  .preview-container {
    /* 保持足够的顶部内边距 */
    padding: ${theme?.space?.[10] || "40px"} ${codeBlockPadding} ${codeBlockPadding} ${codeBlockPadding};
    background: ${theme?.backgroundGhost || "rgba(249, 250, 251, 0.97)"};
    border-radius: ${theme?.space?.[1] || "4px"};
    margin-top: ${theme?.space?.[2] || "8px"};
    border: 1px dashed ${theme?.border || "#E5E7EB"};
    min-height: 50px;
    min-width: 280px; /* 默认最小宽度 */
  }

  /* 响应式设计：根据屏幕尺寸调整最小宽度 */
  @media (min-width: 768px) {
    .preview-container {
      min-width: 400px; /* 中等屏幕（如平板）的最小宽度 */
    }
  }

  @media (min-width: 1024px) {
    .preview-container {
      min-width: 600px; /* 大屏幕（如桌面）的最小宽度 */
    }
  }

  @media (min-width: 1440px) {
    .preview-container {
      min-width: 800px; /* 超大屏幕的最小宽度 */
    }
  }

  @media (max-width: 480px) {
    .preview-container {
      min-width: 250px; /* 小屏幕（如手机）的最小宽度 */
    }
  }

  .error-message {
    padding: ${codeBlockPadding};
    background-color: ${theme?.mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FFF5F5"};
    color: ${theme?.error || "#EF4444"};
    border: 1px solid ${theme?.mode === "dark" ? "rgba(239, 68, 68, 0.3)" : "#FED7D7"};
    border-radius: ${theme?.space?.[1] || "4px"};
    margin-top: ${theme?.space?.[2] || "8px"};
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 13px;
  }
  
  .loading-message {
    padding: ${codeBlockPadding};
    text-align: center;
    color: ${theme?.textSecondary || "#374151"};
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
  // --- Render Logic ---
  if (!showPreview) {
    return null; // 非预览模式下不渲染任何内容，交给外部处理
  }

  if (processedCode) {
    return (
      <>
        <style>{commonStyles}</style>
        <LiveProvider
          code={processedCode}
          scope={liveScope}
          language={language === "tsx" ? "typescript" : "javascript"}
          enableTypeScript={language === "tsx"}
          noInline={true}
        >
          <div className={`preview-container ${className || ""}`}>
            <LivePreview />
            <LiveError className="error-message" />
          </div>
        </LiveProvider>
      </>
    );
  }

  if (processingError) {
    return (
      <>
        <style>{commonStyles}</style>
        <div className={`error-message ${className || ""}`}>
          <strong>预览错误:</strong> {processingError}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{commonStyles}</style>
      <div className={`loading-message ${className || ""}`}>
        正在准备预览...
      </div>
    </>
  );
};

export default ReactLiveBlock;
