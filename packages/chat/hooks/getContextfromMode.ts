import { parseWeatherParams, formatDataSnippet } from "integrations/weather";
import { getWeather } from "integrations/weather/getWeather";
import generateImage from "integrations/image/generateImage";
import { ModeType } from "ai/types";

export const getContextFromMode = async (mode: ModeType, content: string) => {
  if (mode === "image") {
    //todo  add static
    const response = await generateImage({
      prompt: content,
    });
    const data = response.data;
    const imageUrl = data.data[0].url; // 提取图片 URL
    // const staticData = {
    // 	dialogType: "send",
    // 	model: 'dalle-3'
    // 	length: newMessage.length,
    // 	userId: auth?.user?.userId,
    // 	username: auth?.user?.username,
    // 	date: new Date(),
    // };
    return { image: imageUrl };
  }
  if (mode === "surf") {
    // 如果检测到surf模式，我们应该解析出查询参数并获取天气信息
    const queryParams = parseWeatherParams(content); // 解析出天气查询参数的函数
    if (queryParams) {
      try {
        const weatherInfo = await getWeather(queryParams);
        const formattedData = formatDataSnippet(weatherInfo.hours);
        return { content: `查询结果（部分显示）：\n${formattedData}` };
      } catch (error) {
        return { isError: true };
      }
    }
  }
};
