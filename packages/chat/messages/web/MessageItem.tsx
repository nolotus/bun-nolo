import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import { selectShowThinking } from "app/settings/settingSlice";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import Avatar from "render/web/ui/Avatar";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { useFetchData } from "app/hooks";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import { BaseModal } from "render/web/ui/BaseModal";
import { MessageActions } from "./MessageActions";
import { FileItem } from "./FileItem";

// 流式指示器
const StreamingIndicator = memo(() => (
  <div className="streaming-indicator">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
));

// 思考可见性 Hook
const useThinkingVisibility = (showThinking, content, thinkContent) => {
  const init = showThinking && !!thinkContent && !content;
  const [isExpanded, setIsExpanded] = useState(init);
  const [manual, setManual] = useState(false);

  const toggle = useCallback(() => {
    setManual(true);
    setIsExpanded((v) => !v);
  }, []);

  useEffect(() => {
    if (content && isExpanded && !manual) {
      const t = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(t);
    }
  }, [content, isExpanded, manual]);

  return [isExpanded, toggle];
};

// 思考过程组件
const ThinkingContent = memo(({ thinkContent, isExpanded, onToggle }) => {
  const slate = useMemo(
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
        {isExpanded && slate.length > 0 && (
          <div className="thinking-editor-wrapper">
            <Editor initialValue={slate} readOnly className="thinking-editor" />
          </div>
        )}
      </div>
    </div>
  );
});

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
        <Editor key={content} initialValue={slateData} readOnly />
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

// 消息内容组件（支持多图网格展示）
const MessageContent = memo(({ content, thinkContent, role }) => {
  const showThinking = useAppSelector(selectShowThinking);
  const [filePreview, setFilePreview] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [isThinkingExpanded, toggleThinking] = useThinkingVisibility(
    showThinking,
    content,
    thinkContent
  );

  const onFile = useCallback((fd) => setFilePreview(fd), []);
  const onImg = useCallback((src) => setImgPreview(src), []);
  const closeFile = useCallback(() => setFilePreview(null), []);
  const closeImg = useCallback(() => setImgPreview(null), []);

  // 按段落分组：连续图片一组，其它为“normal”
  const segments = useMemo(() => {
    if (!Array.isArray(content)) return [];
    const segs = [];
    let cur = null;
    content.forEach((it) => {
      const isImg = it.type === "image_url" && it.image_url?.url;
      if (isImg) {
        if (cur?.type === "images") {
          cur.items.push(it);
        } else {
          cur = { type: "images", items: [it] };
          segs.push(cur);
        }
      } else {
        if (cur?.type === "normal") {
          cur.items.push(it);
        } else {
          cur = { type: "normal", items: [it] };
          segs.push(cur);
        }
      }
    });
    return segs;
  }, [content]);

  const renderContent = useMemo(() => {
    if (!content) return <div className="empty-content">思考中</div>;
    if (typeof content === "string") {
      return <MessageText content={content} role={role} />;
    }
    return segments.map((seg, i) => {
      if (seg.type === "images") {
        if (seg.items.length > 1) {
          return (
            <div key={i} className="msg-images">
              {seg.items.map((it, idx) => (
                <ImagePreview
                  key={idx}
                  src={it.image_url.url}
                  alt={it.alt_text}
                  onPreview={onImg}
                />
              ))}
            </div>
          );
        }
        const it = seg.items[0];
        return (
          <ImagePreview
            key={i}
            src={it.image_url.url}
            alt={it.alt_text}
            onPreview={onImg}
          />
        );
      }
      return seg.items.map((it, idx) => {
        if (it.type === "text" && it.text) {
          return (
            <MessageText key={`${i}-${idx}`} content={it.text} role={role} />
          );
        }
        if (it.pageKey && it.type) {
          return (
            <FileItem
              key={`${i}-${idx}`}
              file={it}
              variant="message"
              onPreview={() => onFile({ item: it, type: it.type })}
            />
          );
        }
        return null;
      });
    });
  }, [content, role, segments, onImg, onFile]);

  return (
    <>
      <div className="msg-content">
        {role !== "self" && thinkContent && showThinking && (
          <ThinkingContent
            thinkContent={thinkContent}
            isExpanded={isThinkingExpanded}
            onToggle={toggleThinking}
          />
        )}
        {renderContent}
      </div>

      {filePreview && (
        <DocxPreviewDialog
          isOpen
          onClose={closeFile}
          pageKey={filePreview.item.pageKey}
          fileName={filePreview.item.name}
        />
      )}
      {imgPreview && (
        <BaseModal isOpen onClose={closeImg} className="image-modal">
          <img src={imgPreview} alt="放大预览" className="modal-image" />
        </BaseModal>
      )}
    </>
  );
});

