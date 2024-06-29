import React from "react";
import { Spinner } from "@primer/react";

const IconButton: React.FC<{
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  isLoading: boolean;
}> = ({ icon: Icon, onClick, className, style, isLoading }) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer ${className}`}
      style={style}
    >
      {isLoading ? <Spinner size={"small"} /> : <Icon />}
    </div>
  );
};

export default IconButton;
