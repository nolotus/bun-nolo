import testb from "database/server/testDb";
const db = testb;

async function test() {
  try {
    await db.clear();

    const batch = [];
    // 增加到1000个对话，每个对话100-500条消息
    const dialogIds = Array.from({ length: 1000 }, (_, i) => `dialog_${i + 1}`);
    let messageId = 1;

    for (const dialogId of dialogIds) {
      const messageCount = Math.floor(Math.random() * (500 - 100) + 100);

      for (let i = 0; i < messageCount; i++) {
        const timestamp = Date.now() - messageId * 60000;
        const message = {
          dialog_id: dialogId,
          msg_id: messageId,
          timestamp,
          sender: Math.random() < 0.5 ? "user" : "bot",
          text: `Message ${messageId} in dialog ${dialogId}`,
          read: Math.random() < 0.8,
          type: Math.random() < 0.8 ? "text" : "image",
        };

        batch.push({
          type: "put",
          key: `msg_${messageId}`,
          value: JSON.stringify(message),
        });

        batch.push({
          type: "put",
          key: `idx_${dialogId}_${timestamp}`,
          value: `msg_${messageId}`,
        });

        messageId++;
      }
    }
    await db.batch(batch);

    const targetDialogId = "dialog_500";

    const indexStart = process.hrtime();
    const indexMessages = [];
    for await (const [key, value] of db.iterator({
      gte: `idx_${targetDialogId}_`,
      lte: `idx_${targetDialogId}_\uffff`,
    })) {
      const msgKey = value;
      const msgValue = await db.get(msgKey);
      const msg =
        typeof msgValue === "string" ? JSON.parse(msgValue) : msgValue;
      indexMessages.push(msg);
    }
    const indexEnd = process.hrtime(indexStart);

    const filterStart = process.hrtime();
    const filteredMessages = [];
    for await (const [key, value] of db.iterator({
      gte: "msg_",
      lte: "msg_\uffff",
    })) {
      const msg = typeof value === "string" ? JSON.parse(value) : value;
      if (msg.dialog_id === targetDialogId) {
        filteredMessages.push(msg);
      }
    }
    const filterEnd = process.hrtime(filterStart);

    console.log({
      totalMessages: messageId - 1,
      averageMessagesPerDialog: (messageId - 1) / dialogIds.length,
      indexMethodTime: `${indexEnd[0]}s ${indexEnd[1] / 1000000}ms`,
      filterMethodTime: `${filterEnd[0]}s ${filterEnd[1] / 1000000}ms`,
      indexMessagesFound: indexMessages.length,
      filteredMessagesFound: filteredMessages.length,
      resultsMatch: indexMessages.length === filteredMessages.length,
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.close();
  }
}

test();
