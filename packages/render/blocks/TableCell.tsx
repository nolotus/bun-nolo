import React, { FC, ReactNode } from "react";

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

const TableCell: FC<TableCellProps> = ({ children, className = "" }) => {
  return <td className={`${className}`}>{children}</td>;
};

export default TableCell;
