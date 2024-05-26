import React, { ReactNode } from "react";

interface EmphasisProps {
  className?: string;
  children?: ReactNode;
}

const Emphasis: React.FC<EmphasisProps> = ({ className, children }) => {
  return <em className={`${className} `}>{children}</em>;
};

export default Emphasis;
