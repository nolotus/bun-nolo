import React, { useState, useMemo, useCallback, memo } from "react";
import { useAppSelector, useAppDispatch } from "app/store";
import { selectUserId } from "auth/authSlice";
import { selectShowThinking } from "app/settings/settingSlice";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import Avatar from "render/web/ui/Avatar";
import { markdownToSlate } from "create/editor/transforms/markdownToSlate";
import { useFetchData } from "app/hooks";
import Editor from "create/editor/Editor";
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import { BaseModal } from "render/web/ui/modal/BaseModal";
import { MessageActions } from "./MessageActions";
import { FileItem } from "./FileItem";
import { useMessageInteraction } from "../../hooks/useMessageInteraction";
import { useThinkingVisibility } from "../../hooks/useThinkingVisibility";

import { MessageToolConfirmBar } from "./MessageToolConfirmBar";

const StreamingIndicator = memo(() => (
  <div className="streaming-indicator">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
));

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

const MessageText = memo(({ content, role, isStreaming = false }) => {
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

const MessageContent = memo(
  ({ content, thinkContent, role, isStreaming = false }) => {
    const showThinking = useAppSelector(selectShowThinking);
    const [filePreview, setFilePreview] = useState<any | null>(null);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [isThinkingExpanded, toggleThinking] = useThinkingVisibility(
      showThinking,
      content,
      thinkContent
    );

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
  }
);

export const MessageItem = memo(({ message }) => {
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

  // ====== 新增: 支持 role === "tool" ======
  const isTool = role === "tool";
  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user"; // assistant / tool / system 都算“机器人侧”
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  // optional: 从 message 中读 toolName（如果有）
  const toolName: string | undefined = (message as any)?.toolName;

  const { data: robotData } =
    cybotKey && !isTool && isRobot ? useFetchData(cybotKey) : { data: null };

  const displayName =
    isTool && toolName
      ? toolName
      : isTool
        ? "Tool"
        : isRobot
          ? robotData?.name || "Robot"
          : "User";

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
        {/* 桌面端 */}
        {!isTouch && (
          <div className="msg-inner desktop">
            <div className="avatar-area">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
                  type={isRobot ? "robot" : "user"}
                  size="medium"
                />
                {/* 工具消息一般不会流式，这里只给非 tool 的机器人显示 streaming */}
                {!isTool && isRobot && isStreaming && <StreamingIndicator />}
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
                <div className={`robot-name ${isTool ? "tool" : ""}`}>
                  {displayName}
                </div>
              )}
              <div className={`msg-body ${type}`}>
                <MessageContent
                  content={content || ""}
                  thinkContent={thinkContent || ""}
                  role={isSelf ? "self" : "other"}
                  isStreaming={isStreaming}
                />

                {/* 通用确认条：对 interaction === "confirm" 的 ToolRun 显示按钮 */}
                <MessageToolConfirmBar
                  messageId={message?.id}
                  isRobot={isRobot}
                />
              </div>
            </div>
          </div>
        )}

        {/* 移动端 */}
        {isTouch && (
          <div className="msg-inner mobile">
            <div className="msg-header">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
                  type={isRobot ? "robot" : "user"}
                  size="small"
                />
                {!isTool && isRobot && isStreaming && <StreamingIndicator />}
              </div>
              {isRobot && displayName && (
                <div className={`robot-name mobile ${isTool ? "tool" : ""}`}>
                  {displayName}
                </div>
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

                <MessageToolConfirmBar
                  messageId={message?.id}
                  isRobot={isRobot}
                />
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
/* === 下面样式基本与你原来的相同，只新增了 .robot-name.tool === */

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

/* --- MessageItem 基础样式 --- */
.msg {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-4);
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: var(--space-2);
  position: relative;
  z-index: 1;
}

.msg.actions-visible {
  z-index: 50;
}

/* --- 桌面端布局 --- */
.msg-inner.desktop {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.msg.self .msg-inner.desktop {
  flex-direction: row-reverse;
  max-width: 75%;
  margin-left: auto;
  margin-right: 0;
}

.msg.other .msg-inner.desktop { max-width: 75%; }
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
  font-weight: 600;
  color: var(--textSecondary);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
  letter-spacing: 0.5px;
}

/* tool 名称稍微弱一点 */
.robot-name.tool {
  color: var(--textTertiary);
  font-style: italic;
}

/* 桌面端悬停效果 */
@media (hover: hover) and (pointer: fine) {
  .msg:hover {
    background-color: var(--backgroundGhost);
  }

  .msg:hover .actions {
    opacity: 0.8;
    visibility: visible;
  }
}

/* --- 移动端布局 --- */
@media (hover: none) and (pointer: coarse) {
  .msg {
    padding: var(--space-3) var(--space-2);
    margin-bottom: var(--space-2);
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

  .robot-name.mobile.tool {
    color: var(--textTertiary);
    font-style: italic;
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
    border-radius: 16px 16px 4px 16px;
    padding: var(--space-3);
    border: 1px solid var(--primaryHover);
    margin-left: auto;
    max-width: 85%;
  }

  .msg-body.other.mobile {
    background: var(--backgroundSecondary);
    border-radius: 16px 16px 16px 4px;
    padding: var(--space-3);
    border: 1px solid var(--border);
    max-width: 85%;
  }

  .msg-body.robot.mobile {
    background: transparent;
    padding: 0;
    width: 100%;
    max-width: none;
  }

  .msg-header .streaming-indicator {
    bottom: 0;
    right: -6px;
    padding: 2px 4px;
  }

  .msg-header .streaming-indicator .dot {
    width: 3px;
    height: 3px;
  }
}

/* --- 通用消息体样式 --- */
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

/* --- 图片相关 --- */
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

.msg-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.msg-images .msg-image {
  max-height: 200px;
}

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

/* --- 极小屏幕优化 --- */
@media (max-width: 480px) {
  .msg { 
    padding: var(--space-2) var(--space-1);
    margin-bottom: var(--space-2);
  }

  .msg-header .avatar-wrapper {
    width: 24px;
    height: 24px;
  }

  .robot-name.mobile {
    font-size: 11px;
  }

  .msg-body.self.mobile,
  .msg-body.other.mobile {
    padding: var(--space-2);
    font-size: 14px;
    max-width: 90%;
  }

  .msg-image { 
    max-height: 250px; 
  }
}

/* --- 确认按钮样式 --- */
.tool-confirm-row {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.tool-confirm-button {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e11d48;
  background: #fee2e2;
  color: #b91c1c;
  cursor: pointer;
}

.tool-confirm-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.tool-confirm-button:hover:not(:disabled) {
  background: #fecaca;
}

.tool-confirm-status {
  font-size: 12px;
}

.tool-confirm-status.success {
  color: #16a34a;
}

.tool-confirm-status.failed {
  color: #b91c1c;
}

@media (max-width: 480px) {
  .tool-confirm-row {
    align-items: flex-start;
  }
}
      `}</style>
    </>
  );
});

export default MessageItem;
