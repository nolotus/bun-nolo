import React, { useState, memo } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SyncIcon,
  CopyIcon,
  CheckIcon,
} from "@primer/octicons-react";
import { MessageContent } from "./MessageItem";
import { Tooltip } from "render/web/ui/Tooltip";
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ToolMessageProps {
  message: any;
}

// 简化版：把 tool message 的内容转成纯文本，用于复制
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

  // 兜底：JSON pretty print
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
};

export const ToolMessageItem = memo(({ message }: ToolMessageProps) => {
  const [collapsed, setCollapsed] = useState(true); // Tool 默认折叠
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const { t } = useTranslation("chat");

  const { content, toolName, isStreaming = false } = message || {};
  const displayName = toolName || "System Tool";

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed((prev) => !prev);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = getContentString(content);
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
      onError: () => {
        toast.error(t("copyFailed"));
      },
    });
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
                className={`tool-status-icon ${
                  isStreaming ? "spinning" : "success"
                }`}
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
              {/* 内联的极简操作栏：目前只保留复制 */}
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
                      {copied ? (
                        <CheckIcon size={14} />
                      ) : (
                        <CopyIcon size={14} />
                      )}
                    </button>
                  </Tooltip>
                </div>
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

        /* 极简工具栏样式，直接搬运自 MessageActions 的 mini 样式 */
        .actions-mini {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px;
          box-shadow: 0 2px 4px var(--shadowLight);
        }
        .mini-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--textTertiary);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mini-btn:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }
        .mini-btn.active {
          color: var(--success, #10B981);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
});
