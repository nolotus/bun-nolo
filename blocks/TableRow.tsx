import React, {FC, ReactNode} from 'react';

interface TableRowProps {
  children: ReactNode;
}

const TableRow: FC<TableRowProps> = ({children}) => {
  return (
    <tr className="border-b border-gray-400 py-2 text-left bg-gray-200">
      {children}
    </tr>
  );
};

export default TableRow;
