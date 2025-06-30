import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useAppSelector } from "app/hooks";
import { selectUserId } from "auth/authSlice";
import { selectTheme } from "app/settings/settingSlice";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import Avatar from "render/web/ui/Avatar";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useFetchData } from "app/hooks";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import { BaseModal } from "render/web/ui/BaseModal";
import { selectShowThinking } from "app/settings/settingSlice";
import { MessageActions } from "./MessageActions";
import { FileItem } from "./FileItem"; // 提取的共用组件

// 流式指示器
const StreamingIndicator = memo(({ theme }) => (
  <>
    <div className="streaming-indicator">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
    <style>{`
      .streaming-indicator {
        position: absolute;
        bottom: -2px;
        right: -4px;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 6px;
        background: ${theme.background};
        border: 1px solid ${theme.border};
        border-radius: 50px;
        box-shadow: 0 1px 4px ${theme.shadowLight};
        z-index: 10;
      }
      .streaming-indicator .dot {
        width: 4px;
        height: 4px;
        background-color: ${theme.primary};
        border-radius: 50%;
        animation: streaming-bounce 1.4s infinite ease-in-out;
      }
      .streaming-indicator .dot:nth-child(1) { animation-delay: 0s; }
      .streaming-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
      .streaming-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes streaming-bounce {
        0%, 80%, 100% { 
          transform: scale(0.6);
          opacity: 0.3;
        }
        40% { 
          transform: scale(1.0);
          opacity: 1;
        }
      }
    `}</style>
  </>
));

