// DialogDetail.js
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
  SafeAreaView,
} from "react-native";
import { dialogDetails } from "./mockData";

const DialogDetail = ({ route, navigation }) => {
  const { dialogId, userName } = route.params;
  const scrollViewRef = useRef();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    const selectedDialog = dialogDetails.find(
      (dialog) => dialog.id === dialogId
    );
    if (selectedDialog) {
      setMessages(selectedDialog.messages || []);
    }
  }, [dialogId]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        sender: "user",
        message: inputText,
        avatar: require("./assets/user-avatar.png"),
      };
      
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];
        setTimeout(() => {
          const aiResponse = {
            sender: "ai",
            message: "收到你的消息，我会尽快处理。",
            avatar: require("./assets/ai-avatar.png"),
          };
          setMessages((prev) => [...prev, aiResponse]);
          scrollToBottom();
        }, 1000);
        
        scrollToBottom();
        return updatedMessages;
      });
      
      setInputText("");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessageBubble = (msg, index) => {
    const isUser = msg.sender === "user";
    return (
      <View
        key={index}
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.aiMessageRow,
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
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {msg.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessageBubble)}
        </ScrollView>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="输入消息..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              multiline={false}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.7}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  aiMessageRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  userAvatar: {
    marginLeft: 8,
    marginRight: 0,
  },
  aiAvatar: {
    marginRight: 8,
    marginLeft: 0,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  aiBubble: {
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
 
});

export default DialogDetail;
