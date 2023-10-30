import React, { ReactNode, MouseEvent } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={`shadow rounded-[2px] bg-white p-4 hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.9,0.25,1)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
