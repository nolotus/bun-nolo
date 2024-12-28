import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { initialDialogData } from "./mockData"; // 导入假数据


const DialogListScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const [dialogGroups, setDialogGroups] = useState(initialDialogData);

  // 切换分组展开状态
  const toggleGroupExpansion = (groupIndex) => {
    const updatedGroups = [...dialogGroups];
    updatedGroups[groupIndex].expanded = !updatedGroups[groupIndex].expanded;
    setDialogGroups(updatedGroups);
  };

  // 搜索功能
  const handleSearch = (text) => {
    setSearchText(text);

    const filteredGroups = initialDialogData.filter((item) => {
      // 处理有分组的数据
      if (item.group) {
        item.items = item.items.filter(
          (subItem) =>
            subItem.userName.includes(text) ||
            subItem.lastMessage.includes(text)
        );
        return item.items.length > 0;
      }

      // 处理无分组的数据
      return (
        item.userName.includes(text) || 
        (item.lastMessage && item.lastMessage.includes(text))
      );
    });

    setDialogGroups(filteredGroups);
  };

  // 渲染对话列表
  const renderDialogs = () => {
    return dialogGroups.map((item, index) => {
      // 有分组的对话
      if (item.group) {
        return (
          <View key={item.group} style={styles.groupContainer}>
            {/* 分组标题 */}
            <TouchableOpacity
              style={styles.groupHeader}
              onPress={() => toggleGroupExpansion(index)}
            >
              <Icon
                name={item.expanded ? "chevron-down" : "chevron-forward"}
                size={20}
                color="#007AFF"
              />
              <Text style={styles.groupTitle}>{item.group}</Text>
            </TouchableOpacity>

            {/* 分组内容 */}
            {item.expanded &&
              item.items.map((subItem) => (
                <TouchableOpacity
                  key={subItem.id}
                  style={styles.dialogItem}
                  onPress={() =>
                    navigation.navigate("DialogDetail", {
                      dialogId: subItem.id,
                      userName: subItem.userName,
                    })
                  }
                >
                  <View style={styles.dialogContent}>
                    <Text style={styles.userName}>{subItem.userName}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {subItem.lastMessage}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>{subItem.timestamp}</Text>
                </TouchableOpacity>
              ))}
          </View>
        );
      }
      
      // 无分组的对话
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.dialogItem}
          onPress={() =>
            navigation.navigate("DialogDetail", {
              dialogId: item.id,
              userName: item.userName,
            })
          }
        >
          <View style={styles.dialogContent}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* 搜索区域 */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索助手或对话"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* 对话列表 */}
      <ScrollView style={styles.listContainer}>{renderDialogs()}</ScrollView>

      {/* 添加菜单弹窗 */}
      <Modal
        transparent={true}
        visible={isAddMenuVisible}
        animationType="fade"
        onRequestClose={() => setIsAddMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setIsAddMenuVisible(false)}
        >
          <View style={styles.addMenuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsAddMenuVisible(false);
                // 添加选择助手逻辑
              }}
            >
              <Icon name="list" size={20} color="#007AFF" />
              <Text style={styles.menuItemText}>选择助手</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsAddMenuVisible(false);
                // 添加新建助手逻辑
              }}
            >
              <Icon name="create" size={20} color="#007AFF" />
              <Text style={styles.menuItemText}>新建助手</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: 40,
  },

  listContainer: {
    flex: 1,
  },
  groupContainer: {
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  groupTitle: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  dialogItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  dialogContent: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: "transparent",
  },
  addMenuContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 60,
    marginRight: 20,
    width: 180,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#007AFF",
  },
});

export default DialogListScreen;

