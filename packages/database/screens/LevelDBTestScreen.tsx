import React, { useState } from "react";
import { LevelDB } from "react-native-leveldb";
import { encode } from "js-base64";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { Button } from 'rn/ui/Button';

// 设置常量
const BASE_RECORDS_PER_USER = 5; // 大多数用户很少使用，只有少量记录
const NEW_USER_COUNT = 100; // 初创期用户基数不会太大
const NEW_TARGET_AVG_RECORDS = 200; // 但活跃用户会产生较多数据
const NEW_DATA_TYPES = [
    { type: "a", weight: 50 }, // 最常用的操作，比如查看
    { type: "b", weight: 30 }, // 较常用的操作，比如点赞
    { type: "c", weight: 15 }, // 较少的操作，比如评论
    { type: "d", weight: 5 }, // 最少的操作，比如分享
];

// 计算用户分布
const majorityUserCount = Math.floor(NEW_USER_COUNT * 0.95);
const majorityRecords = BASE_RECORDS_PER_USER * majorityUserCount;
const totalRecordsNeeded = NEW_TARGET_AVG_RECORDS * NEW_USER_COUNT;
const remainingRecords = totalRecordsNeeded - majorityRecords;
const busyUserCount = NEW_USER_COUNT - majorityUserCount;
const BUSY_USER_RECORDS = Math.ceil(remainingRecords / busyUserCount);

export function LevelDBTestScreen() {
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentOperation, setCurrentOperation] = useState("");

    // 生成测试数据
    const generateTestData = () => {
        return Array.from({ length: NEW_USER_COUNT }, (_, userIndex) => {
            const userId = `user_${userIndex}`;
            const recordsPerUser = userIndex < majorityUserCount
                ? BASE_RECORDS_PER_USER
                : BUSY_USER_RECORDS;

            return Array.from({ length: recordsPerUser }, () => {
                const random = Math.random() * 100;
                let selectedType = NEW_DATA_TYPES[0].type;
                let accumWeight = 0;

                for (const typeObj of NEW_DATA_TYPES) {
                    accumWeight += typeObj.weight;
                    if (random <= accumWeight) {
                        selectedType = typeObj.type;
                        break;
                    }
                }

                return {
                    userId,
                    type: selectedType,
                    name: "Jane Smith",
                    age: 25,
                    email: "jane@example.com",
                    description: "这是一个测试数据项",
                    address: "1234 测试街道",
                    phone: "123-456-7890",
                };
            });
        }).flat();
    };

    const addTestResult = (description, duration, recordCount) => {
        setTestResults(prev => [...prev, {
            description,
            duration,
            recordCount
        }]);
    };

    const testUserQueries = async (leveldb, userId, userType) => {
        setCurrentOperation(`测试${userType}查询性能...`);
        const iterator = leveldb.newIterator();

        // 测试前缀查询
        const prefixStart = Date.now();
        let count = 0;
        try {
            iterator.seek(userId);
            while (iterator.valid() && iterator.keyStr().startsWith(userId)) {
                count++;
                iterator.next();
            }
        } finally {
            iterator.close();
        }
        const prefixDuration = Date.now() - prefixStart;
        addTestResult(`${userType}前缀查询`, prefixDuration, count);
    };

    const runTests = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setTestResults([]);

        let leveldb = null;
        try {
            setCurrentOperation("初始化数据库...");
            leveldb = new LevelDB("test.db", true, false);
            const testData = generateTestData();

            // 插入数据
            setCurrentOperation(`准备插入数据: ${testData.length} 条`);
            const userTypeCounters = {};
            const writeStart = Date.now();

            for (const record of testData) {
                const { userId, type, ...data } = record;
                if (!userTypeCounters[userId]) {
                    userTypeCounters[userId] = {};
                }
                if (!userTypeCounters[userId][type]) {
                    userTypeCounters[userId][type] = 0;
                }
                const typeCounter = userTypeCounters[userId][type]++;

                const key = `${userId}_${type}_${typeCounter}`;
                leveldb.put(key, encode(JSON.stringify({ ...data, type })));
            }

            const writeDuration = Date.now() - writeStart;
            addTestResult("数据写入", writeDuration, testData.length);

            // 选择测试用户
            const normalUserId = `user_${Math.floor(Math.random() * majorityUserCount)}`;
            const busyUserId = `user_${majorityUserCount + Math.floor(Math.random() * busyUserCount)}`;

            // 执行查询测试
            await testUserQueries(leveldb, normalUserId, "普通用户");
            await testUserQueries(leveldb, busyUserId, "活跃用户");

            Alert.alert("测试完成", "所有性能测试已完成！");
        } catch (error) {
            console.error("测试过程中出现错误:", error);
            Alert.alert("错误", "测试过程中出现错误，请查看控制台日志");
        } finally {
            if (leveldb) {
                leveldb.close();
            }
            setIsRunning(false);
            setCurrentOperation("");
        }
    };

    const renderTestResults = () => {
        if (testResults.length === 0) return null;

        return (
            <View style={styles.metricsContainer}>
                <Text style={styles.metricsTitle}>测试结果</Text>
                {testResults.map((result, index) => (
                    <View key={index} style={styles.metricCard}>
                        <Text style={styles.metricHeader}>{result.description}</Text>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>处理记录数:</Text>
                            <Text style={styles.metricValue}>{result.recordCount}</Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>耗时:</Text>
                            <Text style={styles.metricValue}>{result.duration.toFixed(2)}ms</Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>速率:</Text>
                            <Text style={styles.metricValue}>
                                {(result.recordCount / (result.duration / 1000)).toFixed(2)} ops/s
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>LevelDB 性能测试</Text>
                    <Text style={styles.headerSubtitle}>
                        总用户数: {NEW_USER_COUNT} (普通: {majorityUserCount}, 活跃: {busyUserCount})
                    </Text>
                </View>

                <Button
                    onPress={runTests}
                    disabled={isRunning}
                    title={isRunning ? "测试运行中..." : "开始性能测试"}
                />

                {isRunning && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>{currentOperation}</Text>
                    </View>
                )}

                {renderTestResults()}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    loadingContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#4B5563',
        fontSize: 14,
    },
    metricsContainer: {
        marginTop: 24,
    },
    metricsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    metricCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    metricHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    metricLabel: {
        flex: 2,
        fontSize: 14,
        color: '#6B7280',
    },
    metricValue: {
        flex: 2,
        fontSize: 14,
        color: '#1F2937',
        textAlign: 'right',
    },
});
