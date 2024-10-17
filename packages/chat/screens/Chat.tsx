import { View } from "react-native";

import MessageInput from "./MessageInput";
import { DialogList } from "./DialogList";

export function ChatScreen() {
  return (
    <View>
      {/* <MessageInput /> */}
      <DialogList />
    </View>
  );
}
