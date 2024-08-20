export const deleteQueueCache = new Map<string, Set<string>>();

export const isIdInDeleteQueueCache = (userId: string, id: string): boolean => {
  return deleteQueueCache.has(userId) && deleteQueueCache.get(userId)!.has(id);
};
