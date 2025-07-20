// create/editor/syntaxHighlighting.tsx

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

import { CodeBlockType, CodeLineType } from "./types";
import { normalizeTokens } from "./utils/normalize-tokens";

// 注意: 此类型也用于 Editor.tsx。
// 为了更好的可维护性，建议将其移动到共享的 types.ts 文件中。
type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

/**
 * 将多个 Map 合并成一个。如果 key 冲突，后一个 map 的值会覆盖前一个。
 * @param maps - 需要合并的 Map 对象数组
 * @returns 一个包含所有键值对的新 Map
 */
const mergeMaps = <K, V>(...maps: Map<K, V>[]): Map<K, V> => {
  const merged = new Map<K, V>();
  for (const m of maps) {
    for (const [k, v] of m) {
      merged.set(k, v);
    }
  }
  return merged;
};

/**
 * 使用 Prism.js 为单个代码块节点生成装饰器范围 (Ranges)。
 * @param entry - 代码块的节点条目 [node, path]。
 * @returns 一个 Map，其键是子级的 code-line 元素，值是它们计算出的装饰器 Range 数组。
 */
const getChildNodeToDecorations = ([block, blockPath]: NodeEntry): Map<
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

  // 过滤出有效的 code-line 子节点
  const codeLines = block.children.filter(
    (child): child is SlateElement =>
      SlateElement.isElement(child) && child.type === CodeLineType
  );
  if (codeLines.length === 0) {
    return nodeToDecorations;
  }

  // 确定语言并获取 Prism 的语法规则
  const language = (block as any).language || "plain";
  const grammar = Prism.languages[language] || Prism.languages.plain;
  if (!grammar && language !== "plain") {
    // 优雅地处理缺失的语法规则
    console.warn(`Prism grammar not found for language: ${language}`);
  }

  // 拼接所有代码行的文本以进行整体分析
  let text = "";
  try {
    text = codeLines.map((line) => Node.string(line)).join("\n");
  } catch (e) {
    console.error("从代码行提取文本时出错:", e);
    return nodeToDecorations;
  }

  // 使用 Prism 对整个代码块的文本进行词法分析
  let tokens;
  try {
    tokens = Prism.tokenize(text, grammar);
  } catch (e) {
    console.error(`Prism 在处理 ${language} 时出错:`, e);
    return nodeToDecorations;
  }

  // 将令牌（tokens）规范化为逐行结构，并创建 Slate Ranges
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

      // 创建一个 Slate Range，并将 token 类型作为布尔标志，便于样式化
      const range: Range & Record<string, boolean> = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true, // 一个适用于所有 token 的通用标志
        ...Object.fromEntries(types.map((t) => [t, true])),
      };

      nodeToDecorations.get(element)!.push(range);
      offset = end;
    }
  });

  return nodeToDecorations;
};

/**
 * 一个 React hook，返回一个 memoized 的 Slate `decorate` 函数。
 * 此函数从 editor 实例中读取预先计算好的装饰器数据。
 * @param editor - 自定义 editor 实例
 * @returns 一个 Slate `decorate` 函数
 */
export const useDecorate = (editor: CustomEditor) => {
  return useCallback(
    ([node]: NodeEntry): Range[] => {
      // 仅对那些已经有预计算装饰信息的 code-line 元素进行装饰
      if (
        SlateElement.isElement(node) &&
        node.type === CodeLineType &&
        editor.nodeToDecorations?.has(node)
      ) {
        return editor.nodeToDecorations.get(node)!;
      }
      return [];
    },
    [editor.nodeToDecorations] // 仅当装饰器 map 变更时才重新创建函数
  );
};

/**
 * 一个“无头”的 React 组件，负责预计算并缓存编辑器中所有代码块的语法高亮装饰器。
 * 它将结果附加到 `editor.nodeToDecorations` 上，以供 `useDecorate` 消费。
 */
export const SetNodeToDecorations: React.FC = () => {
  const editor = useSlate<CustomEditor>();

  // Memoize 整个装饰器计算过程。
  // 仅当编辑器的 children (文档内容) 改变时才重新运行。
  const nodeToDecorations = useMemo(() => {
    const codeBlockEntries = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
      })
    );
    const decorationMaps = codeBlockEntries.map(getChildNodeToDecorations);
    return mergeMaps(...decorationMaps);
  }, [editor.children]);

  // 将计算出的装饰器附加到 editor 实例上，以便全局访问。
  editor.nodeToDecorations = nodeToDecorations;

  // 此组件不渲染任何内容。
  return null;
};
