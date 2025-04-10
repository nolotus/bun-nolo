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
 * @param {string | Array<object> | any} content - 消息内容
 * @returns {string} - 纯文本字符串
 */
const getContentAsString = (content) => {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (item.type === "text") return item.text;
        // 可以根据需要扩展对其他类型的处理
        if (item.type === "image_url") return `[Image: ${item.image_url?.url}]`;
        return "";
      })
      .join("\n");
  }
  // 对于未知类型，尝试转为 JSON 字符串，或返回空字符串
  try {
    return JSON.stringify(content);
  } catch (e) {
    console.warn(
      "[getContentAsString] Failed to stringify content:",
      content,
      e
    );
    return "";
  }
};

/**
 * 使用 AI 生成页面标题
 * @param {string} contentString - 页面内容的字符串表示
 * @param {string} fallbackTitle - 生成失败时的备用标题
 * @param {Function} dispatch - Redux dispatch 函数
 * @returns {Promise<string>} - 生成的标题或备用标题
 */
const generatePageTitle = async (contentString, fallbackTitle, dispatch) => {
  if (!contentString) {
    console.warn(
      "[generatePageTitle] Empty content string, using fallback title."
    );
    return fallbackTitle;
  }
  try {
    console.info("[generatePageTitle] Requesting title generation...");
    const title = await dispatch(
      runCybotId({
        cybotId: titleCybotId,
        userInput: contentString.substring(0, 500), // 限制输入长度避免过长
      })
    ).unwrap();
    console.info("[generatePageTitle] Title generated:", title);
    return title || fallbackTitle; // 如果 AI 返回空，也使用 fallback
  } catch (error) {
    console.warn(
      "[generatePageTitle] Failed to generate title via Cybot, using fallback. Error:",
      error
    );
    return fallbackTitle;
  }
};

/**
 * 将 Markdown 字符串转换为 Slate 格式数据
 * @param {string} markdownString - Markdown 格式的字符串
 * @returns {object | null} - Slate 格式数据，如果转换失败则返回 null
 */
const convertMarkdownToSlateFormat = (markdownString) => {
  try {
    const slateData = markdownToSlate(markdownString);
    if (!slateData) {
      // markdownToSlate 可能在内部处理了错误并返回 null
      console.warn(
        "[convertMarkdownToSlateFormat] markdownToSlate returned null for input:",
        markdownString.substring(0, 100) + "..."
      );
    }
    // 可以添加更严格的 Slate 结构校验
    return slateData;
  } catch (error) {
    console.error(
      "[convertMarkdownToSlateFormat] Error converting markdown to Slate:",
      error
    );
    console.error(
      "[convertMarkdownToSlateFormat] Input markdown string:",
      markdownString.substring(0, 100) + "..."
    );
    return null; // 确保出错时返回 null
  }
};

/**
 * 将页面数据写入数据库
 * @param {object} data - 要写入的数据
 * @param {string} key - 数据库键
 * @param {Function} dispatch - Redux dispatch 函数
 * @returns {Promise<object>} - 写入操作的结果
 */
const writePageDataToDb = async (data, key, dispatch) => {
  console.info("[writePageDataToDb] Dispatching write action with key:", key);
  const result = await dispatch(write({ data, customKey: key })).unwrap();
  console.info("[writePageDataToDb] Write action successful.");
  return result;
};

/**
 * 将内容条目添加到指定的 Space
 * @param {string} spaceId - Space ID
 * @param {string} contentKey - 内容的数据库键
 * @param {string} title - 内容标题
 * @param {Function} dispatch - Redux dispatch 函数
 * @returns {Promise<void>}
 */
const addPageEntryToSpace = async (spaceId, contentKey, title, dispatch) => {
  if (!spaceId) {
    console.info("[addPageEntryToSpace] No spaceId provided, skipping.");
    return;
  }
  const params = {
    contentKey,
    type: DataType.PAGE, // 明确类型
    spaceId,
    title,
  };
  console.info(
    "[addPageEntryToSpace] Dispatching addContentToSpace action:",
    params
  );
  await dispatch(addContentToSpace(params)).unwrap();
  console.info("[addPageEntryToSpace] addContentToSpace action successful.");
};

