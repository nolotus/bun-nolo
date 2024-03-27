import { parseWeatherParams, fetchWeatherData } from "integrations/weather";

// 任务 1 - 查询收藏的人最多前十的浪点
const TOP_COLLECTORS_QUERY_INTERVAL = "0 0 * * *"; // 每天凌晨 0 点执行一次
const queryTopTenCollectors = async () => {
  // 这里是伪代码，实际需要根据您的数据库和查询语句进行修改
  const collectors = [
    { id: 1, lat: 39.9, lng: 116.4, collectCount: 100 },
    { id: 2, lat: 39.8, lng: 116.3, collectCount: 90 },
    // ...
  ];
  return collectors;
};

const sendRequestsToTopTenCollectors = async (collectors) => {
  // 这里是伪代码，实际需要根据您的需求进行修改
  for (const collector of collectors) {
    const weatherParams = parseWeatherParams({
      lat: collector.lat,
      lng: collector.lng,
    });
    await fetchWeatherData(weatherParams);
  }
};

export const runTopCollectorsTask = () => {
  const collectors = queryTopTenCollectors();
  sendRequestsToTopTenCollectors(collectors);
  console.log("Sent requests to top ten collectors");
};
// 任务 2 - 其他任务
const OTHER_TASK_INTERVAL = "*/5 * * * *"; // 每隔 5 分钟执行一次
const runOtherTask = async () => {
  // 这里是伪代码，实际需要根据您的需求进行修改
  await fetchWeatherData("/api/v1/other-task", {});
  console.log("Executed other task");
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
