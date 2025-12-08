// chat/messages/web/ToolMessageItem.tsx

import React, { useState, memo } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuCircleCheck,
  LuLoaderCircle,
  LuCopy,
  LuCheck,
  LuCode, // ✅ 用 LuCode 替代 LuCode2
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
  const {
    content,
    toolName,
    isStreaming = false,
    toolPayload, // 结构化工具调用快照
  } = message || {};

  const isPlan = toolName === "createPlan";

  // createPlan 默认折叠，其它工具默认展开
  const [collapsed, setCollapsed] = useState(isPlan);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const { t } = useTranslation("chat");

  const displayName = isPlan ? "Plan (createPlan)" : toolName || "System Tool";

  const fullContentString = getContentString(content);

  // 从 toolPayload 中拿状态（没有的话就退化为原来的简单逻辑）
  const statusFromPayload: string | undefined = toolPayload?.status;
  const isError = statusFromPayload === "failed";

  const statusClass = isStreaming ? "spinning" : isError ? "error" : "success";

  const tagLabel = (() => {
    if (isStreaming) return t("toolStatusRunning", "Running");
    if (statusFromPayload === "pending") {
      return t("toolStatusPending", "Pending");
    }
    if (statusFromPayload === "running") {
      return t("toolStatusRunning", "Running");
    }
    if (statusFromPayload === "succeeded") {
      return isPlan ? "Plan" : "Completed";
    }
    if (statusFromPayload === "failed") {
      return t("toolStatusFailed", "Failed");
    }
    // 没有 toolPayload 或 status 时的兼容逻辑
    return isPlan ? "Plan" : "Completed";
  })();

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
      onError: () => {
        toast.error(t("copyFailed"));
      },
    });
  };

  return (
    <>
      <div
        className={`tool-msg-wrapper ${
          collapsed ? "collapsed" : ""
        } ${isPlan ? "plan" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="tool-msg-inner">
          {/* Header */}
          <div
            className={`tool-header ${isPlan ? "is-plan" : ""}`}
            onClick={toggleCollapse}
          >
            <div className="tool-header-left">
              <span
                className={`tool-status-icon ${statusClass} ${
                  isPlan ? "plan-status" : ""
                }`}
              >
                {isStreaming ? (
                  <LuLoaderCircle size={14} />
                ) : (
                  <LuCircleCheck size={14} />
                )}
              </span>
              <span className={`tool-name ${isPlan ? "plan-name" : ""}`}>
                {displayName}
              </span>
              {!isStreaming && (
                <span
                  className={`tool-tag ${isPlan ? "plan-tag" : ""} ${
                    isError ? "error-tag" : ""
                  }`}
                >
                  {tagLabel}
                </span>
              )}
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
                  {/* 复制当前消息内容（面向用户 / AI 的文本） */}
                  <Tooltip content={t("copyContent")} placement="top">
                    <button
                      className={`mini-btn ${copied ? "active" : ""}`}
                      onClick={handleCopy}
                    >
                      {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                    </button>
                  </Tooltip>

                  {/* 调试信息：只有有 toolPayload 时才显示 */}
                  {toolPayload && (
                    <Tooltip
                      content={t(
                        "viewDebug",
                        "查看调试信息（原始输入 / 输出 / 错误）"
                      )}
                      placement="top"
                    >
                      <button
                        className={`mini-btn ${showDebug ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDebug((prev) => !prev);
                        }}
                      >
                        {/* ✅ 使用 LuCode */}
                        <LuCode size={14} />
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

          {/* Body：给普通用户 / 模型看的内容 */}
          <div className={`tool-body ${isPlan ? "plan-body" : ""}`}>
            <MessageContent
              content={content || ""}
              role="other" // ✅ 工具消息按「机器人」一侧渲染
              thinkContent={""}
              isStreaming={isStreaming}
            />
          </div>

          {/* Debug：给开发者看的结构化工具调用快照 */}
          {showDebug && toolPayload && (
            <div className="tool-debug">
              <details open>
                <summary>{t("debugInfo", "调试信息（工具调用快照）")}</summary>
                <pre>{JSON.stringify(toolPayload, null, 2)}</pre>
              </details>
            </div>
          )}
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
          overflow: visible;
        }

        .tool-msg-wrapper.plan .tool-msg-inner {
          border-color: var(--borderAccent, var(--primary));
          box-shadow: 0 0 0 1px var(--primaryGhost, rgba(22,119,255,0.08));
          background: linear-gradient(
            135deg,
            rgba(22,119,255,0.04),
            rgba(22,119,255,0.01)
          );
        }

        .tool-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          cursor: pointer;
          min-height: 32px;
        }

        .tool-header.is-plan {
          background: radial-gradient(
            circle at 0 0,
            rgba(22,119,255,0.15),
            transparent 55%
          );
        }

        .tool-header-left { display: flex; align-items: center; gap: 8px; }
        .tool-header-right { display: flex; align-items: center; gap: 8px; }

        .tool-status-icon.success { color: var(--success, #10B981); }
        .tool-status-icon.spinning { color: var(--primary); animation: spin 2s linear infinite; }
        .tool-status-icon.plan-status { color: var(--primary); }
        .tool-status-icon.error { color: var(--danger, #EF4444); }

        .tool-name {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--textSecondary);
        }
        .tool-name.plan-name { color: var(--primary); }

        .tool-tag {
          font-size: 10px;
          color: var(--textQuaternary);
          background: rgba(0,0,0,0.03);
          padding: 1px 5px;
          border-radius: 4px;
        }
        .tool-tag.plan-tag {
          color: var(--primaryDark, #0958D9);
          background: var(--primaryGhost, rgba(22,119,255,0.08));
          border: 1px solid var(--borderAccent, rgba(22,119,255,0.3));
        }
        .tool-tag.error-tag {
          color: var(--dangerDark, #B91C1C);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.4);
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

        .tool-body.plan-body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1.6;
          background: var(--background);
          color: var(--textSecondary);
        }

        .tool-msg-wrapper.collapsed .tool-body { display: none; }
        .tool-msg-wrapper.collapsed .tool-debug { display: none; }

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
        .mini-btn.active { color: var(--success, #10B981); }

        .tool-debug {
          padding: 8px 12px 10px;
          border-top: 1px dashed var(--borderLight);
          background: var(--background);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          color: var(--textQuaternary);
        }

        .tool-debug details summary {
          cursor: pointer;
          font-weight: 500;
          color: var(--textSecondary);
          margin-bottom: 4px;
        }

        .tool-debug pre {
          margin: 4px 0 0;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 260px;
          overflow: auto;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
});
