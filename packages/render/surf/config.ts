export const modes = [
	{ value: "sg", title: "自动" },
	{ value: "noaa", title: "GFS" },
	{ value: "meteo", title: "Meteo" },
	{ value: "icon", title: "ICON" },
];

export const intervals = [
	{ value: 3, title: "3H" },
	{ value: 1, title: "1H" },
];

export const defaultDisplayConfig = [
	{
		key: "time",
		enabled: true,
	},
	{
		key: "swellDirection",
		enabled: true,
	},
	{
		key: "windDirection",
		enabled: true,
	},
	{
		key: "windSpeed",
		enabled: true,
	},
	{
		key: "swellHeight",
		enabled: true,
	},
	{
		key: "swellPeriod",
		enabled: true,
	},
	{
		key: "gust",
		enabled: true,
	},
	{
		key: "airTemperature",
		enabled: true,
	},
];
