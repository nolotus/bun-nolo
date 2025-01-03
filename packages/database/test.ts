import { Level } from "level";
import { encode } from "js-base64";

// 初始化 Level 数据库
const levelDb = new Level("../../nolodata/testdb");

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

// 生成测试数据
const HUGE_TEST_DATA = Array.from(
  { length: NEW_USER_COUNT },
  (_, userIndex) => {
    const userId = `user_${userIndex}`;
    const recordsPerUser =
      userIndex < majorityUserCount ? BASE_RECORDS_PER_USER : BUSY_USER_RECORDS;

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
  }
).flat();

// 准备数据库并插入数据
async function prepareDatabase(db) {
  await db.open();
  try {
    console.log(`准备插入数据: ${HUGE_TEST_DATA.length} 条`);
    const userTypeCounters = {};

    await db.batch(
      HUGE_TEST_DATA.map(({ userId, type, ...data }) => {
        if (!userTypeCounters[userId]) {
          userTypeCounters[userId] = {};
        }
        if (!userTypeCounters[userId][type]) {
          userTypeCounters[userId][type] = 0;
        }
        const typeCounter = userTypeCounters[userId][type]++;

        return {
          type: "put",
          key: `${userId}_${type}_${typeCounter}`,
          value: encode(JSON.stringify({ ...data, type })),
        };
      })
    );

    console.log("数据已插入数据库。");
  } catch (error) {
    console.error("插入数据时出错:", error);
  } finally {
    await db.close();
  }
}

// 前缀查询用户所有数据
async function queryAllDataByPrefix(db, userId) {
  await db.open();
  console.log(`\n使用 Prefix 范围查询用户 ${userId} 的所有数据...`);
  const start = process.hrtime.bigint();

  const keys = [];
  const prefix = `${userId}_`;
  for await (const [key] of db.iterator({
    gte: prefix,
    lte: `${prefix}\xFF`,
  })) {
    keys.push(key);
  }

  const duration = Number(process.hrtime.bigint() - start) / 1000000;
  console.log(`找到 ${keys.length} 条记录，耗时: ${duration.toFixed(3)} 毫秒`);

  await db.close();
  return keys;
}

// 前缀查询用户特定类型的数据
async function queryTypeDataByPrefix(db, userId, dataType) {
  await db.open();
  const start = process.hrtime.bigint();

  const keys = [];
  const prefix = `${userId}_${dataType}_`;
  for await (const [key] of db.iterator({
    gte: prefix,
    lte: `${prefix}\xFF`,
  })) {
    keys.push(key);
  }

  const duration = Number(process.hrtime.bigint() - start) / 1000000;
  console.log(
    `Prefix - 类型 ${dataType}: ${keys.length} 条记录，耗时: ${duration.toFixed(3)} 毫秒`
  );

  await db.close();
  return keys;
}

// 使用 startsWith 方法查询用户所有数据
async function queryAllDataByStartsWith(db, userId) {
  await db.open();
  console.log(`\n使用 startsWith 查询用户 ${userId} 的所有数据...`);
  const start = process.hrtime.bigint();

  const keys = [];
  const prefix = `${userId}_`;
  for await (const [key] of db.iterator()) {
    if (key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  const duration = Number(process.hrtime.bigint() - start) / 1000000;
  console.log(`找到 ${keys.length} 条记录，耗时: ${duration.toFixed(3)} 毫秒`);

  await db.close();
  return keys;
}

// 使用 startsWith 方法查询用户特定类型的数据
async function queryTypeDataByStartsWith(db, userId, dataType) {
  await db.open();
  const start = process.hrtime.bigint();

  const keys = [];
  const prefix = `${userId}_${dataType}_`;
  for await (const [key] of db.iterator()) {
    if (key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  const duration = Number(process.hrtime.bigint() - start) / 1000000;
  console.log(
    `startsWith - 类型 ${dataType}: ${keys.length} 条记录，耗时: ${duration.toFixed(3)} 毫秒`
  );

  await db.close();
  return keys;
}

// 执行数据库测试
async function performTest() {
  try {
    console.log("\n--- 测试数据信息 ---");
    console.log(`总用户数: ${NEW_USER_COUNT}`);
    console.log(`普通用户(95%): ${majorityUserCount}`);
    console.log(`活跃用户(5%): ${busyUserCount}`);
    console.log(`普通用户记录数: ${BASE_RECORDS_PER_USER}`);
    console.log(`活跃用户记录数: ${BUSY_USER_RECORDS}`);
    console.log(`总记录数: ${HUGE_TEST_DATA.length}`);

    await prepareDatabase(levelDb);

    // 测试普通用户
    const normalUserId = `user_${Math.floor(Math.random() * majorityUserCount)}`;
    // 测试活跃用户
    const busyUserId = `user_${majorityUserCount + Math.floor(Math.random() * busyUserCount)}`;

    console.log("\n=== 普通用户查询测试 ===");
    console.log("\n--- 使用 Prefix 范围查询 ---");
    const normalUserKeys = await queryAllDataByPrefix(levelDb, normalUserId);
    for (const typeObj of NEW_DATA_TYPES) {
      await queryTypeDataByPrefix(levelDb, normalUserId, typeObj.type);
    }

    console.log("\n--- 使用 startsWith 遍历查询 ---");
    const normalUserKeysStartsWith = await queryAllDataByStartsWith(
      levelDb,
      normalUserId
    );
    for (const typeObj of NEW_DATA_TYPES) {
      await queryTypeDataByStartsWith(levelDb, normalUserId, typeObj.type);
    }

    console.log("\n=== 活跃用户查询测试 ===");
    console.log("\n--- 使用 Prefix 范围查询 ---");
    const busyUserKeys = await queryAllDataByPrefix(levelDb, busyUserId);
    for (const typeObj of NEW_DATA_TYPES) {
      await queryTypeDataByPrefix(levelDb, busyUserId, typeObj.type);
    }

    console.log("\n--- 使用 startsWith 遍历查询 ---");
    const busyUserKeysStartsWith = await queryAllDataByStartsWith(
      levelDb,
      busyUserId
    );
    for (const typeObj of NEW_DATA_TYPES) {
      await queryTypeDataByStartsWith(levelDb, busyUserId, typeObj.type);
    }
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  } finally {
    await levelDb.close();
  }
}

// 启动测试
performTest();
