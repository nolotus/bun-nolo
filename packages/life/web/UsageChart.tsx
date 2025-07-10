// file: src/features/usage/UsageChart.tsx
import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { formatInTimeZone } from "date-fns-tz";
import { getTokenStats } from "ai/token/query";
import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import { selectTheme } from "app/settings/settingSlice";
import { TimeRange, processDateRange } from "utils/processDateRange";
import { ClockIcon, GraphIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "render/web/ui/Dropdown";
import Tabs from "render/web/ui/Tabs";

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type DataType = "tokens" | "cost";

const UsageChart: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectUserId);
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [dataType, setDataType] = useState<DataType>("tokens");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const timeRangeOptions = [
    { label: t("last_7_days", "近 7 天"), value: "7days" },
    { label: t("last_30_days", "近 30 天"), value: "30days" },
    { label: t("last_90_days", "近 90 天"), value: "90days" },
  ];

  const dataTypeOptions = [
    { id: "tokens", label: "Tokens", icon: <GraphIcon size={14} /> },
    { id: "cost", label: t("cost", "成本"), icon: "¥" },
  ];

  const selectedTimeRange = timeRangeOptions.find(
    (option) => option.value === timeRange
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { dateArray } = processDateRange(timeRange, userTimeZone);
        const startDate = dateArray[0].utc;
        const endDate = dateArray[dateArray.length - 1].utc;
        const stats = await getTokenStats({ userId, startDate, endDate });
        setStatsData(stats);
      } catch (err) {
        // 移除日志记录
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchStats();
  }, [userId, timeRange]);

  const getChartData = () => {
    const { dateArray } = processDateRange(timeRange, userTimeZone);
    const series = {
      dates: dateArray.map((d) => d.short),
      total: new Array(dateArray.length).fill(0),
      models: {} as Record<string, number[]>,
    };

    statsData.forEach((stat) => {
      const localDate = formatInTimeZone(
        new Date(stat.timeKey),
        userTimeZone,
        "yyyy-MM-dd"
      );
      const dateIndex = dateArray.findIndex((d) => d.full === localDate);
      if (dateIndex === -1) return;

      series.total[dateIndex] =
        dataType === "tokens"
          ? (stat.total?.tokens?.input || 0) + (stat.total?.tokens?.output || 0)
          : stat.total?.cost || 0;
      Object.entries(stat.models || {}).forEach(
        ([model, data]: [string, any]) => {
          if (!series.models[model])
            series.models[model] = new Array(dateArray.length).fill(0);
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
        backgroundColor: "var(--backgroundGhost)",
        borderColor: "var(--border)",
        textStyle: { color: "var(--text)", fontSize: 12 },
        padding: [8, 12],
        formatter: (params: any) => {
          const date = processDateRange(timeRange, userTimeZone).dateArray[
            params[0].dataIndex
          ].full;
          let result = `<div style="font-weight: 600; margin-bottom: 4px;">${date}</div>`;
          params.forEach((param: any) => {
            const value =
              dataType === "cost"
                ? `¥${param.value.toFixed(4)}`
                : param.value.toLocaleString();
            result += `<div style="margin: 2px 0;"><span style="display: inline-block; width: 8px; height: 8px; background: ${param.color}; border-radius: 50%; margin-right: 6px;"></span>${param.seriesName}: <strong>${value}</strong></div>`;
          });
          return result;
        },
      },
      legend: {
        data: [t("total", "总量"), ...modelNames],
        textStyle: { color: "var(--textSecondary)", fontSize: 12 },
        top: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "8%",
        top: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.dates,
        axisLine: { lineStyle: { color: "var(--borderLight)" } },
        axisLabel: { color: "var(--textTertiary)", fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        name: dataType === "tokens" ? "Tokens" : `${t("cost", "成本")} (¥)`,
        nameTextStyle: { color: "var(--textTertiary)", fontSize: 11 },
        axisLabel: {
          color: "var(--textTertiary)",
          fontSize: 11,
          formatter:
            dataType === "cost"
              ? (value: number) => `¥${value.toFixed(4)}`
              : (value: number) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : value.toString(),
        },
        splitLine: {
          lineStyle: { color: "var(--borderLight)", type: "dashed" },
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: t("total", "总量"),
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: data.total,
          itemStyle: { color: "var(--primary)" },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: "linear",
              colorStops: [
                { offset: 0, color: "var(--primaryGhost)" },
                { offset: 1, color: "rgba(var(--primary), 0)" },
              ],
            },
          },
        },
        ...modelNames.map((model) => ({
          name: model,
          type: "bar",
          stack: "models",
          data: data.models[model],
        })),
      ],
      animationEasing: "cubicInOut",
      animationDuration: 1000,
    };
  };

  return (
    <>
      <style>{`@keyframes pulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }`}</style>
      <div
        style={{
          background: "var(--background)",
          borderRadius: "16px",
          border: `1px solid var(--borderLight)`,
          overflow: "hidden",
          boxShadow: `0 2px 8px var(--shadowLight)`,
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: "var(--backgroundSecondary)",
            borderBottom: `1px solid var(--borderLight)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ClockIcon size={20} color="var(--text)" />
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {t("usage_stats", "使用量统计")}
              </h2>
            </div>
            {loading && (
              <div
                style={{ display: "flex", gap: "3px", alignItems: "center" }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      animation: `pulse 1.4s infinite ${delay}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              style={{
                fontSize: "12px",
                color: "var(--textTertiary)",
                opacity: 0.8,
              }}
            >
              {userTimeZone}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: "120px" }}>
              <Dropdown
                items={timeRangeOptions}
                selectedItem={selectedTimeRange}
                onChange={(item) => setTimeRange(item.value as TimeRange)}
                placeholder={t("select_time_range", "选择时间范围")}
                size="small"
                variant="default"
              />
            </div>
            <Tabs
              items={dataTypeOptions}
              activeTab={dataType}
              onTabChange={(id) => setDataType(id as DataType)}
              size="small"
            />
          </div>
        </div>
        <div style={{ padding: "20px 24px", background: "var(--background)" }}>
          <ReactECharts
            option={getChartOption()}
            style={{ height: "420px" }}
            opts={{ renderer: "svg" }}
            showLoading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default UsageChart;
