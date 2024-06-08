import { View } from "react-native";

import MessageInput from "./MessageInput"; // 导入 MessageInput 组件
import { DialogList } from "./DialogList";

export function ChatScreen() {
  return (
    <View>
      {/* <MessageInput /> */}
      <DialogList />
    </View>
  );
}
