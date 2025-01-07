import { API_ENDPOINTS } from "../config";
import { noloRequest } from "../requests/noloRequest";
import { browserDb } from "database/browser/db";

export const deleteAction = async (args, thunkApi) => {
  const { id, body } = args;
  const { getState } = thunkApi;

  // 本地删除
  browserDb.del(id);

  // 异步执行远程删除，不阻塞主流程
  const deleteRemote = async () => {
    try {
      const fetchConfig = {
        url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
        method: "DELETE",
        body: JSON.stringify(body),
      };
      const res = await noloRequest(getState(), fetchConfig);
      if (res.status === 200) {
        const result = await res.json();
        console.log("Remote delete successful", result);
      }
    } catch (error) {
      console.error("Remote delete failed:", error);
    }
  };

  // 启动远程删除但不等待
  deleteRemote();

  // 本地删除后立即返回
  return { success: true };
};
