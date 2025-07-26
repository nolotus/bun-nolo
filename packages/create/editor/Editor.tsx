import React, { useMemo } from "react";
import {
  Editor,
  Element as SlateElement,
  createEditor,
  Descendant,
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
import { TableContextMenu } from "./TableContextMenu"; // <--- 1. 导入新组件

// 定义自定义编辑器类型
// 注意：此类型也在 syntaxHighlighting.tsx 中使用。
// 最佳实践是将其移动到共享的 types.ts 文件中。
type CustomEditor = ReactEditor &
  History & {
    nodeToDecorations?: Map<SlateElement, Range[]>;
  };

interface NoloEditorProps {
  initialValue: Descendant[];
  readOnly?: boolean;
  onChange?: (value: Descendant[]) => void;
}

const NoloEditor: React.FC<NoloEditorProps> = ({
  initialValue,
  readOnly = false,
  onChange,
}) => {
  // 使用 useMemo 创建 editor 实例，确保在组件重渲染时保持稳定
  const editor = useMemo(() => {
    const baseEditor = withShortcuts(
      withLayout(
        withLinks(withHistory(withReact(createEditor() as ReactEditor)))
      )
    );
    // 保留 inline-code 的内联特性，其他遵循 Slate 默认行为
    const { isInline } = baseEditor;
    baseEditor.isInline = (el) =>
      el.type === "inline-code" ? true : isInline(el);
    return baseEditor as CustomEditor;
  }, []);

  // 从新文件中导入 decorate 函数
  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeyDown(editor);

  return (
    <div className="nolo-editor-container">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          // 仅在 AST (文档结构) 变化时触发 onChange，忽略纯粹的光标移动
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
            <TableContextMenu /> {/* <--- 2. 在这里添加新组件 */}
          </div>
        )}
        {/* "无头"组件，负责在后台计算语法高亮 */}
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
            // 阻止浏览器默认的富文本行为，改用 Slate 命令
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
          z-index: 10; /* 确保工具栏在编辑区域之上，解决点击穿透问题 */
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

export default NoloEditor;
