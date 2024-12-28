import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import { dialogDetails } from "./mockData";

const DialogDetail = ({ route, navigation }) => {
  // 修正了拼写错误 navagation -> navigation
  const { dialogId, userName } = route.params;
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([]); // 初始化为空数组

  const [inputText, setInputText] = useState("");

  useEffect(() => {
    // 根据 dialogId 查找对应的消息列表
    const selectedDialog = dialogDetails.find(
      (dialog) => dialog.id === dialogId
    );
    if (selectedDialog) {
      setMessages(selectedDialog.messages || []); // 如果找到，就设置消息，默认空数组
    }
  }, [dialogId]); // 依赖 dialogId 变化

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        sender: "user",
        message: inputText,
        avatar: require("./assets/user-avatar.png"),
      };
      // 使用函数式更新，避免引用旧的 messages 值
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];

        // 模拟AI回复
        setTimeout(() => {
          const aiResponse = {
            sender: "ai",
            message: "收到你的消息，我会尽快处理。",
            avatar: require("./assets/ai-avatar.png"),
          };
          setMessages((prev) => [...prev, aiResponse]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 1000);

        scrollViewRef.current?.scrollToEnd({ animated: true });
        return updatedMessages;
      });
      setInputText("");
    }
  };

  const renderMessageBubble = (msg, index) => {
    const isUser = msg.sender === "user";
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <Image
          source={msg.avatar}
          style={[styles.avatar, isUser ? styles.userAvatar : styles.aiAvatar]}
        />
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {msg.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 65}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
      >
        {messages.map(renderMessageBubble)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入消息..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    justifyContent: "space-between", // 添加这行
  },

  messagesContentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  userMessageContainer: {
    flexDirection: "row-reverse", // 修改这行
    alignItems: "flex-end",
  },

  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  userAvatar: {
    alignSelf: "flex-end",
    marginLeft: 8, // 调整左边距
    marginRight: 0, // 右边距设为0
  },

  aiAvatar: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  aiMessageText: {
    color: "#000000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
});

export default DialogDetail;

