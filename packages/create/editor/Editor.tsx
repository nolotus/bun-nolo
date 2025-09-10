import React, { useMemo, useState } from "react";
import {
  Editor,
  Element as SlateElement,
  createEditor,
  Descendant,
  Node,
} from "slate";
import { withHistory, History } from "slate-history";
import { Editable, Slate, withReact, ReactEditor } from "slate-react";

// 导入 Redux hooks 和 selector
import { useAppSelector } from "app/store";
import { selectEditorWordCountEnabled } from "app/settings/settingSlice";

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

// 字数统计函数
const countWords = (nodes: Descendant[]): number => {
  const text = nodes.map((node) => Node.string(node)).join("\n");
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

  // 从设置中获取是否显示字数统计
  const wordCountEnabled = useAppSelector(selectEditorWordCountEnabled);

  // 字数统计 state
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
            // 更新字数统计
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

      {/* 只有在设置开启且非只读模式时才显示字数统计 */}
      {!readOnly && wordCountEnabled && (
        <div className="word-count-display">字数: {wordCount}</div>
      )}

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

        /* 字数统计样式 */
        .word-count-display {
          text-align: right;
          font-size: 12px;
          color: var(--textSecondary);
          margin-top: var(--space-2);
          padding-right: var(--space-1);
          user-select: none;
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
