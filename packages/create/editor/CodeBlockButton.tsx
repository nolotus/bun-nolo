import React from "react";
import { useSlate } from "slate-react";
import { Editor, Transforms, Element as SlateElement } from "slate";

import { MdCode } from "react-icons/md";
// 确保导入了所有需要的类型
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

const toggleCodeBlock = (editor: Editor) => {
  const isActive = isCodeBlockActive(editor);

  // --- 1. 定义可以被转换的块类型列表 ---
  // 将所有 HeadingType 的值和 ParagraphType 组合成一个数组
  const convertibleTypes = [...Object.values(HeadingType), ParagraphType];

  // --- 2. 创建一个更通用的匹配函数 ---
  const matchCondition = (n: Node) =>
    SlateElement.isElement(n) && convertibleTypes.includes(n.type as string);

  if (isActive) {
    // 将代码块变回普通段落
    Transforms.setNodes(
      editor,
      { type: ParagraphType },
      { match: (n) => SlateElement.isElement(n) && n.type === CodeLineType }
    );
    Transforms.unwrapNodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
      split: true,
    });
  } else {
    // 将段落或标题转换为代码块

    // --- 3. 在所有 Transforms 操作中使用新的匹配函数 ---
    Transforms.setNodes(
      editor,
      { type: CodeLineType },
      { match: matchCondition } // 先将内部元素类型改为 code-line
    );
    Transforms.wrapNodes(
      editor,
      { type: CodeBlockType, language: "tsx", children: [] },
      {
        match: (n) => SlateElement.isElement(n) && n.type === CodeLineType, // 然后用 code-block 包裹 code-line
        split: true,
      }
    );
  }
};

export const CodeBlockButton = () => {
  const editor = useSlate();
  const isActive = isCodeBlockActive(editor);

  return (
    <Button
      data-test-id="code-block-button"
      active={isActive}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleCodeBlock(editor);
      }}
    >
      <MdCode size={18} />
    </Button>
  );
};
