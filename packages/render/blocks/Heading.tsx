import React from 'react';

const Heading = ({children, level}) => {
  const baseStyle = 'font-bold mb-4';
  const levelStyles = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base',
  };

  const style = `${baseStyle} ${levelStyles[level] || ''}`;

  return React.createElement(`h${level}`, {className: style}, children);
};

export default Heading;
