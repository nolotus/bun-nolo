type MessageType = "text" | "image" | "audio" | "file";
interface Message {
  id: string;
  dialogId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: number;
}
const PREFIXES = {
  MESSAGE: "msg",
  DIALOG: "dlg",
  USER: "usr",
} as const;
const extractAutoIncrId = (messageId: string): string => {
  const [_, autoIncrId] = messageId.split("-");
  return autoIncrId;
};

export const generateMessageKey = (message: Message): string =>
  `${PREFIXES.MESSAGE}-${message.dialogId}-${message.timestamp}-${extractAutoIncrId(message.id)}`;
