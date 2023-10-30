import React, { ReactNode } from 'react';

interface TaskListItemProps {
  className?: string;
  children?: ReactNode;
  checked?: boolean;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  className,
  children,
  checked,
}) => {
  return (
    <li className={`${className}`}>
      <input type="checkbox" checked={checked} readOnly />
      {children}
    </li>
  );
};

export default TaskListItem;
