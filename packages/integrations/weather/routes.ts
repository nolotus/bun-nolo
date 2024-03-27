import { fetchWeatherData } from "./weatherService";
export async function weatherRouteHandler(req, res) {
  try {
    // 将字符串参数转换为浮点数
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    // 检查是否提供了params查询参数并进行处理，此处假设params是逗号分隔的字符串
    const params = req.query.params ? req.query.params.split(",") : [];
    const start = req.query.start;
    const end = req.query.end;
    // 确保lat和lng是数字类型且params是一个字符串数组
    if (!isNaN(lat) && !isNaN(lng) && Array.isArray(params)) {
      const queryParams = {
        lat,
        lng,
        params, // 传入处理过的params数组
        start,
        end,
      };
      const data = await fetchWeatherData(queryParams);

      return res.json(data);
    }
    return res.status(400).json({ message: "Invalid query parameters" });
  } catch (error) {
    // 如果API调用失败，返回500错误及错误信息
    return res.status(500).json({ message: error.message });
  }
}
