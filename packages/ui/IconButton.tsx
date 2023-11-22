import React from 'react';

// IconButton组件，接收一个icon和onClick回调函数
const IconButton: React.FC<{
  icon: React.ElementType,
  onClick: () => void,
  className?: string,
}> = ({ icon: Icon, onClick, className }) => {
  return (
    <div onClick={onClick} className={`cursor-pointer ${className}`}>
      <Icon />
    </div>
  );
};

export default IconButton;
