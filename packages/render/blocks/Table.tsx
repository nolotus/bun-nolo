import React, { FC, ReactNode, cloneElement } from 'react';

interface TableProps {
  children: ReactNode;
}

const Table: FC<TableProps> = ({ children }) => {
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="w-full bg-white divide-y divide-gray-300">
        <tbody className="divide-y divide-gray-300">
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child)
              ? cloneElement(child, {
                  className: `${child.props.className || ''} ${
                    index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                  }`,
                  key: index,
                })
              : child,
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
