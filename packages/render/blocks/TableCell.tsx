import React, {FC, ReactNode} from 'react';

interface TableCellProps {
  children: ReactNode;
}

const TableCell: FC<TableCellProps> = ({children}) => {
  return <td className="px-2 text-gray-600">{children}</td>;
};

export default TableCell;
