import serverDb from "database/server/db";
import { pubCybotKeys } from "database/keys";
import { extractCustomId } from "core/prefix";

interface DeletePubCybotOptions {
  id: string;
}

export async function deletePubCybot(options: DeletePubCybotOptions) {
  const { id } = options;
  const cybotId = extractCustomId(id);
  try {
    // 构建公开 Cybot 的键
    const key = pubCybotKeys.single(cybotId);

    // 检查 Cybot 是否存在
    const value = await serverDb.get(key);

    if (!value || !value.isPublic) {
      return {
        success: false,
        message: `未找到 ID 为 ${key} 的公共 Cybot。`,
      };
    }

    // 删除 Cybot
    await serverDb.del(key);

    return {
      success: true,
      message: `ID 为 ${id} 的公共 Cybot 已成功删除。`,
    };
  } catch (error) {
    throw new Error(`删除 ID 为 ${id} 的公共 Cybot 时出错: ${error.message}`);
  }
}
