import { API_ENDPOINTS } from "database/config";

export const noloReadRequest = async (
  server: string,
  id: string,
  token?: string,
) => {
  const url = `${API_ENDPOINTS.DATABASE}/read/${id}`;
  let headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(server + url, {
    method: "GET",
    headers,
  });
  return res;
};
