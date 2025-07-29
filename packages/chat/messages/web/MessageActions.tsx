// MessageActions.tsx - 设备感知版本

import {
  CopyIcon,
  BookmarkIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
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
  isTouch = false, // 新增 props
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { content, thinkContent, userId, dbKey, cybotKey, role } =
    message || {};
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  const handleCopy = () => {
    const text = content
      ? getContentString(content, thinkContent, showThinking)
      : "";
    if (!text) return toast.error(t("copyFailed"));
    copyToClipboard(text, {
      onSuccess: () => toast.success(t("copySuccess")),
      onError: () => toast.error(t("copyFailed")),
    });
  };

  const handleSave = async () => {
    if (!user?.userId) return toast.error(t("userNotAuthenticated"));

    const str = content
      ? getContentString(content, thinkContent, showThinking)
      : "";
    if (!str) return toast.error(t("contentIsEmpty"));

    const key = `${DataType.PAGE}-${user.userId}-${ulid()}`;
    let title = key;

    try {
      title =
        (await dispatch(
          runAgent({ cybotId: titleAgentId, content: str.substring(0, 2000) })
        ).unwrap()) || key;
    } catch {}

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

  const handleDelete = () => {
    if (dbKey) {
      dispatch(deleteMessage(dbKey));
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(t("deleteFailed"));
    }
  };

  const actions = [
    { icon: CopyIcon, handler: handleCopy, tooltip: t("copyContent") },
    !isSelf && {
      icon: BookmarkIcon,
      handler: handleSave,
      tooltip: t("saveContent"),
    },
    type !== "other" && {
      icon: TrashIcon,
      handler: handleDelete,
      tooltip: t("deleteMessage"),
      danger: true,
    },
    {
      icon: isCollapsed ? ChevronRightIcon : ChevronDownIcon,
      handler: handleToggleCollapse,
      tooltip: isCollapsed ? t("expandMessage") : t("collapseMessage"),
    },
  ].filter(Boolean);

  return (
    <>
      {actions.length > 0 && (
        <div className={`actions ${showActions ? "show" : ""}`}>
          {actions.map(({ icon: Icon, handler, tooltip, danger }, i) => {
            // 桌面端使用 Tooltip，移动端直接渲染按钮
            if (!isTouch) {
              return (
                <Tooltip
                  key={i}
                  content={tooltip}
                  placement={isRobot ? "left" : "right"}
                >
                  <button
                    className={`action-btn ${danger ? "danger" : ""}`}
                    onClick={handler}
                    aria-label={tooltip}
                  >
                    <Icon size={16} />
                  </button>
                </Tooltip>
              );
            }

            // 移动端直接渲染按钮，不使用 Tooltip
            return (
              <button
                key={i}
                className={`action-btn ${danger ? "danger" : ""}`}
                onClick={handler}
                aria-label={tooltip}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      )}
      <style href="message-actions" precedence="high">{`
        .actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          transform: translateY(4px);
        }

        .actions.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: var(--space-1);
          background: var(--backgroundSecondary);
          color: var(--textTertiary);
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px var(--shadowLight);
          border: 1px solid var(--border);
        }

        /* 桌面端悬停效果 */
        @media (hover: hover) and (pointer: fine) {
          .action-btn:hover {
            color: var(--primary);
            background: var(--primaryGhost);
            border-color: var(--primaryLight);
            transform: translateY(-1px);
            box-shadow: 0 2px 6px var(--shadowMedium);
          }

          .action-btn.danger:hover {
            color: var(--error);
            background: rgba(239, 68, 68, 0.06);
            border-color: var(--error);
          }
        }

        .action-btn:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px var(--shadowLight);
        }

        /* 移动端优化 */
        @media (hover: none) and (pointer: coarse) {
          .actions {
            gap: var(--space-2);
          }
          
          .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--background);
            box-shadow: 0 2px 8px var(--shadowMedium);
          }

          .action-btn:active {
            transform: scale(0.95);
            transition: transform 0.1s ease;
          }

          .action-btn.danger {
            color: var(--error);
          }
        }
      `}</style>
    </>
  );
};
