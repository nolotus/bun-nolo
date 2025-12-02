// chat/messages/web/MessageItem.tsx
import React, { useState, useMemo, useCallback, memo } from "react";
import { useAppSelector, useAppDispatch } from "app/store";
import { selectUserId } from "auth/authSlice";
import Avatar from "render/web/ui/Avatar";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import { useFetchData } from "app/hooks";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import { MessageActions } from "./MessageActions";
import { FileItem } from "./FileItem";
import { useMessageInteraction } from "../../hooks/useMessageInteraction";
import { MessageToolConfirmBar } from "./MessageToolConfirmBar";
import { ThinkingSection } from "./ThinkingSection";
import ImagePreviewModal from "chat/web/ImagePreviewModal";

// --- 子组件：流式传输指示器 ---
const StreamingIndicator = memo(() => (
  <div className="streaming-indicator">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
));

// --- 子组件：文本/Markdown 渲染 ---
const MessageText = memo(({ content, role, isStreaming = false }: any) => {
  const slateData = useMemo(
    () => (role === "self" ? [] : markdownToSlate(content)),
    [content, role]
  );

  return (
    <div className="message-text">
      {role === "self" ? (
        <div className="simple-text">{content}</div>
      ) : (
        <Editor
          key={content}
          initialValue={slateData}
          readOnly
          isStreaming={isStreaming}
        />
      )}
    </div>
  );
});

