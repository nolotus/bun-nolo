import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

const DialogDetail = ({ route }) => {
  const { dialogId, userName } = route.params;

  // 模拟根据 dialogId 获取对话详情
  const dialogDetails = {
    '1': [
      { sender: 'user', message: '你好，我想了解一下项目的进度。' },
      { sender: 'ai', message: '你好！目前项目进展顺利，我们正在按计划进行。' },
      { sender: 'user', message: '那太好了，有什么需要我帮忙的吗？' },
      { sender: 'ai', message: '暂时没有，如果有需要我会及时通知你。' },
    ],
    '2': [
      { sender: 'user', message: '下周三的会议安排好了吗？' },
      { sender: 'ai', message: '是的，会议已经安排在下周三上午 10:00，地点是会议室 A。' },
    ],
    '3': [
      { sender: 'user', message: '设计稿的反馈收到了吗？' },
      { sender: 'ai', message: '收到了，我们已经审核完毕，请根据反馈意见进行修改。' },
    ],
  };

  const [messages, setMessages] = useState(dialogDetails[dialogId]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = { sender: 'user', message: inputText };
      setMessages([...messages, newMessage]);
      setInputText('');

      // 模拟AI回复
      setTimeout(() => {
        const aiResponse = { sender: 'ai', message: '收到你的消息，我会尽快处理。' };
        setMessages([...messages, newMessage, aiResponse]);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.messageText}>{msg.message}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入消息..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
});

export default DialogDetail;
