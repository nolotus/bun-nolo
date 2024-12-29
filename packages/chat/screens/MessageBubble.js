import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from 'app/theme';


const MessageBubble = ({ message }) => {
  const theme = useTheme();
  const isUser = message.sender === 'user';


  return (
    <View style={[
      styles.messageRow,
      isUser ? styles.userMessageRow : styles.aiMessageRow
    ]}>
      <Image 
        source={message.avatar}
        style={[
          styles.avatar,
          isUser ? styles.userAvatar : styles.aiAvatar
        ]}
      />
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble,
        {backgroundColor: isUser ? theme.primary : theme.backgroundSecondary}
      ]}>
        <Text style={[
          styles.messageText,
          {color: isUser ? theme.background : theme.text}
        ]}>
          {message.message}
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
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
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  }
});


export default MessageBubble;
