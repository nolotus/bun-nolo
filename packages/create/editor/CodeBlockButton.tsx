import React, { useCallback, useState } from "react";
import { useSlateStatic } from "slate-react";
import { Element, Transforms } from "slate";

import { MdCode } from "react-icons/md"; // 在文件顶部引入
import { CodeBlockType, CodeLineType, ParagraphType } from "./type";
import { Button } from "./components";

export const CodeBlockButton = () => {
  const editor = useSlateStatic();

  const handleClick = () => {
    Transforms.wrapNodes(
      editor,
      { type: CodeBlockType, language: "html", children: [] },
      {
        match: (n) => Element.isElement(n) && n.type === ParagraphType,
        split: true,
      },
    );
    Transforms.setNodes(
      editor,
      { type: CodeLineType },
      { match: (n) => Element.isElement(n) && n.type === ParagraphType },
    );
  };
  return (
    <Button
      data-test-id="code-block-button"
      active
      onMouseDown={(event) => {
        event.preventDefault();
        handleClick();
      }}
    >
      <MdCode size={18} />
    </Button>
  );
};
