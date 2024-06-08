import React, { FC, ReactNode } from "react";

interface TableRowProps {
  children: ReactNode;
  className?: string;
}
const TableRow: FC<TableRowProps> = ({ children, className = "" }) => {
  return <tr className={`${className}`}>{children}</tr>;
};

export default TableRow;
