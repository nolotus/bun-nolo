// 2. ai/token/utils.ts - 工具函数和数据转换
import { pipe, prop } from "rambda";
import { ulid } from "ulid";
import { RequiredData } from "./types";

export const generateId = pipe(prop("timestamp"), ulid);

export const formatDate = pipe(
  prop("timestamp"),
  (t: number) => new Date(t).toISOString().split("T")[0]
);

export const enrichData = (data: RequiredData) => ({
  ...data,
  timestamp: data.date.getTime(),
  id: ulid(data.date.getTime()),
  dateKey: formatDate({ timestamp: data.date.getTime() }),
});
