// create/editor/withLayout.tsx
import { Transforms, Node, Element as SlateElement, Editor } from "slate";

export const withLayout = (editor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      // 检查标题节点是否存在或为空
      if (
        editor.children.length === 0 ||
        Editor.string(editor, [0, 0]) === ""
      ) {
        const title = {
          type: "heading-one",
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        });
      }

      // 遍历子节点并处理类型
      for (const [child, childPath] of Node.children(editor, path)) {
        const slateIndex = childPath[0];
        if (slateIndex === 0) {
          // 第一个节点强制为 heading-one
          const type = "heading-one";
          if (SlateElement.isElement(child) && child.type !== type) {
            const newProperties = { type };
            Transforms.setNodes(editor, newProperties, {
              at: childPath,
            });
          }
        } else if (slateIndex === 1) {
          // 第二个节点如果是 heading-one，则强制转换为 paragraph
          if (SlateElement.isElement(child) && child.type === "heading-one") {
            const newProperties = { type: "paragraph" };
            Transforms.setNodes(editor, newProperties, {
              at: childPath,
            });
          }
        }
        // 其他位置的节点不做任何强制转换
      }
    }
    return normalizeNode([node, path]);
  };
  return editor;
};
