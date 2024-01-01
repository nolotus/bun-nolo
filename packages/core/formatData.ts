import { toObjectString } from "./otherToNolo";
import { Base64 } from "js-base64";

export const formatData = (data, flags) => {
	let formattedData = data;

	if (flags.isBase64) {
		formattedData = Base64.btoa(data);
	} else if (flags.isJSON) {
		formattedData = JSON.stringify(data);
	} else if (flags.isUrlSafe) {
		formattedData = encodeURIComponent(data);
	} else if (flags.isObject) {
		formattedData = toObjectString(data);
	} else if (flags.isList) {
		formattedData = toObjectString(data);
	}

	// 添加其他数据类型处理逻辑…

	return formattedData;
};
