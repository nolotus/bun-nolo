import React, { FC, ReactNode } from 'react';

interface TableRowProps {
  children: ReactNode;
  className?: string;
}
const TableRow: FC<TableRowProps> = ({ children, className = '' }) => {
  return (
    <tr className={`border-b border-gray-400 py-2 ${className}`}>{children}</tr>
  );
};

export default TableRow;
