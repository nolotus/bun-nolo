import React from "react";
import { ArrowUpIcon } from "@primer/octicons-react";

type ButtonProps = {
  onSend: () => void;
};

const ActionButton: React.FC<ButtonProps> = ({ onSend }) => (
  <button
    type="button"
    className={`flex items-center px-3 py-1 text-white ${"bg-blue-500 hover:bg-blue-600"} `}
    onClick={onSend}
  >
    {<ArrowUpIcon />}
  </button>
);

export default ActionButton;
