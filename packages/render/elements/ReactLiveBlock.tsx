import React, { useState, useEffect } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

// --- Code Processing Helper (保持不变) ---
const processCodeForLivePreview = (rawCode: string): string | null => {
  if (!rawCode?.trim()) return null;

  // 1. Basic Cleanup
  let processedCode = rawCode
    .replace(/import React(?:,?\s*{[^}]*})?\s*from\s*['"]react['"];?/g, "")
    .replace(/import\s*{\s*useTheme\s*}\s*from\s*['"]app\/theme['"];?/g, "")
    .replace(/export\s+default\s+\w+;?/g, "")
    .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
    .trim();

  if (processedCode.includes("render(")) {
    return processedCode;
  }

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

  if (componentNameToRender) {
    return (
      processedCode +
      `\n\n// Auto-added for preview\nrender(<${componentNameToRender} />);`
    );
  }

  return null;
};

export const createLiveScope = (theme: any) => ({
  React,
  useState,
  useEffect,
  theme,
});

const ReactLiveBlock: React.FC<{
  rawCode: string;
  language: "jsx" | "tsx";
  theme: any;
  showPreview: boolean;
  liveScope: Record<string, unknown>;
  className?: string;
}> = ({ rawCode, language, theme, showPreview, liveScope, className }) => {
  const [processedCode, setProcessedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showPreview) return;

    try {
      const processed = processCodeForLivePreview(rawCode);
      setProcessedCode(processed);
      setError(processed ? null : "无法准备预览");
    } catch (e: any) {
      setError(e.message);
      setProcessedCode(null);
    }
  }, [showPreview, rawCode]);

  // --- 极简样式 ---
  const styles = `
    .live-preview { 
      padding: ${theme.space[4]}; 
      margin-top: ${theme.space[2]};
      background: ${theme.backgroundGhost};
    }
    .live-error { 
      padding: ${theme.space[3]}; 
      color: ${theme.error}; 
      font-size: 13px; 
    }
  `;

  if (!showPreview) return null;

  return (
    <>
      <style>{styles}</style>
      {processedCode ? (
        <LiveProvider
          code={processedCode}
          scope={liveScope}
          language={language === "tsx" ? "typescript" : "javascript"}
          enableTypeScript={language === "tsx"}
          noInline={true}
        >
          <div className={`live-preview ${className || ""}`}>
            <LivePreview />
            <LiveError className="live-error" />
          </div>
        </LiveProvider>
      ) : (
        error && <div className={`live-error ${className || ""}`}>{error}</div>
      )}
    </>
  );
};

export default ReactLiveBlock;
