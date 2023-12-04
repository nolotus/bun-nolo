import React from 'react';
import { baseCard } from 'render/styles';
export const Card = (props) => {
  const { children, onClick, className } = props;
  return (
    <div onClick={onClick} className={`${baseCard} p-4 ${className}`}>
      {children}
    </div>
  );
};
