import { useAppSelector } from "app/hooks";
import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";

import { selectCurrentUserId } from "auth/authSlice";

import { CreateRoutePaths } from "create/routePaths";

import { useMemo } from "react";
import { selectTheme } from "app/theme/themeSlice";

import Octicons from "react-native-vector-icons/Octicons";

const { width } = Dimensions.get("window");

const IconButton = ({
  name,
  size = 24,
  style,
}: {
  name: string;
  size?: number;
  style?: any;
}) => {
  const theme = useAppSelector(selectTheme);
  return (
    <Octicons name={name} size={size} color={theme.primary} style={style} />
  );
};

const GuideButton = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) => {
  const theme = useAppSelector(selectTheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.background }, style]}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

interface ButtonInfo {
  text: string;
  route: string;
  icon?: React.ReactNode;
  description?: string;
}

interface ButtonGroupProps {
  buttons: ButtonInfo[];
  onButtonPress: (route: string) => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  onButtonPress,
}) => {
  const theme = useAppSelector(selectTheme);

  return (
    <View style={styles.buttonGroup}>
      {buttons.map((button) => (
        <GuideButton
          key={button.text}
          onPress={() => onButtonPress(button.route)}
          style={[
            styles.groupButton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.buttonContent}>
            {button.icon}
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, { color: theme.text }]}>
                {button.text}
              </Text>
              {button.description && (
                <Text
                  style={[
                    styles.buttonDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {button.description}
                </Text>
              )}
            </View>
          </View>
        </GuideButton>
      ))}
    </View>
  );
};

const ChatGuide = () => {
  const navigation = useNavigation();
  const userId = useAppSelector(selectCurrentUserId);
  const theme = useAppSelector(selectTheme);

  const buttonsInfo = useMemo(
    () => [
      {
        text: "Cybot",
        route: CreateRoutePaths.CREATE_CYBOT,
        icon: <IconButton name="robot" />,
        description: "创建智能对话机器人",
      },
      {
        text: "空白页面",
        icon: <IconButton name="file-added" />,
        description: "从空白页面开始创作",
      },
      {
        text: "提示词",
        route: CreateRoutePaths.CREATE_PROMPT,
        icon: <IconButton name="comment-discussion" />,
        description: "管理和创建提示词模板",
      },
    ],
    []
  );

  const templates = [];
  const templateButtons =
    templates?.map((template) => ({
      text: template.title,
      route: `create/page?id=${template.id}`,
      description: template.description || "使用此模板快速开始",
      icon: <IconButton name="file-code" size={16} />,
    })) ?? [];

  const handleNavigation = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              开始创建
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconButton name="robot" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                快速创建
              </Text>
            </View>
            <ButtonGroup
              buttons={buttonsInfo}
              onButtonPress={handleNavigation}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconButton name="file-code" size={20} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                从模板创建
              </Text>
            </View>
            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              使用精心设计的模板，快速开始你的项目
            </Text>
            <ButtonGroup
              buttons={templateButtons}
              onButtonPress={handleNavigation}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconButton name="people" size={20} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                我的机器人
              </Text>
            </View>
            {/* {userId && <Cybots queryUserId={userId} limit={48} />} */}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconButton name="search" size={20} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                探索社区
              </Text>
            </View>
            {/* <Cybots queryUserId={nolotusId} limit={12} /> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  button: {
    borderRadius: 8,
    overflow: "hidden",
  },
  groupButton: {
    width: (width - 48) / 2,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
  },
});

export default ChatGuide;
