export const cache = new Map<string, Set<string>>();

export const isIdInCache = (userId: string, id: string): boolean => {
  return cache.has(userId) && cache.get(userId)!.has(id);
};
