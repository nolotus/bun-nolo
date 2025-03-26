import React, { useRef, useEffect, useState } from "react";
import { Editor, Range } from "slate";
import { useFocused, useSlate } from "slate-react";
import { Menu, Portal } from "./components";

import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";
import { isMarkActive, toggleMark } from "./mark";

export const Button = ({ className, active, reversed, children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      {...props}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        color: reversed
          ? active
            ? "white"
            : "#aaa"
          : active
            ? "black"
            : "#ccc",
        padding: "0 6px",
        opacity: isHovered ? 0.85 : 1,
        backgroundColor: isHovered ? "rgba(255,255,255,0.1)" : "transparent",
        transition: "all 0.2s",
        borderRadius: "2px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
};

// 在 HoveringToolbar 组件文件中

const FormatButton = ({ format, icon: Icon }) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={isMarkActive(editor, format)}
      onClick={() => toggleMark(editor, format)}
    >
      <Icon size={16} />
    </Button>
  );
};

export const HoveringToolbar = () => {
  const ref = useRef();
  const editor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) return;

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    // 只设置位置相关属性
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 6}px`;
    el.style.left = `${rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2}px`;
    el.style.opacity = "1";
    el.style.visibility = "visible";
  });

  return (
    <Portal>
      <Menu
        ref={ref}
        style={{
          padding: "6px 8px",
          position: "fixed",
          zIndex: 9999,
          backgroundColor: "#222",
          borderRadius: "6px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
          transition: "opacity 0.2s, visibility 0.2s",
          visibility: "hidden",
          opacity: 0,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        <FormatButton format="bold" icon={MdFormatBold} />
        <FormatButton format="italic" icon={MdFormatItalic} />
        <FormatButton format="underlined" icon={MdFormatUnderlined} />
      </Menu>
    </Portal>
  );
};
