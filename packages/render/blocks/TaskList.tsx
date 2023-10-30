import React, { ReactNode } from 'react';

interface TaskListProps {
  className?: string;
  children?: ReactNode;
}

const TaskList: React.FC<TaskListProps> = ({ className, children }) => {
  return <ul className={`${className}`}>{children}</ul>;
};

export default TaskList;
