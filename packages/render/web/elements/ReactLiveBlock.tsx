import React, { useState, useEffect } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

type ProcessResult = {
  code: string | null;
  error: string | null;
};

const wrapWithTemplate = (processedCode: string): ProcessResult => {
  // 仅需确认代码中包含顶层 Example 定义
  if (!/function\s+Example\s*\(/.test(processedCode)) {
    return {
      code: null,
      error:
        "无法自动预览：未检测到顶层组件 `function Example() { ... }`。请按提示词输出该组件。",
    };
  }

  const finalCode = `${processedCode}

// 系统统一渲染 Example 组件
render(<Example />);
`;
  return { code: finalCode, error: null };
};

const sanitizeCode = (rawCode: string): string =>
  rawCode
    .replace(/import React(?:,?\s*{[^}]*})?\s*from\s*['"]react['"];?/g, "")
    .replace(/export\s+default\s+\w+;?/g, "")
    .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
    .trim();

const processCodeForLivePreview = (rawCode: string): ProcessResult => {
  if (!rawCode?.trim()) return { code: null, error: null };
  const processedCode = sanitizeCode(rawCode);
  if (processedCode.includes("render(")) {
    return {
      code: processedCode,
      error:
        "请勿手动调用 render()。只需要定义 `function Example()`，系统会自动渲染。",
    };
  }
  return wrapWithTemplate(processedCode);
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
  showPreview: boolean;
  liveScope: Record<string, unknown>;
  className?: string;
}> = ({ rawCode, language, showPreview, liveScope, className }) => {
  const [previewState, setPreviewState] = useState<ProcessResult>({
    code: null,
    error: null,
  });

  useEffect(() => {
    if (showPreview) {
      setPreviewState(processCodeForLivePreview(rawCode));
    }
  }, [showPreview, rawCode]);

  const styles = `
    .live-preview-wrapper {
      background: var(--backgroundGhost);
    }
    .live-preview-content {
      padding: var(--space-4);
      min-height: 100px;
    }
    .live-error, .preview-error {
      padding: var(--space-4);
      background: var(--errorGhost);
      color: var(--error);
      font-size: 13px;
      font-family: monospace;
      line-height: 1.5;
    }
  `;

  if (!showPreview) return null;

  return (
    <>
      <style>{styles}</style>
      <div className={`live-preview-wrapper ${className || ""}`}>
        {previewState.error && (
          <div className="preview-error">{previewState.error}</div>
        )}

        {previewState.code && (
          <LiveProvider
            code={previewState.code}
            scope={liveScope}
            language={language === "tsx" ? "typescript" : "javascript"}
            enableTypeScript={language === "tsx"}
            noInline
          >
            <div className="live-preview-content">
              <LivePreview />
              <LiveError className="live-error" />
            </div>
          </LiveProvider>
        )}
      </div>
    </>
  );
};

export default ReactLiveBlock;
