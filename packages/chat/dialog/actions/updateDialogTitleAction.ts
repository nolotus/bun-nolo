import { runCybotId } from "ai/cybot/cybotSlice";
import { patchData } from "database/dbSlice";
import { format } from "date-fns";
import { selectCurrentServer } from "setting/settingSlice";

export const updateDialogTitleAction = async (args, thunkApi) => {
	const { dialogId, currentMsgs, cybotConfig } = args; // 假设 cybotConfig 是从外部传入的
	const dispatch = thunkApi.dispatch;
	const state = thunkApi.getState();
	const content = JSON.stringify(currentMsgs);
	const currentServer = selectCurrentServer(state);
	console.log("currentServer", currentServer);

	const cybotId = currentServer.includes("localhost")
		? "000000100000-c1NvY0lIV2tudXVOY0xMY3gxRlVjX29yVUJUU3RsbnEwcmVQMUJSQm9XRQ-01JFHYXE5J7C31WK7X8EDT048Z"
		: "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JFJ1CRD6MPQ8G8EJFBA0YY8J";

	let title;
	try {
		title = await dispatch(
			runCybotId({
				cybotId,
				userInput: content,
			}),
		).unwrap();
	} catch (error) {
		console.error("Failed to get title from cybotId:", error);

		// 使用 date-fns 格式化当前日期为“MM-dd”
		const formattedDate = format(new Date(), "MM-dd");

		// 生成备用标题
		title = `${cybotConfig.name}_${formattedDate}`;
	}

	const result = await dispatch(
		patchData({ id: dialogId, changes: { title } }),
	).unwrap();

	return result;
};
