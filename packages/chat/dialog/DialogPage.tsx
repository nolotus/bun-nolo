import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import {
	clearDialogState,
	initDialog,
	selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/messages/MessageInputContainer";
import MessagesList from "chat/messages/MessageList";
import withTranslations from "i18n/withTranslations";
//  chat/dialog/DialogPage
import { useEffect } from "react";
import { layout } from "render/styles/layout";

const DialogPage = ({ dialogId }) => {
	const auth = useAuth();
	const dispatch = useAppDispatch();
	console.log("dialogId", dialogId);
	if (!auth.user) {
		window.location.href = "/login";
	}
	useEffect(() => {
		dialogId && dispatch(initDialog({ dialogId }));

		// 组件卸载时清空数据
		return () => {
			dispatch(clearDialogState());
		};
	}, [auth.user, dialogId]); // 添加 dispatch 到依赖数组

	const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

	// 计算剩余的空间

	return (
		<div
			style={{
				...layout.flex,
				...layout.overflowXHidden,
				height: "calc(100dvh - 60px)",
			}}
		>
			<div
				style={{
					...layout.flexColumn,
					...layout.flexGrow1,
					...layout.overflowXHidden,
				}}
			>
				{currentDialogConfig && (
					<div
						style={{
							...layout.flexColumn,
							...layout.h100,
							...layout.overflowXHidden,
						}}
					>
						<div
							style={{
								...layout.flexGrow1,
								...layout.overflowYAuto,
								...layout.flexColumn,
							}}
						>
							<MessagesList />
						</div>
						<MessageInputContainer />
					</div>
				)}
			</div>
		</div>
	);
};

export default withTranslations(DialogPage, ["chat", "ai"]);
