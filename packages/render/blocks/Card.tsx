import React, { ReactNode, MouseEvent } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "2px",
        backgroundColor: "white",
        padding: "1rem",
        transition: "all 0.3s cubic-bezier(0.25, 0.9, 0.25, 1)",
        ...(className ? { className } : {}),
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)")
      }
    >
      {children}
    </div>
  );
};

export default Card;
