import React from 'react';

import { Modal, useModal } from './index';
interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const useDeleteAlert = (deleteCallback) => {
  const { visible, open, close, modalState } = useModal();

  const confirmDelete = (item) => {
    open(item);
  };

  const doDelete = () => {
    deleteCallback(modalState);
    close();
  };
  return { visible, confirmDelete, doDelete, closeAlert: close, modalState };
};

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-red-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-red-700">{message}</p>
        <button
          className="mt-4 py-2 px-6 rounded bg-red-600 text-white hover:bg-red-500 transition-colors duration-200 ease-in-out"
          onClick={onConfirm}
        >
          确定
        </button>
        <button onClick={onClose}>取消</button>
      </div>
    </Modal>
  );
};
