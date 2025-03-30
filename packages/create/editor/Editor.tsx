// create/editor/Editor.tsx
import Prism from "prismjs";
import React, { useCallback, useState } from "react";
import { Editor, Node, Element as SlateElement, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSlate, withReact } from "slate-react";

import { ElementWrapper } from "./ElementWrapper"; // 确认路径正确
import { ExampleToolbar } from "./ExampleToolbar"; // 假设的工具栏
import { HoveringToolbar } from "./HoveringToolbar"; // 假设的工具栏
import { toggleMark } from "./mark"; // 假设的 mark 处理函数
import { renderLeaf } from "./renderLeaf"; // 确认路径正确
import { prismThemeCss } from "./theme/prismThemeCss"; // 假设的主题 CSS
import { CodeBlockType, CodeLineType } from "./type"; // 假设的类型
import { useOnKeydown } from "./useOnKeyDown"; // 假设的按键处理 hook
import { normalizeTokens } from "./utils/normalize-tokens"; // 假设的工具函数
import { withLayout } from "./withLayout"; // 假设的 layout HOC
import { withShortcuts } from "./withShortcuts"; // 假设的 shortcuts HOC

// NoloEditor 组件 (保持不变)
const NoloEditor = ({ initialValue, readOnly, onChange, placeholder }) => {
  const [editor] = useState(() =>
    withShortcuts(withLayout(withHistory(withReact(createEditor()))))
  );
  // useDecorate 和 SetNodeToDecorations 相关逻辑保持不变
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
          if (isAstChange) {
            onChange?.(value);
          }
        }}
      >
        {!readOnly && (
          <div className="toolbar-container">
            <ExampleToolbar />
            <HoveringToolbar />
          </div>
        )}
        {/* 语法高亮相关组件保持不变 */}
        <SetNodeToDecorations />
        <Editable
          placeholder={placeholder}
          readOnly={readOnly}
          decorate={decorate}
          renderElement={ElementWrapper} // 使用修改后的 ElementWrapper
          renderLeaf={renderLeaf} // 使用修改后的 renderLeaf
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
                return toggleMark(editor, "underlined"); // 假设有 underline mark
            }
          }}
        />
        <style>{prismThemeCss}</style> {/* 注入 Prism 主题样式 */}
      </Slate>

      {/* 容器样式 (保持不变) */}
      <style>{`
        .nolo-editor-container {
          position: relative;
          /* 可以添加其他容器样式，如边框、背景等 */
        }

        .toolbar-container {
          position: sticky; /* 固定工具栏 */
          top: 0;
          z-index: 100;
   
        }
      `}</style>
    </div>
  );
};

// --- useDecorate, SetNodeToDecorations, getChildNodeToDecorations, mergeMaps ---
// --- 这些与语法高亮相关的函数保持不变 ---

const useDecorate = (editor) => {
  // 注意：editor.nodeToDecorations 需要被 SetNodeToDecorations 正确填充
  return useCallback(
    ([node, path]) => {
      // 仅为代码行应用装饰
      if (SlateElement.isElement(node) && node.type === CodeLineType) {
        // @ts-ignore (如果 editor 上没有显式声明 nodeToDecorations)
        const ranges = editor.nodeToDecorations?.get(node) || [];
        return ranges;
      }
      // 其他类型的元素不应用此装饰逻辑
      return [];
    },
    // @ts-ignore
    [editor.nodeToDecorations] // 依赖于 editor 实例上的这个映射
  );
};