// 主消息组件
export const MessageItem = memo(({ message }) => {
  const currentUserId = useAppSelector(selectUserId);
  const [collapsed, setCollapsed] = useState(false);
  const [showActs, setShowActs] = useState(false);

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

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);
  const toggleActs = useCallback(() => setShowActs((v) => !v), []);
  const onClick = useCallback(
    (e) => {
      if (e.target.closest(".actions") || e.target.closest("button")) return;
      toggleActs();
    },
    [toggleActs]
  );

  return (
    <>
      <div
        className={`msg ${type} ${collapsed ? "collapsed" : ""}`}
        onClick={onClick}
      >
        <div className="msg-inner">
          <div className="avatar-area">
            <div className="avatar-wrapper">
              <Avatar
                name={isRobot ? robotData?.name || "Robot" : "User"}
                type={isRobot ? "robot" : "user"}
                size="medium"
              />
              {isRobot && isStreaming && <StreamingIndicator />}
            </div>
            <MessageActions
              isRobot={isRobot}
              isSelf={isSelf}
              handleToggleCollapse={toggleCollapse}
              isCollapsed={collapsed}
              message={message}
              showActions={showActs}
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
      </div>

      <style href="message-item" precedence="high">{`
/* --- StreamingIndicator --- */
.streaming-indicator {
  position: absolute;
  bottom: -2px;
  right: -4px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 50px;
  box-shadow: 0 1px 4px var(--shadowLight);
  z-index: 10;
}
.streaming-indicator .dot {
  width: 4px;
  height: 4px;
  background-color: var(--primary);
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
    transform: scale(1);
    opacity: 1;
  }
}

/* --- ThinkingContent --- */
.thinking-container { margin-bottom: var(--space-3); }
.thinking-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--backgroundGhost);
  border: 1px solid var(--primaryGhost);
  border-radius: var(--space-2);
  color: var(--textSecondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.thinking-toggle:hover,
.thinking-toggle:focus-visible {
  background: var(--primaryGhost);
  color: var(--primary);
  border-color: var(--focus);
  outline: none;
}
.thinking-toggle:focus-visible {
  box-shadow: 0 0 0 2px var(--focus);
}
.thinking-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
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
  background: var(--primary);
  opacity: 0.6;
}
.thinking-content {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.2s ease, margin-top 0.2s ease;
}
.thinking-content.collapsed {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}
.thinking-content.expanded {
  max-height: 1000px;
  opacity: 1;
  margin-top: var(--space-3);
}
.thinking-editor-wrapper {
  position: relative;
  background: var(--backgroundTertiary);
  border: 1px solid var(--border);
  border-radius: var(--space-3);
  overflow: hidden;
}
.thinking-editor-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0; right: 0;
  height: 4px;
  background: var(--primaryGradient);
}
.thinking-editor-wrapper .thinking-editor {
  padding: var(--space-4);
  font-size: 14px;
  color: var(--textTertiary);
  line-height: 1.6;
}

/* --- MessageItem & 普通渲染 --- */
.msg {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-4);
  cursor: pointer;
}
.msg-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-3);
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
  gap: var(--space-2);
  position: sticky;
  top: var(--space-4);
}
.avatar-wrapper { position: relative; }

.msg:hover .actions,
.msg .actions.show {
  opacity: 0.8;
  visibility: visible;
}
.actions {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s;
}

.content-area {
  flex: 1;
  min-width: 0;
}
.robot-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--textSecondary);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
  letter-spacing: 0.5px;
}

.msg-body {
  color: var(--text);
  line-height: 1.6;
  word-wrap: break-word;
}
.msg-body.self {
  background: var(--primaryBg);
  border-radius: 16px 16px 4px 16px;
  padding: var(--space-4);
  border: 1px solid var(--primaryHover);
}
.msg-body.other {
  background: var(--backgroundSecondary);
  border-radius: 16px 16px 16px 4px;
  padding: var(--space-4);
  border: 1px solid var(--border);
}
.msg-body.robot {
  background: transparent;
  padding: var(--space-2) 0;
}

.msg-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.empty-content {
  color: var(--textTertiary);
  font-style: italic;
}
.message-text {
  line-height: 1.65;
}
.simple-text {
  white-space: pre-wrap;
  margin: 0;
}

/* --- 单图 --- */
.msg-image-wrap { display: inline-block; }
.msg-image {
  border-radius: var(--space-2);
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  box-shadow: 0 2px 8px var(--shadowLight);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.msg-image:hover { transform: translateY(-2px); }

/* --- 多图网格 --- */
.msg-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.msg-images .msg-image {
  max-height: 200px;
}

/* --- 弹窗图片 --- */
.modal-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--space-2);
}

/* --- 收起态 --- */
.msg.collapsed .msg-content {
  max-height: 60px;
  overflow: hidden;
  position: relative;
  transition: max-height 0.3s ease;
}
.msg.collapsed .msg-content::after {
  content: "";
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 20px;
  background: linear-gradient(
    transparent,
    var(--backgroundSecondary)
  );
}

/* --- 响应式 --- */
@media (max-width: 768px) {
  .msg { padding: 0 var(--space-3); }
  .msg.self .msg-inner,
  .msg.other .msg-inner {
    max-width: 95%;
  }
  .msg:hover .actions {
    opacity: 0;
    visibility: hidden;
  }
  .msg-image { max-height: 280px; }
}
@media (max-width: 480px) {
  .msg { padding: 0 var(--space-2); }
  .msg-inner { gap: var(--space-2); }
  .avatar-area { position: static; }
}
      `}</style>
    </>
  );
});

export default MessageItem;
