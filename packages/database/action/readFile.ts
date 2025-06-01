// database/actions/readFile.ts
import { selectCurrentServer } from "setting/settingSlice";
import { getAllServers, logger } from "./common";
import { noloReadFileRequest } from "../requests";
import { toast } from "react-hot-toast";

/**
 * Read File Action: 从服务器读取文件内容或元数据。
 * 1. 验证文件ID和参数。
 * 2. 从服务器获取文件数据（元数据或内容）。
 * @param readConfig 读取配置，包含 fileId, type。
 * @param thunkApi Redux Thunk API。
 * @returns Promise<any> 服务器返回的文件数据（元数据或内容）。
 * @throws Error 如果参数无效或请求失败。
 */
export const readFileAction = async (
  readConfig: { fileId: string; type?: "metadata" | "content" },
  thunkApi: any
): Promise<any> => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state); // 当前选定服务器
  const { fileId, type = "metadata" } = readConfig;

  // 1. 验证参数
  if (!fileId) {
    const errorMsg =
      "Invalid arguments for readFileAction: fileId is required.";
    logger.error(errorMsg, { readConfig });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // 2. 获取所有目标服务器列表
    const servers = getAllServers(currentServer); // common.ts 中的函数，应处理去重

    // 3. 尝试从第一个服务器读取文件数据
    // 备注：这里简化为只尝试第一个服务器，您可以根据需求实现多服务器轮询或优先级逻辑
    const server = servers[0];
    if (!server) {
      const errorMsg = "No server available for reading file.";
      logger.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    logger.debug(`[readFileAction] Reading file ${fileId} from ${server}.`);
    const result = await noloReadFileRequest(server, fileId, { type }, state);

    if (!result.success) {
      const errorMsg = `Failed to read file ${fileId} from ${server}.`;
      logger.error(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 4. 返回文件数据
    return result.data;
  } catch (error: any) {
    const errorMessage = `Read file action failed for ${fileId}: ${error.message || "Unknown error"}`;
    logger.error("[readFileAction] Error:", error);
    toast.error(`Failed to read file ${fileId}.`); // 用户友好的提示
    throw error;
  }
};
