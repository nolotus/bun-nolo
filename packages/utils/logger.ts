import pino from "pino";
const baseLogger = pino({ transport: { target: "pino-pretty" } });
const defaultOptions = {
	activeLoggers: [
		"life",
		"OpenAI",
		"signup",
		"crypto",
		"validation",
		"api",
		"form",
		"update",
		"deleteUser",
		"data-import",
		"Message",
		"TableComponent",
		"ChatWindow",
		"register",
	],
};
const childLoggers = {};

export const getLogger = (name, options = defaultOptions) => {
	const shouldLog = (filterIDs, obj) =>
		filterIDs ? filterIDs.includes(obj.id) : true;
	const setActiveLogLevel = (logger, name, activeLoggers) => {
		if (!activeLoggers.includes(name)) {
			logger.level = "silent";
		}
	};
	if (childLoggers[name]) {
		return childLoggers[name];
	}

	const newLogger = baseLogger.child({ name });
	const { activeLoggers = defaultOptions.activeLoggers, filterIDs } = options;

	if (!filterIDs) {
		setActiveLogLevel(newLogger, name, activeLoggers);
	}

	const customLogger = {
		info: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.info(obj, msg);
			}
		},
		error: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.error(obj, msg);
			}
		},
		warn: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.warn(obj, msg);
			}
		},
		debug: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.debug(obj, msg);
			}
		},
		fatal: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.fatal(obj, msg);
			}
		},
		trace: (obj, msg) => {
			if (shouldLog(filterIDs, obj)) {
				newLogger.trace(obj, msg);
			}
		},
	};

	childLoggers[name] = customLogger;

	return customLogger;
};
