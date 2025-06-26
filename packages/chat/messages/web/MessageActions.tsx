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
import { useAppSelector, useAppDispatch } from "app/hooks";
import { deleteMessage } from "../messageSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";
import { selectTheme } from "app/theme/themeSlice";

// 获取内容字符串，包含思考内容（如果需要显示）
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
  showThinking = false, // 添加默认参数
}) => {
  const { user } = useAuth();
  const theme = useAppSelector(selectTheme);
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
              style={{ marginLeft: theme.space[2], color: theme.primary }}
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
          {actions.map(({ icon: Icon, handler, tooltip, danger }, i) => (
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
          ))}
        </div>
      )}
      <style href="message-actions" precedence="high">{`
        .actions {
          display: flex;
          flex-direction: column;
          opacity: 0;
          transition: opacity 0.2s ease;
          gap: 4px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: ${theme.textTertiary};
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          color: ${theme.primary};
          background: ${theme.backgroundHover};
        }
        .action-btn.danger:hover {
          color: ${theme.error};
        }
      `}</style>
    </>
  );
};
