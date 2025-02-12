import { browserDb } from "database/browser/db";
import { pino } from "pino";
import { pubCybotKeys } from "database/keys";

const logger = pino({ name: "deletePubCybot" });

interface DeletePubCybotOptions {
  id: string;
}

export async function deletePubCybot(options: DeletePubCybotOptions) {
  const { id } = options;

  try {
    // 构建公开 Cybot 的键
    const key = pubCybotKeys.single(id);

    // 检查 Cybot 是否存在
    const value = await browserDb.get(key);

    if (!value || !value.isPublic) {
      logger.warn(`未找到 ID 为 ${id} 的公共 Cybot。`);
      return {
        success: false,
        message: `未找到 ID 为 ${id} 的公共 Cybot。`,
      };
    }

    // 删除 Cybot
    await browserDb.del(key);

    logger.debug(
      `ID 为 ${id} 的公共 Cybot 已成功删除。`,
      "Deleted public cybot"
    );

    return {
      success: true,
      message: `ID 为 ${id} 的公共 Cybot 已成功删除。`,
    };
  } catch (error) {
    logger.error({ error }, `删除 ID 为 ${id} 的公共 Cybot 时出错`);
    throw error;
  }
}
