import React, { FC, ReactNode } from "react";

interface TableCellProps {
  children: ReactNode;
  style?: React.CSSProperties;
  title?: string;
}

const TableCell: FC<TableCellProps> = ({ children, style = {}, title }) => {
  return (
    <td
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        ...style,
      }}
      title={title}
    >
      {children}
    </td>
  );
};

export default TableCell;
