import { parse as parseYaml } from "yaml";
import { parse as parseDate, format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import {
  markdownToMdast,
  getH1TextFromMdast,
  getYamlValueFromMdast,
} from "render/MarkdownProcessor";
import { pick } from "rambda";
const location = ["lat", "lng", "country", "province", "state", "city"];
const render = ["layout"];
const artcile = ["title", "tags", "categories"];
const todo = ["end_time", "start_time"];
const pay = ["price", "payment_method", "pay_time"];
export function processContent(content: string) {
  // 使用自定义的函数将内容转换为mdast对象
  const mdast = markdownToMdast(content);

  // 获取YAML部分的值
  const newYamlValue = getYamlValueFromMdast(mdast); // 使用你的函数从mdast中获取YAML部分
  let metaUpdates = {};

  if (newYamlValue) {
    try {
      const parsedYaml = parseYaml(newYamlValue);
      metaUpdates = pick(
        ["type", ...location, ...render, ...artcile, ...todo, ...pay, "date"],
        parsedYaml,
      );

      if (metaUpdates.end_time) {
        const timeZone = "Asia/Shanghai"; // 设定你需要使用的时区
        // 将YAML中提取的日期字符串先转换成UTC时间，然后再转换为指定时区的时间
        const utcDate = zonedTimeToUtc(
          parseDate(metaUpdates.end_time, "yyyy-MM-dd", new Date()),
          timeZone,
        );
        metaUpdates.end_time = format(utcDate, "yyyy-MM-dd'T'HH:mm:ssXXX", {
          timeZone,
        });
      }
    } catch (error) {
      console.error("解析YAML出错：", error);
      // 处理解析错误
    }
  }

  // 更新标题情况处理
  const newTitle = getH1TextFromMdast(mdast); // 使用你的函数从mdast中获取标题
  if (newTitle) {
    metaUpdates.title = newTitle;
  }

  return { content, mdast, metaUpdates };
}
