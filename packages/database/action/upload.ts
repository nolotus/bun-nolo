// database/actions/upload.ts
import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { ulid } from "ulid"; // 使用 ulid 生成唯一ID
import { getAllServers, normalizeTimeFields, logger } from "./common";
import {
  noloUploadRequest, // 假设有一个专门用于文件上传的请求函数
  syncWithServers, // 导入通用同步函数
} from "../requests";

// web
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast"; // 用于用户友好的错误提示

/**
 * 辅助函数：保存文件元数据到客户端数据库
 * @param clientDb 客户端数据库实例
 * @param dbKey 数据库键
 * @param metadata 文件元数据
 */
const saveToClientDb = async (
  clientDb: any,
  dbKey: string,
  metadata: any
): Promise<void> => {
  if (!clientDb) {
    logger.error({ dbKey }, "Client database is undefined in saveToClientDb");
    throw new Error("Client database instance is required");
  }
  try {
    await clientDb.put(dbKey, metadata);
    logger.debug(
      { dbKey },
      "File metadata saved successfully to local database."
    );
  } catch (err: any) {
    logger.error(
      { err, dbKey },
      "Failed to save file metadata to local database"
    );
    throw new Error(`Local database put failed for ${dbKey}: ${err.message}`);
  }
};

/**
 * 辅助函数：计算文件的 SHA256 校验值
 * @param buffer 文件的 Buffer 数据
 * @returns SHA256 校验值（十六进制字符串）
 */
const calculateSha256 = (buffer: Buffer): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(buffer);
  return hasher.digest("hex"); // 以十六进制字符串返回
};

/**
 * Upload File Action: 上传文件并保存元数据。
 * 1. 验证文件和相关参数。
 * 2. 生成文件元数据（添加时间戳、dbKey、userId、SHA256 校验值）。
 * 3. 保存文件到本地存储（如果适用）并保存元数据到本地数据库。
 * 4. 异步将文件和元数据上传到服务器。
 * @param uploadConfig 上传配置，包含 file, customKey, 可选 userId。
 * @param thunkApi Redux Thunk API。
 * @param clientDb 客户端数据库实例 (默认为 browserDb)。
 * @returns Promise<any> 已保存到本地的文件元数据对象。
 * @throws Error 如果文件或参数无效、本地保存失败。
 */
export const uploadFileAction = async (
  uploadConfig: { file: File; customKey: string; userId?: string },
  thunkApi: any,
  clientDb: any = browserDb // 允许注入 DB 进行测试
): Promise<any> => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state); // 当前选定服务器
  const currentUserId = selectCurrentUserId(state); // 当前登录用户 ID
  const { file, customKey } = uploadConfig;
  // 优先使用 uploadConfig 中提供的 userId，否则回退到当前登录用户的 ID
  const userId = uploadConfig.userId || currentUserId;

  // 1. 验证参数
  if (!file || !customKey) {
    const errorMsg =
      "Invalid arguments for uploadFileAction: file and customKey are required.";
    logger.error(errorMsg, { uploadConfig });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // 2. 生成文件ID和文件名
    const fileId = ulid();
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${fileId}${fileExtension ? "." + fileExtension : ""}`;

    // 3. 读取文件内容并计算 SHA256 校验值
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const sha256 = calculateSha256(fileBuffer);

    // 4. 准备文件元数据（添加时间戳、dbKey、userId）
    const fileMetadata = normalizeTimeFields({
      id: fileId,
      originalName: file.name,
      fileName: fileName,
      filePath: "", // 前端可能不需要存储本地路径，留空或根据需求调整
      size: file.size,
      type: file.type || "unknown",
      sha256: sha256, // 存储文件的 SHA256 校验值
      dbKey: customKey, // 确保 dbKey 存在于对象中
      userId: userId, // 确保 userId 存在于对象中
    });

    // 5. 保存元数据到本地数据库
    await saveToClientDb(clientDb, customKey, fileMetadata);

    // 6. 获取所有目标服务器列表
    const servers = getAllServers(currentServer); // common.ts 中的函数，应处理去重

    // 7. 准备用于服务器上传的配置
    const serverUploadConfig = {
      file: file, // 传递文件对象给服务器请求
      metadata: fileMetadata, // 传递完整元数据
      customKey: customKey,
      userId: userId,
    };

    // 8. 后台异步同步文件和元数据到所有服务器
    Promise.resolve().then(() => {
      logger.debug(
        `[uploadFileAction] Initiating background sync for file: ${fileName} with key: ${customKey} to ${servers.length} servers.`
      );
      syncWithServers(
        servers,
        noloUploadRequest, // 使用假设的文件上传请求函数
        `Upload sync failed for ${customKey} on`, // 错误消息前缀
        // --- 传递给 noloUploadRequest 的参数 ---
        serverUploadConfig, // 包含 file, metadata, customKey, userId 的对象
        state // 传递 state 用于认证
        // ------------------------------------
      );
    });

    // 9. 返回已保存到本地的文件元数据
    return fileMetadata;
  } catch (error: any) {
    // 捕获 saveToClientDb 或其他可能的错误
    const errorMessage = `Upload action failed for ${customKey}: ${error.message || "Unknown error"}`;
    logger.error("[uploadFileAction] Error:", error);
    toast.error(`Failed to upload file for ${customKey}.`); // 用户友好的提示
    throw error;
  }
};
