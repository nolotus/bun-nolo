// MessageItem.jsx
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { selectTheme } from "app/theme/themeSlice";
import { CopyIcon, BookmarkIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";
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
import { Avatar } from "render/ui";
import { MessageContent } from "./MessageContent";
import { useFetchData } from "app/hooks";

const getContentString = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) =>
        item.type === "text"
          ? item.text
          : item.type === "image_url"
            ? `[Image: ${item.image_url?.url}]`
            : ""
      )
      .join("\n");
  }
  return JSON.stringify(content);
};

export const MessageItem = ({ message }) => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const { user } = useAuth();
  const [isShort, setIsShort] = useState(false);

  const { content, userId, dbKey, cybotKey, role } = message;
  if (!content) return null;

  useEffect(() => {
    const str = getContentString(content);
    setIsShort(str.split("\n").length <= 2 && str.length <= 80);
  }, [content]);

  const isSelf = role === "user" && (currentUserId === userId || !cybotKey);
  const isRobot = role !== "user";
  const type = isSelf ? "self" : isRobot ? "robot" : "other";

  const { data: robotData } =
    cybotKey && isRobot ? useFetchData(cybotKey) : { data: null };

  const handleCopy = () => {
    const text = getContentString(content);
    if (!text) return toast.error(t("copyFailed"));
    copyToClipboard(text, {
      onSuccess: () => toast.success(t("copySuccess")),
      onError: () => toast.error(t("copyFailed")),
    });
  };

  const handleDelete = () => {
    dispatch(deleteMessage(dbKey));
    toast.success(t("deleteSuccess"));
  };

  const handleSave = async () => {
    if (!user?.userId) return toast.error(t("userNotAuthenticated"));

    const str = getContentString(content);
    if (!str) return toast.error(t("contentIsEmpty"));

    const key = `${DataType.PAGE}-${user.userId}-${ulid()}`;
    let title = key;

    // 生成标题
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

  // 根据消息类型过滤操作
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

  return (
    <div className={`msg ${type} ${isShort ? "short" : ""}`}>
      <div className="msg-inner">
        {/* 头像和操作区域 */}
        <div className="avatar-area">
          <Avatar name={isRobot ? "robot" : "user"} />
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
              content={content}
              role={isSelf ? "self" : "other"}
            />
          </div>
        </div>
      </div>

      <style href="msg">{`
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
        
        /* 用户消息右对齐 */
        .msg.self .msg-inner { 
          flex-direction: row-reverse; 
          justify-content: flex-start;
          max-width: 75%;
          margin-left: auto;
          margin-right: 0;
        }
        
        /* 其他用户消息左对齐 */
        .msg.other .msg-inner { 
          max-width: 75%;
          margin-left: 0;
          margin-right: auto;
        }
        
        /* 机器人消息居中 */
        .msg.robot .msg-inner { 
          max-width: 95%; 
        }
        
        /* 头像和操作区域 */
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
          border: 1px solid ${theme.border}30; 
          border-radius: ${theme.space[2]}; 
          padding: ${theme.space[1]}; 
          gap: 2px;
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }
        
        .msg:hover .actions { opacity: 0.9; }
        .actions:hover { opacity: 1 !important; }
        
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
          transform: scale(1.1);
        }
        
        .action-btn.danger:hover { 
          color: ${theme.error}; 
          background: ${theme.error}10; 
        }
        
        /* 内容区域 */
        .content-area { 
          flex: 1; 
          min-width: 0; 
        }
        
        .robot-name { 
          font-size: 11px; 
          font-weight: 700; 
          color: ${theme.textSecondary}; 
          text-transform: uppercase; 
          margin-bottom: ${theme.space[2]}; 
          padding-left: ${theme.space[1]};
        }
        
        .msg-body { 
          color: ${theme.text}; 
          line-height: 1.7; 
          word-wrap: break-word; 
        }
        
        /* 消息样式 */
        .msg-body.self { 
          background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}12 100%); 
          border-radius: 18px 18px 6px 18px; 
          padding: ${theme.space[4]} ${theme.space[5]}; 
          border: 1px solid ${theme.primary}20; 
          transition: all 0.25s ease; 
        }
        
        .msg-body.other { 
          background: ${theme.backgroundSecondary}; 
          border-radius: 18px 18px 18px 6px; 
          padding: ${theme.space[4]} ${theme.space[5]}; 
          border: 1px solid ${theme.border}40; 
          transition: all 0.25s ease; 
        }
        
        .msg-body.robot { 
          background: transparent; 
          padding: ${theme.space[2]} 0; 
        }
        
        /* 短消息优化 */
        .msg.short .msg-body.self,
        .msg.short .msg-body.other { 
          padding: ${theme.space[3]} ${theme.space[4]}; 
          border-radius: 14px; 
          font-size: 14px; 
        }
        
        .msg.short .msg-body.self { border-radius: 14px 14px 4px 14px; }
        .msg.short .msg-body.other { border-radius: 14px 14px 14px 4px; }
        
        /* 响应式 */
        @media (max-width: 768px) { 
          .msg { padding: 0 ${theme.space[3]}; }
          .msg.self .msg-inner, .msg.other .msg-inner { max-width: 90%; }
          .actions { opacity: 0.7; }
          .action-btn { width: 28px; height: 28px; }
        }
        
        @media (max-width: 480px) { 
          .msg { padding: 0 ${theme.space[2]}; }
          .msg.self .msg-inner, .msg.other .msg-inner, .msg.robot .msg-inner { max-width: 100%; }
          .msg-inner { gap: ${theme.space[2]}; }
          .avatar-area { position: static; }
        }
      `}</style>
    </div>
  );
};
