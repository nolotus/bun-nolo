import { XIcon } from '@primer/octicons-react';
import React from 'react';

import { Modal } from './index';

export const Dialog = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col bg-white rounded-lg max-h-[500px] h-auto">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="text-black font-bold hover:text-red-500 transition-colors duration-300 ease-in-out"
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
