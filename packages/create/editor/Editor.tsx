import React, { useMemo, useState, useCallback } from "react";
import {
  Editor,
  Element as SlateElement,
  createEditor,
  Descendant,
  Node,
} from "slate";
import { withHistory, History } from "slate-history";
import { Editable, Slate, withReact, ReactEditor } from "slate-react";

import { useAppSelector } from "app/store";
import { selectEditorWordCountEnabled } from "app/settings/settingSlice";

import { useDecorate, SetNodeToDecorations } from "./syntaxHighlighting";
import { toggleMark } from "./mark";
import { useOnKeyDown } from "./useOnKeyDown";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { withLinks } from "./withLinks";

import { prismThemeCss } from "./theme/prismThemeCss";
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { renderLeaf } from "./renderLeaf";
import { ElementWrapper } from "./ElementWrapper";
import { EditorToolbar } from "./EditorToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { TableContextMenu } from "./TableContextMenu";
import { withTables } from "./withTables";

type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
  isStreaming?: boolean;
}

const countWords = (nodes: Descendant[]): number => {
  const text = nodes.map((node) => Node.string(node)).join("\n");
  const matches = text.match(/[a-zA-Z0-9]+|[\u4e00-\u9fa5]/g);
  return matches ? matches.length : 0;
};

const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
  isStreaming = false,
}) => {
  const editor = useMemo(() => {
    const baseEditor = withTables(
      withShortcuts(
        withLayout(
          withLinks(withHistory(withReact(createEditor() as ReactEditor)))
        )
      )
    );
    const { isInline } = baseEditor;
    baseEditor.isInline = (el) =>
      el.type === "inline-code" ? true : isInline(el);
    return baseEditor as CustomEditor;
  }, []);

  const wordCountEnabled = useAppSelector(selectEditorWordCountEnabled);
  const [wordCount, setWordCount] = useState(() => countWords(initialValue));

  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeyDown(editor);

  const renderElement = useCallback(
    (elementProps: any) => (
      <ElementWrapper {...elementProps} isStreaming={isStreaming} />
    ),
    [isStreaming]
  );

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          const isAstChange = editor.operations.some(
            (op) => op.type !== "set_selection"
          );
          if (isAstChange) {
            setWordCount(countWords(value));
            if (onChange) {
              onChange(value);
            }
          }
        }}
      >
        {!readOnly && (
          <div className="toolbar-container">
            <EditorToolbar />
            <HoveringToolbar />
            <TableContextMenu />
          </div>
        )}
        <SetNodeToDecorations />
        <Editable
          renderPlaceholder={({ attributes }) => (
            <div {...attributes}>
              <PlaceHolder />
            </div>
          )}
          readOnly={readOnly}
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          onDOMBeforeInput={(event: InputEvent) => {
            switch (event.inputType) {
              case "formatBold":
                event.preventDefault();
                toggleMark(editor, "bold");
                break;
              case "formatItalic":
                event.preventDefault();
                toggleMark(editor, "italic");
                break;
              case "formatUnderline":
                event.preventDefault();
                toggleMark(editor, "underline");
                break;
            }
          }}
        />
        <style>{prismThemeCss}</style>
      </Slate>

      {!readOnly && wordCountEnabled && (
        <div className="word-count-display">字数: {wordCount}</div>
      )}

      <style>{`
        .nolo-editor-container {
          position: relative;
          padding: var(--space-2);
        }
        .toolbar-container {
          position: sticky;
          top: 0;
          margin-bottom: var(--space-2);
          padding: var(--space-1);
          z-index: 10;
        }
        .nolo-editor-container [data-slate-editor] {
          font-size: 14px;
          line-height: 1.4;
          color: var(--text);
          -webkit-text-size-adjust: 100%;
        }
        .nolo-editor-container a {
          color: var(--primary);
          text-decoration: none;
          cursor: pointer;
        }
        .nolo-editor-container a:hover {
          text-decoration: underline;
        }
        .inline-code {
          font-family: monospace;
          background-color: var(--backgroundTertiary);
          padding: 0.1em 0.3em;
          border-radius: 3px;
          font-size: 0.85em;
        }
        .word-count-display {
          text-align: right;
          font-size: 12px;
          color: var(--textSecondary);
          margin-top: var(--space-2);
          padding-right: var(--space-1);
          user-select: none;
        }
        
        @media (max-width: 768px) {
          .nolo-editor-container {
            padding: var(--space-1);
          }
          .nolo-editor-container [data-slate-editor] {
            font-size: 15px;
            line-height: 1.35;
          }
          .toolbar-container {
            padding: var(--space-1);
            margin-bottom: var(--space-1);
          }
          .inline-code {
            padding: 0.12em 0.35em;
            font-size: 0.9em;
          }
          .word-count-display {
             margin-top: var(--space-1);
          }
        }
      `}</style>
    </div>
  );
};

export default NoloEditor;