// --- Component ---

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

  /** 处理删除消息 */
  const handleDeleteMessage = () => {
    console.info(`[handleDeleteMessage] Deleting message with id: ${id}`);
    dispatch(deleteMessage(id));
    toast.success(t("deleteSuccess")); // 考虑添加删除成功的提示
  };

  /** 处理复制消息内容 */
  const handleCopyMessageContent = () => {
    const textContent = getContentAsString(content);
    if (!textContent) {
      console.warn("[handleCopyMessageContent] No text content to copy.");
      toast.error(t("copyFailed") + ": Content is empty or invalid.");
      return;
    }
    copyToClipboard(textContent, {
      onSuccess: () => toast.success(t("copySuccess")),
      onError: (err) => {
        console.error("[handleCopyMessageContent] Copy failed:", err);
        toast.error(`${t("copyFailed")}: ${err.message}`);
      },
    });
  };

  /** 处理保存消息内容为新页面 */
  const handleSaveMessageAsPage = async () => {
    console.info("[handleSaveMessageAsPage] Initiating save process.");

    // 1. 校验用户和内容
    const userId = auth.user?.userId;
    if (!userId) {
      console.error("[handleSaveMessageAsPage] User not authenticated.");
      toast.error(t("saveFailed") + ": " + t("userNotAuthenticated"));
      return;
    }

    const contentString = getContentAsString(content);
    if (!contentString) {
      console.warn(
        "[handleSaveMessageAsPage] Content is empty or invalid, aborting save."
      );
      toast.error(t("saveFailed") + ": " + t("contentIsEmpty"));
      return;
    }

    // 2. 准备数据
    const customKey = `${DataType.PAGE}-${userId}-${ulid()}`;
    console.info(`[handleSaveMessageAsPage] Generated key: ${customKey}`);

    const slateData = convertMarkdownToSlateFormat(contentString); // 使用转换后的字符串
    // 注意：即使 slateData 为 null，我们仍然继续保存，但日志已记录警告

    const title = await generatePageTitle(contentString, customKey, dispatch);

    const pageData = {
      content: contentString, // 考虑是否仍需保存原始 content 或只保存 string
      slateData,
      type: DataType.PAGE,
      title,
      // userId 和时间戳通常由 'write' action 或后端处理，无需在此显式添加
    };

    // 3. 执行保存和关联操作
    try {
      const savedItem = await writePageDataToDb(pageData, customKey, dispatch);
      await addPageEntryToSpace(currentSpaceId, customKey, title, dispatch);

      console.info(
        "[handleSaveMessageAsPage] Save process completed successfully."
      );
      toast.success(
        <div>
          {t("saveSuccess")}
          {savedItem?.id && ( // 确保 savedItem 和 id 存在
            <Link
              to={`/${savedItem.id}`} // 使用返回的 ID
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                textDecoration: "underline",
              }}
            >
              {t("clickHere")}
            </Link>
          )}
          {t("viewDetails")}
        </div>
      );
    } catch (error) {
      console.error(
        "[handleSaveMessageAsPage] Error during save process:",
        error
      );
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
            onClick={handleCopyMessageContent} // 使用新函数名
            aria-label={t("copyContent")} // 使用 t 函数翻译 aria-label
          >
            <CopyIcon size={14} />
          </button>
        </Tooltip>

        {/* Save Button */}
        {showSave && (
          <Tooltip content={t("saveContent")} placement="top">
            <button
              className="chat-action-button"
              onClick={handleSaveMessageAsPage} // 使用新函数名
              aria-label={t("saveContent")} // 使用 t 函数翻译 aria-label
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
              onClick={handleDeleteMessage} // 使用新函数名
              aria-label={t("deleteMessage")} // 使用 t 函数翻译 aria-label
            >
              <TrashIcon size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Style tag remains unchanged */}
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
          color: ${theme?.textSecondary || "#555"};
          background-color: transparent;
          transition: all 0.15s ease;
        }
        .chat-action-button:hover {
          color: ${theme?.textPrimary || "#333"};
          transform: translateY(-1px);
        }
        .chat-action-button:active {
          transform: translateY(0);
        }
        .chat-action-button-danger:hover {
          color: ${theme?.textDanger || "#e53935"};
        }
      `}</style>
    </>
  );
};
