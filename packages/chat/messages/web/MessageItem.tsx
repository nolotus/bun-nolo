import React, { useState, useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { selectTheme } from "app/theme/themeSlice";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import Avatar from "render/web/ui/Avatar";
import { markdownToSlate } from "create/editor/markdownToSlate";

import { useFetchData } from "app/hooks";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { BaseModal } from "render/web/ui/BaseModal";
import { selectShowThinking } from "setting/settingSlice";
import { MessageActions } from "./MessageActions";

// --- 新增代码 ---
// 流式输出指示器组件 (AI正在输入中)
const StreamingIndicator = ({ theme }) => (
  <>
    <div className="streaming-indicator">
      <span className="dot" style={{ animationDelay: "0s" }} />
      <span className="dot" style={{ animationDelay: "0.2s" }} />
      <span className="dot" style={{ animationDelay: "0.4s" }} />
    </div>
    <style>{`
      .streaming-indicator {
        position: absolute;
        bottom: -2px;
        right: -4px;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 5px 6px;
        background: ${theme.background};
        border: 1px solid ${theme.border};
        border-radius: 50px;
        box-shadow: 0 1px 4px ${theme.shadowLight};
        z-index: 1;
      }

      .streaming-indicator .dot {
        width: 4px;
        height: 4px;
        background-color: ${theme.textSecondary};
        border-radius: 50%;
        animation: streaming-bounce 1.4s infinite ease-in-out both;
      }

      @keyframes streaming-bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1.0);
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .streaming-indicator .dot {
          animation: none;
        }
      }
    `}</style>
  </>
);
// --- 新增代码结束 ---

// 思考内容组件
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

      <style href="list" precedence="medium">{`
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

// 消息文本组件
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

// 消息内容组件
const MessageContent = ({ content, thinkContent, role }) => {
  const theme = useAppSelector(selectTheme);
  const showThinking = useAppSelector(selectShowThinking);
  const [previewingFile, setPreviewingFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const isSelf = role === "self";
  const isRobot = role !== "self";

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
        {showThinking && isRobot && thinkContent && (
          <ThinkingContent thinkContent={thinkContent} theme={theme} />
        )}

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

      {previewingFile && (
        <DocxPreviewDialog
          isOpen={true}
          onClose={() => setPreviewingFile(null)}
          pageKey={previewingFile.item.pageKey}
          fileName={previewingFile.item.name}
        />
      )}

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

// 消息项组件，折叠完全交给用户控制，移动端点击显示actions
export const MessageItem = ({ message }) => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  // const showThinking = useAppSelector(selectShowThinking);

  const [isCollapsed, setIsCollapsed] = useState(false); // 折叠状态
  const [showActions, setShowActions] = useState(false); // 是否显示操作按钮

  // --- 修改代码 ---
  // 解构message对象，确保所有字段都存在，增加 isStreaming
  const {
    content,
    thinkContent,
    userId,
    cybotKey,
    role,
    isStreaming = false,
  } = message || {};
  // --- 修改代码结束 ---

  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user";
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

  // 切换折叠状态
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 切换操作按钮显示状态（用于移动端点击消息显示actions）
  const handleToggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <div
      className={`msg ${type} ${isCollapsed ? "collapsed" : ""}`}
      onClick={handleToggleActions}
    >
      <div className="msg-inner">
        {/* 头像区域 */}
        <div className="avatar-area">
          {/* --- 修改代码：增加 wrapper 用于定位 --- */}
          <div className="avatar-wrapper">
            <Avatar
              name={isRobot ? robotData?.name || "Robot" : "User"}
              type={isRobot ? "robot" : "user"}
              size="medium"
            />
            {/* --- 修改代码：条件渲染流式输出指示器 --- */}
            {isRobot && isStreaming && <StreamingIndicator theme={theme} />}
          </div>
          {/* --- 修改代码结束 --- */}

          <MessageActions
            isRobot={isRobot}
            isSelf={isSelf}
            handleToggleCollapse={handleToggleCollapse}
            isCollapsed={isCollapsed}
            message={message}
            showActions={showActions}
          />
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

      <style href="list" precedence="medium">{`
        .msg {
          padding: 0 ${theme.space[4]};
          margin-bottom: ${theme.space[4]};
          cursor: pointer;
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

        /* --- 新增样式：为头像和指示器提供定位上下文 --- */
        .avatar-wrapper {
          position: relative;
        }
        /* --- 新增样式结束 --- */

        /* 桌面端悬停显示，移动端点击显示 */
        .msg:hover .actions {
          opacity: 0.8;
        }

        .msg .actions.show {
          opacity: 0.8;
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

        /* 折叠样式 */
        .msg.collapsed .msg-content {
          max-height: 60px;
          overflow: hidden;
          position: relative;
          transition: max-height 0.3s ease;
        }

        .msg.collapsed .msg-content::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 20px;
          background: linear-gradient(
            transparent,
            ${theme.backgroundSecondary}
          );
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
          /* 移动端不默认显示actions，通过点击切换 */
          .msg:hover .actions {
            opacity: 0;
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
          .msg.collapsed .msg-content {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageItem;
