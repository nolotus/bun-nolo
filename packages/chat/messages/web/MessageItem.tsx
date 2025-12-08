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
import StreamingIndicator from "render/web/ui/StreamingIndicator";

// --- 文本渲染 ---
const MessageText = memo(
  ({
    content,
    role,
    isStreaming = false,
  }: {
    content: string;
    role: string;
    isStreaming?: boolean;
  }) => {
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
  }
);

const ImagePreview = memo(
  ({
    src,
    alt,
    onPreview,
  }: {
    src: string;
    alt?: string;
    onPreview: (src: string) => void;
  }) => {
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
  }
);

// --- 内容聚合 ---
export const MessageContent = memo(
  ({
    content,
    thinkContent,
    role,
    isStreaming = false,
  }: {
    content: any;
    thinkContent: any;
    role: "self" | "other";
    isStreaming?: boolean;
  }) => {
    const [filePreview, setFilePreview] = useState<any | null>(null);
    const [imgPreview, setImgPreview] = useState<string | null>(null);

    const onFile = useCallback((fd: any) => setFilePreview(fd), []);
    const onImg = useCallback((src: string) => setImgPreview(src), []);
    const closeFile = useCallback(() => setFilePreview(null), []);
    const closeImg = useCallback(() => setImgPreview(null), []);

    const segments = useMemo(() => {
      if (!Array.isArray(content)) return [];
      const segs: any[] = [];
      let cur: any = null;

      content.forEach((it: any) => {
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
      if (!content) return <div className="empty-content">思考中...</div>;

      if (typeof content === "string") {
        return (
          <MessageText
            content={content}
            role={role === "self" ? "self" : "other"}
            isStreaming={isStreaming}
          />
        );
      }

      return segments.map((seg: any, i: number) => {
        if (seg.type === "images") {
          if (seg.items.length > 1) {
            return (
              <div key={i} className="msg-images">
                {seg.items.map((it: any, idx: number) => (
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

        return seg.items.map((it: any, idx: number) => {
          if (it.type === "text" && it.text) {
            return (
              <MessageText
                key={`${i}-${idx}`}
                content={it.text}
                role={role === "self" ? "self" : "other"}
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

// --- 主组件 ---
export const MessageItem = memo(({ message }: { message: any }) => {
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

  const displayName = isRobot ? robotData?.name || "AI Assistant" : "User";

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
    onToggleActions: () => setShowActions((v: boolean) => !v),
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
        {/* 桌面端：头像 + actions 使用 sticky，内容区域正常滚动 */}
        {!isTouch && (
          <div className="msg-inner desktop">
            {/* 头像 + 操作区列：在桌面端 sticky 在视口上方一定位置 */}
            <div className="avatar-area">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
                  type={isRobot ? "robot" : "user"}
                  size="medium"
                />
                {isRobot && isStreaming && (
                  <div className="avatar-indicator-pos">
                    <StreamingIndicator />
                  </div>
                )}
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

        {/* 移动端：保持原有结构，不做 sticky，避免遮挡 */}
        {isTouch && (
          <div className="msg-inner mobile">
            <div className="msg-header">
              <div className="avatar-wrapper">
                <Avatar
                  name={displayName}
                  type={isRobot ? "robot" : "user"}
                  size="small"
                />
                {isRobot && isStreaming && (
                  <div className="avatar-indicator-pos mobile">
                    <StreamingIndicator />
                  </div>
                )}
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
/* === 外层：不加横向 padding，由 DialogPage 控制安全区 === */
.msg {
  margin-bottom: var(--space-4);
  position: relative;
  z-index: 1;
}

/* === 桌面端：左右两块，使用 flex 布局 === */
.msg-inner.desktop {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

/* 自己的消息：反转主轴方向，让头像到右边 */
.msg.self .msg-inner.desktop {
  flex-direction: row-reverse;
}

/* === 头像列 === */
.avatar-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  position: relative;
}

/* 头像 + actions 在桌面端 sticky：随着滚动向上，抵达 top 后固定，直到被下一条顶走 */
@media (hover: hover) and (pointer: fine) {
  .msg-inner.desktop .avatar-area {
    position: sticky;
    /* 根据你的顶部导航 / 工具栏高度微调这个值 */
    top: 72px;
    align-self: flex-start;
    z-index: 5;
  }

  /* 自己的消息时头像在右侧，对齐到右边更自然 */
  .msg.self .msg-inner.desktop .avatar-area {
    align-items: flex-end;
  }
}

.avatar-wrapper {
  position: relative;
}

.avatar-indicator-pos {
  position: absolute;
  bottom: -4px;
  right: -8px;
  z-index: 10;
  transform: scale(0.8);
}
.avatar-indicator-pos.mobile {
  right: -6px;
  bottom: -4px;
  transform: scale(0.7);
}

/* === 内容列 === */
.content-area {
  flex: 1;
  min-width: 0;
}

.robot-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--textTertiary);
  margin-bottom: 6px;
  opacity: 0.8;
}

/* === 气泡 === */
.msg-body {
  color: var(--text);
  line-height: 1.75;
  font-size: 15px;
  word-wrap: break-word;
}

/* 机器人：靠左自然排布 */
.msg-body.robot {
  background: transparent;
  padding: 0;
}

/* 用户：右对齐气泡，头像在最右，气泡在头像左侧 */
.msg-body.self {
  background: var(--primaryBg);
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-left: auto; /* 在 content-area 内把气泡推到右边 */
}

/* === 移动端保持原有两套 DOM === */
@media (hover: none) and (pointer: coarse) {
  .msg {
    margin-bottom: var(--space-3);
  }

  .msg-inner.mobile {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .msg-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
  }
  .msg.self .msg-header {
    flex-direction: row-reverse;
  }

  .msg-header .avatar-wrapper {
    width: 28px;
    height: 28px;
  }

  .robot-name.mobile {
    font-size: 12px;
    margin: 0;
  }

  .msg-body.self.mobile {
    background: var(--primaryBg);
    border-radius: 16px 16px 4px 16px;
    padding: 10px 14px;
    margin-left: auto;
    max-width: 100%;
  }

  .msg-body.robot.mobile {
    max-width: 100%;
  }
}

/* === 内容细节 === */
.msg-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-content {
  color: var(--textTertiary);
  font-style: italic;
  font-size: 13px;
}

.message-text {
  line-height: inherit;
}
.simple-text {
  white-space: pre-wrap;
  margin: 0;
}

/* 图片 */
.msg-image-wrap {
  display: inline-block;
  vertical-align: top;
}
.msg-image {
  border-radius: 8px;
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border: 1px solid var(--border);
  cursor: pointer;
}

.msg-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.msg-images .msg-image {
  max-height: 200px;
}

/* hover 显示操作区（桌面） */
@media (hover: hover) and (pointer: fine) {
  .msg:hover .actions {
    opacity: 1;
    visibility: visible;
  }
}

/* 折叠态 */
.msg.collapsed .msg-content {
  max-height: 56px;
  overflow: hidden;
  position: relative;
}
.msg.collapsed .msg-content::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: linear-gradient(transparent, var(--background));
}

@media (max-width: 480px) {
  .msg-body.self.mobile,
  .msg-body.robot.mobile {
    font-size: 15px;
  }
}
      `}</style>
    </>
  );
});

export default MessageItem;
