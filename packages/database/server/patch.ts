// patch.js (或你的 patch 处理文件名)
import serverDb from "./db"; // 确认路径正确

// 深度合并工具函数 (保持不变)
const deepMerge = (target, source) => {
  const output = { ...target };
  for (const key in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (!source.hasOwnProperty(key)) continue;

    if (source[key] === null && key in output) {
      delete output[key];
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

export const handlePatch = async (req, res) => {
  // --- 修改：变量名改为 dbKey，但仍然从 req.params.id 获取值 ---
  // (路由中仍然是 :id, 所以这里还是 req.params.id)
  const dbKey = req.params.id;
  const changes = req.body;
  const { user } = req; // 假设 handleToken 添加了 user 对象

  // --- 可选：检查 user 是否存在及权限 ---
  if (!user || !user.userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Missing user token or userId" });
  }
  const actionUserId = user.userId;

  // --- 基本验证 ---
  if (!dbKey) {
    // 这里理论上不会发生，因为路由匹配了 :id
    return res
      .status(400)
      .json({ message: "Bad Request: Missing key in path parameter 'id'" });
  }
  if (
    !changes ||
    typeof changes !== "object" ||
    Object.keys(changes).length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Bad Request: Missing or invalid changes in body" });
  }

  try {
    // --- 修改：使用 dbKey 变量与数据库交互 ---
    const exist = await serverDb.get(dbKey);
    if (!exist) {
      // 使用 404 Not Found 更合适
      return res
        .status(404)
        .json({ message: `Data not found for key: ${dbKey}` });
    }

    // --- 权限检查 (TODO: 实现具体的检查逻辑) ---
    // 示例：你需要一个函数 hasPatchPermission(userId, data)
    // if (!hasPatchPermission(actionUserId, exist)) {
    //   return res.status(403).json({ message: "Permission denied" });
    // }

    // 深度合并现有数据和变更 (保持不变)
    const final = deepMerge(exist, changes);

    // --- 修改：使用 dbKey 变量更新数据库 ---
    await serverDb.put(dbKey, final);

    // 返回成功响应 (保持修正后的逻辑：返回 final 对象)
    return res.status(200).json({
      data: final, // 返回合并后的完整数据，它应包含正确的 id
      message: "Data patched successfully",
    });
  } catch (error) {
    console.error(`[handlePatch Error] dbKey: ${dbKey}, Error:`, error); // 添加 dbKey 到日志
    // 根据错误类型返回更具体的错误码可能更好
    if (error.name === "NotFoundError" || error.notFound) {
      // 检查 LevelDB 可能的错误类型
      return res
        .status(404)
        .json({
          message: `Data not found during patch operation for key: ${dbKey}`,
        });
    }
    return res.status(500).json({
      message: "Failed to patch data due to internal server error",
      // 在生产环境中隐藏详细错误信息
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
