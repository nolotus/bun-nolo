import React, { FC, ReactNode, useState } from "react";

interface TableRowProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

const TableRow: FC<TableRowProps> = ({ children, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <tr
      style={{
        borderBottom: "1px solid #ddd",
        backgroundColor: isHovered ? "#e0f7fa" : style.backgroundColor,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </tr>
  );
};

export default TableRow;
