/**
 * 向指定服务器发送请求以获取对话消息
 * @param {string} server - 服务器地址
 * @param {string} token - 认证令牌
 * @param {Object} params - 请求参数
 * @param {string} params.dialogId - 对话ID
 * @param {number} params.limit - 消息数量限制
 * @param {string} [params.beforeKey] - 用于加载更多旧消息的键（可选）
 * @returns {Promise<any[]>} - 返回消息数组，如果失败则返回空数组
 */
export const fetchConvMsgs = async (
  server,
  token,
  { dialogId, limit, beforeKey }
) => {
  try {
    const response = await fetch(`${server}/rpc/getConvMsgs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dialogId,
        limit,
        ...(beforeKey && { beforeKey }), // 如果有 beforeKey，则添加到请求体中
      }),
    });

    if (!response.ok) {
      console.error(`fetchConvMsgs: Failed ${response.status} from ${server}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`fetchConvMsgs: Error fetching from ${server}:`, error);
    return [];
  }
};
