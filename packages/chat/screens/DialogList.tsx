import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const dialogData = [
  { id: '1', userName: '张三', title: '关于项目进度的讨论', timestamp: '昨天' },
  { id: '2', userName: '李四', title: '会议安排', timestamp: '上午 10:00' },
  { id: '3', userName: '王五', title: '设计稿反馈', timestamp: '上午 9:30' },
  // ... 更多对话数据
];

const DialogListScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.dialogItem} onPress={() => navigation.navigate('DialogDetail', { dialogId: item.id, userName: item.userName })}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={dialogData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  dialogItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    color: 'gray',
  },
  timestamp: {
    fontSize: 12,
    color: 'lightgray',
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default DialogListScreen;
