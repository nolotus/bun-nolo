// create/editor/HoveringToolbar.tsx (使用 @floating-ui/react 最终修复版)

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Editor, Range, Element as SlateElement, Transforms } from "slate";
import { useFocused, useSlate, ReactEditor } from "slate-react";

// 1. 导入 @floating-ui/react
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";

import { Menu, Portal, Button } from "./components";
import { LuBold, LuItalic, LuUnderline, LuLink2 } from "react-icons/lu";
import { isMarkActive, toggleMark } from "./mark";
import { LinkCommands } from "./utils/linkCommands";
import { LinkEditorPopover } from "./LinkEditorPopover";

const FormatButton = ({
  format,
  icon: Icon,
}: {
  format: string;
  icon: React.ComponentType<{ size?: number }>;
}) => {
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
  const editor = useSlate();
  const inFocus = useFocused();

  // 2. 设置 useFloating Hook
  const { x, y, strategy, refs } = useFloating({
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const [isLinkEditorOpen, setLinkEditorOpen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  // 3. 重写 useEffect，只负责更新浮动UI的引用和可见性
  useEffect(() => {
    const { selection } = editor;

    const shouldShow =
      selection &&
      inFocus &&
      !isLinkEditorOpen &&
      !Range.isCollapsed(selection) &&
      Editor.string(editor, selection) !== "";

    setShowToolbar(shouldShow);

    if (shouldShow) {
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        // 创建一个基于用户文本选择的“虚拟”引用元素
        const domRange = domSelection.getRangeAt(0);
        refs.setReference({
          getBoundingClientRect: () => domRange.getBoundingClientRect(),
        });
      }
    }
  }, [editor.selection, inFocus, isLinkEditorOpen, refs, editor]);

  const getActiveLinkUrl = useCallback(() => {
    const [linkNode] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "link",
      at: editor.selection || undefined,
    });
    return linkNode ? (linkNode[0] as any).url : "";
  }, [editor.selection]);

  const handleOpenLinkEditor = useCallback(() => {
    if (editor.selection) {
      setSavedSelection(editor.selection);
      setLinkEditorOpen(true);
    }
  }, [editor.selection]);

  const handleCloseLinkEditor = useCallback(() => {
    setLinkEditorOpen(false);
    if (savedSelection) {
      ReactEditor.focus(editor);
      Transforms.select(editor, savedSelection);
    }
    setSavedSelection(null);
  }, [editor, savedSelection]);

  const handleConfirmLink = useCallback(
    (url: string) => {
      if (savedSelection) {
        Transforms.select(editor, savedSelection);
        LinkCommands.toggleLink(editor, url);
        handleCloseLinkEditor();
      }
    },
    [editor, savedSelection, handleCloseLinkEditor]
  );

  const handleRemoveLink = useCallback(() => {
    if (savedSelection) {
      Transforms.select(editor, savedSelection);
      LinkCommands.toggleLink(editor);
      handleCloseLinkEditor();
    }
  }, [editor, savedSelection, handleCloseLinkEditor]);

  return (
    <>
      <Portal>
        {showToolbar && (
          <Menu
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              padding: "6px 8px",
              zIndex: 9998,
              backgroundColor: "#222",
              borderRadius: "6px",
              transition: "opacity 0.2s",
              display: "flex",
              gap: "4px",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <FormatButton format="bold" icon={LuBold} />
            <FormatButton format="italic" icon={LuItalic} />
            <FormatButton format="underline" icon={LuUnderline} />
            <Button
              reversed
              active={LinkCommands.isLinkActive(editor)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkEditor();
              }}
            >
              <LuLink2 size={16} />
            </Button>
          </Menu>
        )}
      </Portal>

      {/* LinkEditorPopover 现在也需要改造以接收浮动UI的上下文 */}
      <LinkEditorPopover
        isOpen={isLinkEditorOpen}
        // [核心修改] 不再传递 DOMRect，让 LinkEditorPopover 自己处理定位
        onConfirm={handleConfirmLink}
        onRemove={handleRemoveLink}
        onClose={handleCloseLinkEditor}
        initialUrl={getActiveLinkUrl()}
      />
    </>
  );
};
