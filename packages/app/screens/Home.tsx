import React, { useState } from "react";
import { LevelDB } from "react-native-leveldb";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";


export function HomeScreen() {
  const navigation = useNavigation();
  const [testResults, setTestResults] = useState({
    write: null,
    read: null,
    delete: null,
  });
  const TEST_COUNT = 100000;

  interface User {
    id: number;
    name: string;
    age: number;
    city: string;
    score: number;
  }

  const runTests = async () => {
    try {
      const leveldb = new LevelDB("test.db", true, false);

      // === 基础 String 性能测试 ===
      console.log("=== Basic String Tests ===");
      const writeStart = Date.now();
      for (let i = 0; i < TEST_COUNT; i++) {
        leveldb.put(`key${i}`, `value${i}`);
      }
      const writeTime = Date.now() - writeStart;
      console.log(`Write time: ${writeTime}ms`);

      const readStart = Date.now();
      for (let i = 0; i < TEST_COUNT; i++) {
        leveldb.getStr(`key${i}`);
      }
      const readTime = Date.now() - readStart;
      console.log(`Read time: ${readTime}ms`);

      // === JSON查询测试 ===
      console.log("\n=== JSON Query Tests ===");

      // 写入一些测试数据
      const users: User[] = [
        { id: 1, name: "Alice", age: 20, city: "Beijing", score: 85 },
        { id: 2, name: "Bob", age: 25, city: "Shanghai", score: 90 },
        { id: 3, name: "Charlie", age: 30, city: "Beijing", score: 95 },
        { id: 4, name: "David", age: 22, city: "Shanghai", score: 88 }
      ];

      // 写入用户数据
      users.forEach(user => {
        leveldb.put(`user:${user.id}`, JSON.stringify(user));
      });

      // 使用Iterator查询示例 - 查找所有北京的用户
      const iterator = leveldb.newIterator();
      iterator.seekToFirst();

      const beijingUsers: User[] = [];

      while (iterator.valid()) {
        const key = iterator.keyStr();
        if (key.startsWith('user:')) {
          const value = iterator.valueStr();
          const user = JSON.parse(value);
          if (user.city === 'Beijing') {
            beijingUsers.push(user);
          }
        }
        iterator.next();
      }

      console.log('Beijing users:', beijingUsers);
      iterator.close();

      // 清理测试数据
      users.forEach(user => {
        leveldb.delete(`user:${user.id}`);
      });

      // 基础String清理
      const deleteStart = Date.now();
      for (let i = 0; i < TEST_COUNT; i++) {
        leveldb.delete(`key${i}`);
      }
      const deleteTime = Date.now() - deleteStart;
      console.log(`Delete time: ${deleteTime}ms`);

      leveldb.close();

      setTestResults({
        write: writeTime,
        read: readTime,
        delete: deleteTime,
      });

    } catch (error) {
      console.error(error);
    }
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={runTests}>
          <Text style={styles.buttonText}>运行 LevelDB 性能测试</Text>
        </TouchableOpacity>

        {testResults.write !== null && (
          <View style={styles.results}>
            <Text>写入 {TEST_COUNT} 条记录耗时: {testResults.write}ms</Text>
            <Text>读取 {TEST_COUNT} 条记录耗时: {testResults.read}ms</Text>
            <Text>删除 {TEST_COUNT} 条记录耗时: {testResults.delete}ms</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>nolotus.com 的移动端测试版!</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Text style={styles.linkText}>浪点功能</Text>
          <Text style={styles.textDescription}> 待优化：数据展示</Text>
          <Text style={styles.textDescription}> 待优化：涨落潮数据</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步增加</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Text style={styles.linkText}>AI对话功能</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>
          无需登录注册也可以使用，你的数据留在手机本地。
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("User")}>
          <Text style={styles.linkText}>
            如果你需要同步你的数据，请注册或登录使用。
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步功能</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Create")}>
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
  },
  section: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  textDescription: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 6,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    textAlign: "center",
    marginVertical: 6,
  }
});
