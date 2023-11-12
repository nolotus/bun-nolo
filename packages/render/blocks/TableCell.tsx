import React, { FC, ReactNode } from 'react';

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

const TableCell: FC<TableCellProps> = ({ children, className = '' }) => {
  return (
    <td className={`px-4 py-2 text-gray-700 text-sm ${className}`}>
      {children}
    </td>
  );
};

export default TableCell;
