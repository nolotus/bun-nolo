// elements/Table.tsx
import React, { useState } from "react";

interface TableBaseProps {
  attributes: any;
  children: React.ReactNode;
  theme: any;
}

const getTableStyle = (theme: any) => ({
  borderCollapse: "collapse" as const,
  width: "100%",
  margin: "1em 0",
  background: theme.table.background,
  color: theme.table.color,
});

export const Table: React.FC<TableBaseProps> = ({
  attributes,
  children,
  theme,
}) => (
  <table style={getTableStyle(theme)} {...attributes}>
    {children}
  </table>
);

const getRowStyle = (theme: any, isHovered: boolean) => ({
  borderBottom: `1px solid ${theme.row.borderColor}`,
  background: isHovered ? theme.row.hoverBackground : theme.row.background,
  transition: "background-color 0.2s ease",
});

export const TableRow: React.FC<TableBaseProps> = ({
  attributes,
  children,
  theme,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      style={getRowStyle(theme, isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...attributes}
    >
      {children}
    </tr>
  );
};

interface TableCellProps extends TableBaseProps {
  element: {
    header?: boolean;
  };
}

const getCellStyle = (theme: any, isHeader: boolean) =>
  isHeader
    ? {
        backgroundColor: theme.header.background,
        color: theme.header.color,
        fontWeight: 600,
        padding: theme.cell.padding,
        textAlign: "left" as const,
        border: `1px solid ${theme.header.borderColor}`,
      }
    : {
        padding: theme.cell.padding,
        border: `1px solid ${theme.cell.borderColor}`,
      };

export const TableCell: React.FC<TableCellProps> = ({
  attributes,
  children,
  element,
  theme,
}) => {
  const cellStyle = getCellStyle(theme, element.header);

  return element.header ? (
    <th style={cellStyle} {...attributes}>
      {children}
    </th>
  ) : (
    <td style={cellStyle} {...attributes}>
      {children}
    </td>
  );
};
