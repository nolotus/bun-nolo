import React, { useState, useCallback, ReactNode, useEffect } from "react";

// 定义Toast的类型，它可以是string或者ReactNode
type ToastType = {
  id: number;
  content: ReactNode | string;
};

export const useToastManager = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((content: ReactNode | string) => {
    setToasts((currentToasts) => [
      ...currentToasts,
      { id: Date.now(), content },
    ]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  return { toasts, addToast, removeToast };
};

export const Toast = ({
  content,
  id,
  onClose,
}: ToastType & { onClose: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="fixed bottom-5 right-5 rounded-md bg-white px-4 py-2 text-white">
      {content}
    </div>
  );
};
