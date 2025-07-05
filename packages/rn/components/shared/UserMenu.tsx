import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageStyle,
  Dimensions,
} from "react-native";
import { useSimpleNavigation } from "../../SimpleNavigator";

// 用户信息接口
interface UserInfo {
  name: string;
  avatar?: string;
  email?: string;
}

// 菜单项接口
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

// 用户菜单组件props
interface UserMenuProps {
  userInfo: UserInfo;
}

const UserMenu: React.FC<UserMenuProps> = ({ userInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const { navigate } = useSimpleNavigation();

  // 监听屏幕尺寸变化
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isLargeScreen = screenWidth >= 768;

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      id: "profile",
      title: "用户资料",
      icon: "👤",
      onPress: () => {
        setIsOpen(false);
        navigate("UserProfile");
      },
    },
    {
      id: "settings",
      title: "设置",
      icon: "⚙️",
      onPress: () => {
        setIsOpen(false);
        navigate("Settings");
      },
    },
    {
      id: "recharge",
      title: "充值",
      icon: "💰",
      onPress: () => {
        setIsOpen(false);
        navigate("Recharge");
      },
    },
    {
      id: "about",
      title: "关于",
      icon: "ℹ️",
      onPress: () => {
        setIsOpen(false);
        navigate("About");
      },
    },
    {
      id: "data",
      title: "数据",
      icon: "📊",
      onPress: () => {
        setIsOpen(false);
        navigate("Data");
      },
    },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // 渲染用户头像
  const renderAvatar = () => {
    if (userInfo.avatar) {
      return <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />;
    } else {
      return (
        <View style={styles.defaultAvatar}>
          <Text style={styles.avatarText}>
            {userInfo.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 用户按钮 - 响应式显示 */}
      <TouchableOpacity style={styles.userButton} onPress={toggleDropdown}>
        <View style={styles.userInfo}>
          {renderAvatar()}
          {/* 大屏幕显示用户名，小屏幕只显示头像 */}
          {isLargeScreen && (
            <Text style={styles.userName} numberOfLines={1}>
              {userInfo.name}
            </Text>
          )}
        </View>
        <Text style={styles.dropdownIcon}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeDropdown}
            activeOpacity={1}
          />

          {/* 菜单内容 */}
          <View style={styles.dropdown}>
            {/* 用户信息区域 */}
            <View style={styles.userSection}>
              <View style={styles.userDetails}>
                <Text style={styles.userNameLarge}>{userInfo.name}</Text>
                {userInfo.email && (
                  <Text style={styles.userEmail}>{userInfo.email}</Text>
                )}
              </View>
            </View>

            {/* 分割线 */}
            <View style={styles.separator} />

            {/* 菜单项 */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 9999,
    alignSelf: "flex-end",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    minHeight: 40,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  } as ImageStyle,
  defaultAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  userName: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
    maxWidth: 100,
    opacity: 0.9,
  },
  dropdownIcon: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 6,
  },
  overlay: {
    position: "absolute",
    top: 48,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: "transparent",
    zIndex: 9998,
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 24,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  userSection: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  userDetails: {
    alignItems: "flex-start",
  },
  userNameLarge: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    opacity: 0.8,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    marginHorizontal: 0,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
});

export default UserMenu;
