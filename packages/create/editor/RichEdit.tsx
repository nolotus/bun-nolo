import React, { useMemo, useCallback } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { Transforms, createEditor, Descendant } from "slate";
import { jsx } from "slate-hyperscript";
import { Element } from "render/Element/";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
// import slate from "remark-slate";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!",
      },
    ],
  },
  {
    type: "check-list-item",
    checked: true,
    children: [{ text: "Slide to the left." }],
  },
  {
    type: "check-list-item",
    checked: true,
    children: [{ text: "Slide to the right." }],
  },
  {
    type: "check-list-item",
    checked: false,
    children: [{ text: "Criss-cross." }],
  },
  {
    type: "check-list-item",
    checked: true,
    children: [{ text: "Criss-cross!" }],
  },
  {
    type: "check-list-item",
    checked: false,
    children: [{ text: "Cha cha real smooth…" }],
  },
  {
    type: "check-list-item",
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: "paragraph",
    children: [{ text: "Try it out for yourself!" }],
  },
];
const ELEMENT_TAGS = {
  A: (el) => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote" }),
  H1: () => ({ type: "heading-one" }),
  H2: () => ({ type: "heading-two" }),
  H3: () => ({ type: "heading-three" }),
  H4: () => ({ type: "heading-four" }),
  H5: () => ({ type: "heading-five" }),
  H6: () => ({ type: "heading-six" }),
  IMG: (el) => ({ type: "image", url: el.getAttribute("src") }),
  LI: () => ({ type: "list-item" }),
  OL: () => ({ type: "numbered-list" }),
  P: () => ({ type: "paragraph" }),
  PRE: () => ({ type: "code" }),
  UL: () => ({ type: "bulleted-list" }),
};
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};
export const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }
  const { nodeName } = el;
  let parent = el;
  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat();
  if (children.length === 0) {
    children = [{ text: "" }];
  }
  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }
  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }
  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => jsx("text", attrs, child));
  }
  return children;
};

const withHtml = (editor) => {
  const { insertData, isInline, isVoid } = editor;
  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };
  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };
  editor.insertData = (data) => {
    console.log("insertData data raw", data);
    const doc = data.getData("text/plain");
    console.log("doc", doc);
    const tree = fromMarkdown(doc, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    });
    console.log("tree", tree);
    Transforms.insertFragment(editor, tree);

    // const slateDoc = slate(tree);
    // console.log("slateDoc", slateDoc);

    // const html = data.getData("text/html");
    // if (html) {
    //   console.log("html");
    //   const parsed = new DOMParser().parseFromString(html, "text/html");
    //   const fragment = deserialize(parsed.body);
    //   Transforms.insertFragment(editor, fragment);
    //   return;
    // }
    insertData(data);
  };
  return editor;
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }
  return <span {...attributes}>{children}</span>;
};

export const RichEdit = ({ mdast, value, onKeyDown, onChange }) => {
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const editor = useMemo(
    () => withHtml(withReact(withHistory(createEditor()))),
    [],
  );
  return (
    <>
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          console.log("value", value);
          const isAstChange = editor.operations.some(
            (op) => "set_selection" !== op.type,
          );
          if (isAstChange) {
            // Save the value to Local Storage.
            // const content = JSON.stringify(value);
            // localStorage.setItem("content", content);
          }
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some plain text..."
        />
      </Slate>
    </>
  );
};
