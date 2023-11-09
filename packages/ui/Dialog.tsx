import React from 'react';

import { Modal } from './index';

export const Dialog = ({ isOpen, onClose, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-gray-100 rounded-lg p-4 h-auto max-h-full overflow-auto">
        <button
          className="absolute top-5 right-5 text-black font-bold hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </Modal>
  );
};
