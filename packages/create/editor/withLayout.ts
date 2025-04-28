import { Transforms, Node, Element as SlateElement, Editor } from "slate";
export const withLayout = (editor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      // 检查标题节点是否存在或为空
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === "") {
        const title = {
          type: "heading-one",
          children: [{ text: "" }], // 将 'Untitled' 改为空字符串
        };
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        });
      }
      // 确保至少有两个节点（标题+段落）
      if (editor.children.length < 2) {
        const paragraph = {
          type: "paragraph",
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) });
      }
      // 遍历子节点并强制设置类型
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
            type = "heading-one";
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
