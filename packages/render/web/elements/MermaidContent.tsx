import React, { useEffect, useMemo } from "react";
import mermaid from "mermaid";
import { useTheme } from "app/theme"; // 假设路径正确

// --- Mermaid Initialization (最佳实践是移到应用入口) ---
try {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "default", // 考虑根据应用主题动态设置
    // theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
  });
} catch (e) {
  console.error("Failed to initialize Mermaid:", e);
}

const MermaidContent = ({
  elementId,
  content,
  showPreview,
  isCollapsed,
  children, // 用于显示原始代码
  theme, // 传递 theme 对象
  codeBlockPadding, // 传递内边距
}) => {
  // --- Mermaid Rendering Effect ---
  useEffect(() => {
    // 仅在预览模式、非折叠状态下运行
    if (showPreview && !isCollapsed) {
      const mermaidContainer = document.getElementById(`mermaid-${elementId}`);
      if (
        mermaidContainer &&
        mermaidContainer.getAttribute("data-processed") !== "true"
      ) {
        try {
          // 清空容器以防重复渲染（如果 run 不清空）
          mermaidContainer.innerHTML = content; // 将 Mermaid 代码放入容器
          mermaidContainer.removeAttribute("data-processed"); // 重置状态

          // 使用 mermaid.run() 进行渲染
          mermaid.run({
            nodes: [mermaidContainer],
          });
          // 不需要 mermaid.contentLoaded()，因为我们手动指定了节点

          // 设置 data-processed 防止重复处理（虽然 run 可能内部处理了）
          // mermaidContainer.setAttribute("data-processed", "true");
        } catch (e) {
          console.error("Error rendering Mermaid diagram:", e);
          // 可以在容器内显示错误信息
          mermaidContainer.innerHTML = `<pre>Error rendering Mermaid diagram:\n${e.message}\n\n${content}</pre>`;
          mermaidContainer.style.color = theme?.error || "red"; // 使用主题错误颜色
          mermaidContainer.style.background = theme?.background || "#fff";
          mermaidContainer.style.padding = codeBlockPadding;
          mermaidContainer.style.display = "block"; // 确保错误可见
          mermaidContainer.style.textAlign = "left";
        }
      }
    }
  }, [showPreview, isCollapsed, content, elementId, theme, codeBlockPadding]); // 添加 theme 和 padding 到依赖

  // --- Styles ---
  // 将 Mermaid 相关样式移到这里
  const mermaidStyles = `
    .mermaid-container-${elementId} { /* 使用唯一类名或 ID */
      /* 样式应用在外部容器，内部 mermaid div 由 useEffect 控制 */
    }

    .mermaid { /* 这是 mermaid.run 生成的 SVG 的默认类，或者我们包裹的 div */
        display: ${isCollapsed ? "none" : "flex"};
        justify-content: center; /* Center the diagram */
        align-items: center;
        padding: ${codeBlockPadding}; /* Add some padding around the diagram */
        /* 背景色很重要，因为 SVG 可能是透明的 */
        background: ${theme?.mode === "dark" ? theme.background : "#FFFFFF"};
        border-radius: ${theme?.space?.[1] || "4px"};
        min-height: 100px; /* Ensure some space for rendering */
        line-height: 1; /* 避免继承父级的 line-height 导致多余空间 */
        overflow: auto; /* 如果图表过大，允许滚动 */
    }

    .mermaid svg {
      max-width: 100%; /* Ensure diagram scales down */
      height: auto; /* Maintain aspect ratio */
      display: block; /* 修复可能的底部空隙 */
    }

    /* Prism code view styles (when preview is off) */
    .code-content.language-mermaid {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme?.text || "#1F2937"};
      overflow-x: auto;
      display: ${isCollapsed ? "none" : "block"};
    }
  `;

  return (
    <>
      <style>{mermaidStyles}</style>
      {/* 根据 showPreview 和 isCollapsed 决定渲染内容 */}
      {!isCollapsed && showPreview ? (
        // Mermaid 图表容器
        <div
          id={`mermaid-${elementId}`} // 唯一的 ID 用于 useEffect 定位
          className={`mermaid mermaid-container-${elementId}`} // 添加唯一类名便于样式隔离
          data-processed="false" // 初始状态
        >
          {/* 内容将在 useEffect 中填充 */}
          {/* 初始可以放一个加载指示器 */}
          Loading diagram...
        </div>
      ) : (
        // 原始 Mermaid 代码（使用 PrismJS 高亮）
        !isCollapsed && (
          <pre className={`code-content language-mermaid`}>
            <code>{children}</code>
          </pre>
        )
      )}
    </>
  );
};

export default MermaidContent;
