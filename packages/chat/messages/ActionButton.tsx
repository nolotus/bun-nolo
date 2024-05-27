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
    className={`flex items-center px-3 py-1 text-white ${
      isSending
        ? "bg-red-500 hover:bg-red-600"
        : "bg-blue-500 hover:bg-blue-600"
    } `}
    onClick={isSending ? onCancel : onSend}
  >
    {isSending ? <SquareIcon /> : <ArrowUpIcon />}
  </button>
);

export default ActionButton;
