// create/editor/CodeBlockButton.tsx

import React from "react";
import { useSlate } from "slate-react";
import { Editor, Transforms, Element as SlateElement, Node } from "slate";

import { LuFileCode2 } from "react-icons/lu"; // Lucide 文件 + 代码 图标
import {
  CodeBlockType,
  CodeLineType,
  ParagraphType,
  HeadingType,
} from "./types";
import { Button } from "./components";

const isCodeBlockActive = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === CodeBlockType,
  });
  return !!match;
};

export const toggleCodeBlock = (editor: Editor) => {
  const isActive = isCodeBlockActive(editor);

  // 1. 可转换的块类型
  const convertibleTypes = [...Object.values(HeadingType), ParagraphType];

  // 2. 通用匹配函数
  const matchCondition = (n: Node) =>
    SlateElement.isElement(n) && convertibleTypes.includes(n.type as string);

  if (isActive) {
    // 取消代码块：先把 code-line 变回段落，再拆 unwrap code-block
    Transforms.setNodes(
      editor,
      { type: ParagraphType },
      {
        match: (n) => SlateElement.isElement(n) && n.type === CodeLineType,
      }
    );
    Transforms.unwrapNodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
      split: true,
    });
  } else {
    // 应用代码块：先将段落/标题改成 code-line，再 wrap 成 code-block
    Transforms.setNodes(
      editor,
      { type: CodeLineType },
      { match: matchCondition }
    );
    Transforms.wrapNodes(
      editor,
      { type: CodeBlockType, language: "tsx", children: [] },
      {
        match: (n) => SlateElement.isElement(n) && n.type === CodeLineType,
        split: true,
      }
    );
  }
};

export const CodeBlockButton: React.FC = () => {
  const editor = useSlate();
  const isActive = isCodeBlockActive(editor);

  return (
    <Button
      data-test-id="code-block-button"
      active={isActive}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleCodeBlock(editor);
      }}
    >
      <LuFileCode2 size={18} />
    </Button>
  );
};