// 思考内容Hook
const useThinkingVisibility = (showThinking, content, thinkContent) => {
  const isInitiallyExpanded = showThinking && !!thinkContent && !content;
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [isManualControl, setIsManualControl] = useState(false);

  const toggleExpansion = useCallback(() => {
    setIsExpanded((prev) => {
      setIsManualControl(true);
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (content && isExpanded && !isManualControl) {
      const timer = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [content, isExpanded, isManualControl]);

  return [isExpanded, toggleExpansion];
};

// 思考内容组件
const ThinkingContent = memo(
  ({ thinkContent, theme, isExpanded, onToggle }) => {
    const slateData = useMemo(
      () => (thinkContent ? markdownToSlate(thinkContent) : []),
      [thinkContent]
    );

    return (
      <div className="thinking-container">
        <button
          className="thinking-toggle"
          onClick={onToggle}
          aria-expanded={isExpanded}
          type="button"
        >
          <div className="thinking-icon">
            {isExpanded ? (
              <ChevronDownIcon size={14} />
            ) : (
              <ChevronRightIcon size={14} />
            )}
          </div>
          <span className="thinking-label">思考过程</span>
          <div className="thinking-indicator" />
        </button>

        <div
          className={`thinking-content ${isExpanded ? "expanded" : "collapsed"}`}
        >
          {isExpanded && slateData.length > 0 && (
            <div className="thinking-editor-wrapper">
              <Editor
                initialValue={slateData}
                readOnly={true}
                className="thinking-editor"
              />
            </div>
          )}
        </div>

        <style>{`
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
          border: 1px solid ${theme.primary}20;
          border-radius: ${theme.space[2]};
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
        }
        .thinking-toggle:hover {
          background: ${theme.primary}0D;
          color: ${theme.primary};
          border-color: ${theme.primary}40;
        }
        .thinking-icon { color: ${theme.primary}; }
        .thinking-label { flex: 1; letter-spacing: 0.5px; text-transform: uppercase; }
        .thinking-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${theme.primary};
          opacity: 0.6;
        }
        .thinking-content {
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .thinking-content.collapsed { max-height: 0; opacity: 0; }
        .thinking-content.expanded {
          max-height: 500px;
          opacity: 1;
          margin-top: ${theme.space[2]};
        }
        .thinking-editor-wrapper {
          padding: ${theme.space[4]};
          background: ${theme.backgroundTertiary}40;
          border-radius: ${theme.space[3]};
          border: 1px solid ${theme.border};
          position: relative;
        }
        .thinking-editor-wrapper::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${theme.primary}60, ${theme.primary}20, transparent);
        }
        .thinking-editor {
          font-size: 14px;
          color: ${theme.textTertiary};
          line-height: 1.6;
        }
      `}</style>
      </div>
    );
  }
);

// 文本内容组件
const MessageText = memo(({ content, role }) => {
  const slateData = useMemo(
    () => (role === "self" ? [] : markdownToSlate(content)),
    [content, role]
  );

  return (
    <div className="message-text">
      {role === "self" ? (
        <div className="simple-text">{content}</div>
      ) : (
        <Editor key={content} initialValue={slateData} readOnly={true} />
      )}
    </div>
  );
});

// 图片预览组件
const ImagePreview = memo(({ src, alt, onPreview }) => {
  const handleClick = useCallback(() => onPreview(src), [src, onPreview]);

  return (
    <div className="msg-image-wrap">
      <img
        src={src}
        alt={alt || "消息图片"}
        className="msg-image"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        loading="lazy"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      />
    </div>
  );
});

// 消息内容组件
const MessageContent = memo(({ content, thinkContent, role }) => {
  const theme = useAppSelector(selectTheme);
  const showThinking = useAppSelector(selectShowThinking);

  const [previewingFile, setPreviewingFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isThinkingExpanded, toggleThinkingExpansion] = useThinkingVisibility(
    showThinking,
    content,
    thinkContent
  );

  const isSelf = role === "self";
  const isRobot = role !== "self";

  const handleFilePreview = useCallback(
    (fileData) => setPreviewingFile(fileData),
    []
  );
  const handleImagePreview = useCallback(
    (imageSrc) => setSelectedImage(imageSrc),
    []
  );
  const handleCloseFilePreview = useCallback(() => setPreviewingFile(null), []);
  const handleCloseImagePreview = useCallback(() => setSelectedImage(null), []);

  const renderContent = useMemo(() => {
    if (!content) return <div className="empty-content">思考中</div>;

    if (typeof content === "string") {
      return <MessageText content={content} role={role} />;
    }

    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (!item || typeof item !== "object") return null;

        // 文本内容
        if (item.type === "text" && item.text) {
          return (
            <MessageText
              key={`text-${index}`}
              content={item.text}
              role={role}
            />
          );
        }

        // 图片内容
        if (item.type === "image_url" && item.image_url?.url) {
          return (
            <ImagePreview
              key={`image-${index}`}
              src={item.image_url.url}
              alt={item.alt_text}
              onPreview={handleImagePreview}
            />
          );
        }

        // 文件内容
        if (item.pageKey && item.type) {
          return (
            <FileItem
              key={`file-${index}`}
              file={item}
              variant="message"
              onPreview={() => handleFilePreview({ item, type: item.type })}
            />
          );
        }

        return null;
      });
    }

    return null;
  }, [content, role, handleImagePreview, handleFilePreview]);

  return (
    <>
      <div className="msg-content">
        {isRobot && thinkContent && showThinking && (
          <ThinkingContent
            thinkContent={thinkContent}
            theme={theme}
            isExpanded={isThinkingExpanded}
            onToggle={toggleThinkingExpansion}
          />
        )}
        {renderContent}
      </div>

      {previewingFile && (
        <DocxPreviewDialog
          isOpen={true}
          onClose={handleCloseFilePreview}
          pageKey={previewingFile.item.pageKey}
          fileName={previewingFile.item.name}
        />
      )}

      {selectedImage && (
        <BaseModal
          isOpen={true}
          onClose={handleCloseImagePreview}
          className="image-modal"
        >
          <img src={selectedImage} alt="放大预览" className="modal-image" />
        </BaseModal>
      )}
    </>
  );
});

// 主消息组件
export const MessageItem = memo(({ message }) => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectUserId);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const {
    content,
    thinkContent,
    userId,
    cybotKey,
    role,
    isStreaming = false,
  } = message || {};

  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user";
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

  const handleToggleCollapse = useCallback(
    () => setIsCollapsed((prev) => !prev),
    []
  );
  const handleToggleActions = useCallback(
    () => setShowActions((prev) => !prev),
    []
  );

  const handleClick = useCallback(
    (e) => {
      if (e.target.closest(".actions") || e.target.closest("button")) return;
      handleToggleActions();
    },
    [handleToggleActions]
  );

  return (
    <div
      className={`msg ${type} ${isCollapsed ? "collapsed" : ""}`}
      onClick={handleClick}
    >
      <div className="msg-inner">
        <div className="avatar-area">
          <div className="avatar-wrapper">
            <Avatar
              name={isRobot ? robotData?.name || "Robot" : "User"}
              type={isRobot ? "robot" : "user"}
              size="medium"
            />
            {isRobot && isStreaming && <StreamingIndicator theme={theme} />}
          </div>
          <MessageActions
            isRobot={isRobot}
            isSelf={isSelf}
            handleToggleCollapse={handleToggleCollapse}
            isCollapsed={isCollapsed}
            message={message}
            showActions={showActions}
          />
        </div>

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

      <style href="message-item" precedence="high">{`
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
        .msg.self .msg-inner { 
          flex-direction: row-reverse; 
          max-width: 75%; 
          margin-left: auto; 
          margin-right: 0; 
        }
        .msg.other .msg-inner { max-width: 75%; }
        .msg.robot .msg-inner { max-width: 95%; }
        .avatar-area { 
          flex-shrink: 0; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: ${theme.space[2]}; 
          position: sticky; 
          top: ${theme.space[4]}; 
        }
        .avatar-wrapper { position: relative; }
        .msg:hover .actions, .msg .actions.show { 
          opacity: 0.8; 
          visibility: visible;
        }
        .actions {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s;
        }
        .content-area { flex: 1; min-width: 0; }
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
        .msg-content { 
          display: flex; 
          flex-direction: column; 
          gap: ${theme.space[3]}; 
        }
        .message-text { line-height: 1.65; }
        .simple-text { 
          white-space: pre-wrap; 
          margin: 0; 
        }
        .msg-image-wrap { display: inline-block; }
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
        .msg-image:hover { transform: translateY(-2px); }
        .modal-image { 
          max-width: 90vw; 
          max-height: 85vh; 
          object-fit: contain; 
          border-radius: ${theme.space[2]}; 
        }
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
          background: linear-gradient(transparent, ${theme.backgroundSecondary}); 
        }
        
        @media (max-width: 768px) {
          .msg { padding: 0 ${theme.space[3]}; }
          .msg.self .msg-inner, .msg.other .msg-inner { max-width: 95%; }
          .msg:hover .actions { opacity: 0; visibility: hidden; }
          .msg-image { max-height: 280px; }
        }
        
        @media (max-width: 480px) {
          .msg { padding: 0 ${theme.space[2]}; }
          .msg-inner { gap: ${theme.space[2]}; }
          .avatar-area { position: static; }
        }
      `}</style>
    </div>
  );
});

export default MessageItem;
