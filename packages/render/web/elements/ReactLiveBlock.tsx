import React, { useState, useEffect } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

/**
 * 处理结果的类型定义
 */
type ProcessResult = {
  code: string | null;
  error: string | null;
};

/**
 * 代码预处理函数
 * @param rawCode 原始代码字符串
 */
const processCodeForLivePreview = (rawCode: string): ProcessResult => {
  if (!rawCode?.trim()) {
    return { code: null, error: null }; // 无代码，静默处理
  }

  // 1. 基础清理
  let processedCode = rawCode
    .replace(/import React(?:,?\s*{[^}]*})?\s*from\s*['"]react['"];?/g, "")
    .replace(/import\s*{\s*useTheme\s*}\s*from\s*['"]app\/theme['"];?/g, "")
    .replace(/export\s+default\s+\w+;?/g, "")
    .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
    .trim();

  // 2. 如果用户已包含 render()，直接使用
  if (processedCode.includes("render(")) {
    return { code: processedCode, error: null };
  }

  // 3. 智能查找最后一个定义的 React 组件名 (大写字母开头)
  const componentNameMatch = processedCode.match(
    /((?:function|const|class)\s+([A-Z]\w*)|(const\s+([A-Z]\w*)\s*=\s*\([^)]*\)\s*=>))/g
  );

  let componentNameToRender: string | null = null;
  if (componentNameMatch) {
    const lastMatch = componentNameMatch[componentNameMatch.length - 1];
    const nameMatch = lastMatch.match(/[A-Z]\w*/);
    if (nameMatch) {
      componentNameToRender = nameMatch[0];
    }
  }

  // 4. 如果找到组件，自动添加 render 调用
  if (componentNameToRender) {
    const finalCode = `${processedCode}\n\n// 为预览自动添加\nrender(<${componentNameToRender} />);`;
    return { code: finalCode, error: null };
  }

  // 5. 如果未找到，返回清晰的错误提示
  return {
    code: null,
    error:
      "无法自动预览: 未找到React组件。请确保代码中包含一个大写字母开头的组件，或手动调用 render()。",
  };
};

/**
 * 导出 live scope（保留 theme，用于让示例代码内部可以使用 theme）
 */
export const createLiveScope = (theme: any) => ({
  React,
  useState,
  useEffect,
  theme,
});

/**
 * ReactLiveBlock 组件
 * - 不再依赖 theme（全部使用全局 CSS 变量）
 */
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

  // 使用 CSS 变量的极简样式
  // 依赖的变量（在 :root 注入）：
  //   --backgroundGhost
  //   --space-4
  //   --errorGhost
  //   --error
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
        {/* 预处理阶段的错误 */}
        {previewState.error && (
          <div className="preview-error">{previewState.error}</div>
        )}

        {/* 仅当有可执行代码时，才渲染 LiveProvider */}
        {previewState.code && (
          <LiveProvider
            code={previewState.code}
            scope={liveScope}
            language={language === "tsx" ? "typescript" : "javascript"}
            enableTypeScript={language === "tsx"}
            noInline={true}
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
