import COLORS from "./color";

export const calculateAverage = (
  hours: Array<any>,
  field: string,
  mode: string,
): string => {
  let tempSum = 0;
  let tempCount = 0;

  for (const hour of hours) {
    const tempValue = hour[field]?.[mode];
    if (tempValue !== undefined) {
      tempSum += parseFloat(tempValue);
      tempCount++;
    }
  }

  return tempCount > 0 ? (tempSum / tempCount).toFixed(1) : "-";
};

export const getQualityColor = (value: number, type: string): string => {
  let quality = "average"; // 默认质量为'average'
  let backgroundColor = COLORS.quality.average; // 默认背景颜色为淡黄色（average）

  // 根据不同数据类型设置不同条件的阈值判断
  switch (type) {
    case "windSpeed":
      if (value < 5) quality = "good";
      else if (value > 8) quality = "bad";
      break;
    case "swellHeight":
      if (value > 1.5) quality = "good";
      else if (value < 0.5) quality = "bad";
      break;
    case "swellPeriod":
      if (value > 12) quality = "good";
      else if (value < 8) quality = "bad";
      break;
    default:
      break;
  }

  // 根据质量结果更新背景颜色
  if (quality === "good")
    backgroundColor = COLORS.quality.good; // Light green
  else if (quality === "bad") backgroundColor = COLORS.quality.bad; // Light red

  return backgroundColor;
};