const getChildNodeToDecorations = ([block, blockPath]) => {
  const nodeToDecorations = new Map();
  if (!SlateElement.isElement(block) || !Array.isArray(block.children)) {
    return nodeToDecorations; // Return empty map if block is not valid
  }

  // 确保 block.children 包含有效的 Slate 节点
  const validLines = block.children.filter((line) => Node.isNode(line));
  if (validLines.length === 0) {
    return nodeToDecorations;
  }

  // 尝试更安全地获取文本内容
  let text = "";
  try {
    text = validLines.map((line) => Node.string(line)).join("\n");
  } catch (e) {
    console.error("Error getting string from code block lines:", e, block);
    return nodeToDecorations; // Return empty map on error
  }

  const language = block.language || "plain"; // 提供默认语言
  // @ts-ignore
  const grammar = Prism.languages[language] || Prism.languages.plain;

  if (!grammar) {
    console.warn(`Prism grammar not found for language: ${language}`);
    return nodeToDecorations; // Return empty map if grammar not found
  }

  let tokens;
  try {
    tokens = Prism.tokenize(text, grammar);
  } catch (e) {
    console.error(
      `Prism error tokenizing text for language ${language}:`,
      e,
      text
    );
    return nodeToDecorations; // Return empty map on tokenization error
  }

  const normalizedTokens = normalizeTokens(tokens);
  const blockChildren = validLines; // 使用过滤后的有效行

  for (let index = 0; index < normalizedTokens.length; index++) {
    // 确保索引在 blockChildren 范围内
    if (index >= blockChildren.length) {
      // This case might happen if normalization logic differs from line count
      console.warn("Normalized token index out of bounds for block children.");
      continue;
    }
    const tokensForLine = normalizedTokens[index];
    const element = blockChildren[index];

    if (!element || !SlateElement.isElement(element)) {
      console.warn(
        "Expected Slate Element at index",
        index,
        "but got",
        element
      );
      continue;
    }

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of tokensForLine) {
      const length =
        typeof token.content === "string" ? token.content.length : 0; // Handle potential non-string content?
      if (!length) {
        continue;
      }
      const end = start + length;

      // Ensure the path is correctly structured
      // Assuming blockPath is the path to the CodeBlock element
      // The path to the text node within the CodeLine is [blockPath, lineIndex, textNodeIndex (usually 0)]
      const path = [...blockPath, index, 0];

      // Construct the range for decoration
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true, // Basic flag indicating it's a token
        // Dynamically add boolean flags for each token type
        ...Object.fromEntries((token.types || []).map((type) => [type, true])),
      };

      // Add the calculated range to the map for the specific CodeLine element
      const elementDecorations = nodeToDecorations.get(element);
      if (elementDecorations) {
        // Type guard
        elementDecorations.push(range);
      }

      start = end; // Move starting offset for the next token
    }
  }
  return nodeToDecorations;
};

const SetNodeToDecorations = () => {
  const editor = useSlate();

  // 使用 useMemo 尝试减少不必要的计算，但这依赖于 editor.children 的引用稳定性
  // 更精细的优化需要更复杂的逻辑
  const nodeToDecorations = React.useMemo(() => {
    console.log("Recalculating decorations..."); // 添加日志观察计算频率
    const blockEntries = Array.from(
      Editor.nodes(editor, {
        at: [],
        mode: "highest", // 获取顶层节点
        match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType, // 匹配代码块
      })
    );
    // 为每个代码块计算装饰并合并
    const maps = blockEntries.map(getChildNodeToDecorations);
    return mergeMaps(...maps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.children]); // 依赖于 editor.children，当内容变化时重新计算

  // @ts-ignore (如果 editor 上没有显式声明 nodeToDecorations)
  editor.nodeToDecorations = nodeToDecorations; // 将计算结果附加到 editor 实例

  return null; // 此组件不渲染任何内容
};

const mergeMaps = (...maps) => {
  const map = new Map();
  for (const m of maps) {
    if (m instanceof Map) {
      // Ensure 'm' is a Map
      for (const item of m) {
        if (Array.isArray(item) && item.length === 2) {
          // Ensure 'item' is a [key, value] pair
          map.set(item[0], item[1]); // Use spread syntax safely
        }
      }
    }
  }
  return map;
};

export default NoloEditor;
