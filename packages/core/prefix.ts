const extractKeyPart = (key: string, index: number): string => {
  const parts = key.split("-");
  if (index < 2) {
    return parts[index];
  }
  return parts.slice(index).join("-");
};

export const extractUserId = (key: string): string => {
  const userId = extractKeyPart(key, 1);
  return userId;
};

export const extractCustomId = (key: string): string => extractKeyPart(key, 2);
