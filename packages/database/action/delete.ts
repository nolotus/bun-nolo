import { selectCurrentUserId } from "auth/authSlice";
import { API_ENDPOINTS } from "../config";
import { noloRequest } from "../requests/noloRequest";
import { deleteFromIndexedDB } from "../browser/indexedDBActions";

export const deleteAction = async (args, thunkApi) => {
  const { id, body } = args;
  const { getState } = thunkApi;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);
  if (currentUserId === "local") {
    deleteFromIndexedDB(currentUserId, id);
  } else {
    const fetchConfig = {
      url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
      method: "DELETE",
      body: JSON.stringify(body),
    };
    const res = await noloRequest(state, fetchConfig);
    if (res.status === 200) {
      const result = await res.json();
      console.log("result 200", result);
      const { processingIds } = result;
      return processingIds;
    }
  }
};
