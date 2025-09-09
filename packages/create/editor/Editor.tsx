import React, { useMemo, useState } from "react"; // <--- 1. 导入 useState
import {
  Editor,
  Element as SlateElement,
  createEditor,
  Descendant,
  Node, // <--- 2. 导入 Node
} from "slate";
import { withHistory, History } from "slate-history";
import { Editable, Slate, withReact, ReactEditor } from "slate-react";

// 导入重构后的语法高亮相关 hooks 和组件
import { useDecorate, SetNodeToDecorations } from "./syntaxHighlighting";

// 核心功能和插件
import { toggleMark } from "./mark";
import { useOnKeyDown } from "./useOnKeyDown";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { withLinks } from "./withLinks";

// UI 组件和样式
import { prismThemeCss } from "./theme/prismThemeCss";
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { renderLeaf } from "./renderLeaf";
import { ElementWrapper } from "./ElementWrapper";
import { EditorToolbar } from "./EditorToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { TableContextMenu } from "./TableContextMenu";
import { withTables } from "./withTables";

// 定义自定义编辑器类型
type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
}

// --- 3. 新增：字数统计函数 ---
// --- 修正后的字数统计函数 ---
// --- 这已经是正确的、经过优化的版本 ---
const countWords = (nodes: Descendant[]): number => {
  const text = nodes.map((node) => Node.string(node)).join("\n");

  // 该正则表达式的逻辑：
  // 匹配所有连续的英文/数字块，或者单个的中文字符。
  // 任何不符合这两个规则的字符（如空格、标点符号）都会被作为分隔符忽略。
  const matches = text.match(/[a-zA-Z0-9]+|[\u4e00-\u9fa5]/g);

  return matches ? matches.length : 0;
};

const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
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

  // --- 4. 新增：为字数统计创建 state ---
  // 使用函数作为 useState 的初始值，确保这个计算只在首次渲染时执行
  const [wordCount, setWordCount] = useState(() => countWords(initialValue));

  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeyDown(editor);

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          // 仅在 AST (文档结构) 变化时触发
          const isAstChange = editor.operations.some(
            (op) => op.type !== "set_selection"
          );
          if (isAstChange) {
            // --- 5. 修改：在内容变化时更新字数统计 ---
            setWordCount(countWords(value));

            // 调用外部传入的 onChange
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
          renderElement={ElementWrapper}
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

      {/* --- 6. 新增：渲染字数统计的 UI 元素 --- */}
      {!readOnly && <div className="word-count-display">字数: {wordCount}</div>}

      {/* 编辑器容器和核心元素的样式 */}
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

        /* --- 7. 新增：字数统计的样式 --- */
        .word-count-display {
          text-align: right;
          font-size: 12px;
          color: var(--textSecondary, #888); /* 适配主题，提供一个默认颜色 */
          margin-top: var(--space-2);
          padding-right: var(--space-1);
          user-select: none; /* 防止用户意外选中 */
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
