import React, { useEffect, useRef, useCallback } from 'react';

export const Toast = ({ message, id, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-md">
      {message}
    </div>
  );
};
