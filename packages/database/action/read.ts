import { selectCurrentServer } from "setting/settingSlice";
import { selectIsLoggedIn } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { toast } from "react-hot-toast";
import { browserDb } from "../browser/db";
import { pino } from "pino";

const logger = pino({ name: "data-fetch" });
const CYBOT_SERVER = "https://cybot.one";

const fetchData = async (server: string, id: string, token?: string) => {
  try {
    const res = await fetch(`${server}${API_ENDPOINTS.DATABASE}/read/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (res.status === 200) {
      return await res.json();
    }
    logger.warn({ status: res.status }, "Fetch failed");
    return null;
  } catch (err) {
    logger.error({ err }, "Fetch error");
    return null;
  }
};

const updateLocalData = async (id: string, remoteData: any, localData: any) => {
  if (!remoteData?.updatedAt) return;

  const shouldUpdate =
    !localData?.updatedAt ||
    new Date(remoteData.updatedAt) > new Date(localData.updatedAt);

  if (shouldUpdate) {
    await browserDb.put(id, remoteData);
    toast.success("Data updated from server");
  }
};

export const readAction = async (id: string, thunkApi) => {
  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  // 并行请求本地和远程数据
  const [localData, remoteData] = await Promise.all([
    browserDb.get(id),
    fetchData(currentServer, id, selectIsLoggedIn(state) ? token : undefined),
  ]);

  // 有本地数据则先返回，异步更新
  if (localData) {
    updateLocalData(id, remoteData, localData);
    return localData;
  }

  // 远程数据可用则保存并返回
  if (remoteData) {
    await browserDb.put(id, remoteData);
    return remoteData;
  }

  // 尝试从 cybot 获取
  logger.info("Fetching from cybot.one");
  const cybotData = await fetchData(CYBOT_SERVER, id);

  if (!cybotData) {
    throw new Error("Failed to fetch data from all sources");
  }

  await browserDb.put(id, cybotData);
  toast.success("Data fetched from cybot.one");
  return cybotData;
};
