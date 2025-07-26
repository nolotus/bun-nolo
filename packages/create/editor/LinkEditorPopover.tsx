// create/editor/LinkEditorPopover.tsx (最终完美版：使用 Floating UI & 统一图标)

import React, { useRef, useEffect, useState } from "react";
import { useSlate } from "slate-react";
import { createPortal } from "react-dom";
import { useAppSelector } from "app/store";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";

import { Portal, Menu, Button } from "./components";
import { selectTheme } from "app/settings/settingSlice";

// 1. [图标统一] 从 react-icons/lu 导入图标
import { LuCheck, LuTrash2 } from "react-icons/lu";

interface LinkEditorPopoverProps {
  isOpen: boolean;
  initialUrl: string;
  onConfirm: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const LinkEditorPopover: React.FC<LinkEditorPopoverProps> = ({
  isOpen,
  initialUrl,
  onConfirm,
  onRemove,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const isEditing = initialUrl !== "";

  // 2. 设置 @floating-ui/react Hook
  const { x, y, strategy, refs } = useFloating({
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  // 3. 定位和焦点管理的副作用
  useEffect(() => {
    if (!isOpen) return;

    // 定位逻辑: 基于用户当前的文本选择
    const domSelection = window.getSelection();
    if (domSelection && domSelection.rangeCount > 0) {
      const domRange = domSelection.getRangeAt(0);
      refs.setReference({
        getBoundingClientRect: () => domRange.getBoundingClientRect(),
      });
    }

    // 焦点和状态更新逻辑
    setUrl(initialUrl);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isOpen, initialUrl, refs]);

  const handleConfirm = () => {
    onConfirm(url.trim());
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

  return createPortal(
    <Menu
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 9999,
        backgroundColor: theme.backgroundSecondary,
        borderRadius: "6px",
        boxShadow: `0 3px 12px ${theme.shadowMedium}`,
        padding: "8px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
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
      {/* 4. [图标统一] 使用 LuCheck 和 LuTrash2 图标 */}
      <Button reversed active onClick={handleConfirm}>
        <LuCheck size={20} color={theme.textSecondary} />
      </Button>
      {isEditing && (
        <Button reversed active onClick={onRemove}>
          <LuTrash2 size={16} color={theme.textSecondary} />
        </Button>
      )}
    </Menu>,
    document.body
  );
};
