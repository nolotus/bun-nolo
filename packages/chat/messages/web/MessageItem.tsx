import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { selectTheme } from "app/theme/themeSlice";
import {
  CopyIcon,
  BookmarkIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";
import Avatar from "render/web/ui/Avatar";
import toast from "react-hot-toast";
import copyToClipboard from "utils/clipboard";
import { useAuth } from "auth/hooks/useAuth";
import { deleteMessage } from "../messageSlice";
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
import { titleCybotId } from "core/init";
import { useFetchData } from "app/hooks";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { BaseModal } from "render/web/ui/BaseModal";
import { selectShowThinking } from "setting/settingSlice";
// 假设用户偏好设置存储在settingSlice中

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

  // 如果用户希望看到思考内容，且有thinkContent，则拼接到前面
  return showThinking && thinkContent
    ? `**思考内容**:\n${thinkContent}\n\n**回答**:\n${baseContent}`
    : baseContent;
};

// 优化的思考内容组件
const ThinkingContent = ({ thinkContent, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinkContent) return null;

  const slateData = useMemo(
    () => markdownToSlate(thinkContent),
    [thinkContent]
  );

  return (
    <div className="thinking-container">
      <button
        className="thinking-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "收起" : "展开"}思考过程`}
      >
        {isExpanded ? (
          <ChevronDownIcon size={14} />
        ) : (
          <ChevronRightIcon size={14} />
        )}
        <span className="thinking-label">思考过程</span>
        <div className="thinking-indicator" />
      </button>

      {isExpanded && (
        <div className="thinking-content">
          <Editor
            initialValue={slateData}
            readOnly={true}
            className="thinking-editor"
          />
        </div>
      )}

      <style jsx>{`
        .thinking-container {
          margin-bottom: ${theme.space[3]};
        }

        .thinking-toggle {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          width: 100%;
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundGhost};
          backdrop-filter: blur(8px);
          border: 1px solid ${theme.primary}20;
          border-radius: ${theme.space[2]};
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .thinking-toggle:hover {
          background: ${theme.primary}08;
          color: ${theme.primary};
          border-color: ${theme.primary}30;
        }

        .thinking-toggle:focus {
          outline: 2px solid ${theme.primary}40;
          outline-offset: 2px;
        }

        .thinking-label {
          flex: 1;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .thinking-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${theme.primary};
          opacity: 0.6;
        }

        .thinking-content {
          margin-top: ${theme.space[2]};
          padding: ${theme.space[4]};
          background: ${theme.backgroundTertiary}40;
          backdrop-filter: blur(12px);
          border-radius: ${theme.space[3]};
          border: 1px solid ${theme.border};
          animation: slideDown 0.3s ease-out;
          position: relative;
        }

        .thinking-content::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            ${theme.primary}60,
            ${theme.primary}20,
            transparent
          );
          border-radius: ${theme.space[1]} ${theme.space[1]} 0 0;
        }

        .thinking-editor {
          font-size: 14px;
          color: ${theme.textTertiary};
          line-height: 1.6;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .thinking-content {
            animation: none;
          }
          .thinking-toggle {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

// 内部 MessageText 组件 - 移除了思考内容的硬编码显示
const MessageText = ({ content, role }) => {
  const slateData = useMemo(() => markdownToSlate(content), [content]);

  return (
    <div className="message-text">
      {role === "self" ? (
        <div className="simple-text">{content}</div>
      ) : (
        <Editor key={content} initialValue={slateData} readOnly={true} />
      )}
    </div>
  );
};

// 内部 MessageContent 组件
const MessageContent = ({ content, thinkContent, role }) => {
  const theme = useAppSelector(selectTheme);
  const showThinking = useAppSelector(selectShowThinking);
  const [previewingFile, setPreviewingFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const isSelf = role === "self";
  const isRobot = role !== "self";

  // 简化的文件类型配置
  const FILE_TYPES = {
    excel: { icon: FaFileExcel, color: "#1D6F42" },
    docx: { icon: FaFileWord, color: "#2B579A" },
    pdf: { icon: FaFilePdf, color: "#DC3545" },
    page: { icon: FaFileWord, color: "#FF9500" },
  };

  const renderFile = (item, index, type) => {
    const config = FILE_TYPES[type];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div
        key={`${type}-${index}`}
        className="file-item"
        onClick={() => setPreviewingFile({ item, type })}
        style={{ "--file-color": config.color }}
      >
        <IconComponent size={16} />
        <span className="file-name">{item.name || "未知文件"}</span>
      </div>
    );
  };

  return (
    <>
      <div className="msg-content">
        {/* 思考内容区域 - 仅对机器人回复显示 */}
        {showThinking && isRobot && thinkContent && (
          <ThinkingContent thinkContent={thinkContent} theme={theme} />
        )}

        {/* 主要内容 */}
        {content ? (
          typeof content === "string" ? (
            <MessageText content={content} role={role} />
          ) : Array.isArray(content) ? (
            content.map((item, index) => {
              if (!item || typeof item !== "object") return null;

              if (item.type === "text" && item.text) {
                return (
                  <MessageText
                    key={`text-${index}`}
                    content={item.text}
                    role={role}
                  />
                );
              }

              if (item.type === "image_url" && item.image_url?.url) {
                return (
                  <div key={`image-${index}`} className="msg-image-wrap">
                    <img
                      src={item.image_url.url}
                      alt={item.alt_text || "消息图片"}
                      className="msg-image"
                      onClick={() => setSelectedImage(item.image_url.url)}
                    />
                  </div>
                );
              }

              if (item.pageKey && FILE_TYPES[item.type]) {
                return renderFile(item, index, item.type);
              }

              return null;
            })
          ) : null
        ) : (
          <div className="empty-content">无内容</div>
        )}
      </div>

      {/* 文件预览 */}
      {previewingFile && (
        <DocxPreviewDialog
          isOpen={true}
          onClose={() => setPreviewingFile(null)}
          pageKey={previewingFile.item.pageKey}
          fileName={previewingFile.item.name}
        />
      )}

      {/* 图片预览 */}
      {selectedImage && (
        <BaseModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          className="image-modal"
        >
          <img
            src={selectedImage}
            alt="放大预览"
            className="modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </BaseModal>
      )}
    </>
  );
};

export const MessageItem = ({ message }) => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const showThinking = useAppSelector(selectShowThinking);
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const { user } = useAuth();
  const [isShort, setIsShort] = useState(false);

  // 解构message对象，确保所有字段都存在
  const { content, thinkContent, userId, dbKey, cybotKey, role } =
    message || {};

  // 使用useEffect设置isShort，避免提前返回影响Hooks
  useEffect(() => {
    if (content) {
      const str = getContentString(content, thinkContent, showThinking);
      setIsShort(str.split("\n").length <= 2 && str.length <= 80);
    } else {
      setIsShort(false);
    }
  }, [content, thinkContent, showThinking]);

  // 如果没有内容，仍然继续渲染，只是显示空内容
  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user";
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

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

  const handleDelete = () => {
    if (dbKey) {
      dispatch(deleteMessage(dbKey));
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(t("deleteFailed"));
    }
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
          runCybotId({ cybotId: titleCybotId, content: str.substring(0, 500) })
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
  ].filter(Boolean);

  // 即使没有内容，也渲染完整结构
  return (
    <div className={`msg ${type} ${isShort ? "short" : ""}`}>
      <div className="msg-inner">
        {/* 头像区域 */}
        <div className="avatar-area">
          <Avatar
            name={isRobot ? robotData?.name || "Robot" : "User"}
            type={isRobot ? "robot" : "user"}
            size="medium"
          />
          {actions.length > 0 && (
            <div className="actions">
              {actions.map(({ icon: Icon, handler, tooltip, danger }, i) => (
                <Tooltip key={i} content={tooltip} placement="top">
                  <button
                    className={`action-btn ${danger ? "danger" : ""}`}
                    onClick={handler}
                    aria-label={tooltip}
                  >
                    <Icon size={12} />
                  </button>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="content-area">
          {isRobot && robotData?.name && (
            <div className="robot-name">{robotData.name}</div>
          )}
          <div className={`msg-body ${type}`}>
            <MessageContent
              content={content || ""}
              thinkContent={thinkContent || ""}
              role={isSelf ? "self" : "other"}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .msg {
          padding: 0 ${theme.space[4]};
          margin-bottom: ${theme.space[4]};
        }

        .msg-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          gap: ${theme.space[3]};
          align-items: flex-start;
        }

        /* 布局优化 */
        .msg.self .msg-inner {
          flex-direction: row-reverse;
          max-width: 75%;
          margin-left: auto;
          margin-right: 0;
        }

        .msg.other .msg-inner {
          max-width: 75%;
        }

        .msg.robot .msg-inner {
          max-width: 95%;
        }

        /* 头像区域简化 */
        .avatar-area {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${theme.space[2]};
          position: sticky;
          top: ${theme.space[4]};
        }

        .actions {
          display: flex;
          flex-direction: column;
          opacity: 0;
          transition: opacity 0.2s ease;
          background: ${theme.backgroundGhost};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          padding: ${theme.space[1]};
          gap: 2px;
          box-shadow: 0 2px 8px ${theme.shadowLight};
          backdrop-filter: blur(8px);
        }

        .msg:hover .actions {
          opacity: 0.8;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
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

        /* 内容区域 */
        .content-area {
          flex: 1;
          min-width: 0;
        }

        .robot-name {
          font-size: 11px;
          font-weight: 600;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          margin-bottom: ${theme.space[2]};
          letter-spacing: 0.5px;
        }

        .msg-body {
          color: ${theme.text};
          line-height: 1.6;
          word-wrap: break-word;
        }

        /* 消息样式简化 */
        .msg-body.self {
          background: ${theme.primary}08;
          border-radius: 16px 16px 4px 16px;
          padding: ${theme.space[4]};
          border: 1px solid ${theme.primary}15;
        }

        .msg-body.other {
          background: ${theme.backgroundSecondary};
          border-radius: 16px 16px 16px 4px;
          padding: ${theme.space[4]};
          border: 1px solid ${theme.border};
        }

        .msg-body.robot {
          background: transparent;
          padding: ${theme.space[2]} 0;
        }

        /* MessageContent 样式简化 */
        .msg-content {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
        }

        .message-text {
          max-width: 100%;
          line-height: 1.65;
        }

        .simple-text {
          white-space: pre-wrap;
          margin: 0;
        }

        .msg-image-wrap {
          display: inline-block;
        }

        .msg-image {
          border-radius: ${theme.space[2]};
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          box-shadow: 0 2px 8px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .msg-image:hover {
          transform: translateY(-2px);
        }

        /* 文件样式简化 */
        .file-item {
          display: inline-flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--file-color, ${theme.textSecondary});
          font-size: 14px;
          font-weight: 500;
          max-width: 280px;
        }

        .file-item:hover {
          background: ${theme.backgroundHover};
          transform: translateY(-1px);
        }

        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        /* 模态框样式简化 */
        .modal-image {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: ${theme.space[2]};
        }

        /* 短消息优化 */
        .msg.short .msg-body.self,
        .msg.short .msg-body.other {
          padding: ${theme.space[3]};
          border-radius: 12px;
        }

        /* 响应式简化 */
        @media (max-width: 768px) {
          .msg {
            padding: 0 ${theme.space[3]};
          }
          .msg.self .msg-inner,
          .msg.other .msg-inner {
            max-width: 95%;
          }
          .actions {
            opacity: 0.6;
          }
          .msg-image {
            max-height: 280px;
          }
          .file-item {
            max-width: 200px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .msg {
            padding: 0 ${theme.space[2]};
          }
          .msg-inner {
            gap: ${theme.space[2]};
          }
          .avatar-area {
            position: static;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .msg-image,
          .file-item,
          .action-btn,
          .actions {
            transition: none;
          }
          .msg-image:hover,
          .file-item:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageItem;
