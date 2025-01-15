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
