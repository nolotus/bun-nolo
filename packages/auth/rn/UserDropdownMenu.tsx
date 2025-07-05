import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageStyle,
} from "react-native";
import { useSimpleNavigation } from "../../../SimpleNavigator";
import { Z_INDEX } from "../../../zIndexLayers";

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

// 用户下拉菜单组件props
interface UserDropdownMenuProps {
  userInfo: UserInfo;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ userInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigate } = useSimpleNavigation();

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
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* 用户头像和名称 */}
      <TouchableOpacity style={styles.userButton} onPress={toggleDropdown}>
        <View style={styles.userInfo}>
          {userInfo.avatar ? (
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {userInfo.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {userInfo.name}
          </Text>
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
    zIndex: Z_INDEX.TOPBAR_DROPDOWN,
    alignSelf: "flex-end",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  } as ImageStyle,
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  userName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    maxWidth: 120,
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 8,
  },
  overlay: {
    position: "absolute",
    top: 52,
    right: -50,
    width: 250,
    height: 200,
    backgroundColor: "transparent",
    zIndex: Z_INDEX.DROPDOWN_OVERLAY,
  },
  dropdown: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: Z_INDEX.DROPDOWN_CONTENT,
  },
  userSection: {
    padding: 16,
  },
  userDetails: {
    alignItems: "flex-start",
  },
  userNameLarge: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});

export default UserDropdownMenu;
