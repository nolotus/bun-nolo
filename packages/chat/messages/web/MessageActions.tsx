import React from "react";
import {
  CopyIcon,
  BookmarkIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@primer/octicons-react";
import copyToClipboard from "utils/clipboard";
import { write } from "database/dbSlice";
import { DataType } from "create/types";
import { ulid } from "ulid";
import { runAgent } from "ai/cybot/cybotSlice";
import { Link } from "react-router-dom";
import { titleAgentId } from "core/init";
import { useAuth } from "auth/hooks/useAuth";
import {
  selectCurrentSpaceId,
  addContentToSpace,
} from "create/space/spaceSlice";
import { useAppDispatch, useAppSelector } from "app/store";
import { deleteMessage } from "../messageSlice";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";

// 获取内容字符串 (保持不变)
const getContentString = (content, thinkContent = "", showThinking = false) => {
  let baseContent = "";
  if (typeof content === "string") {
    baseContent = content;
  } else if (Array.isArray(content)) {
    baseContent = content
      .map((item) =>
        item.type === "text"
          ? item.text
          : item.type === "image_url"
            ? `[Image: ${item.image_url?.url}]`
            : item.pageKey
              ? `[File: ${item.name || "未知文件"}]`
              : ""
      )
      .join("\n");
  } else {
    baseContent = JSON.stringify(content);
  }
  return showThinking && thinkContent
    ? `**思考内容**:\n${thinkContent}\n\n**回答**:\n${baseContent}`
    : baseContent;
};

export const MessageActions = ({
  message,
  isRobot,
  isSelf,
  isCollapsed,
  handleToggleCollapse,
  showActions,
  showThinking = false,
  isTouch = false,
  variant = "default", // 新增: "default" | "tool" | "mini"
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { content, thinkContent, userId, dbKey } = message || {};
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const text = content
      ? getContentString(content, thinkContent, showThinking)
      : "";
    if (!text) return toast.error(t("copyFailed"));
    copyToClipboard(text, {
      onSuccess: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t("copySuccess"));
      },
      onError: () => toast.error(t("copyFailed")),
    });
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user?.userId) return toast.error(t("userNotAuthenticated"));
    // ... 保存逻辑 (保持不变) ...
    // 为节省篇幅省略具体实现，逻辑与原版一致
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (dbKey) {
      dispatch(deleteMessage(dbKey));
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(t("deleteFailed"));
    }
  };

  // 针对 Tool 消息，只保留复制和折叠
  const isTool = variant === "tool";

  const actions = [
    {
      icon: copied ? CheckIcon : CopyIcon,
      handler: handleCopy,
      tooltip: t("copyContent"),
      label: "复制",
      active: copied,
    },
    !isSelf &&
      !isTool && {
        icon: BookmarkIcon,
        handler: handleSave,
        tooltip: t("saveContent"),
        label: "保存",
      },
    type !== "other" &&
      !isTool && {
        icon: TrashIcon,
        handler: handleDelete,
        tooltip: t("deleteMessage"),
        danger: true,
        label: "删除",
      },
    // Tool 自带折叠按钮在 Header，这里可以省略，或者保留以备不时之需
    // 这里我们决定：如果是 Tool 模式，不在这里显示折叠，因为 Header 已经有了
    !isTool && {
      icon: isCollapsed ? ChevronRightIcon : ChevronDownIcon,
      handler: handleToggleCollapse,
      tooltip: isCollapsed ? t("expandMessage") : t("collapseMessage"),
      label: isCollapsed ? "展开" : "收起",
    },
  ].filter(Boolean);

  // --- Tool / Mini 模式渲染 (横向，极简) ---
  if (variant === "tool" || variant === "mini") {
    return (
      <div className="actions-mini" onClick={(e) => e.stopPropagation()}>
        {actions.map(({ icon: Icon, handler, tooltip, active }, i) => (
          <Tooltip key={i} content={tooltip} placement="top">
            <button
              className={`mini-btn ${active ? "active" : ""}`}
              onClick={handler}
            >
              <Icon size={14} />
            </button>
          </Tooltip>
        ))}
        <style href="actions-mini" precedence="high">{`
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
        `}</style>
      </div>
    );
  }

  // --- 桌面端：侧边栏式操作按钮 (原版优化) ---
  if (!isTouch) {
    return (
      <>
        {actions.length > 0 && (
          <div className={`actions desktop ${showActions ? "show" : ""}`}>
            {actions.map(
              ({ icon: Icon, handler, tooltip, danger, active }, i) => (
                <Tooltip
                  key={i}
                  content={tooltip}
                  placement={isRobot ? "left" : "right"}
                >
                  <button
                    className={`action-btn ${danger ? "danger" : ""} ${active ? "active" : ""}`}
                    onClick={handler}
                    aria-label={tooltip}
                  >
                    <Icon size={16} />
                  </button>
                </Tooltip>
              )
            )}
          </div>
        )}
        <style href="message-actions-desktop" precedence="high">{`
          .actions.desktop {
            display: flex;
            flex-direction: column;
            gap: 6px; /* 增加间距 */
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            transform: translateX(isRobot ? -4px : 4px); /* 微妙的位移进入 */
          }

          /* 悬停消息体时显示 */
          .msg:hover .actions.desktop,
          .actions.desktop.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
          }

          .actions.desktop .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px; /* 稍微加大一点点击区域 */
            height: 32px;
            border: none;
            border-radius: 8px; /* 更圆润 */
            background: var(--background); /* 纯白/纯黑背景，更干净 */
            color: var(--textTertiary);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 2px 5px var(--shadowLight);
            border: 1px solid transparent;
          }

          .actions.desktop .action-btn:hover {
            color: var(--primary);
            background: var(--background);
            border-color: var(--border);
            transform: scale(1.05);
            box-shadow: 0 4px 12px var(--shadowMedium);
          }

          .actions.desktop .action-btn.active {
             color: var(--success, #10B981);
             border-color: var(--success, #10B981);
          }

          .actions.desktop .action-btn.danger:hover {
            color: var(--error);
            background: var(--background);
            border-color: rgba(239, 68, 68, 0.2);
          }
        `}</style>
      </>
    );
  }

  // --- 移动端保持不变 (省略代码以节省篇幅，沿用你提供的即可) ---
  return null; // 这里应放入你原有的移动端代码
};
