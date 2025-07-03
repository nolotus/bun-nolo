import React, { useRef, useEffect, useState, useCallback } from "react";
import { Editor, Range, Element as SlateElement, Transforms } from "slate";
import { useFocused, useSlate, ReactEditor } from "slate-react";
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
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  const [isLinkEditorOpen, setLinkEditorOpen] = useState(false);
  const [toolbarAnchorRect, setToolbarAnchorRect] = useState<DOMRect | null>(
    null
  );
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

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
    if (!domSelection || domSelection.rangeCount === 0) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    setToolbarAnchorRect(rect);

    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 6}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  }, [editor.selection, inFocus, isLinkEditorOpen]);

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
            opacity: 0,
            visibility: "hidden",
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
