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

// 获取内容字符串
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
  variant = "default", // "default" | "tool" | "mini"
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { content, thinkContent, userId, dbKey, cybotKey, role } =
    message || {};
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [copied, setCopied] = React.useState(false);

  // 1. 复制功能（带状态反馈）
  const handleCopy = (e) => {
    e?.stopPropagation?.();
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

  // 2. 保存功能（已恢复完整逻辑）
  const handleSave = async (e) => {
    e?.stopPropagation?.();
    if (!user?.userId) return toast.error(t("userNotAuthenticated"));

    const str = content
      ? getContentString(content, thinkContent, showThinking)
      : "";
    if (!str) return toast.error(t("contentIsEmpty"));

    const key = `${DataType.PAGE}-${user.userId}-${ulid()}`;
    let title = key;

    // 尝试生成标题
    try {
      title =
        (await dispatch(
          runAgent({ cybotId: titleAgentId, content: str.substring(0, 2000) })
        ).unwrap()) || key;
    } catch {}

    // 写入数据库
    try {
      const saved = await dispatch(
        write({
          data: {
            content: str,
            slateData: markdownToSlate(str),
            type: DataType.PAGE,
            title,
            spaceId: currentSpaceId,
          },
          customKey: key,
        })
      ).unwrap();

      // 如果在空间中，关联到空间
      if (currentSpaceId) {
        await dispatch(
          addContentToSpace({
            contentKey: key,
            type: DataType.PAGE,
            spaceId: currentSpaceId,
            title,
          })
        ).unwrap();
      }

      toast.success(
        <div>
          {t("saveSuccess")}
          {saved?.dbKey && (
            <Link
              to={`/${saved.dbKey}`}
              target="_blank"
              style={{ marginLeft: "8px", color: "var(--primary)" }}
            >
              {t("clickHere")}
            </Link>
          )}
        </div>
      );
    } catch {
      toast.error(t("saveFailed"));
    }
  };

  // 3. 删除功能
  const handleDelete = (e) => {
    e?.stopPropagation?.();
    if (dbKey) {
      dispatch(deleteMessage(dbKey));
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(t("deleteFailed"));
    }
  };

  // 针对 Tool 消息，只保留复制和折叠等
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
    // Tool 模式下如果不希望在这里折叠（假设 Header 有了），可在这里过滤
    !isTool && {
      icon: isCollapsed ? ChevronRightIcon : ChevronDownIcon,
      handler: handleToggleCollapse,
      tooltip: isCollapsed ? t("expandMessage") : t("collapseMessage"),
      label: isCollapsed ? "展开" : "收起",
    },
  ].filter(Boolean);

  // --- 渲染分支 1: Tool / Mini 模式 (横向，极简) ---
  if (variant === "tool" || variant === "mini") {
    return (
      <>
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
        </div>
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
      </>
    );
  }

  // --- 渲染分支 2: 桌面端 (侧边栏悬浮) ---
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
                    className={`action-btn ${danger ? "danger" : ""} ${
                      active ? "active" : ""
                    }`}
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
            gap: 6px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            transform: translateX(${isRobot ? "-4px" : "4px"});
          }

          /* 悬停消息体时显示，或强制显示 */
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
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: var(--background);
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

  // --- 渲染分支 3: 移动端 (底部覆盖面板) - 已恢复完整代码 ---
  return (
    <>
      {showActions && (
        <div className="actions-overlay mobile">
          <div className="overlay-backdrop" onClick={handleToggleCollapse} />{" "}
          {/* 点击背景关闭 */}
          <div className="actions-panel">
            <div className="panel-header">
              <div className="panel-indicator" />
            </div>
            <div className="actions-grid">
              {actions.map(
                ({ icon: Icon, handler, label, danger, active }, i) => (
                  <button
                    key={i}
                    className={`action-item ${danger ? "danger" : ""} ${active ? "active" : ""}`}
                    onClick={(e) => {
                      handler(e);
                      // 移动端点击后通常希望面板关闭，具体视交互需求而定
                      // 这里暂不强制关闭，保持原版逻辑
                    }}
                  >
                    <div className="action-icon">
                      <Icon size={20} />
                    </div>
                    <span className="action-label">{label}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
      <style href="message-actions-mobile" precedence="high">{`
        /* 移动端覆盖式操作面板 */
        .actions-overlay.mobile {
          position: fixed; /* 改为 fixed 确保覆盖全屏 */
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          animation: overlayFadeIn 0.25s ease-out;
        }

        .overlay-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
        }

        .actions-panel {
          position: relative;
          width: 100%;
          background: var(--background);
          border-radius: var(--space-4) var(--space-4) 0 0;
          box-shadow: 0 -8px 32px var(--shadowHeavy);
          border: 1px solid var(--border);
          border-bottom: none;
          padding-bottom: env(safe-area-inset-bottom); /* 适配全面屏底部 */
          animation: panelSlideUp 0.25s ease-out;
        }

        .panel-header {
          display: flex;
          justify-content: center;
          padding: var(--space-3) 0 var(--space-2) 0;
        }

        .panel-indicator {
          width: 36px;
          height: 4px;
          background: var(--borderAccent);
          border-radius: 2px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: var(--space-2);
          padding: 0 var(--space-4) var(--space-5) var(--space-4);
        }

        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-2);
          background: transparent;
          border: none;
          border-radius: var(--space-3);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text);
        }

        .action-item:active {
          transform: scale(0.95);
          background: var(--backgroundHover);
        }

        .action-item.danger {
          color: var(--error);
        }
        
        .action-item.active {
          color: var(--success, #10B981);
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--backgroundSecondary);
          border-radius: 50%;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
        }

        .action-item:active .action-icon {
          background: var(--primaryGhost);
          border-color: var(--primary);
        }
        
        .action-item.active .action-icon {
          background: var(--successGhost, rgba(16, 185, 129, 0.1));
          border-color: var(--success, #10B981);
        }

        .action-item.danger:active .action-icon {
          background: rgba(239, 68, 68, 0.06);
          border-color: var(--error);
        }

        .action-label {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }

        /* 动画 */
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes panelSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
