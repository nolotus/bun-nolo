// screens/HomeScreen.js

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { rnHashpasswordV1 } from 'rn/hashPassword'

rnHashpasswordV1('password')

// Generate a hash asynchronously
export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("LevelDBTest")}
        >
          <Text style={styles.linkText}>LevelDB 性能测试</Text>
          <Text style={styles.textDescription}>测试数据库读写性能</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Location")}
        >
          <Text style={styles.linkText}>浪点功能</Text>
          <Text style={styles.textDescription}>待优化：数据展示</Text>
          <Text style={styles.textDescription}>待优化：涨落潮数据</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步增加</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Chat")}
        >
          <Text style={styles.linkText}>AI对话功能</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>
          无需登录注册也可以使用，你的数据留在手机本地。
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("User")}
        >
          <Text style={styles.linkText}>
            如果你需要同步你的数据，请注册或登录使用。
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步功能</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Create")}
        >
          <Text style={styles.linkText}>创建笔记</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  navButton: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 4,
  },
});
