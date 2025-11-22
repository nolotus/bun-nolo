import React, { useCallback, useMemo } from "react";
import {
  Editor,
  Node,
  Element as SlateElement,
  Range,
  NodeEntry,
  Path,
} from "slate";
import { useSlate, ReactEditor } from "slate-react";
import { History } from "slate-history";
import Prism from "prismjs";

// 常用语言静态引入，确保立即可用
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-mermaid";

import { CodeBlockType, CodeLineType } from "./types";
import { normalizeTokens } from "./utils/normalize-tokens";

type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

const mergeMaps = <K, V>(...maps: Map<K, V>[]): Map<K, V> => {
  const merged = new Map<K, V>();
  for (const m of maps) {
    for (const [k, v] of m) {
      merged.set(k, v);
    }
  }
  return merged;
};

const getChildNodeToDecorations = (
  [block, blockPath]: NodeEntry,
  prismLib: typeof Prism
): Map<SlateElement, Range[]> => {
  const nodeToDecorations = new Map<SlateElement, Range[]>();
  if (
    !SlateElement.isElement(block) ||
    block.type !== CodeBlockType ||
    !Array.isArray(block.children) ||
    (block as any).preview === "true"
  ) {
    return nodeToDecorations;
  }

  const codeLines = block.children.filter(
    (child): child is SlateElement =>
      SlateElement.isElement(child) && child.type === CodeLineType
  );
  if (codeLines.length === 0) return nodeToDecorations;

  const language = ((block as any).language || "plain").toLowerCase();
  const grammar =
    prismLib.languages[language] || prismLib.languages.plain || {};

  let text = "";
  try {
    text = codeLines.map((line) => Node.string(line)).join("\n");
  } catch (e) {
    console.error("从代码行提取文本时出错:", e);
    return nodeToDecorations;
  }

  let tokens;
  try {
    tokens = prismLib.tokenize(text, grammar);
  } catch (e) {
    console.error(`Prism 在处理 ${language} 时出错:`, e);
    return nodeToDecorations;
  }

  const normalized = normalizeTokens(tokens);
  normalized.forEach((lineTokens, lineIndex) => {
    if (lineIndex >= codeLines.length) return;

    const element = codeLines[lineIndex];
    nodeToDecorations.set(element, []);
    let offset = 0;

    for (const token of lineTokens) {
      const content = typeof token.content === "string" ? token.content : "";
      const length = content.length;
      if (length === 0) continue;

      const start = offset;
      const end = start + length;
      const path: Path = [...blockPath, lineIndex, 0];
      const types = (token.types || []).filter((t) => t !== "text");

      const range: Range & Record<string, boolean> = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(types.map((t) => [t, true])),
      };

      nodeToDecorations.get(element)!.push(range);
      offset = end;
    }
  });

  return nodeToDecorations;
};

export const useDecorate = (editor: CustomEditor) => {
  return useCallback(
    ([node]: NodeEntry): Range[] => {
      const decorations = editor.nodeToDecorations;
      if (
        SlateElement.isElement(node) &&
        node.type === CodeLineType &&
        decorations?.has(node)
      ) {
        return decorations.get(node)!;
      }
      return [];
    },
    [editor]
  );
};

interface SetNodeToDecorationsProps {
  highlightEnabled: boolean;
  docVersion: number;
}

export const SetNodeToDecorations: React.FC<SetNodeToDecorationsProps> = ({
  highlightEnabled,
  docVersion,
}) => {
  const editor = useSlate<CustomEditor>();

  const nodeToDecorations = useMemo(() => {
    if (!highlightEnabled) {
      return new Map<SlateElement, Range[]>();
    }
    const codeBlockEntries = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          SlateElement.isElement(n) &&
          n.type === CodeBlockType &&
          (n as any).preview !== "true",
      })
    );
    const decorationMaps = codeBlockEntries.map((entry) =>
      getChildNodeToDecorations(entry, Prism)
    );
    return mergeMaps(...decorationMaps);
  }, [editor, docVersion, highlightEnabled]);

  editor.nodeToDecorations = nodeToDecorations;
  return null;
};
