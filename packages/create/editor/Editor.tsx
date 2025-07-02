// create/editor/Editor.tsx

import Prism from "prismjs";
import React, { useCallback, useMemo } from "react";
import {
  Editor,
  Node,
  Element as SlateElement,
  createEditor,
  Descendant,
  Range,
  NodeEntry,
  Path,
} from "slate";
import { withHistory, History } from "slate-history";
import { Editable, Slate, useSlate, withReact, ReactEditor } from "slate-react";

import { toggleMark } from "./mark";
import { CodeBlockType, CodeLineType } from "./types";
import { useOnKeyDown } from "./useOnKeyDown"; // ✅ 修复：确保与导出名称和文件名大小写一致
import { normalizeTokens } from "./utils/normalize-tokens";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { withLinks } from "./withLinks";

//web
import { prismThemeCss } from "./theme/prismThemeCss";
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { renderLeaf } from "./renderLeaf";
import { ElementWrapper } from "./ElementWrapper";
import { EditorToolbar } from "./EditorToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
  // placeholder 已移除，原有未使用
}

const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
}) => {
  const editor = useMemo(() => {
    // ✅ 修复：插件链中正确串联 withLinks
    const baseEditor = withShortcuts(
      withLayout(
        withLinks(withHistory(withReact(createEditor() as ReactEditor)))
      )
    );
    // ✅ 修复：保留 inline-code，其他 inline 由 Slate 默认处理
    const { isInline } = baseEditor;
    baseEditor.isInline = (el) =>
      el.type === "inline-code" ? true : isInline(el);
    return baseEditor as CustomEditor;
  }, []);

  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeyDown(editor);

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          // ✅ 修复：检测非 selection 更改时才触发外层 onChange
          const isAstChange = editor.operations.some(
            (op) => op.type !== "set_selection"
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
          renderPlaceholder={({ attributes }) => (
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
            // ✅ 修复：使用 switch-case 并 break，避免 return undefined
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

      {/* ✨ 优化：合并媒体查询，减少重复 */}
      <style>{`
        .nolo-editor-container {
          position: relative;
          padding: var(--space-2);
        }
        .toolbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: var(--space-2);
          padding: var(--space-1);
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
        }
      `}</style>
    </div>
  );
};

// 装饰器 Hook
const useDecorate = (editor: CustomEditor) => {
  return useCallback(
    ([node]: NodeEntry): Range[] => {
      if (
        SlateElement.isElement(node) &&
        node.type === CodeLineType &&
        editor.nodeToDecorations?.has(node)
      ) {
        return editor.nodeToDecorations.get(node)!;
      }
      return [];
    },
    [editor.nodeToDecorations]
  );
};

// 为单个 CodeBlock 生成装饰范围
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

  const codeLines = block.children.filter(
    (child): child is SlateElement =>
      SlateElement.isElement(child) && child.type === CodeLineType
  );
  if (codeLines.length === 0) {
    return nodeToDecorations;
  }

  // ✅ 修复：block.language 可能无类型，使用 any
  const language = (block as any).language || "plain";
  const grammar = Prism.languages[language] || Prism.languages.plain;
  if (!grammar && language !== "plain") {
    console.warn(`Prism grammar not found for language: ${language}`);
  }

  // 拼接整个 code block 文本
  let text = "";
  try {
    text = codeLines.map((line) => Node.string(line)).join("\n");
  } catch (e) {
    console.error("Error extracting text from code lines:", e);
    return nodeToDecorations;
  }

  // Prism 分词
  let tokens;
  try {
    tokens = Prism.tokenize(text, grammar);
  } catch (e) {
    console.error(`Prism tokenize error for ${language}:`, e);
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

// 统一合并所有 codeBlock 的装饰范围
const SetNodeToDecorations: React.FC = () => {
  const editor = useSlate<CustomEditor>();
  const nodeToDecorations = useMemo(() => {
    const blocks = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
      })
    );
    return mergeMaps(...blocks.map(getChildNodeToDecorations));
  }, [editor.children]);

  editor.nodeToDecorations = nodeToDecorations;
  return null;
};

// ✨ 优化：简化 mergeMaps，无需 instanceof 检查
const mergeMaps = <K, V>(...maps: Map<K, V>[]): Map<K, V> => {
  const merged = new Map<K, V>();
  for (const m of maps) {
    for (const [k, v] of m) {
      merged.set(k, v);
    }
  }
  return merged;
};

export default NoloEditor;
