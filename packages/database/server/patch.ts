import serverDb from "./db";

// 深度合并工具函数，支持删除（null 值）
const deepMerge = (target, source) => {
  const output = { ...target };
  for (const key in source) {
    if (source[key] === null && key in output) {
      // 如果值为 null，则删除该键
      delete output[key];
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // 递归合并嵌套对象
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      // 直接赋值基本类型或数组
      output[key] = source[key];
    }
  }
  return output;
};

export const handlePatch = async (req, res) => {
  const id = req.params.id;
  const changes = req.body; // 直接使用 body 作为 changes
  const { user } = req;
  const actionUserId = user.userId;

  try {
    // 获取现有数据
    const exist = await serverDb.get(id);
    if (!exist) {
      return res.status(404).json({ message: "Data not found" });
    }

    // TODO: 检查用户权限
    // 示例：if (!hasPatchPermission(actionUserId, exist)) {
    //   return res.status(403).json({ message: "Permission denied" });
    // }

    // 深度合并现有数据和变更
    const final = deepMerge(exist, changes);

    // 更新数据库
    await serverDb.put(id, final);

    // 返回成功响应
    return res.status(200).json({
      data: { id, ...final },
      message: "Data patched successfully",
    });
  } catch (error) {
    console.error("Patch error:", error);
    return res.status(500).json({
      message: "Failed to patch data",
      error: error.message,
    });
  }
};
