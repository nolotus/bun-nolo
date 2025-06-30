// create/editor/Editor.tsx (完整修改版)

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
import { withHistory, History } from "slate-history";
import { Editable, Slate, useSlate, withReact, ReactEditor } from "slate-react";
import { useSelector } from "react-redux";

import { ElementWrapper } from "./ElementWrapper";
import { EditorToolbar } from "./EditorToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { toggleMark } from "./mark";
import { renderLeaf } from "./renderLeaf";
import { prismThemeCss } from "./theme/prismThemeCss";
import { CodeBlockType, CodeLineType } from "./types";
import { useOnKeydown } from "./useOnKeyDown";
import { normalizeTokens } from "./utils/normalize-tokens";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { selectTheme } from "app/settings/settingSlice";

// --- 新增: 引入链接插件 ---
import { withLinks } from "./withLinks";

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
  const theme = useSelector(selectTheme);
  // `isMobile` state 未被使用，可以考虑移除
  // const [isMobile, setIsMobile] = useState(false);

  const editor = useMemo(() => {
    // --- 修改: 在插件链中加入 withLinks ---
    const baseEditor = withShortcuts(
      withLayout(
        withLinks(withHistory(withReact(createEditor() as ReactEditor)))
      )
    );

    // --- 修改: 扩展 isInline 而不是重新定义 ---
    // withLinks 已经处理了 link 类型，这里只需保留原有的即可
    const { isInline } = baseEditor;
    baseEditor.isInline = (element) => {
      // 保留已有的 inline-code 判断，withLinks 会处理 link 类型
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
            <EditorToolbar />
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

      <style>{`
        .nolo-editor-container {
          position: relative;
          padding: ${theme.space[2]};
        }

        .toolbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: ${theme.space[2]}; 
          padding: ${theme.space[1]};
        }

        /* 编辑器内容区域 - 更紧凑 */
        .nolo-editor-container [data-slate-editor] {
          font-size: 14px;
          line-height: 1.4; 
          color: ${theme.text};
          -webkit-text-size-adjust: 100%;
        }

        /* 新增: 链接样式 */
        .nolo-editor-container a {
          color: ${theme.primary};
          text-decoration: none;
          cursor: pointer;
        }
        .nolo-editor-container a:hover {
          text-decoration: underline;
        }


        /* 移动端响应式 - 简化 */
        @media (max-width: 768px) {
          .nolo-editor-container {
            padding: ${theme.space[1]}; /* 移动端更小边距 */
          }
          
          .nolo-editor-container [data-slate-editor] {
            font-size: 15px; /* 移动端稍大一点防止缩放 */
            line-height: 1.35;
          }
          
          .toolbar-container {
            padding: ${theme.space[1]};
            margin-bottom: ${theme.space[1]};
          }
        }

        /* 行内代码样式 - 简化 */
        .inline-code {
          font-family: monospace;
          background-color: ${theme.backgroundTertiary};
          padding: 0.1em 0.3em; /* 减小内边距 */
          border-radius: 3px;
          font-size: 0.85em; /* 稍小一点 */
        }

        /* 移动端触摸目标优化 - 保持必要的可用性 */
        @media (max-width: 768px) {
          .inline-code {
            padding: 0.12em 0.35em;
            font-size: 0.9em;
          }
        }
      `}</style>
    </div>
  );
};

// ... 剩余部分 (useDecorate, getChildNodeToDecorations, SetNodeToDecorations, mergeMaps) 保持不变 ...
// ... (此处省略未修改的下半部分代码，请保留你原有的)

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
    [editor.nodeToDecorations]
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
    if (lineIndex >= codeLines.length) continue;

    const tokensInLine = normalizedTokens[lineIndex];
    const codeLineElement = codeLines[lineIndex];

    nodeToDecorations.set(codeLineElement, []);

    let currentOffset = 0;
    for (const token of tokensInLine) {
      const tokenContent =
        typeof token.content === "string" ? token.content : "";
      const tokenLength = tokenContent.length;
      if (!tokenLength) continue;

      const startOffset = currentOffset;
      const endOffset = startOffset + tokenLength;
      const textNodePath = [...blockPath, lineIndex, 0];

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
  }, [editor.children]);

  editor.nodeToDecorations = nodeToDecorations;
  return null;
};

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
