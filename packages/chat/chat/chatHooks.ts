// 在一个hooks.js文件中或者在chatSlice文件中定义这个自定义钩子
import { useSelector } from "react-redux";
import { RootState } from "app/store";
import { selectChatById, selectChat } from "../chatSlice";

export const useCurrentChatConfig = () => {
	const currentChatId = useSelector(
		(state: RootState) => selectChat(state).currentChatId,
	);
	const currentChatConfig = useSelector((state: RootState) =>
		currentChatId ? selectChatById(state, currentChatId) : null,
	);

	return currentChatConfig;
};
