// UsageChart.tsx
import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { formatInTimeZone } from "date-fns-tz";

import { pino } from "pino";
import { getTokenStats } from "ai/token/query";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { TimeRange, processDateRange } from "utils/processDateRange";
const logger = pino({ name: "usage-chart" });

// 获取用户时区
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type DataType = "tokens" | "cost";

const UsageChart: React.FC<any> = ({ theme }) => {
  const userId = useAppSelector(selectCurrentUserId);
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [dataType, setDataType] = useState<DataType>("tokens");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { dateArray } = processDateRange(timeRange, userTimeZone);
        const startDate = dateArray[0].utc;
        const endDate = dateArray[dateArray.length - 1].utc;

        logger.info(
          {
            startDate,
            endDate,
            timeZone: userTimeZone,
          },
          "Fetching stats"
        );

        const stats = await getTokenStats({
          userId,
          startDate,
          endDate,
        });

        setStatsData(stats);
      } catch (err) {
        logger.error({ err }, "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, timeRange]);

  const getChartData = () => {
    const { dateArray } = processDateRange(timeRange, userTimeZone);

    // 初始化数据结构
    const series = {
      dates: dateArray.map((d) => d.short),
      total: new Array(dateArray.length).fill(0),
      models: {} as Record<string, number[]>,
    };

    // 处理统计数据
    statsData.forEach((stat) => {
      // 将UTC时间转换为用户时区时间进行匹配
      const localDate = formatInTimeZone(
        new Date(stat.timeKey),
        userTimeZone,
        "yyyy-MM-dd"
      );
      const dateIndex = dateArray.findIndex((d) => d.full === localDate);
      if (dateIndex === -1) return;

      // 更新总量
      series.total[dateIndex] =
        dataType === "tokens"
          ? (stat.total?.tokens?.input || 0) + (stat.total?.tokens?.output || 0)
          : stat.total?.cost || 0;

      // 更新各模型数据
      Object.entries(stat.models || {}).forEach(
        ([model, data]: [string, any]) => {
          if (!series.models[model]) {
            series.models[model] = new Array(dateArray.length).fill(0);
          }
          series.models[model][dateIndex] =
            dataType === "tokens"
              ? (data.tokens?.input || 0) + (data.tokens?.output || 0)
              : data.cost || 0;
        }
      );
    });

    return series;
  };

  const getChartOption = () => {
    const data = getChartData();
    const modelNames = Object.keys(data.models);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        formatter: (params: any) => {
          const date = processDateRange(timeRange, userTimeZone).dateArray[
            params[0].dataIndex
          ].full;
          let result = `${date}<br/>`;
          params.forEach((param: any) => {
            const value =
              dataType === "cost" ? param.value.toFixed(4) : param.value;
            result += `${param.seriesName}: ${value}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ["总量", ...modelNames],
        textStyle: { color: theme?.text },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.dates,
        axisLine: { lineStyle: { color: theme?.border } },
        axisLabel: { color: theme?.textSecondary },
      },
      yAxis: {
        type: "value",
        name: dataType === "tokens" ? "Tokens" : "Cost ($)",
        axisLabel: {
          color: theme?.textSecondary,
          formatter:
            dataType === "cost"
              ? (value: number) => value.toFixed(4)
              : undefined,
        },
        splitLine: { lineStyle: { color: theme?.borderLight } },
      },
      series: [
        {
          name: "总量",
          type: "line",
          smooth: true,
          data: data.total,
          itemStyle: { color: theme?.primary },
        },
        ...modelNames.map((model) => ({
          name: model,
          type: "bar",
          stack: "models",
          data: data.models[model],
          emphasis: { focus: "series" },
        })),
      ],
    };
  };

  return (
    <div
      style={{
        background: theme?.background,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: `0 2px 8px ${theme?.shadowLight}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>
          使用量统计 {loading && "(加载中...)"}
          <span style={{ fontSize: "0.8em", color: "#666" }}>
            ({userTimeZone})
          </span>
        </h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            style={{ padding: "8px" }}
          >
            <option value="7days">近7天</option>
            <option value="30days">近30天</option>
            <option value="90days">近90天</option>
          </select>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as DataType)}
            style={{ padding: "8px" }}
          >
            <option value="tokens">Tokens</option>
            <option value="cost">Cost</option>
          </select>
        </div>
      </div>

      <ReactECharts
        option={getChartOption()}
        style={{ height: "400px" }}
        opts={{ renderer: "svg" }}
        showLoading={loading}
      />
    </div>
  );
};

export default UsageChart;
