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
 * 优化后的代码处理函数 (保持不变)
 * @param rawCode 原始代码字符串
 * @returns 一个包含处理后代码或错误信息的对象
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

  // 3. 智能查找最后一个定义的React组件名 (大写字母开头)
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
 * 导出 live scope
 */
export const createLiveScope = (theme: any) => ({
  React,
  useState,
  useEffect,
  theme,
});

/**
 * 优化和整理后的 ReactLiveBlock 组件
 */
const ReactLiveBlock: React.FC<{
  rawCode: string;
  language: "jsx" | "tsx";
  theme: any;
  showPreview: boolean;
  liveScope: Record<string, unknown>;
  className?: string;
}> = ({ rawCode, language, theme, showPreview, liveScope, className }) => {
  const [previewState, setPreviewState] = useState<ProcessResult>({
    code: null,
    error: null,
  });

  useEffect(() => {
    if (showPreview) {
      setPreviewState(processCodeForLivePreview(rawCode));
    }
  }, [showPreview, rawCode]);

  // --- 极简样式 ---
  const styles = `
    .live-preview-wrapper {
      /* 预览区域的背景色，用于和页面背景区分 */
      background: ${theme.backgroundGhost};
    }
    .live-preview-content { 
      /* 内容的内边距，给预览组件留出呼吸空间 */
      padding: ${theme.space[4]};
      min-height: 100px; /* 保留一个较小的最小高度 */
    }
    .live-error, .preview-error { 
      /* 错误信息的内边距 */
      padding: ${theme.space[4]};
      /* 错误信息的背景和文字颜色 */
      background: ${theme.errorGhost};
      color: ${theme.error}; 
      font-size: 13px;
      font-family: monospace;
      line-height: 1.5;
    }
  `;

  if (!showPreview) {
    return null;
  }

  return (
    <>
      <style>{styles}</style>
      <div className={`live-preview-wrapper ${className || ""}`}>
        {/* 优先显示预处理阶段的错误 */}
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
