import { runCybotId } from "ai/cybot/cybotSlice";
import { patchData } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";

export const updateDialogTitleAction = async (args, thunkApi) => {
	const { dialogId, currentMsgs } = args;
	const dispatch = thunkApi.dispatch;
	const state = thunkApi.getState();
	const content = JSON.stringify(currentMsgs);
	const currentServer = selectCurrentServer(state);
	console.log("currentServer", currentServer);
	const cybotId = currentServer.includes("localhost")
		? "000000100000-c1NvY0lIV2tudXVOY0xMY3gxRlVjX29yVUJUU3RsbnEwcmVQMUJSQm9XRQ-01JFHYXE5J7C31WK7X8EDT048Z"
		: "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JFJ1CRD6MPQ8G8EJFBA0YY8J";

	const title = await dispatch(
		runCybotId({
			cybotId,
			userInput: content,
		}),
	).unwrap();
	console.log("title", title);
	const result = await dispatch(
		patchData({ id: dialogId, changes: { title } }),
	).unwrap();
	console.log("result", result);
	return result;
};
