export type WeatherParam =
  | 'time'
  | 'airTemperature'
  | 'airTemperature80m'
  | 'airTemperature100m'
  | 'airTemperature1000hpa'
  | 'airTemperature800hpa'
  | 'airTemperature500hpa'
  | 'airTemperature200hpa'
  | 'pressure'
  | 'cloudCover'
  | 'currentDirection'
  | 'currentSpeed'
  | 'gust'
  | 'humidity'
  | 'iceCover'
  | 'precipitation'
  | 'snowDepth'
  | 'seaLevel'
  | 'swellDirection'
  | 'swellHeight'
  | 'swellPeriod'
  | 'secondarySwellPeriod'
  | 'secondarySwellDirection'
  | 'secondarySwellHeight'
  | 'visibility'
  | 'waterTemperature'
  | 'waveDirection'
  | 'waveHeight'
  | 'wavePeriod'
  | 'windWaveDirection'
  | 'windWaveHeight'
  | 'windWavePeriod'
  | 'windDirection'
  | 'windDirection20m'
  | 'windDirection30m'
  | 'windDirection40m'
  | 'windDirection50m'
  | 'windDirection80m'
  | 'windDirection100m'
  | 'windDirection1000hpa'
  | 'windDirection800hpa'
  | 'windDirection500hpa'
  | 'windDirection200hpa'
  | 'windSpeed'
  | 'windSpeed20m'
  | 'windSpeed30m'
  | 'windSpeed40m'
  | 'windSpeed50m'
  | 'windSpeed80m'
  | 'windSpeed100m'
  | 'windSpeed1000hpa'
  | 'windSpeed800hpa'
  | 'windSpeed500hpa'
  | 'windSpeed200hpa';

// 接口用以表达获取天气数据的请求参数
export interface WeatherQueryParams {
  lat: number;
  lng: number;
  params: WeatherParam[];
  start?: number | string; // 可选 - 开始时间戳或ISO格式日期
  end?: number | string; // 可选 - 结束时间戳或ISO格式日期
  source?: string; // 可选 - 数据源
}

export interface DataSourceValue {
  [source: string]: number | string;
}

export interface HourlyWeather {
  time: string; // 时间点，ISO格式的日期时间字符串
  airTemperature?: DataSourceValue; // 空气温度，不同数据源可能提供不同的数值
  airTemperature80m?: DataSourceValue; // 80米高处的空气温度
  airTemperature100m?: DataSourceValue; // 100米高处的空气温度
  airTemperature1000hpa?: DataSourceValue; // 1000hpa等压面的空气温度
  airTemperature800hpa?: DataSourceValue; // 800hpa等压面的空气温度
  airTemperature500hpa?: DataSourceValue; // 500hpa等压面的空气温度
  airTemperature200hpa?: DataSourceValue; // 200hpa等压面的空气温度
  pressure?: DataSourceValue; // 气压，单位为hPa(百帕)
  cloudCover?: DataSourceValue; // 云层覆盖率，以百分比表示
  currentDirection?: DataSourceValue; // 海流方向，0° 表示从北方向
  currentSpeed?: DataSourceValue; // 海流速度，单位为米每秒(m/s)
  gust?: DataSourceValue; // 阵风，单位为米每秒(m/s)
  humidity?: DataSourceValue; // 相对湿度, 以百分比表示
  iceCover?: DataSourceValue; // 浮冰覆盖率，范围从 0（无冰）到 1（全覆盖）
  precipitation?: DataSourceValue; // 降水量，单位为毫米每小时(mm/h)
  snowDepth?: DataSourceValue; // 雪的深度，单位为米(m)
  seaLevel?: DataSourceValue; // 海平面相对于平均海平面的高度(m)
  swellDirection?: DataSourceValue; // 涌浪方向，0° 表示涌浪来自北方
  swellHeight?: DataSourceValue; // 涌浪高度，单位为米(m)
  swellPeriod?: DataSourceValue; // 涌浪周期，单位为秒(s)
  secondarySwellPeriod?: DataSourceValue; // 副涌浪周期，单位为秒(s)
  secondarySwellDirection?: DataSourceValue; // 副涌浪方向，0° 表示波浪来自北方
  secondarySwellHeight?: DataSourceValue; // 副涌浪高度，单位为米(m)
  visibility?: DataSourceValue; // 水平能见度，单位为千米(km)
  waterTemperature?: DataSourceValue; // 水面温度，单位为摄氏度(℃)
  waveDirection?: DataSourceValue; // 浪向，0° 表示浪向来自北方
  waveHeight?: DataSourceValue; // 波浪高度，单位为米(m)
  wavePeriod?: DataSourceValue; // 波浪周期，单位为秒(s)
  windWaveDirection?: DataSourceValue; // 风浪方向，0°表示风浪来源北方
  windWaveHeight?: DataSourceValue; // 风浪高度，单位为米(m)
  windWavePeriod?: DataSourceValue; // 风浪周期，单位为秒(s)
  windDirection?: DataSourceValue; // 风向, 0° 表示风来自北方
  windDirection20m?: DataSourceValue; // 20米高处风向
  windDirection30m?: DataSourceValue; // 30米高处风向
  windDirection40m?: DataSourceValue; // 40米高处风向
  windDirection50m?: DataSourceValue; // 50米高处风向
  windDirection80m?: DataSourceValue; // 80米高处风向
  windDirection100m?: DataSourceValue; // 100米高处风向
  windDirection1000hpa?: DataSourceValue; // 1000hpa等压面风向
  windDirection800hpa?: DataSourceValue; // 800hpa等压面风向
  windDirection500hpa?: DataSourceValue; // 500hpa等压面风向
  windDirection200hpa?: DataSourceValue; // 200hpa等压面风向
  windSpeed?: DataSourceValue; // 10米高处的风速, 单位为米每秒(m/s)
  windSpeed20m?: DataSourceValue; // 20米高处的风速
  windSpeed30m?: DataSourceValue; // 30米高处的风速
  windSpeed40m?: DataSourceValue; // 40米高处的风速
  windSpeed50m?: DataSourceValue; // 50米高处的风速
  windSpeed80m?: DataSourceValue; // 80米高处的风速
  windSpeed100m?: DataSourceValue; // 100米高处的风速
  windSpeed1000hpa?: DataSourceValue; // 1000hpa等压面的风速
  windSpeed800hpa?: DataSourceValue; // 800hpa等压面的风速
  windSpeed500hpa?: DataSourceValue; // 500hpa等压面的风速
  windSpeed200hpa?: DataSourceValue; // 200hpa等压面的风速
  // ...如果有更多参数，按需继续添加
}

export interface WeatherApiResponse {
  hours: HourlyWeather[];
  meta: {
    dailyQuota: number,
    lat: number,
    lng: number,
    requestCount: number,
  };
}

export interface WeatherError {
  message: string;
}
