import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState } from "react";

const MessageInput = ({}) => {
  const [text, setText] = useState(""); // 输入框的文本状态

  const handleSend = () => {
    if (text.trim()) {
      setText(""); // 清空输入框
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        onSubmitEditing={handleSend} // 按下回车也可以发送
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};
export default MessageInput;
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  input: {
    flex: 1, // 输入框会占据剩余空间
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: "blue",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
  // ...其他样式
});
