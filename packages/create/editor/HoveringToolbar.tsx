import React, { useRef, useEffect, useState, useCallback } from "react";
import { Editor, Range, Element as SlateElement, Transforms } from "slate";
import { useFocused, useSlate, ReactEditor } from "slate-react";
import { Menu, Portal, Button } from "./components";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdLink,
} from "react-icons/md";
import { isMarkActive, toggleMark } from "./mark";
import { LinkCommands } from "./utils/linkCommands";
import { LinkEditorPopover } from "./LinkEditorPopover";

const FormatButton = ({ format, icon: Icon }) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={isMarkActive(editor, format)}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon size={16} />
    </Button>
  );
};

export const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  const [isLinkEditorOpen, setLinkEditorOpen] = useState(false);
  const [toolbarAnchorRect, setToolbarAnchorRect] = useState<DOMRect | null>(
    null
  );
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  // 【核心修复】副作用现在直接依赖于 `editor.selection`
  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    const shouldHide =
      !el ||
      !selection ||
      !inFocus ||
      isLinkEditorOpen ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === "";

    if (shouldHide) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      setToolbarAnchorRect(null);
      return;
    }

    const domSelection = window.getSelection();
    // 确保 domSelection 存在，以防万一
    if (!domSelection || domSelection.rangeCount === 0) {
      // 如果无法获取，也隐藏工具栏
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    setToolbarAnchorRect(rect); // 保存 Rect 给 LinkEditorPopover 使用

    // 直接操作 DOM 样式以显示和定位
    el.style.opacity = "1";
    el.style.visibility = "visible";
    // `getBoundingClientRect` 相对于视口，`top` 和 `left` 需要加上滚动偏移
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 6}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;

    // 【核心修复】将 `editor` 替换为 `editor.selection`
    // 这确保了每次选区变化时，useEffect 都会重新运行。
  }, [editor.selection, inFocus, isLinkEditorOpen]);

  const getActiveLinkUrl = useCallback(() => {
    const [linkNode] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "link",
      at: editor.selection || undefined, // 优化：只在当前选区查找
    });
    return linkNode ? (linkNode[0] as any).url : "";
  }, [editor.selection]); // 依赖选区变化

  const handleOpenLinkEditor = useCallback(() => {
    if (editor.selection) {
      setSavedSelection(editor.selection);
      setLinkEditorOpen(true);
    }
  }, [editor.selection]); // 依赖选区

  const handleCloseLinkEditor = useCallback(() => {
    setLinkEditorOpen(false);
    if (savedSelection) {
      ReactEditor.focus(editor);
      // 恢复选区，确保编辑器焦点和选区状态正确
      Transforms.select(editor, savedSelection);
    }
    setSavedSelection(null); // 清理状态
  }, [editor, savedSelection]);

  const handleConfirmLink = useCallback(
    (url: string) => {
      if (savedSelection) {
        // 核心：在执行命令前，必须先将保存的选区应用回编辑器
        Transforms.select(editor, savedSelection);
        LinkCommands.toggleLink(editor, url);
        handleCloseLinkEditor(); // 关闭并清理
      }
    },
    [editor, savedSelection, handleCloseLinkEditor]
  );

  const handleRemoveLink = useCallback(() => {
    if (savedSelection) {
      Transforms.select(editor, savedSelection);
      LinkCommands.toggleLink(editor); // toggleLink 不带 url 参数即为移除
      handleCloseLinkEditor(); // 关闭并清理
    }
  }, [editor, savedSelection, handleCloseLinkEditor]);

  return (
    <>
      <Portal>
        <Menu
          ref={ref}
          style={{
            padding: "6px 8px",
            position: "absolute",
            zIndex: 9998,
            backgroundColor: "#222",
            borderRadius: "6px",
            transition: "opacity 0.2s, visibility 0.2s, top 0.1s, left 0.1s",
            display: "flex",
            gap: "4px",
            // 初始状态隐藏，由 useEffect 控制
            opacity: 0,
            visibility: "hidden",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <FormatButton format="bold" icon={MdFormatBold} />
          <FormatButton format="italic" icon={MdFormatItalic} />
          <FormatButton format="underline" icon={MdFormatUnderlined} />
          <Button
            reversed
            active={LinkCommands.isLinkActive(editor)}
            onMouseDown={(e) => {
              e.preventDefault();
              handleOpenLinkEditor();
            }}
          >
            <MdLink size={16} />
          </Button>
        </Menu>
      </Portal>

      <LinkEditorPopover
        isOpen={isLinkEditorOpen}
        anchorRect={toolbarAnchorRect}
        initialUrl={getActiveLinkUrl()}
        onConfirm={handleConfirmLink}
        onRemove={handleRemoveLink}
        onClose={handleCloseLinkEditor}
      />
    </>
  );
};
