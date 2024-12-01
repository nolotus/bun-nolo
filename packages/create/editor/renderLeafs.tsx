// renderLeafs.tsx
import React from "react";
import { RenderLeafProps } from "slate-react";

export const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  let element = <>{children}</>;

  if (leaf.bold) {
    element = <strong>{element}</strong>;
  }
  if (leaf.italic) {
    element = <em>{element}</em>;
  }
  if (leaf.strikethrough) {
    element = <del>{element}</del>;
  }

  return <span {...attributes}>{element}</span>;
};
