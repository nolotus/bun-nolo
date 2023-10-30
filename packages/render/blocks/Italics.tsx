import React, { ReactNode } from 'react';

interface ItalicsProps {
  className?: string;
  children?: ReactNode;
}

const Italics: React.FC<ItalicsProps> = ({ className, children }) => {
  return <i className={`${className} italic`}>{children}</i>;
};

export default Italics;
