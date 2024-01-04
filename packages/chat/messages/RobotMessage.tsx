import {
	DesktopDownloadIcon,
	UnmuteIcon,
	TrashIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAuth } from "app/hooks";
import { useWriteHashMutation } from "database/services";
import { WriteHashDataType } from "database/types";
import React from "react";
import { Avatar } from "ui";
import IconButton from "ui/IconButton";
import { Toast, useToastManager } from "ui/Toast";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { MessageContent } from "./MessageContent";
import { MessageImage } from "./MessageImage";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
// 机器人消息组件
const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
	const dispatch = useAppDispatch();

	const { audioSrc, handlePlayClick } = useAudioPlayer(content);
	const [writeHash] = useWriteHashMutation();
	const auth = useAuth();
	const handleSaveContent = async () => {
		if (content) {
			const writeData: WriteHashDataType = {
				data: { content, type: "page" },
				flags: { isJSON: true },
				userId: auth.user?.userId,
			};

			const response = await writeHash(writeData);
			addToast(
				<div className="text-black">
					<a
						href={`/${response.data.dataId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 font-bold"
					>
						保存成功，这里
					</a>{" "}
					查看详情。
				</div>,
			);
		}
	};
	const handleDeleteMessage = () => {
		dispatch(deleteMessage(id));
	};

	const { toasts, addToast, removeToast } = useToastManager();

	return (
		<div className="flex justify-start mb-2 space-x-2">
			{toasts.map((toast) => (
				<Toast
					key={toast.id}
					id={toast.id}
					content={toast.content}
					onClose={removeToast}
				/>
			))}
			<div className="flex items-start space-x-2">
				<div className="flex-shrink-0">
					<Avatar name="robot" />
				</div>
				{image ? (
					<MessageImage image={image} />
				) : (
					<MessageContent role="robot" content={content} />
				)}
				<div className="flex flex-col space-y-1 ml-2">
					<IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
					<IconButton icon={DesktopDownloadIcon} onClick={handleSaveContent} />
					<IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
				</div>
			</div>
			{audioSrc && <audio src={audioSrc} controls />}
		</div>
	);
};
export default RobotMessage;
