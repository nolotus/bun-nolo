import React, {FC, ReactNode} from 'react';

interface TableProps {
  children: ReactNode;
}

const Table: FC<TableProps> = ({children}) => {
  return <table className="w-full border-collapse bg-white"><tbody>{children}</tbody></table>;
};

export default Table;