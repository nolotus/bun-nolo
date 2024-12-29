import React, { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import {
	queryDialogList,
	selectCurrentWorkSpaceId,
} from "create/workspace/workspaceSlice";
import { selectFilteredDataByUserAndTypeAndWorkspace } from "database/selectors";

import { DialogList } from "./dialog/DialogList";

const ChatSidebar = () => {
	const dispatch = useAppDispatch();
	const currentUserId = useAppSelector(selectCurrentUserId);
	const workspaceId = useAppSelector(selectCurrentWorkSpaceId);
	const data = useAppSelector(
		selectFilteredDataByUserAndTypeAndWorkspace(
			currentUserId,
			DataType.Dialog,
			workspaceId,
		),
	);
	useEffect(() => {
		dispatch(queryDialogList());
	}, []);

	return <nav>{data && <DialogList dialogList={data} />}</nav>;
};

export default ChatSidebar
