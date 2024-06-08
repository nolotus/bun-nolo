import React, { FC, ReactNode, cloneElement } from "react";

interface TableProps {
  children: ReactNode;
}

const Table: FC<TableProps> = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody className="">
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child)
              ? cloneElement(child, {
                  className: `${child.props.className || ""}`,
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
