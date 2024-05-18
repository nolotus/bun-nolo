import React from "react";
import { Button } from "ui/Button"; // 确保这是正确的导入路径

import { Modal, useModal } from "./index";

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
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end space-x-4">
          <Button variant="secondary" size="medium" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" size="medium" onClick={onConfirm}>
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};
