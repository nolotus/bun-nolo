/**
 * 从XML标签中提取JSON内容
 * @param {string} xmlString - 包含XML标签的字符串
 * @param {string} startTag - 开始标签
 * @param {string} endTag - 结束标签
 * @returns {object|null} 解析后的JSON对象,解析失败则返回null
 */
export function extractJsonFromXml(
  xmlString,
  startTag = "<tool_call>",
  endTag = "</tool_call>",
) {
  try {
    // 获取标签位置
    const startIndex = xmlString.indexOf(startTag) + startTag.length;
    const endIndex = xmlString.indexOf(endTag);

    // 检查标签是否存在
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("找不到指定的XML标签");
    }

    // 提取并解析JSON
    const jsonStr = xmlString.substring(startIndex, endIndex).trim();
    const jsonObj = JSON.parse(jsonStr);

    return jsonObj;
  } catch (error) {
    console.error("解析失败:", error.message);
    return null;
  }
}
