import React from 'react';

export const Card = (props) => {
  const { children, onClick, className } = props;
  return (
    <div
      onClick={onClick}
      className={`shadow rounded-[2px] bg-white p-4 hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.9,0.25,1)] ${className}`}
    >
      {children}
    </div>
  );
};
