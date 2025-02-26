import Prism from "prismjs";

import React, { useCallback, useState } from "react";
import { Editor, Node, Element as SlateElement, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSlate, withReact } from "slate-react";

import { ElementWrapper } from "./ElementWrapper";
import { ExampleToolbar } from "./ExampleToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { toggleMark } from "./mark";
import { renderLeaf } from "./renderLeaf";
import { prismThemeCss } from "./theme/prismThemeCss";
import { CodeBlockType, CodeLineType } from "./type";
import { useOnKeydown } from "./useOnKeyDown";
import { normalizeTokens } from "./utils/normalize-tokens";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";

const NoloEditor = ({ initialValue, readOnly, onChange, placeholder }) => {
  const [editor] = useState(() =>
    withShortcuts(withLayout(withHistory(withReact(createEditor()))))
  );
  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeydown(editor);
  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          onChange?.(value);
        }
      }}
    >
      {!readOnly && (
        <>
          <ExampleToolbar />
          <HoveringToolbar />
        </>
      )}

      <SetNodeToDecorations />
      <Editable
        placeholder={placeholder}
        style={!readOnly ? { padding: "20px" } : {}}
        readOnly={readOnly}
        decorate={decorate}
        renderElement={ElementWrapper}
        renderLeaf={renderLeaf}
        onKeyDown={onKeyDown}
        onDOMBeforeInput={(event) => {
          switch (event.inputType) {
            case "formatBold":
              event.preventDefault();
              return toggleMark(editor, "bold");
            case "formatItalic":
              event.preventDefault();
              return toggleMark(editor, "italic");
            case "formatUnderline":
              event.preventDefault();
              return toggleMark(editor, "underlined");
          }
        }}
      />
      <style>{prismThemeCss}</style>
    </Slate>
  );
};

const useDecorate = (editor) => {
  return useCallback(
    ([node, path]) => {
      if (SlateElement.isElement(node) && node.type === CodeLineType) {
        const ranges = editor.nodeToDecorations.get(node) || [];
        return ranges;
      }
      return [];
    },
    [editor.nodeToDecorations]
  );
};

const getChildNodeToDecorations = ([block, blockPath]) => {
  const nodeToDecorations = new Map();
  const text = block.children.map((line) => Node.string(line)).join("\n");
  const language = block.language;
  const grammar = Prism.languages[language] || Prism.languages.plain;
  const tokens = Prism.tokenize(text, grammar);
  const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
  const blockChildren = block.children;

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];
    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }
    let start = 0;
    for (const token of tokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }
      const end = start + length;
      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map((type) => [type, true])),
      };
      nodeToDecorations.get(element).push(range);
      start = end;
    }
  }
  return nodeToDecorations;
};
// precalculate editor.nodeToDecorations map to use it inside decorate function then

const SetNodeToDecorations = () => {
  const editor = useSlate();
  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: "highest",
      match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
    })
  );
  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  );
  editor.nodeToDecorations = nodeToDecorations;
  return null;
};

const mergeMaps = (...maps) => {
  const map = new Map();
  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }
  return map;
};

export default NoloEditor;
