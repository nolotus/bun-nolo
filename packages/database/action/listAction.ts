import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "../config";

// 最小化的类型定义
type ListPayload = {
  itemId: string;
  listId: string;
};

const createAuthHeaders = (token: string) => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// 使用 any 类型简化 thunkAPI
export const addToListAction = async (
  { itemId, listId }: ListPayload,
  thunkAPI: any
) => {
  const state = thunkAPI.getState();
  const baseUrl = selectCurrentServer(state);
  const token = state.auth.currentToken;

  const response = await fetch(`${baseUrl}${API_ENDPOINTS.PUT}/${listId}`, {
    method: "PUT",
    ...createAuthHeaders(token),
    body: JSON.stringify({ id: itemId }),
  });

  if (!response.ok) {
    throw new Error("Failed to add item to list");
  }

  return response.json();
};

export const removeFromListAction = async (
  { itemId, listId }: ListPayload,
  thunkAPI: any
) => {
  const state = thunkAPI.getState();
  const baseUrl = selectCurrentServer(state);
  const token = state.auth.currentToken;

  const response = await fetch(`${baseUrl}${API_ENDPOINTS.PUT}/${listId}`, {
    method: "DELETE",
    ...createAuthHeaders(token),
    body: JSON.stringify({ id: itemId, action: "remove" }),
  });

  if (!response.ok) {
    throw new Error("Failed to remove item from list");
  }
};
