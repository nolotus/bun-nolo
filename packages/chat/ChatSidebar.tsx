import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";

import { SidebarItem } from "./dialog/SidebarItem";

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
		console.log("page", page)
		console
		return <nav>
			{dialog?.map((dilogItem) => { return <SidebarItem {...dilogItem} /> })}
			{page?.map((pageItem) => { return <SidebarItem {...pageItem} /> })}
		</nav>

	}
	return null;
};

export default ChatSidebar;
