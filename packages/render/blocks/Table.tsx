import React, { FC, ReactNode, cloneElement } from "react";

interface TableProps {
  children: ReactNode;
}

const Table: FC<TableProps> = ({ children }) => {
  return (
    <div style={{ overflowX: "auto", marginTop: "20px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        {React.Children.map(children, (child, index) =>
          React.isValidElement(child)
            ? cloneElement(child, {
                key: index,
              })
            : child,
        )}
      </table>
    </div>
  );
};

export default Table;
