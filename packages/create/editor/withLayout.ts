// create/editor/withLayout.tsx (修复版)

import {
  Transforms,
  Node,
  Element as SlateElement,
  Editor,
  Point,
} from "slate";

export const withLayout = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // 1. 确保顶级节点是 Element
    if (Editor.isEditor(node)) {
      // 2. 检查编辑器是否完全为空，或者只有一个空的子节点，这时才初始化标题
      if (
        node.children.length === 0 ||
        (node.children.length === 1 &&
          SlateElement.isElement(node.children[0]) &&
          Node.string(node.children[0]) === "")
      ) {
        const title = {
          type: "heading-one",
          children: [{ text: "" }],
        };
        // 使用 remove + insert 来替换，而不是单纯 insert，避免堆积
        Transforms.removeNodes(editor, { at: [0] });
        Transforms.insertNodes(editor, title, { at: [0] });
        // 在某些情况下，需要强制重新标准化
        return;
      }

      // 3. 遍历所有子节点，应用规则
      for (const [child, childPath] of Node.children(editor, [])) {
        const slateIndex = childPath[0];

        // 规则一：第一个节点必须是 'heading-one'
        if (slateIndex === 0) {
          if (SlateElement.isElement(child) && child.type !== "heading-one") {
            Transforms.setNodes(
              editor,
              { type: "heading-one" },
              { at: childPath }
            );
            // 返回以触发新一轮 normalize，因为类型变化可能影响其他规则
            return;
          }
        }
        // 规则二：紧跟在 'heading-one' 后面的不应该是另一个 'heading-one'
        // 这解决了在标题行按 Enter 的问题
        else if (slateIndex > 0) {
          const prevNode = Node.get(editor, [slateIndex - 1]);
          if (
            SlateElement.isElement(prevNode) &&
            prevNode.type === "heading-one" &&
            SlateElement.isElement(child) &&
            child.type === "heading-one"
          ) {
            Transforms.setNodes(
              editor,
              { type: "paragraph" },
              { at: childPath }
            );
            return;
          }
        }
      }
    }

    // 调用原始的 normalizeNode 完成其他默认的规范化
    return normalizeNode(entry);
  };

  return editor;
};
