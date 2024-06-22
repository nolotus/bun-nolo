import React from 'react';
export const Avatar = ({ name }) => {
  const isUser = name !== 'robot';
  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white 
        ${isUser ? 'bg-blue-500' : 'bg-green-500'}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
