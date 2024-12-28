import { useState } from "react";

export const useModal = <T,>() => {
  const [visible, setVisible] = useState(false);
  const [modalState, setModalState] = useState<T | null>(null);

  const open = (item: T) => {
    setModalState(item);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setTimeout(() => {
      setModalState(null);
    }, 300);
  };

  return { visible, open, close, modalState };
};



