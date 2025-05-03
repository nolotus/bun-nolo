// create/editor/Editor.tsx
import Prism from "prismjs";
import React, { useCallback, useState, useMemo } from "react";
import {
  Editor,
  Node,
  Element as SlateElement,
  createEditor,
  Descendant,
  Range,
  Transforms,
} from "slate";
import { withHistory, History } from "slate-history"; // Import History type
import { Editable, Slate, useSlate, withReact, ReactEditor } from "slate-react";

import { ElementWrapper } from "./ElementWrapper";
import { ExampleToolbar } from "./ExampleToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { toggleMark } from "./mark";
import { renderLeaf } from "./renderLeaf";
import { prismThemeCss } from "./theme/prismThemeCss";
import { CodeBlockType, CodeLineType } from "./type"; // Define these types
import { useOnKeydown } from "./useOnKeyDown";
import { normalizeTokens } from "./utils/normalize-tokens";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { PlaceHolder } from "render/page/PlaceHolder";
// Type for the editor instance with custom properties
type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
  placeholder?: string;
}

const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
  placeholder,
}) => {
  const editor = useMemo(() => {
    const baseEditor = withShortcuts(
      withLayout(withHistory(withReact(createEditor() as ReactEditor)))
    );

    // Fix for inline elements (e.g., inline-code) copy/paste behavior
    const { isInline } = baseEditor;
    baseEditor.isInline = (element) => {
      // Add all your inline element types here
      return element.type === "inline-code" ? true : isInline(element);
    };

    return baseEditor as CustomEditor;
  }, []);

  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeydown(editor);

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          const isAstChange = editor.operations.some(
            (op) => "set_selection" !== op.type
          );
          if (isAstChange && onChange) {
            onChange(value);
          }
        }}
      >
        {!readOnly && (
          <div className="toolbar-container">
            <ExampleToolbar />
            <HoveringToolbar />
          </div>
        )}
        <SetNodeToDecorations />
        <Editable
          placeholder=" "
          renderPlaceholder={({ children, attributes }) => (
            <div {...attributes}>
              <PlaceHolder />
            </div>
          )}
          readOnly={readOnly}
          decorate={decorate}
          renderElement={ElementWrapper}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          onDOMBeforeInput={(event: InputEvent) => {
            switch (event.inputType) {
              case "formatBold":
                event.preventDefault();
                return toggleMark(editor, "bold");
              case "formatItalic":
                event.preventDefault();
                return toggleMark(editor, "italic");
              case "formatUnderline":
                event.preventDefault();
                return toggleMark(editor, "underline");
            }
          }}
        />
        <style>{prismThemeCss}</style>
      </Slate>

      {/* Minimal container styling */}
      <style>{`
        .nolo-editor-container {
          position: relative;
          /* Removed border */
          border-radius: 4px;
          padding: 10px; /* Keep padding for content spacing */
        }

        .toolbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: white; /* Example background */
          border-bottom: 1px solid #eee; /* Separator */
          margin-bottom: 10px;
          padding: 5px;
        }

        /* Example style for inline code - Ensure ElementWrapper renders correctly */
        .inline-code {
            font-family: monospace;
            background-color: #f0f0f0;
            padding: 0.1em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

// --- Syntax Highlighting Logic ---

const useDecorate = (editor: CustomEditor) => {
  return useCallback(
    ([node, path]): Range[] => {
      if (
        SlateElement.isElement(node) &&
        node.type === CodeLineType &&
        editor.nodeToDecorations?.has(node)
      ) {
        return editor.nodeToDecorations.get(node) || [];
      }
      return [];
    },
    [editor.nodeToDecorations] // Depends on the decoration map stored on the editor
  );
};

const getChildNodeToDecorations = ([block, blockPath]): Map<
  SlateElement,
  Range[]
> => {
  const nodeToDecorations = new Map<SlateElement, Range[]>();
  if (
    !SlateElement.isElement(block) ||
    block.type !== CodeBlockType ||
    !Array.isArray(block.children)
  ) {
    return nodeToDecorations;
  }

  const codeLines = block.children.filter(
    (line): line is SlateElement =>
      SlateElement.isElement(line) && line.type === CodeLineType
  );
  if (codeLines.length === 0) return nodeToDecorations;

  let text = "";
  try {
    text = codeLines.map((line) => Node.string(line)).join("\n");
  } catch (e) {
    console.error("Error getting string from code block lines:", e, block);
    return nodeToDecorations;
  }

  const language = (block.language as string) || "plain";
  const grammar = Prism.languages[language] || Prism.languages.plain;

  if (!grammar && language !== "plain") {
    console.warn(`Prism grammar not found for language: ${language}`);
  }

  let tokens;
  try {
    tokens = Prism.tokenize(text, grammar || Prism.languages.plain);
  } catch (e) {
    console.error(
      `Prism error tokenizing text for language ${language}:`,
      e,
      text
    );
    return nodeToDecorations;
  }

  const normalizedTokens = normalizeTokens(tokens);

  for (let lineIndex = 0; lineIndex < normalizedTokens.length; lineIndex++) {
    if (lineIndex >= codeLines.length) continue; // Skip extra normalized lines if any

    const tokensInLine = normalizedTokens[lineIndex];
    const codeLineElement = codeLines[lineIndex];

    nodeToDecorations.set(codeLineElement, []); // Ensure map entry exists

    let currentOffset = 0;
    for (const token of tokensInLine) {
      const tokenContent =
        typeof token.content === "string" ? token.content : "";
      const tokenLength = tokenContent.length;
      if (!tokenLength) continue;

      const startOffset = currentOffset;
      const endOffset = startOffset + tokenLength;
      const textNodePath = [...blockPath, lineIndex, 0];

      // Filter out 'text' type to prevent Slate internal errors
      const tokenTypes = (token.types || []).filter((type) => type !== "text");

      const range: Range & { [key: string]: any } = {
        anchor: { path: textNodePath, offset: startOffset },
        focus: { path: textNodePath, offset: endOffset },
        token: true,
        ...Object.fromEntries(tokenTypes.map((type) => [type, true])),
      };

      nodeToDecorations.get(codeLineElement)?.push(range);
      currentOffset = endOffset;
    }
  }
  return nodeToDecorations;
};

// Component calculates decorations and stores them on editor.nodeToDecorations
const SetNodeToDecorations: React.FC = () => {
  const editor = useSlate() as CustomEditor;

  const nodeToDecorations = useMemo(() => {
    const codeBlockEntries = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
      })
    );
    const decorationMaps = codeBlockEntries.map(getChildNodeToDecorations);
    return mergeMaps(...decorationMaps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.children]); // Recalculate when editor content changes

  editor.nodeToDecorations = nodeToDecorations;
  return null; // Renders nothing
};

// Merges multiple Maps, later maps overwrite earlier ones
const mergeMaps = <K, V>(...maps: Map<K, V>[]): Map<K, V> => {
  const mergedMap = new Map<K, V>();
  for (const currentMap of maps) {
    if (currentMap instanceof Map) {
      for (const [key, value] of currentMap.entries()) {
        mergedMap.set(key, value);
      }
    }
  }
  return mergedMap;
};

export default NoloEditor;
