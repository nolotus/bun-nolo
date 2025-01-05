import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";

import { DialogList } from "./dialog/DialogList";

const ChatSidebar = () => {
	const currentUserId = useAppSelector(selectCurrentUserId);
	const { data: fullData } = useUserData(
		[DataType.Dialog, DataType.Page],
		currentUserId,
		100
	);
	if (fullData) {
		const { dialog, page } = fullData;
		console.log("dialog", dialog);
		return <nav>{dialog && <DialogList dialogList={dialog} />}</nav>;
	}
	return null;
};

export default ChatSidebar;