// --- 子组件：消息流中的图片缩略图 ---
const ImagePreview = memo(({ src, alt, onPreview }: any) => {
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

// --- 子组件：消息内容聚合 ---
const MessageContent = memo(
  ({ content, thinkContent, role, isStreaming = false }: any) => {
    const [filePreview, setFilePreview] = useState<any | null>(null);
    const [imgPreview, setImgPreview] = useState<string | null>(null);

    const onFile = useCallback((fd) => setFilePreview(fd), []);
    const onImg = useCallback((src) => setImgPreview(src), []);
    const closeFile = useCallback(() => setFilePreview(null), []);
    const closeImg = useCallback(() => setImgPreview(null), []);

    const segments = useMemo(() => {
      if (!Array.isArray(content)) return [];
      const segs: any[] = [];
      let cur: any = null;

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
        return (
          <MessageText
            content={content}
            role={role}
            isStreaming={isStreaming}
          />
        );
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
              <MessageText
                key={`${i}-${idx}`}
                content={it.text}
                role={role}
                isStreaming={isStreaming}
              />
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
    }, [content, role, segments, onImg, onFile, isStreaming]);

    return (
      <>
        <div className="msg-content">
          <ThinkingSection
            thinkContent={thinkContent}
            messageContent={content}
            role={role}
          />
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

        <ImagePreviewModal
          imageUrl={imgPreview}
          onClose={closeImg}
          alt="预览图片"
        />
      </>
    );
  }
);

export { MessageContent };

// --- 主组件：MessageItem ---
export const MessageItem = memo(({ message }: any) => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectUserId);
  const [collapsed, setCollapsed] = useState(false);

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
  const type = isSelf ? "self" : "robot";

  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

  const displayName = isRobot ? robotData?.name || "Robot" : "User";

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  const {
    isTouch,
    showActions,
    setShowActions,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useMessageInteraction({
    messageId: message?.id,
    onToggleActions: () => setShowActions((v) => !v),
  });

  return (
    <>
      <div
        className={`msg ${type} ${collapsed ? "collapsed" : ""} ${
          showActions ? "actions-visible" : ""
        }`}
        data-message-id={message?.id}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!isTouch && (
          <div className="msg-inner desktop">
            <div className="avatar-area">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
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
                showActions={showActions}
                isTouch={isTouch}
              />
            </div>

            <div className="content-area">
              {isRobot && displayName && (
                <div className="robot-name">{displayName}</div>
              )}
              <div className={`msg-body ${type}`}>
                <MessageContent
                  content={content || ""}
                  thinkContent={thinkContent || ""}
                  role={isSelf ? "self" : "other"}
                  isStreaming={isStreaming}
                />
                {isRobot && (
                  <MessageToolConfirmBar
                    messageId={message?.id}
                    isRobot={isRobot}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {isTouch && (
          <div className="msg-inner mobile">
            <div className="msg-header">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
                  type={isRobot ? "robot" : "user"}
                  size="small"
                />
                {isRobot && isStreaming && <StreamingIndicator />}
              </div>
              {isRobot && displayName && (
                <div className="robot-name mobile">{displayName}</div>
              )}
            </div>

            <div className="content-area mobile">
              <div className={`msg-body ${type} mobile`}>
                <MessageContent
                  content={content || ""}
                  thinkContent={thinkContent || ""}
                  role={isSelf ? "self" : "other"}
                  isStreaming={isStreaming}
                />
                {isRobot && (
                  <MessageToolConfirmBar
                    messageId={message?.id}
                    isRobot={isRobot}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {isTouch && (
          <MessageActions
            isRobot={isRobot}
            isSelf={isSelf}
            handleToggleCollapse={toggleCollapse}
            isCollapsed={collapsed}
            message={message}
            showActions={showActions}
            isTouch={isTouch}
          />
        )}
      </div>

      <style href="message-item" precedence="high">{`
/* --- StreamingIndicator --- */
.streaming-indicator {
  position: absolute;
  bottom: -4px;
  right: -6px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 8px;
  background: var(--background);
  /* 调整：移除边框，使用柔和阴影 (40% 拟物) */
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border-radius: 50px;
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
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* --- MessageItem 基础样式 --- */
.msg {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-5); /* 调整：增加间距，提升呼吸感 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: var(--space-3);
  position: relative;
  z-index: 1;
}

.msg.actions-visible { z-index: 50; }

/* --- 桌面端布局 --- */
.msg-inner.desktop {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-4); /* 调整：增加头像与内容的间距 */
  align-items: flex-start;
}

.msg.self .msg-inner.desktop {
  flex-direction: row-reverse;
  max-width: 75%;
  margin-left: auto;
  margin-right: 0;
}

.msg.robot .msg-inner.desktop { max-width: 95%; }

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

.content-area {
  flex: 1;
  min-width: 0;
}

.robot-name {
  font-size: 11px;
  font-weight: 500; /* 调整：稍微纤细一点 */
  color: var(--textSecondary);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
  letter-spacing: 0.5px;
  opacity: 0.8;
}

/* 桌面端悬停效果 */
@media (hover: hover) and (pointer: fine) {
  .msg:hover {
    background-color: var(--backgroundGhost);
  }
  .msg:hover .actions {
    opacity: 0.9;
    visibility: visible;
  }
}

/* --- 移动端布局 --- */
@media (hover: none) and (pointer: coarse) {
  .msg {
    padding: var(--space-3) var(--space-2);
    margin-bottom: var(--space-3);
    overflow: visible;
  }

  .msg.actions-visible {
    background-color: var(--primaryGhost);
    transform: scale(0.995);
    transition: all 0.2s ease;
  }

  .msg-inner.mobile {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--space-2);
  }

  .msg-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .msg.self .msg-header {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .msg-header .avatar-wrapper {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .robot-name.mobile {
    font-size: 12px;
    font-weight: 600;
    color: var(--textSecondary);
    margin: 0;
    flex-shrink: 0;
  }

  .content-area.mobile {
    width: 100%;
    flex: none;
  }

  .msg-body.mobile {
    width: 100%;
    margin: 0;
  }

  .msg-body.self.mobile {
    background: var(--primaryBg);
    border-radius: 18px 18px 4px 18px; /* 调整：更圆润的圆角 */
    padding: var(--space-3) var(--space-4);
    /* 调整：移除边框，改用阴影 */
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-left: auto;
    max-width: 88%;
  }

  .msg-body.robot.mobile {
    background: transparent;
    padding: 0;
    width: 100%;
    max-width: none;
  }
}

/* --- 通用消息体样式 --- */
.msg-body {
  color: var(--text);
  line-height: 1.65; /* 调整：增加行高，提升阅读舒适度 */
  word-wrap: break-word;
}

.msg-body.self {
  background: var(--primaryBg);
  border-radius: 18px 18px 4px 18px; /* 调整：更圆润 */
  padding: var(--space-4) var(--space-5); /* 调整：增加左右内边距 */
  /* 调整：移除边框，增加精致的克制阴影 */
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.02);
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
  line-height: 1.6; /* 调整：统一行高 */
}

.simple-text {
  white-space: pre-wrap;
  margin: 0;
}

/* --- 图片缩略图相关 --- */
.msg-image-wrap { display: inline-block; }
.msg-image {
  border-radius: var(--space-3); /* 调整：圆角统一 */
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  /* 调整：移除边框，使用更通透的阴影 */
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-image:hover { transform: translateY(-2px); }

.msg-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.msg-images .msg-image { max-height: 200px; }

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
  height: 24px;
  background: linear-gradient(
    transparent,
    var(--background)
  );
}

/* --- 极小屏幕优化 --- */
@media (max-width: 480px) {
  .msg { 
    padding: var(--space-2) var(--space-1);
    margin-bottom: var(--space-3);
  }
  .msg-header .avatar-wrapper {
    width: 24px;
    height: 24px;
  }
  .robot-name.mobile { font-size: 11px; }
  .msg-body.self.mobile,
  .msg-body.robot.mobile {
    padding: var(--space-2) var(--space-3);
    font-size: 15px; /* 调整：微调字号易读性 */
    max-width: 90%;
  }
  .msg-image { max-height: 250px; }
}
      `}</style>
    </>
  );
});

export default MessageItem;
