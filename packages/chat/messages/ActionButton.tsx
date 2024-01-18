import React from "react";
import { ArrowUpIcon, SquareIcon } from "@primer/octicons-react";

type ButtonProps = {
	isSending: boolean;
	onSend: () => void;
	onCancel: () => void;
};

const ActionButton: React.FC<ButtonProps> = ({
	isSending,
	onSend,
	onCancel,
}) => (
	<button
		type="button"
		className={`py-1 px-3 flex items-center text-white ${
			isSending
				? "bg-red-500 hover:bg-red-600"
				: "bg-blue-500 hover:bg-blue-600"
		}`}
		onClick={isSending ? onCancel : onSend}
	>
		{isSending ? <SquareIcon size={16} /> : <ArrowUpIcon size={20} />}
	</button>
);

export default ActionButton;
