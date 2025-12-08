// chat/messages/web/ToolMessageItem.tsx

import React, { useState, memo } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuCircleCheck,
  LuLoaderCircle,
  LuCopy,
  LuCheck,
  LuCode,
  LuWrench,
} from "react-icons/lu";
import { MessageContent } from "./MessageItem";
import { Tooltip } from "render/web/ui/Tooltip";
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ToolMessageProps {
  message: any;
}

const getContentString = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item?.type === "text") return item.text;
        if (item?.type === "image_url")
          return `[Image: ${item.image_url?.url}]`;
        if (item?.pageKey) return `[File: ${item.name || "未知文件"}]`;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
};

export const ToolMessageItem = memo(({ message }: ToolMessageProps) => {
  const { content, toolName, isStreaming = false, toolPayload } = message || {};

  const isPlan = toolName === "createPlan";
  const [collapsed, setCollapsed] = useState(isPlan);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const { t } = useTranslation("chat");
  const displayName = isPlan ? "Plan" : toolName || "Tool";
  const fullContentString = getContentString(content);
  const statusFromPayload: string | undefined = toolPayload?.status;
  const isError = statusFromPayload === "failed";
  const statusClass = isStreaming ? "spinning" : isError ? "error" : "success";

  const renderStatusIcon = () => {
    if (isStreaming)
      return <LuLoaderCircle size={14} className="animate-spin" />;
    if (isError) return <LuCircleCheck size={14} />; // 失败也可暂用叉号或感叹号，这里保持一致风格
    if (isPlan) return <LuWrench size={14} />;
    return <LuCircleCheck size={14} />;
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((prev) => !prev);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = fullContentString;
    if (!text) {
      toast.error(t("copyFailed"));
      return;
    }
    copyToClipboard(text, {
      onSuccess: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t("copySuccess"));
      },
      onError: () => toast.error(t("copyFailed")),
    });
  };

  return (
    <>
      <div
        className={`tool-msg-wrapper ${collapsed ? "collapsed" : ""} ${
          isError ? "error" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="tool-msg-inner">
          {/* Header 也可以点击折叠 */}
          <div className="tool-header" onClick={toggleCollapse}>
            <div className="tool-header-left">
              {/* 纯图标状态指示，更极简 */}
              <span className={`tool-icon ${statusClass}`}>
                {renderStatusIcon()}
              </span>

              <span className="tool-name">
                {isPlan ? "Thinking Plan" : `Use Tool: ${displayName}`}
              </span>

              {isError && <span className="error-badge">Failed</span>}
            </div>

            <div className="tool-header-right">
              <div
                className={`tool-actions ${
                  isHovered || !collapsed ? "visible" : ""
                }`}
              >
                <div
                  className="actions-mini"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip content={t("copyContent")} placement="top">
                    <button
                      className={`mini-btn ${copied ? "active" : ""}`}
                      onClick={handleCopy}
                    >
                      {copied ? <LuCheck size={13} /> : <LuCopy size={13} />}
                    </button>
                  </Tooltip>

                  {toolPayload && (
                    <Tooltip content="Debug Info" placement="top">
                      <button
                        className={`mini-btn ${showDebug ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDebug((prev) => !prev);
                        }}
                      >
                        <LuCode size={13} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              <button className="collapse-btn">
                {collapsed ? (
                  <LuChevronRight size={14} />
                ) : (
                  <LuChevronDown size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="tool-body">
            <MessageContent
              content={content || ""}
              role="other"
              thinkContent={""}
              isStreaming={isStreaming}
            />
          </div>

          {/* Debug */}
          {showDebug && toolPayload && (
            <div className="tool-debug">
              <pre>{JSON.stringify(toolPayload, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <style href="tool-message-item" precedence="high">{`
        .tool-msg-wrapper {
          position: relative;
          margin-bottom: 6px;
          /* 核心视觉改动：不再全宽背景，而是左侧细条，且不强行缩进太多 */
          width: 100%;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .tool-msg-inner {
          /* 极简风格：透明背景，左侧 accent border */
          background: transparent;
          border-left: 2px solid var(--border);
          padding-left: 12px;
          transition: border-color 0.2s;
        }

        /* 鼠标悬停加深左侧线条，增加交互感 */
        .tool-msg-wrapper:hover .tool-msg-inner {
          border-left-color: var(--primary);
        }
        
        /* 错误状态红色线条 */
        .tool-msg-wrapper.error .tool-msg-inner {
          border-left-color: var(--danger, #EF4444);
        }

        .tool-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 0;
          cursor: pointer;
          min-height: 28px;
          user-select: none;
        }

        .tool-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--textSecondary);
        }

        .tool-icon {
          display: flex;
          align-items: center;
          color: var(--textTertiary);
        }
        .tool-icon.spinning { color: var(--primary); }
        .tool-icon.error { color: var(--danger); }

        .tool-name {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.9;
        }
        
        .error-badge {
          font-size: 10px;
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          padding: 1px 4px;
          border-radius: 4px;
        }

        .tool-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .collapse-btn {
          background: none;
          border: none;
          color: var(--textQuaternary);
          padding: 2px;
          display: flex;
          cursor: pointer;
          transition: color 0.15s;
        }
        .collapse-btn:hover { color: var(--text); }

        /* 内容区域 */
        .tool-body {
          padding-top: 4px;
          padding-bottom: 4px;
          font-size: 13px;
          color: var(--textSecondary);
          /* 与 Header 保持一致的字体 */
          font-family: inherit;
        }

        .tool-msg-wrapper.collapsed .tool-body { display: none; }
        .tool-msg-wrapper.collapsed .tool-debug { display: none; }

        /* Actions 悬浮显示 */
        .tool-actions {
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .tool-actions.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .actions-mini {
          display: flex;
          align-items: center;
          gap: 2px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px;
        }
        
        .mini-btn {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--textTertiary);
          border-radius: 3px;
          cursor: pointer;
        }
        .mini-btn:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .tool-debug {
          margin-top: 6px;
          background: var(--backgroundSecondary);
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
          color: var(--textTertiary);
          overflow: auto;
          max-height: 200px;
        }
        
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
});
