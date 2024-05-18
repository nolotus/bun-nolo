import { generateIdWithCustomId } from "core/generateMainKey";
import { Flags } from "core/prefix";

import { API_ENDPOINTS } from "../config";

export const readOwnData = async (
  userId: string,
  customId: string,
  flags: Flags,
) => {
  const noloId = generateIdWithCustomId(userId, customId, flags);
  const validUrl = `${API_ENDPOINTS.DATABASE}/read/${noloId}`;
  return await fetch(validUrl).then((res) => {
    return res.json();
  });
};

export async function readData(noloId: string) {
  const prefixDomain = "http://localhost";
  const apiUrl = `${API_ENDPOINTS.DATABASE}/read/${noloId}`;
  const validUrl = prefixDomain + apiUrl;
  console.log("validUrl", validUrl);
  return await fetch(validUrl).then((res) => {
    return res.json();
  });
}
