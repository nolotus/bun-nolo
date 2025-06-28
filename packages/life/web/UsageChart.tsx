// UsageChart.tsx
import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { formatInTimeZone } from "date-fns-tz";
import { pino } from "pino";
import { getTokenStats } from "ai/token/query";
import { useAppSelector } from "app/hooks";
import { selectUserId } from "auth/authSlice";
import { selectTheme } from "app/theme/themeSlice";
import { TimeRange, processDateRange } from "utils/processDateRange";
import { ClockIcon, GraphIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "render/web/ui/Dropdown";

const logger = pino({ name: "usage-chart" });
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

  // 时间范围选项
  const timeRangeOptions = [
    { label: t("last_7_days", "近 7 天"), value: "7days" },
    { label: t("last_30_days", "近 30 天"), value: "30days" },
    { label: t("last_90_days", "近 90 天"), value: "90days" },
  ];

  // 当前选中的时间范围项
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
        logger.error({ err }, "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
        backgroundColor: theme.backgroundGhost,
        borderColor: theme.border,
        textStyle: { color: theme.text, fontSize: 12 },
        padding: [8, 12],
        formatter: (params: any) => {
          const date = processDateRange(timeRange, userTimeZone).dateArray[
            params[0].dataIndex
          ].full;
          let result = `<div style="font-weight: 600; margin-bottom: 4px;">${date}</div>`;
          params.forEach((param: any) => {
            const value =
              dataType === "cost" ? `¥${param.value.toFixed(4)}` : param.value;
            result += `<div style="margin: 2px 0;">
              <span style="display: inline-block; width: 8px; height: 8px; background: ${param.color}; border-radius: 50%; margin-right: 6px;"></span>
              ${param.seriesName}: ${value}
            </div>`;
          });
          return result;
        },
      },
      legend: {
        data: [t("total", "总量"), ...modelNames],
        textStyle: { color: theme.textSecondary, fontSize: 12 },
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
        axisLine: { lineStyle: { color: theme.borderLight } },
        axisLabel: { color: theme.textTertiary, fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        name: dataType === "tokens" ? "Tokens" : t("cost", "成本") + " (¥)",
        nameTextStyle: { color: theme.textTertiary, fontSize: 11 },
        axisLabel: {
          color: theme.textTertiary,
          fontSize: 11,
          formatter:
            dataType === "cost"
              ? (value: number) => `¥${value.toFixed(4)}`
              : (value: number) =>
                  value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : value.toString(),
        },
        splitLine: { lineStyle: { color: theme.borderLight, type: "dashed" } },
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
          itemStyle: { color: theme.primary },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: "linear",
              colorStops: [
                { offset: 0, color: theme.primaryLight + "40" },
                { offset: 1, color: theme.primaryLight + "10" },
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
    };
  };

  return (
    <>
      <style>
        {`@keyframes pulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }`}
      </style>

      <div
        style={{
          background: theme.background,
          borderRadius: "16px",
          border: `1px solid ${theme.borderLight}`,
          overflow: "hidden",
          boxShadow: `0 2px 8px ${theme.shadowLight}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background: `linear-gradient(135deg, ${theme.backgroundSecondary}, ${theme.backgroundTertiary})`,
            borderBottom: `1px solid ${theme.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Left: Title and Loading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "200px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ClockIcon size={20} />
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: theme.text,
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
                      background: theme.primary,
                      animation: `pulse 1.4s infinite ${delay}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div
              style={{
                fontSize: "12px",
                color: theme.textTertiary,
                opacity: 0.8,
              }}
            >
              {userTimeZone}
            </div>
          </div>

          {/* Right: Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            {/* Time Range Dropdown */}
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

            {/* Data Type Toggle */}
            <div
              style={{
                display: "flex",
                background: theme.backgroundTertiary,
                borderRadius: "10px",
                padding: "2px",
                border: `1px solid ${theme.borderLight}`,
              }}
            >
              {[
                {
                  type: "tokens",
                  label: "Tokens",
                  icon: <GraphIcon size={14} />,
                },
                { type: "cost", label: t("cost", "成本"), icon: "¥" },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setDataType(type as DataType)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    height: "32px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      dataType === type ? theme.primary : "transparent",
                    color:
                      dataType === type
                        ? theme.background
                        : theme.textSecondary,
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ padding: "20px 24px", background: theme.background }}>
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
