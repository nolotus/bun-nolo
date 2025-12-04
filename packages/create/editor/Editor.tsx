// NoloEditor.tsx

import React, { useMemo, useState, useCallback } from "react";
import {
  Editor,
  Element as SlateElement,
  createEditor,
  Descendant,
  Node,
  Range,
} from "slate";
import { withHistory, History } from "slate-history";
import {
  Editable,
  Slate,
  withReact,
  ReactEditor,
  RenderElementProps,
} from "slate-react";

import { useAppSelector } from "app/store";
import {
  selectEditorWordCountEnabled,
  selectEditorCodeTheme,
} from "app/settings/settingSlice";

import { useDecorate, SetNodeToDecorations } from "./syntaxHighlighting";
import { toggleMark } from "./mark";
import { useOnKeyDown } from "./useOnKeyDown";
import { withLayout } from "./withLayout";
import { withShortcuts } from "./withShortcuts";
import { withLinks } from "./withLinks";
import { withTables } from "./withTables";

import { getPrismThemeCss } from "./theme/prism"; // ✅ 改为从新的 theme 入口导入
import { PlaceHolder } from "render/page/EditorPlaceHolder";
import { renderLeaf } from "./renderLeaf";
import { ElementWrapper } from "./ElementWrapper";
import { EditorToolbar } from "./EditorToolbar";
import { HoveringToolbar } from "./HoveringToolbar";
import { TableContextMenu } from "./TableContextMenu";
import { hasPlainCodeBlock } from "./utils/hasPlainCodeBlock";

type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
  isStreaming?: boolean;
}

/**
 * 统计字数：
 * - 英文/数字按单词分
 * - 中文按单个汉字计数
 */
const countWords = (nodes: Descendant[]): number => {
  const text = nodes.map((node) => Node.string(node)).join("\n");
  const matches = text.match(/[a-zA-Z0-9]+|[\u4e00-\u9fa5]/g);
  return matches ? matches.length : 0;
};

/**
 * 创建带所有插件的编辑器实例
 */
const createNoloEditor = (): CustomEditor => {
  const baseEditor = withTables(
    withShortcuts(
      withLayout(
        withLinks(withHistory(withReact(createEditor() as ReactEditor)))
      )
    )
  );

  // 保留原有 isInline 行为，并扩展 inline-code
  const { isInline } = baseEditor;
  baseEditor.isInline = (element) =>
    element.type === "inline-code" ? true : isInline(element);

  return baseEditor as CustomEditor;
};

/**
 * 编辑器主体组件
 */
const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
  isStreaming = false,
}) => {
  // 只创建一次编辑器实例
  const editor = useMemo<CustomEditor>(() => createNoloEditor(), []);

  // 全局设置
  const wordCountEnabled = useAppSelector(selectEditorWordCountEnabled);
  const editorCodeTheme = useAppSelector(selectEditorCodeTheme);

  // 本地状态
  const [wordCount, setWordCount] = useState(() => countWords(initialValue));
  const [docVersion, setDocVersion] = useState(0);
  const [hasPlainCode, setHasPlainCode] = useState(() =>
    hasPlainCodeBlock(initialValue)
  );

  // 语法高亮 & 快捷键
  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeyDown(editor);

  // 是否启用代码高亮：流式输出时或无代码块时关闭
  const highlightEnabled = useMemo(
    () => !isStreaming && hasPlainCode,
    [isStreaming, hasPlainCode]
  );

  // 渲染 block 元素
  const renderElement = useCallback(
    (elementProps: RenderElementProps) => (
      <ElementWrapper
        {...elementProps}
        isStreaming={isStreaming}
        highlightEnabled={highlightEnabled}
      />
    ),
    [isStreaming, highlightEnabled]
  );

  // 值变更处理：只在 AST 变化时更新
  const handleChange = useCallback(
    (value: Descendant[]) => {
      const isAstChange = editor.operations.some(
        (op) => op.type !== "set_selection"
      );
      if (!isAstChange) return;

      setDocVersion((v) => v + 1);
      setHasPlainCode(hasPlainCodeBlock(value));
      setWordCount(countWords(value));
      onChange?.(value);
    },
    [editor, onChange]
  );

  // 键盘输入事件（粗体/斜体/下划线）
  const handleDOMBeforeInput = useCallback(
    (event: InputEvent) => {
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
        default:
          break;
      }
    },
    [editor]
  );

  // 根据当前设置获取 Prism 代码主题 CSS（default / okaidia / github-light / github-dark 等）
  const prismThemeCss = useMemo(
    () => getPrismThemeCss(editorCodeTheme),
    [editorCodeTheme]
  );

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={handleChange}
      >
        {!readOnly && (
          <div className="toolbar-container">
            <EditorToolbar />
            <HoveringToolbar />
            <TableContextMenu />
          </div>
        )}

        <SetNodeToDecorations
          highlightEnabled={highlightEnabled}
          docVersion={docVersion}
        />

        <Editable
          renderPlaceholder={({ attributes }) => (
            <div {...attributes}>
              <PlaceHolder />
            </div>
          )}
          readOnly={readOnly}
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          onDOMBeforeInput={handleDOMBeforeInput}
        />

        {/* 根据当前主题动态注入 Prism 代码高亮样式 */}
        <style>{prismThemeCss}</style>
      </Slate>

      {!readOnly && wordCountEnabled && (
        <div className="word-count-display">字数: {wordCount}</div>
      )}

      {/* 编辑器基础样式（静态，不依赖 state） */}
      <style>{baseEditorStyles}</style>
    </div>
  );
};

export default NoloEditor;

/**
 * 基础样式抽成常量，避免每次渲染都创建长字符串
 */
const baseEditorStyles = `
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
`;
