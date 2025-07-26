/**
 * 这是一个递归的辅助函数，用于从单个 Slate 节点及其子节点中提取所有文本内容。
 * @param node 当前要处理的 Slate 节点。
 * @returns 提取出的文本字符串。
 */
function getNodeText(node: any): string {
  // 如果是文本节点，直接返回其文本内容
  if (node.text) {
    return node.text;
  }

  // 如果是元素节点（且非空），则递归地处理其所有子节点，
  // 并将结果用适当的分隔符连接。对于大多数块级元素，换行符是合适的。
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getNodeText).join("\n");
  }

  // 对于其他情况（如空节点或无子节点的元素），返回空字符串
  return "";
}

/**
 * 将 Slate 节点数组转换为一个单一的、拼接好的纯文本字符串。
 * @param nodes Slate 节点数组。
 * @returns 拼接后的纯文本字符串，顶层节点间用双换行符分隔以模拟段落。
 */
export function slateToText(nodes: any[]): string {
  if (!nodes || nodes.length === 0) {
    return "";
  }

  return nodes.map(getNodeText).join("\n\n");
}
