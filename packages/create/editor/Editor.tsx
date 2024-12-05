import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-mermaid";

import React, { useCallback, useState } from "react";
import { createEditor, Node, Editor, Element } from "slate";
import { withReact, Slate, Editable, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import { normalizeTokens } from "./utils/normalize-tokens";
import { prismThemeCss } from "./theme/prismThemeCss";
import { ElementWrapper } from "./ElementWrapper";
import { useOnKeydown } from "./useOnKeyDown";
import { renderLeaf } from "./renderLeaf";
import { ExampleToolbar } from "./ExampleToolbar";
import { CodeLineType, CodeBlockType } from "./type";

const NoloEditor = ({ initialValue, readOnly }) => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeydown(editor);
  return (
    <Slate editor={editor} initialValue={initialValue}>
      {!readOnly && <ExampleToolbar />}
      <SetNodeToDecorations />
      <Editable
        readOnly={readOnly}
        decorate={decorate}
        renderElement={ElementWrapper}
        renderLeaf={renderLeaf}
        onKeyDown={onKeyDown}
      />
      <style>{prismThemeCss}</style>
    </Slate>
  );
};

const useDecorate = (editor) => {
  return useCallback(
    ([node, path]) => {
      if (Element.isElement(node) && node.type === CodeLineType) {
        const ranges = editor.nodeToDecorations.get(node) || [];
        return ranges;
      }
      return [];
    },
    [editor.nodeToDecorations],
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
      match: (n) => Element.isElement(n) && n.type === CodeBlockType,
    }),
  );
  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations),
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
