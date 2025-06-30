// create/editor/LinkEditorPopover.tsx (最终重构版)

import React, { useRef, useEffect, useState } from "react";
import { Portal, Menu, Button } from "./components";
import { MdCheck } from "react-icons/md";
import { TrashIcon } from "@primer/octicons-react";
import { selectTheme } from "app/settings/settingSlice";
import { useAppSelector } from "app/store";

// Props 定义了组件的 API，它需要什么，以及它能做什么
interface LinkEditorPopoverProps {
  isOpen: boolean;
  anchorRect: DOMRect | null;
  initialUrl: string;
  onConfirm: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const LinkEditorPopover: React.FC<LinkEditorPopoverProps> = ({
  isOpen,
  anchorRect,
  initialUrl,
  onConfirm,
  onRemove,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 内部 state 只用于管理输入框的值
  const [url, setUrl] = useState("");
  const isEditing = initialUrl !== "";

  // 当弹窗打开时，用 initialUrl 同步内部输入框的值
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
    }
  }, [isOpen, initialUrl]);

  // 定位和焦点管理的副作用
  useEffect(() => {
    if (!isOpen || !anchorRect || !popoverRef.current) return;

    const el = popoverRef.current;
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.top = `${anchorRect.top + window.pageYOffset - el.offsetHeight - 6}px`;
    el.style.left = `${anchorRect.left + window.pageXOffset - el.offsetWidth / 2 + anchorRect.width / 2}px`;

    // 延迟以确保在浏览器渲染后执行，可靠地设置焦点和全选
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isOpen, anchorRect]);

  const handleConfirm = () => {
    const trimmedUrl = url.trim();
    if (trimmedUrl) {
      onConfirm(trimmedUrl);
    } else {
      // 如果空 URL，则当做移除链接处理
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Menu
        ref={popoverRef}
        style={{
          position: "absolute",
          zIndex: 9999,
          backgroundColor: theme.backgroundSecondary,
          borderRadius: "6px",
          boxShadow: `0 3px 12px ${theme.shadowMedium}`,
          padding: "8px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          transition: "opacity 0.2s, visibility 0.2s, top 0.1s, left 0.1s",
          visibility: "hidden",
          opacity: 0,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="粘贴或输入链接..."
          style={{
            background: theme.backgroundTertiary,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            borderRadius: "4px",
            padding: "6px 10px",
            fontSize: "14px",
            width: "240px",
            outline: "none",
          }}
        />
        <Button reversed active onClick={handleConfirm}>
          <MdCheck size={20} color={theme.textSecondary} />
        </Button>
        {isEditing && (
          <Button reversed active onClick={onRemove}>
            <TrashIcon size={18} color={theme.textSecondary} />
          </Button>
        )}
      </Menu>
    </Portal>
  );
};
