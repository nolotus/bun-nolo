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
import { withHistory, History } from "slate-history";
import { Editable, Slate, useSlate, withReact, ReactEditor } from "slate-react";
import { useSelector } from "react-redux";

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
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { selectTheme } from "app/theme/themeSlice";

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
  const [isMobile, setIsMobile] = useState(false);

  const editor = useMemo(() => {
    const baseEditor = withShortcuts(
      withLayout(withHistory(withReact(createEditor() as ReactEditor)))
    );

    const { isInline } = baseEditor;
    baseEditor.isInline = (element) => {
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

      <style>{`
        .nolo-editor-container {
          position: relative;
          padding: ${theme.space[2]}; /* 从10px减小到8px */
        }

        .toolbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: ${theme.space[2]}; /* 从10px减小到8px */
          padding: ${theme.space[1]}; /* 从5px减小到4px */
        }

        /* 编辑器内容区域 - 更紧凑 */
        .nolo-editor-container [data-slate-editor] {
          font-size: 14px; /* 从默认字体减小 */
          line-height: 1.4; /* 从1.6减小到1.4 */
          color: ${theme.text};
          -webkit-text-size-adjust: 100%;
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

// 保持原有的语法高亮逻辑不变...
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
