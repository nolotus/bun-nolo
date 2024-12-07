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
      // 第一个节点转为title
      const [firstNode] = Node.children(editor, path);
      if (
        SlateElement.isElement(firstNode[0]) &&
        firstNode[0].type !== "heading-one"
      ) {
        Transforms.setNodes(
          editor,
          { type: "heading-one" },
          {
            at: [0],
          }
        );
      }

      // 第二个节点如果存在,转为paragraph
      if (editor.children.length > 1) {
        const secondNode = editor.children[1];
        if (
          SlateElement.isElement(secondNode) &&
          secondNode.type !== "paragraph"
        ) {
          Transforms.setNodes(
            editor,
            { type: "paragraph" },
            {
              at: [1],
            }
          );
        }
      }
    }
    return normalizeNode([node, path]);
  };
  return editor;
};
