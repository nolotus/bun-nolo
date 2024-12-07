import { parse as parseYaml } from "yaml";
import { parse as parseDate, format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { pick } from "rambda";
import { visit } from "unist-util-visit";
import { markdownToMdast } from "create/editor/markdownToSlate";

const location = ["lat", "lng"];
const render = ["layout"];
const artcile = ["title", "tags", "categories"];
const todo = ["end_time", "start_time"];

export const getYamlValueFromMdast = (mdast: MdastNode): string | null => {
  let yamlValue: string | null = null;
  visit(mdast, "yaml", (node) => {
    if (node.type === "yaml" && node.value) {
      yamlValue = node.value;
      return false; // 停止访问
    }
  });
  return yamlValue;
};
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
        ["type", ...location, ...render, ...artcile, ...todo, "date"],
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
      // 处理解析错误
    }
  }

  return { content, metaUpdates };
}
