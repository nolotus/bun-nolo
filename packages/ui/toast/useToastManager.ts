import { useState, useCallback } from 'react';

export const useToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    setToasts((currentToasts) => [
      ...currentToasts,
      { id: Date.now(), message },
    ]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  return { toasts, addToast, removeToast };
};
