import { XIcon } from "@primer/octicons-react";
import React from "react";

import { Modal } from "./index";

export const Dialog = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="surface3 flex h-auto  max-h-[500px] flex-col ">
        <div className="flex items-center justify-between p-6">
          <h2>{title}</h2>
          <button
            className=" hover:text-red-500"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="overflow-auto p-6">{children}</div>
      </div>
    </Modal>
  );
};
