import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// 页面类型定义
type PageType = "home" | "settings" | "about" | "data" | "user";

// Z_INDEX 常量 - 简化版本
const Z_INDEX = {
  DROPDOWN_CONTENT: 1000,
};

// 空间选择器组件
interface SpaceSelectorProps {
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  selectedSpace,
  onSpaceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const spaces = ["个人空间", "工作空间", "团队空间", "项目空间"];

  return (
    <View style={styles.spaceSelectorContainer}>
      <TouchableOpacity
        style={styles.spaceSelectorButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.spaceSelectorText}>{selectedSpace}</Text>
        <Text style={styles.spaceSelectorArrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.spaceDropdown}>
          {spaces.map((space) => (
            <TouchableOpacity
              key={space}
              style={[
                styles.spaceDropdownItem,
                selectedSpace === space && styles.spaceDropdownItemSelected,
              ]}
              onPress={() => {
                onSpaceChange(space);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.spaceDropdownText,
                  selectedSpace === space && styles.spaceDropdownTextSelected,
                ]}
              >
                {space}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// 侧边栏头部组件 - 包含主页按钮和空间选择器
interface SidebarHeaderComponentProps {
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
  onHomeClick: () => void;
}

const SidebarHeaderComponent: React.FC<SidebarHeaderComponentProps> = ({
  selectedSpace,
  onSpaceChange,
  onHomeClick,
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerRow}>
      <TouchableOpacity style={styles.homeButton} onPress={onHomeClick}>
        <Text style={styles.homeButtonText}>🏠 主页</Text>
      </TouchableOpacity>

      <SpaceSelector
        selectedSpace={selectedSpace}
        onSpaceChange={onSpaceChange}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    zIndex: 1, // Ensure header is above other sidebar content
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  homeButton: {
    flex: 0.8,
    marginRight: 12,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  // 空间选择器样式
  spaceSelectorContainer: {
    flex: 1.2,
    position: "relative",
    zIndex: Z_INDEX.DROPDOWN_CONTENT,
  },
  spaceSelectorButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spaceSelectorText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  spaceSelectorArrow: {
    fontSize: 12,
    color: "#666",
  },
  spaceDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 6,
    marginTop: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: Z_INDEX.DROPDOWN_CONTENT,
  },
  spaceDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  spaceDropdownItemSelected: {
    backgroundColor: "#e3f2fd",
  },
  spaceDropdownText: {
    fontSize: 14,
    color: "#333",
  },
  spaceDropdownTextSelected: {
    color: "#007AFF",
    fontWeight: "500",
  },
});

export default SidebarHeaderComponent;
export type { PageType };
