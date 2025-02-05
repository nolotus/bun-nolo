import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../hooks";
import { useAuth } from "auth/hooks/useAuth";
import Octicons from "react-native-vector-icons/Octicons";
import { selectTheme } from "app/theme/themeSlice";
import { CreateRoutePaths } from "create/routePaths";
import { useMemo } from "react";

const IconButton = ({ name, size = 24, color }) => {
  return <Octicons name={name} size={size} color={color} />;
};

export function HomeScreen() {
  const { user, isLoggedIn } = useAuth();
  const auth = useAppSelector((state) => state.auth);
  const theme = useAppSelector(selectTheme);
  const navigation = useNavigation();

  const actionButtons = useMemo(
    () => [
      {
        text: "Cybot",
        route: CreateRoutePaths.CREATE_CYBOT,
        icon: "gear",
        description: "创建智能对话机器人",
      },
      {
        text: "空白页面",
        icon: "file",
        description: "从空白页面开始创作",
      },
    ],
    []
  );

  const communityCybots = [
    { id: 1, name: "Community Cybot 1", description: "这是社区Cybot 1的描述" },
    { id: 2, name: "Community Cybot 2", description: "这是社区Cybot 2的描述" },
  ];

  const myCybots = [
    { id: 1, name: "My Cybot 1", description: "这是我的Cybot 1的描述" },
    { id: 2, name: "My Cybot 2", description: "这是我的Cybot 2的描述" },
  ];

  const handleCybotPress = (cybotId) => {
    navigation.navigate("Chat", { cybotId });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.quickActions}>
          {actionButtons.map((button) => (
            <TouchableOpacity
              key={button.text}
              onPress={() => button.route && navigation.navigate(button.route)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  shadowColor: theme.shadowLight,
                },
              ]}
              activeOpacity={0.7}
            >
              <IconButton name={button.icon} color={theme.primary} />
              <View style={styles.buttonTextContainer}>
                <Text style={[styles.buttonTitle, { color: theme.text }]}>
                  {button.text}
                </Text>
                <Text
                  style={[
                    styles.buttonDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {button.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.textDescription, { color: theme.textSecondary }]}
          >
            无需登录注册也可以使用，你的数据留在手机本地。
          </Text>
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                backgroundColor: theme.backgroundSecondary,
                shadowColor: theme.shadowLight,
              },
            ]}
            onPress={() => navigation.navigate("User")}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>
              如果你需要同步你的数据，请注册或登录使用。
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconButton name="search" color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              探索社区
            </Text>
          </View>
          {communityCybots.map((cybot) => (
            <TouchableOpacity
              key={cybot.id}
              style={[
                styles.cybotButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  shadowColor: theme.shadowLight,
                },
              ]}
              onPress={() => handleCybotPress(cybot.id)}
            >
              <Text style={[styles.cybotName, { color: theme.primary }]}>
                {cybot.name}
              </Text>
              <Text
                style={[
                  styles.cybotDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {cybot.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconButton name="people" color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              我的机器人
            </Text>
          </View>
          {myCybots.map((cybot) => (
            <TouchableOpacity
              key={cybot.id}
              style={[
                styles.cybotButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  shadowColor: theme.shadowLight,
                },
              ]}
              onPress={() => handleCybotPress(cybot.id)}
            >
              <Text style={[styles.cybotName, { color: theme.primary }]}>
                {cybot.name}
              </Text>
              <Text
                style={[
                  styles.cybotDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {cybot.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  navButton: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  textDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginVertical: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
  },
  cybotButton: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cybotName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  cybotDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
