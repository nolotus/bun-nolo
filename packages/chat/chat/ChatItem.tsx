import { PencilIcon, TrashIcon } from "@primer/octicons-react";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import React from "react";
import { NavLink } from "react-router-dom";
import { useModal, Dialog, Alert, useDeleteAlert } from "ui";

const ChatItem = ({ chat, onDeleteChat, isSelected, allowEdit }) => {
	const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();

	const {
		visible: deleteAlertVisible,
		confirmDelete,
		doDelete,
		closeAlert,
		modalState,
	} = useDeleteAlert(() => {
		onDeleteChat(chat);
	});

	return (
		<div
			className={`flex items-center px-4 py-2 cursor-pointer group ${
				isSelected ? "bg-gray-200" : "hover:bg-gray-100"
			} transition duration-150 ease-in-out`}
		>
			<NavLink
				to={`/chat?chatId=${chat.id}`}
				className="flex-grow text-gray-600 hover:text-gray-800"
			>
				<span className="block p-2">{chat.name}</span>
			</NavLink>
			{allowEdit && (
				<div className="flex opacity-0 group-hover:opacity-100 ml-auto space-x-2 transition duration-150 ease-in-out">
					<button
						type="button"
						className="text-gray-500 hover:text-blue-500 focus:outline-none"
						onClick={(e) => {
							e.stopPropagation();
							openEdit();
						}}
					>
						<PencilIcon size={16} />
					</button>
					{editVisible && (
						<Dialog
							isOpen={editVisible}
							onClose={closeEdit}
							title={`Edit ${chat.name}`}
						>
							<ChatConfigForm initialValues={chat} onClose={closeEdit} />
						</Dialog>
					)}
					<button
						type="button"
						className="text-gray-500 hover:text-red-500 focus:outline-none"
						onClick={(e) => {
							e.stopPropagation();
							confirmDelete(chat);
						}}
					>
						<TrashIcon size={16} />
					</button>
					{deleteAlertVisible && (
						<Alert
							isOpen={deleteAlertVisible}
							onClose={closeAlert}
							onConfirm={doDelete}
							title={`删除 ${modalState.name}`}
							message={`你确定要删除 ${modalState.name} 吗？`}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default ChatItem;
