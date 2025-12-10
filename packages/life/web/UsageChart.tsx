// file: src/features/usage/UsageChart.tsx
import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { formatInTimeZone } from "date-fns-tz";
import { getTokenStats } from "ai/token/query";
import { useAppSelector } from "app/store";
import { selectUserId } from "auth/authSlice";
import { TimeRange, processDateRange } from "utils/processDateRange";
import { ClockIcon, GraphIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import Combobox from "render/web/ui/Combobox";
// ✅ 替换为 TabsNav
import TabsNav from "render/web/ui/TabsNav";

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
type DataType = "tokens" | "cost";

const STYLES = `
  .usage-card {
    background: var(--background);
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 1px 3px var(--shadowLight);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .usage-header {
    padding: 16px 20px;
    background: var(--backgroundSecondary);
    border-bottom: 1px solid var(--borderLight);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .usage-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
  }
  .usage-meta {
    font-size: 0.75rem;
    color: var(--textTertiary);
    font-weight: normal;
    font-family: monospace;
    margin-left: 4px;
    opacity: 0.8;
  }
  .usage-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .usage-body {
    padding: 20px;
    background: var(--background);
    min-height: 400px;
  }

  /* ✅ TabsNav 里 label 的 icon + 文本 布局 */
  .tab-label-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  /* ✅ 模拟原先 Tabs size="small" 的高度 */
  .usage-tabs-nav .tabs {
    --tabs-height: 32px;
  }
`;

const UsageChart: React.FC = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(selectUserId);
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");
  const [dataType, setDataType] = useState<DataType>("tokens");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 这里的 useMemo 是为了保持对象引用稳定
  const timeRangeOptions = useMemo(
    () => [
      { label: t("last_7_days", "近 7 天"), value: "7days" },
      { label: t("last_30_days", "近 30 天"), value: "30days" },
      { label: t("last_90_days", "近 90 天"), value: "90days" },
    ],
    [t]
  );

  const dataTypeOptions = useMemo(
    () => [
      { id: "tokens", label: "Tokens", icon: <GraphIcon size={14} /> },
      { id: "cost", label: t("cost", "成本"), icon: "¥" },
    ],
    [t]
  );

  // ✅ 映射为 TabsNav 的 tabs 结构
  const dataTypeTabs = useMemo(
    () =>
      dataTypeOptions.map(({ id, label, icon }) => ({
        id,
        label: (
          <span className="tab-label-with-icon">
            {/* icon 可能是字符串，也可能是 ReactNode */}
            {typeof icon === "string" ? <span>{icon}</span> : icon}
            <span>{label}</span>
          </span>
        ),
      })),
    [dataTypeOptions]
  );

  const selectedTimeRange = timeRangeOptions.find((o) => o.value === timeRange);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const { dateArray } = processDateRange(timeRange, userTimeZone);
    const startDate = dateArray[0].utc;
    const endDate = dateArray[dateArray.length - 1].utc;

    getTokenStats({ userId, startDate, endDate })
      .then(setStatsData)
      .catch(() => {
        // TODO: 可按需加 toast
      })
      .finally(() => setLoading(false));
  }, [userId, timeRange]);

  const chartOption = useMemo(() => {
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
      const idx = dateArray.findIndex((d) => d.full === localDate);
      if (idx === -1) return;

      const getTotal = (obj: any) =>
        dataType === "tokens"
          ? (obj?.tokens?.input || 0) + (obj?.tokens?.output || 0)
          : obj?.cost || 0;

      series.total[idx] = getTotal(stat.total);
      Object.entries(stat.models || {}).forEach(([model, data]) => {
        if (!series.models[model])
          series.models[model] = new Array(dateArray.length).fill(0);
        series.models[model][idx] = getTotal(data);
      });
    });

    const modelNames = Object.keys(series.models);
    const isCost = dataType === "cost";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
        textStyle: { color: "var(--text)" },
        padding: 12,
        formatter: (params: any[]) => {
          const date = dateArray[params[0].dataIndex].full;
          let html = `<div style="font-weight:600;margin-bottom:6px">${date}</div>`;
          params.forEach((p) => {
            const val = isCost
              ? `¥${p.value.toFixed(4)}`
              : p.value.toLocaleString();
            html += `<div style="display:flex;align-items:center;gap:6px;margin:3px 0">
              <span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
              <span style="color:var(--textSecondary)">${p.seriesName}:</span>
              <span style="margin-left:auto;font-weight:500">${val}</span>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        data: [t("total", "总量"), ...modelNames],
        top: 0,
        textStyle: { color: "var(--textSecondary)" },
      },
      grid: { left: 10, right: 10, bottom: 0, top: 40, containLabel: true },
      xAxis: {
        type: "category",
        data: series.dates,
        axisLine: { lineStyle: { color: "var(--border)" } },
        axisLabel: { color: "var(--textTertiary)" },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: { color: "var(--borderLight)", type: "dashed" },
        },
        axisLabel: {
          color: "var(--textTertiary)",
          formatter: isCost
            ? (v: number) => `¥${v}`
            : (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v),
        },
      },
      series: [
        {
          name: t("total", "总量"),
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: series.total,
          itemStyle: { color: "var(--primary)" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "var(--primaryGhost)" },
                { offset: 1, color: "transparent" },
              ],
            },
          },
        },
        ...modelNames.map((model) => ({
          name: model,
          type: "bar",
          stack: "models",
          data: series.models[model],
          barMaxWidth: 30,
        })),
      ],
    };
  }, [timeRange, dataType, statsData, t]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="usage-card">
        <div className="usage-header">
          <div className="usage-title">
            <ClockIcon size={18} className="text-secondary" />
            <span>{t("usage_stats", "使用量统计")}</span>
            <span className="usage-meta">({userTimeZone})</span>
          </div>

          <div className="usage-controls">
            <div style={{ width: 140 }}>
              <Combobox
                items={timeRangeOptions}
                selectedItem={selectedTimeRange}
                onChange={(i) => i && setTimeRange(i.value as TimeRange)}
                size="small"
                variant="filled" // 使用 Filled 样式让其在 Header 背景上更自然
                searchable={false} // 选项少，无需搜索
                placeholder={t("select_time_range")}
              />
            </div>

            {/* ✅ 使用 TabsNav 替代 Tabs */}
            <TabsNav
              className="usage-tabs-nav"
              tabs={dataTypeTabs}
              activeTab={dataType}
              onChange={(id) => setDataType(id as DataType)}
            />
          </div>
        </div>

        <div className="usage-body">
          <ReactECharts
            option={chartOption}
            style={{ height: "400px" }}
            opts={{ renderer: "svg" }}
            showLoading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default UsageChart;
