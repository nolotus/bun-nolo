import React, { useState } from 'react';
import {
  View,
  TextInput, 
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from 'app/theme';

const MessageInput = ({ onSend }) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.inputWrapper, {backgroundColor: theme.background}]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                maxHeight: 100 // 限制最大高度
              }
            ]}
            placeholder="输入消息..."
            placeholderTextColor={theme.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline={true} // 启用多行
            returnKeyType="default" // 使用默认的换行键
            blurOnSubmit={false} // 提交时不失去焦点
          />
          <TouchableOpacity
            style={[styles.sendButton, {backgroundColor: theme.primary}]}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <Text style={[styles.sendButtonText, {color: theme.background}]}>
              发送
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // 改为底部对齐
    padding: 12,
  },
  input: {
    flex: 1,
    minHeight: 40, // 最小高度
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8, // 添加顶部内边距
    paddingBottom: 8, // 添加底部内边距
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 2, // 稍微调整按钮位置
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '500',
  }
});

export default MessageInput;
