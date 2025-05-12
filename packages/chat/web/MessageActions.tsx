// MessageActions.jsx
import React from "react";
import { CopyIcon, BookmarkIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";
import copyToClipboard from "utils/clipboard";
import { useAuth } from "auth/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { deleteMessage } from "../messages/messageSlice";
import { write } from "database/dbSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { DataType } from "create/types";
import { ulid } from "ulid";
import { runCybotId } from "ai/cybot/cybotSlice";
import {
  selectCurrentSpaceId,
  addContentToSpace,
} from "create/space/spaceSlice";
import { Link } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";
import { titleCybotId } from "core/init";

// --- Helper Functions ---

/**
 * 将不同格式的消息内容转换为纯字符串
 */
const getContentAsString = (content) => {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (item.type === "text") return item.text;
        if (item.type === "image_url") return `[Image: ${item.image_url?.url}]`;
        return "";
      })
      .join("\n");
  }

  try {
    return JSON.stringify(content);
  } catch (e) {
    return "";
  }
};

/**
 * 使用 AI 生成页面标题
 */
const generatePageTitle = async (contentString, fallbackTitle, dispatch) => {
  if (!contentString) {
    return fallbackTitle;
  }
  try {
    const title = await dispatch(
      runCybotId({
        cybotId: titleCybotId,
        content: contentString.substring(0, 500),
      })
    ).unwrap();
    return title || fallbackTitle;
  } catch (error) {
    return fallbackTitle;
  }
};

/**
 * 将 Markdown 字符串转换为 Slate 格式数据
 */
const convertMarkdownToSlateFormat = (markdownString) => {
  try {
    return markdownToSlate(markdownString);
  } catch (error) {
    return null;
  }
};

// --- Component ---

export const MessageActions = ({
  content,
  dbKey,
  showDelete = true,
  showSave = true,
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const auth = useAuth();
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const theme = useAppSelector(selectTheme);

  /** 处理删除消息 */
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(dbKey));
    toast.success(t("deleteSuccess"));
  };

  /** 处理复制消息内容 */
  const handleCopyMessageContent = () => {
    const textContent = getContentAsString(content);
    if (!textContent) {
      toast.error(t("copyFailed") + ": Content is empty or invalid.");
      return;
    }
    copyToClipboard(textContent, {
      onSuccess: () => toast.success(t("copySuccess")),
      onError: (err) => {
        toast.error(`${t("copyFailed")}: ${err.message}`);
      },
    });
  };

  /** 处理保存消息内容为新页面 */
  const handleSaveMessageAsPage = async () => {
    // 1. 校验用户和内容
    const userId = auth.user?.userId;
    if (!userId) {
      toast.error(t("saveFailed") + ": " + t("userNotAuthenticated"));
      return;
    }

    const contentString = getContentAsString(content);
    if (!contentString) {
      toast.error(t("saveFailed") + ": " + t("contentIsEmpty"));
      return;
    }

    // 2. 准备数据
    const customKey = `${DataType.PAGE}-${userId}-${ulid()}`;
    const slateData = convertMarkdownToSlateFormat(contentString);
    const title = await generatePageTitle(contentString, customKey, dispatch);

    const pageData = {
      content: contentString,
      slateData,
      type: DataType.PAGE,
      title,
    };

    // 3. 执行保存和关联操作
    try {
      const savedItem = await dispatch(
        write({ data: pageData, customKey })
      ).unwrap();

      // 如果有当前 Space，则添加内容到该 Space
      if (currentSpaceId) {
        await dispatch(
          addContentToSpace({
            contentKey: customKey,
            type: DataType.PAGE,
            spaceId: currentSpaceId,
            title,
          })
        ).unwrap();
      }

      toast.success(
        <div>
          {t("saveSuccess")}
          {savedItem?.dbKey && (
            <Link
              to={`/${savedItem.dbKey}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: theme.space[2],
                marginRight: theme.space[2],
                textDecoration: "underline",
                color: theme.primary,
              }}
            >
              {t("clickHere")}
            </Link>
          )}
          {t("viewDetails")}
        </div>
      );
    } catch (error) {
      toast.error(`${t("saveFailed")}: ${error.message || "Unknown error"}`);
    }
  };

  // --- Render ---
  return (
    <>
      <div className={`chat-message-actions ${className}`}>
        {/* Copy Button */}
        <Tooltip content={t("copyContent")} placement="top">
          <button
            className="chat-action-button"
            onClick={handleCopyMessageContent}
            aria-label={t("copyContent")}
          >
            <CopyIcon size={14} />
          </button>
        </Tooltip>

        {/* Save Button */}
        {showSave && (
          <Tooltip content={t("saveContent")} placement="top">
            <button
              className="chat-action-button"
              onClick={handleSaveMessageAsPage}
              aria-label={t("saveContent")}
            >
              <BookmarkIcon size={14} />
            </button>
          </Tooltip>
        )}

        {/* Delete Button */}
        {showDelete && (
          <Tooltip content={t("deleteMessage")} placement="top">
            <button
              className="chat-action-button chat-action-button-danger"
              onClick={handleDeleteMessage}
              aria-label={t("deleteMessage")}
            >
              <TrashIcon size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* 使用主题系统的样式 */}
      <style href="msg-actions" precedence="medium">{`
        .chat-message-actions {
          display: flex;
          justify-content: flex-end;
          gap: ${theme.space[2]};
          margin-top: ${theme.space[1]};
          opacity: 0;
          transition:
            opacity 0.15s ease,
            transform 0.15s ease;
          transform: translateY(-2px);
        }
        .chat-message-list .chat-message-item:first-child .chat-message-actions,
        .chat-message-content-wrapper:hover .chat-message-actions {
          opacity: 0.92;
          transform: translateY(0);
        }
        .chat-action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 5px;
          padding: 0;
          cursor: pointer;
          color: ${theme.textSecondary};
          background-color: transparent;
          transition: all 0.15s ease;
        }
        .chat-action-button:hover {
          color: ${theme.text};
          background-color: ${theme.backgroundHover};
          transform: translateY(-1px);
        }
        .chat-action-button:active {
          transform: translateY(0);
        }
        .chat-action-button-danger:hover {
          color: ${theme.error};
        }
      `}</style>
    </>
  );
};
