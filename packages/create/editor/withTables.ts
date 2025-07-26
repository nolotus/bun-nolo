import { Editor, Transforms, Element as SlateElement, Path } from "slate";

export const withTables = (editor: Editor) => {
  const { normalizeNode } = editor;

  // 重写 normalizeNode 方法
  editor.normalizeNode = ([node, path]) => {
    // 检查节点是否为 table 类型
    if (node.type === "table") {
      const element = node as SlateElement;
      let maxColumns = 0;
      let columnMismatch = false;

      // 1. 确保表格至少有一行一列
      if (!element.children || element.children.length === 0) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }

      // 2. 遍历所有行，计算最大列数
      for (const child of element.children) {
        if (SlateElement.isElement(child) && child.type === "table-row") {
          const row = child as SlateElement;
          maxColumns = Math.max(maxColumns, row.children?.length || 0);
        }
      }

      // 3. 检查 'columns' 属性是否存在且长度是否正确
      const columns = element.columns as any[];
      if (!columns || columns.length !== maxColumns) {
        columnMismatch = true;
      }

      if (columnMismatch && maxColumns > 0) {
        // 如果 columns 属性不正确，则创建或重置它
        const newColumns = Array.from({ length: maxColumns }, () => ({
          width: null, // 默认宽度
          align: "left",
        }));

        Transforms.setNodes(editor, { columns: newColumns }, { at: path });
        // console.log(`[withTables] Normalized table at path [${path}]: set columns to`, newColumns);
        return; // 返回以允许 Slate 重新运行规范化
      }
    }

    // 对于其他所有节点，调用原始的 normalizeNode
    return normalizeNode([node, path]);
  };

  return editor;
};
