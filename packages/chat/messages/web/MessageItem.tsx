import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
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

// 文件类型配置常量
const FILE_TYPES = Object.freeze({
  excel: { icon: FaFileExcel, color: "#1D6F42" },
  docx: { icon: FaFileWord, color: "#2B579A" },
  pdf: { icon: FaFilePdf, color: "#DC3545" },
  page: { icon: FaFileWord, color: "#FF9500" },
});

// 流式输出指示器组件 - 使用 memo 优化
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
      @media (prefers-reduced-motion: reduce) {
        .streaming-indicator .dot { 
          animation: none;
          opacity: 0.7;
        }
      }
    `}</style>
  </>
));

StreamingIndicator.displayName = "StreamingIndicator";

/**
 * 管理思考过程可见性的自定义 Hook
 */
/**
 * 管理思考过程可见性的自定义 Hook - 改进版
 */
const useThinkingVisibility = (showThinking, content, thinkContent) => {
  const isInitiallyExpanded = showThinking && !!thinkContent && !content;
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [isManualControl, setIsManualControl] = useState(false); // 新增：跟踪是否为手动控制

  // 使用 useCallback 优化事件处理函数
  const toggleExpansion = useCallback(() => {
    setIsExpanded((prev) => {
      const newState = !prev;
      // 如果是手动切换，则标记为手动控制
      if (!isManualControl) {
        setIsManualControl(true);
      }
      return newState;
    });
  }, [isManualControl]);

  // 当有最终内容时自动折叠 - 仅在非手动控制时生效
  useEffect(() => {
    if (content && isExpanded && !isManualControl) {
      const timer = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [content, isExpanded, isManualControl]);

  return [isExpanded, toggleExpansion];
};

// 思考内容组件 - 使用 memo 和优化的样式
const ThinkingContent = memo(
  ({ thinkContent, theme, isExpanded, onToggle }) => {
    const slateData = useMemo(() => {
      return thinkContent ? markdownToSlate(thinkContent) : [];
    }, [thinkContent]);

    return (
      <div className="thinking-container">
        <button
          className="thinking-toggle"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "收起" : "展开"}思考过程`}
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
          will-change: transform;
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
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .thinking-toggle:hover {
          background: ${theme.primary}0D;
          color: ${theme.primary};
          border-color: ${theme.primary}40;
          transform: translateY(-1px);
        }
        
        .thinking-toggle:hover .thinking-indicator {
           transform: scale(1.5);
           opacity: 1;
        }

        .thinking-toggle:focus-visible {
          outline: 2px solid ${theme.primary}40;
          outline-offset: 2px;
        }

        .thinking-toggle:active {
          transform: translateY(0);
        }

        .thinking-icon {
          color: ${theme.primary};
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
        }

        .thinking-label {
          flex: 1;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          user-select: none;
        }

        .thinking-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${theme.primary};
          opacity: 0.6;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
        }

        .thinking-content {
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: max-height, opacity;
        }

        .thinking-content.collapsed {
          max-height: 0;
          opacity: 0;
          margin-top: 0;
        }

        .thinking-content.expanded {
          max-height: 500px;
          opacity: 1;
          margin-top: ${theme.space[2]};
        }

        .thinking-editor-wrapper {
          padding: ${theme.space[4]};
          background: ${theme.backgroundTertiary}40;
          backdrop-filter: blur(12px);
          border-radius: ${theme.space[3]};
          border: 1px solid ${theme.border};
          position: relative;
          overflow: hidden;
        }

        .thinking-editor-wrapper::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${theme.primary}60, ${theme.primary}20, transparent);
          border-radius: ${theme.space[1]} ${theme.space[1]} 0 0;
        }

        .thinking-editor {
          font-size: 14px;
          color: ${theme.textTertiary};
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .thinking-toggle {
            font-size: 11px;
            padding: ${theme.space[2]};
          }
          .thinking-editor-wrapper {
            padding: ${theme.space[3]};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .thinking-content, .thinking-toggle, .thinking-indicator {
            transition: none;
          }
          .thinking-toggle:hover {
            transform: none;
          }
        }
      `}</style>
      </div>
    );
  }
);

ThinkingContent.displayName = "ThinkingContent";

// 消息文本组件 - 使用 memo 优化
const MessageText = memo(({ content, role }) => {
  const slateData = useMemo(() => {
    return role === "self" ? [] : markdownToSlate(content);
  }, [content, role]);

  if (role === "self") {
    return (
      <div className="message-text">
        <div className="simple-text">{content}</div>
      </div>
    );
  }

  return (
    <div className="message-text">
      <Editor key={content} initialValue={slateData} readOnly={true} />
    </div>
  );
});

MessageText.displayName = "MessageText";

// 文件项组件 - 使用 memo 优化
const FileItem = memo(({ item, index, type, onPreview }) => {
  const config = FILE_TYPES[type];
  if (!config) return null;

  const IconComponent = config.icon;

  const handleClick = useCallback(() => {
    onPreview({ item, type });
  }, [item, type, onPreview]);

  return (
    <div
      key={`${type}-${index}`}
      className="file-item"
      onClick={handleClick}
      style={{ "--file-color": config.color }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <IconComponent size={16} aria-hidden="true" />
      <span className="file-name">{item.name || "未知文件"}</span>
    </div>
  );
});

FileItem.displayName = "FileItem";

// 图片预览组件 - 使用 memo 优化
const ImagePreview = memo(({ src, alt, onPreview }) => {
  const handleClick = useCallback(() => {
    onPreview(src);
  }, [src, onPreview]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className="msg-image-wrap">
      <img
        src={src}
        alt={alt || "消息图片"}
        className="msg-image"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        loading="lazy"
      />
    </div>
  );
});

ImagePreview.displayName = "ImagePreview";

// 消息内容组件 - 使用 memo 和优化的状态管理
const MessageContent = memo(({ content, thinkContent, role }) => {
  const theme = useAppSelector(selectTheme);
  const showThinking = useAppSelector(selectShowThinking);

  // 使用状态管理优化
  const [previewingFile, setPreviewingFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isThinkingExpanded, toggleThinkingExpansion] = useThinkingVisibility(
    showThinking,
    content,
    thinkContent
  );

  const isSelf = role === "self";
  const isRobot = role !== "self";

  // 优化的事件处理函数
  const handleFilePreview = useCallback((fileData) => {
    setPreviewingFile(fileData);
  }, []);

  const handleImagePreview = useCallback((imageSrc) => {
    setSelectedImage(imageSrc);
  }, []);

  const handleCloseFilePreview = useCallback(() => {
    setPreviewingFile(null);
  }, []);

  const handleCloseImagePreview = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // 渲染内容的优化函数
  const renderContentItems = useMemo(() => {
    if (!content) {
      return <div className="empty-content">思考中</div>;
    }

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
        if (item.pageKey && FILE_TYPES[item.type]) {
          return (
            <FileItem
              key={`file-${index}`}
              item={item}
              index={index}
              type={item.type}
              onPreview={handleFilePreview}
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
        {/* 思考过程 - 带条件渲染优化 */}
        {isRobot && thinkContent && showThinking && (
          <ThinkingContent
            thinkContent={thinkContent}
            theme={theme}
            isExpanded={isThinkingExpanded}
            onToggle={toggleThinkingExpansion}
          />
        )}

        {/* 主要内容 */}
        {renderContentItems}
      </div>

      {/* 文件预览弹窗 - 按需渲染 */}
      {previewingFile && (
        <DocxPreviewDialog
          isOpen={true}
          onClose={handleCloseFilePreview}
          pageKey={previewingFile.item.pageKey}
          fileName={previewingFile.item.name}
        />
      )}

      {/* 图片预览弹窗 - 按需渲染 */}
      {selectedImage && (
        <BaseModal
          isOpen={true}
          onClose={handleCloseImagePreview}
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
});

MessageContent.displayName = "MessageContent";

// 主消息组件 - 使用 memo 和优化的事件处理
export const MessageItem = memo(({ message }) => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);

  // 状态管理优化
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

  // 计算用户类型
  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user";
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  // 机器人数据获取 - 只在需要时获取
  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

  // 优化的事件处理函数
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleToggleActions = useCallback(() => {
    setShowActions((prev) => !prev);
  }, []);

  // 点击处理 - 防抖优化
  const handleClick = useCallback(
    (e) => {
      // 防止在操作按钮上触发
      if (e.target.closest(".actions") || e.target.closest("button")) {
        return;
      }
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

      {/* 优化的样式 - 使用 CSS 变量和更好的性能 */}
      <style>{`
        .msg { 
          padding: 0 ${theme.space[4]}; 
          margin-bottom: ${theme.space[4]}; 
          cursor: pointer;
          will-change: transform;
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
        .msg:hover .actions { 
          opacity: 0.8; 
          visibility: visible;
        }
        .msg .actions.show { 
          opacity: 0.8; 
          visibility: visible;
        }
        .actions {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.2s;
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
          will-change: transform;
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
        .message-text { max-width: 100%; line-height: 1.65; }
        .simple-text { 
          white-space: pre-wrap; 
          margin: 0; 
          user-select: text;
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
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .msg-image:hover { transform: translateY(-2px); }
        .file-item { 
          display: inline-flex; 
          align-items: center; 
          gap: ${theme.space[2]}; 
          padding: ${theme.space[2]} ${theme.space[3]}; 
          background: ${theme.backgroundSecondary}; 
          border: 1px solid ${theme.border}; 
          border-radius: ${theme.space[2]}; 
          cursor: pointer; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
          color: var(--file-color, ${theme.textSecondary}); 
          font-size: 14px; 
          font-weight: 500; 
          max-width: 280px; 
        }
        .file-item:hover { 
          background: ${theme.backgroundHover}; 
          transform: translateY(-1px); 
        }
        .file-item:focus-visible {
          outline: 2px solid ${theme.primary}40;
          outline-offset: 2px;
        }
        .file-name { 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
          flex: 1; 
        }
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
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
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
          .file-item { max-width: 200px; font-size: 13px; }
        }
        
        @media (max-width: 480px) {
          .msg { padding: 0 ${theme.space[2]}; }
          .msg-inner { gap: ${theme.space[2]}; }
          .avatar-area { position: static; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .msg-image, .file-item, .actions, .msg.collapsed .msg-content, 
          .thinking-toggle, .thinking-content { 
            transition: none; 
          }
          .msg-image:hover, .file-item:hover, .thinking-toggle:hover { 
            transform: none; 
          }
        }
      `}</style>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default MessageItem;
