import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { queryData } from "database/query/queryHandler";
import { parseWeatherParams, fetchWeatherData } from "integrations/weather";
import { ulid } from "ulid";

// 任务 1 - 查询收藏的人最多前十的浪点
// const TOP_COLLECTORS_QUERY_INTERVAL = "0 0 * * *"; // 每天凌晨 0 点执行一次
const TOP_COLLECTORS_QUERY_INTERVAL = "* * * * * *";

const queryTopTenCollectors = async () => {
  const result = await queryData({
    userId: nolotusId,
    isJSON: true,
    condition: {
      type: DataType.SurfSpot,
    },
  });
  const collectors = result.map((item) => {
    return { lat: item.lat, lng: item.lng };
  });
  return collectors;
};

// 单独的处理天气数据的函数
const processWeatherData = async (weatherData, collector) => {
  weatherData.hours.forEach(async (hour) => {
    const specificTime = new Date(hour.time).getTime();
    const ulidForSpecificTime = ulid(specificTime);
    const customKey = ulidForSpecificTime;
    const id = customKey;
    // 在这里添加 lat 和 lng 到 hour 数据中
    const augmentedHour = {
      ...hour,
      lat: collector.lat, // 获取当前 collector 的 lat
      lng: collector.lng, // 获取当前 collector 的 lng
      created_at: Date.now(),
      type: DataType.SurfInfo,
    };
    const tableName = "surf_info";
    // await serverCreateTable(nolotusId, "surf_info");
    // await serverWriteDataInTable(nolotusId, tableName, hour.time, augmentedHour);
  });
};

const sendRequestsToTopTenCollectors = async (
  collectors,
  shouldFetchAll = false
) => {
  let promises = [];

  if (shouldFetchAll || collectors.length === 0) {
    // 请求全部数据或者处理空收集器数组的情况
    promises = collectors.map((collector) => {
      const weatherParams = parseWeatherParams({
        lat: collector.lat,
        lng: collector.lng,
      });
      return fetchWeatherData(weatherParams).then((weatherData) => ({
        weatherData,
        collector,
      }));
    });
  } else {
    // 仅请求第一个
    const collector = collectors[0];
    const weatherParams = parseWeatherParams({
      lat: collector.lat,
      lng: collector.lng,
    });
    promises = [
      fetchWeatherData(weatherParams).then((weatherData) => ({
        weatherData,
        collector,
      })),
    ];
  }

  const results = await Promise.allSettled(promises);

  // 统一处理天气数据，无论是请求单个还是全部
  const processedResults = results.map((result) => {
    if (result.status === "fulfilled") {
      try {
        const { weatherData, collector } = result.value;
        processWeatherData(weatherData, collector); // 处理天气数据
        return { success: true, data: weatherData }; // 可以选择返回处理后的数据或不返回
      } catch (error) {
        return { success: false, error: error.toString() };
      }
    } else {
      return { success: false, error: result.reason };
    }
  });

  return processedResults;
};

export const runTopCollectorsTask = async () => {
  const collectors = await queryTopTenCollectors();
  sendRequestsToTopTenCollectors(collectors);
};
// 任务 2 - 其他任务
const OTHER_TASK_INTERVAL = "*/30 * * * * *"; // 每隔 5 分钟执行一次
const runOtherTask = async () => {
  // 这里是伪代码，实际需要根据您的需求进行修改
};

export const tasks = [
  {
    name: "top collectors",
    interval: TOP_COLLECTORS_QUERY_INTERVAL,
    task: runTopCollectorsTask,
  },
  // {
  //   name: "other task",
  //   interval: OTHER_TASK_INTERVAL,
  //   task: runOtherTask,
  // },
];
// runTopCollectorsTask();
