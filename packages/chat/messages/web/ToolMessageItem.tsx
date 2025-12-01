// ToolMessageItem.tsx

import React, { useState, memo } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SyncIcon,
} from "@primer/octicons-react";
import { MessageActions } from "./MessageActions";
import { MessageContent } from "./MessageItem";

interface ToolMessageProps {
  message: any;
}

export const ToolMessageItem = memo(({ message }: ToolMessageProps) => {
  const [collapsed, setCollapsed] = useState(true); // Tool 默认折叠通常体验更好，你可以改为 false
  const [isHovered, setIsHovered] = useState(false);

  const { content, toolName, id, isStreaming = false } = message || {};

  const displayName = toolName || "System Tool";

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  return (
    <>
      <div
        className={`tool-msg-wrapper ${collapsed ? "collapsed" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="tool-msg-inner">
          {/* Header */}
          <div className="tool-header" onClick={toggleCollapse}>
            <div className="tool-header-left">
              <span
                className={`tool-status-icon ${isStreaming ? "spinning" : "success"}`}
              >
                {isStreaming ? (
                  <SyncIcon size={14} />
                ) : (
                  <CheckCircleIcon size={14} />
                )}
              </span>
              <span className="tool-name">{displayName}</span>
              {!isStreaming && <span className="tool-tag">Completed</span>}
            </div>

            <div className="tool-header-right">
              {/* 
                   Action Bar: 
                   1. 只有当不流式传输且鼠标悬停(或展开)时才显示复制按钮，保持界面极简。
                   2. 或者一直显示，看偏好。这里设为 hover 显示复制，一直显示折叠。
                */}
              <div
                className={`tool-actions ${isHovered || !collapsed ? "visible" : ""}`}
              >
                <MessageActions
                  message={message}
                  isRobot={true}
                  isSelf={false}
                  isCollapsed={collapsed}
                  handleToggleCollapse={() => {}} // Tool 自带 Header 点击折叠，这里不需要传
                  showActions={true}
                  variant="tool" // 使用新的 mini 模式
                />
              </div>

              <button className="collapse-btn">
                {collapsed ? (
                  <ChevronRightIcon size={14} />
                ) : (
                  <ChevronDownIcon size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="tool-body">
            <MessageContent
              content={content || ""}
              role="tool"
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      <style href="tool-message-item" precedence="high">{`
        /* ... (保留之前的布局样式: margin-left, width 等) ... */
        .tool-msg-wrapper {
          position: relative;
          margin-bottom: var(--space-2);
          padding-right: var(--space-4);
          width: 100%;
        }
        @media (min-width: 768px) {
          .tool-msg-wrapper {
            margin-left: 56px;
            max-width: calc(95% - 56px);
          }
        }
        
        .tool-msg-inner {
          background: var(--backgroundSecondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: visible; /* 允许 Tooltip 溢出 */
        }

        .tool-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px; /* 更紧凑 */
          cursor: pointer;
          min-height: 32px;
        }

        .tool-header-left { display: flex; align-items: center; gap: 8px; }
        .tool-header-right { display: flex; align-items: center; gap: 8px; }

        .tool-status-icon.success { color: var(--success, #10B981); }
        .tool-status-icon.spinning { color: var(--primary); animation: spin 2s linear infinite; }
        
        .tool-name {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--textSecondary);
        }
        
        .tool-tag {
           font-size: 10px;
           color: var(--textQuaternary);
           background: rgba(0,0,0,0.03);
           padding: 1px 5px;
           border-radius: 4px;
        }

        .tool-actions {
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }
        .tool-actions.visible {
            opacity: 1;
            pointer-events: auto;
        }

        .collapse-btn {
            background: none;
            border: none;
            color: var(--textQuaternary);
            padding: 2px;
            display: flex;
            cursor: pointer;
        }
        .collapse-btn:hover { color: var(--text); }

        .tool-body {
          padding: 10px 12px;
          font-size: 12px;
          border-top: 1px solid var(--borderLight);
          background: var(--backgroundGhost);
          color: var(--textTertiary);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        
        .tool-msg-wrapper.collapsed .tool-body {
            display: none;
        }
        .tool-msg-wrapper.collapsed .tool-msg-inner {
            border-bottom-color: var(--border);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
});
