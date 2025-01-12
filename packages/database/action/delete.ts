import { API_ENDPOINTS } from "../config";
import { noloRequest } from "../requests/noloRequest";
import { browserDb } from "database/browser/db";

export const deleteAction = async (id, thunkApi) => {
  const { getState } = thunkApi;
  // 本地删除
  browserDb.del(id);

  // 异步执行远程删除，不阻塞主流程
  const deleteRemote = async () => {
    const fetchConfig = {
      url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
      method: "DELETE",
    };
    const res = await noloRequest(getState(), fetchConfig);
    if (res.status === 200) {
      const result = await res.json();
      console.log("Remote delete successful", result);
    }
  };

  // 启动远程删除但不等待
  deleteRemote();

  // 本地删除后立即返回
  return { id };
};
