import React, { ReactNode } from 'react';

interface StrikethroughProps {
  className?: string;
  children?: ReactNode;
}

const Strikethrough: React.FC<StrikethroughProps> = ({
  className,
  children,
}) => {
  return <del className={`${className} line-through`}>{children}</del>;
};

export default Strikethrough;
