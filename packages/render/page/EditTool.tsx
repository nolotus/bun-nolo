//EditTool.ts
import { NavLink, useNavigate, useParams } from "react-router-dom";
import React, { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { deleteData } from "database/dbSlice";
import toast from "react-hot-toast";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { setSaveAsTemplate } from "./pageSlice";
import { colors } from "render/styles/theme";
import { animations } from "../styles/animations";
import {
  CheckIcon,
  EyeIcon,
  TrashIcon,
  CommentDiscussionIcon,
} from "@primer/octicons-react";
import {
  createButtonStyle,
  iconStyle,
  getHoverStyles,
} from "render/styles/button";

interface EditToolProps {
  handleSave: () => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
}

export const EditTool: React.FC<EditToolProps> = ({
  handleSave,
  showChat,
  setShowChat,
}) => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDeleting, setDeleting] = React.useState(false);

  const saveAsTemplate = useAppSelector((state) => state.page.saveAsTemplate);

  const handleToggleTemplateChange = (value: boolean) => {
    dispatch(setSaveAsTemplate(value));
  };

  const handleDelete = useCallback(async () => {
    if (!pageId) return;

    setDeleting(true);
    try {
      await dispatch(deleteData({ id: pageId })).unwrap();
      toast.success("删除成功");
      navigate(-1);
    } catch (error) {
      toast.error("删除失败");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  }, [pageId, dispatch, navigate]);

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background-color: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple 0.4s linear;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
  };

  if (!pageId) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "4px",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: "8px",
          backgroundColor: colors.background.lighter,
          backdropFilter: "blur(8px)",
          transition: `all ${animations.duration.fast} ${animations.spring}`,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: colors.text.secondary,
            marginRight: "8px",
            userSelect: "none",
          }}
        >
          按模板保存
        </span>
        <ToggleSwitch
          checked={saveAsTemplate}
          onChange={handleToggleTemplateChange}
        />
      </div>

      <button
        onClick={(e) => {
          createRipple(e);
          handleSave();
        }}
        style={createButtonStyle("primary")}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, getHoverStyles("primary"));
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            createButtonStyle("primary").boxShadow;
        }}
      >
        <span style={iconStyle}>
          <CheckIcon size={16} />
        </span>
        保存
      </button>

      <NavLink
        to={`/${pageId}`}
        style={({ isActive }) => ({
          ...createButtonStyle("default"),
          ...(isActive
            ? {
                backgroundColor: colors.background.active,
                boxShadow: "none",
              }
            : {}),
        })}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, getHoverStyles("default"));
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            createButtonStyle("default").boxShadow;
        }}
        onClick={createRipple}
      >
        <span style={iconStyle}>
          <EyeIcon size={16} />
        </span>
        预览
      </NavLink>

      <button
        onClick={(e) => {
          createRipple(e);
          handleDelete();
        }}
        disabled={isDeleting}
        style={{
          ...createButtonStyle("danger"),
          ...(isDeleting
            ? {
                opacity: 0.7,
                cursor: "not-allowed",
                transform: "none",
                boxShadow: "none",
              }
            : {}),
        }}
        onMouseEnter={(e) => {
          if (!isDeleting) {
            Object.assign(e.currentTarget.style, getHoverStyles("danger"));
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            createButtonStyle("danger").boxShadow;
        }}
      >
        <span style={iconStyle}>
          <TrashIcon size={16} />
        </span>
        {isDeleting ? "删除中..." : "删除"}
      </button>

      <button
        onClick={(e) => {
          createRipple(e);
          setShowChat(!showChat);
        }}
        style={createButtonStyle("chat", showChat)}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, getHoverStyles("chat"));
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = createButtonStyle("chat").boxShadow;
        }}
      >
        <span style={iconStyle}>
          <CommentDiscussionIcon size={16} />
        </span>
        {showChat ? "关闭对话" : "打开对话"}
      </button>

      <style>
        {`
          @keyframes ripple {
            to {
              transform: scale(3);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};
