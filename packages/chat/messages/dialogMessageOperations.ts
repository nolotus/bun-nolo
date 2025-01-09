export const getLatestMessages = async (db, dialogId, limit = 20) => {
    const messages = [];
    const prefix = `dialog-${dialogId}-msg-`;
  
    try {
      for await (const [key, value] of db.iterator({
        gte: prefix,
        lte: prefix + "\uffff",
        reverse: true,
        limit,
      })) {
        messages.push(value);
      }
  
      return messages;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    }
  };
  
export const deleteAllMessages = async (db, dialogId) => {
    const prefix = `dialog-${dialogId}-msg-`;
    const batch = db.batch();
  
    try {
      // 收集所有需要删除的key
      for await (const [key] of db.iterator({
        gte: prefix,
        lte: prefix + "\uffff"
      })) {
        batch.del(key);
      }
  
      // 批量删除
      await batch.write();
      return true;
    } catch (err) {
      console.error("Failed to delete messages:", err);
      return false;
    }
  };
  