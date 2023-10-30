import React, { ReactNode, CSSProperties } from 'react';

interface HeadingProps {
  children: ReactNode;
  level: number;
  className?: string; // 添加 className 作为可选属性
  style?: CSSProperties; // 如果你还需要支持样式
}

const Heading: React.FC<HeadingProps> = ({ children, level, className }) => {
  const baseStyle = 'font-bold mb-4';
  const levelStyles: { [key: number]: string } = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base',
  };

  // 使用 className（如果有的话）
  const style = `${baseStyle} ${levelStyles[level] || ''} ${className || ''}`;

  return React.createElement(`h${level}`, { className: style }, children);
};

export default Heading;
