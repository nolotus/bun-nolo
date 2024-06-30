import React from "react";
export const Card = (props) => {
  const { children, onClick, className } = props;
  return (
    <div onClick={onClick} className={`p-4 ${className}`}>
      {children}
    </div>
  );
};
