import {
  Transforms,
  createEditor,
  Node,
  Element as SlateElement,
  Editor,
} from "slate";
export const withLayout = (editor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === "") {
        const title = {
          type: "heading-one",
          children: [{ text: "Untitled" }],
        };
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        });
      }
      if (editor.children.length < 2) {
        const paragraph = {
          type: "paragraph",
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) });
      }
      for (const [child, childPath] of Node.children(editor, path)) {
        let type;
        const slateIndex = childPath[0];
        const enforceType = (type) => {
          if (SlateElement.isElement(child) && child.type !== type) {
            const newProperties = { type };
            Transforms.setNodes(editor, newProperties, {
              at: childPath,
            });
          }
        };
        switch (slateIndex) {
          case 0:
            type = "title";
            enforceType(type);
            break;
          case 1:
            type = "paragraph";
            enforceType(type);
          default:
            break;
        }
      }
    }
    return normalizeNode([node, path]);
  };
  return editor;
};
