// MessageActions.jsx
import React from "react";
import { CopyIcon, BookmarkIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "web/ui/Tooltip";
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

export const MessageActions = ({
  content,
  id,
  showDelete = true,
  showSave = true,
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const auth = useAuth();
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const theme = useAppSelector(selectTheme);

  const handleDelete = () => {
    dispatch(deleteMessage(id));
  };

  const handleCopyContent = () => {
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else if (Array.isArray(content)) {
      textContent = content
        .map((item) => {
          if (item.type === "text") return item.text;
          if (item.type === "image_url")
            return `[Image: ${item.image_url?.url}]`;
          return "";
        })
        .join("\n");
    } else {
      textContent = JSON.stringify(content);
    }
    copyToClipboard(textContent, {
      onSuccess: () => toast.success(t("copySuccess")),
      onError: (err) => toast.error(`${t("copyFailed")}: ${err.message}`),
    });
  };

  const handleSaveContent = async () => {
    if (content) {
      try {
        const slateData = markdownToSlate(content);
        const title = await dispatch(
          runCybotId({
            cybotId: titleCybotId,
            userInput: content,
          })
        ).unwrap();

        // 保存content
        const customKey = `${DataType.PAGE}-${auth.user.userId}-${ulid()}`;

        const saveResult = await dispatch(
          write({
            data: { content, slateData, type: DataType.PAGE, title },
            customKey,
          })
        ).unwrap();

        console.log("currentSpaceId", currentSpaceId);

        // 添加到当前space
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
            <Link
              to={`/${saveResult.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("clickHere")}
            </Link>
            {t("viewDetails")}
          </div>
        );
      } catch (error) {
        toast.error(`${t("saveFailed")}: ${error.message}`);
      }
    }
  };

  return (
    <>
      <div className={`chat-message-actions ${className}`}>
        <Tooltip content={t("copyContent")} placement="top">
          <button
            className="chat-action-button"
            onClick={handleCopyContent}
            aria-label="Copy content"
          >
            <CopyIcon size={14} />
          </button>
        </Tooltip>

        {showSave && (
          <Tooltip content={t("saveContent")} placement="top">
            <button
              className="chat-action-button"
              onClick={handleSaveContent}
              aria-label="Save content"
            >
              <BookmarkIcon size={14} />
            </button>
          </Tooltip>
        )}

        {showDelete && (
          <Tooltip content={t("deleteMessage")} placement="top">
            <button
              className="chat-action-button chat-action-button-danger"
              onClick={handleDelete}
              aria-label="Delete message"
            >
              <TrashIcon size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      <style jsx>{`
        .chat-message-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 6px;
          opacity: 0;
          transition:
            opacity 0.15s ease,
            transform 0.15s ease;
          transform: translateY(-2px);
        }

        /* 消息列表中的第一条消息始终显示按钮 */
        .chat-message-list
          .chat-message-item:first-child
          .chat-message-actions {
          opacity: 0.92;
          transform: translateY(0);
        }

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
          color: ${theme.textSecondary || "#555"};
          background-color: transparent;
          transition: all 0.15s ease;
        }

        .chat-action-button:hover {
          color: ${theme.textPrimary || "#333"};
          transform: translateY(-1px);
        }

        .chat-action-button:active {
          transform: translateY(0);
        }

        .chat-action-button-danger:hover {
          color: ${theme.textDanger || "#e53935"};
        }
      `}</style>
    </>
  );
};
