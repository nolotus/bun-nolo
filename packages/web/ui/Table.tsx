// web/ui/Table/index.tsx
import React from "react";
import { useTheme } from "app/theme";

interface TableBaseProps {
  attributes?: any;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Table: React.FC<TableBaseProps> = ({
  attributes,
  children,
  style,
}) => {
  const theme = useTheme();

  return (
    <>
      <style>{`
        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: ${theme.background};
          border-radius: 8px;
          box-shadow: 0 1px 3px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          overflow: hidden;
        }
      `}</style>
      <table className="data-table" style={style} {...attributes}>
        {children}
      </table>
    </>
  );
};

export const TableRow: React.FC<TableBaseProps> = ({
  attributes,
  children,
  style,
}) => {
  const theme = useTheme();

  return (
    <>
      <style>{`
        .table-row {
          border-bottom: 1px solid ${theme.border};
          background: ${theme.background};
          transition: background-color 0.2s ease;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .table-row:hover {
          background: ${theme.backgroundSecondary};
        }
      `}</style>
      <tr className="table-row" style={style} {...attributes}>
        {children}
      </tr>
    </>
  );
};

interface TableCellProps extends TableBaseProps {
  element: {
    header?: boolean;
  };
}

export const TableCell: React.FC<TableCellProps> = ({
  attributes,
  children,
  element,
  style,
}) => {
  const theme = useTheme();
  const Component = element.header ? "th" : "td";

  return (
    <>
      <style>{`
        .table-cell {
          padding: ${element.header ? "12px 24px" : "16px 24px"};
          text-align: left;
          color: ${element.header ? theme.textSecondary : theme.text};
          font-size: ${element.header ? "13px" : "14px"};
          line-height: 1.5;
          white-space: nowrap;
        }
        
        .table-header {
          position: sticky;
          top: 0;
          background: ${theme.backgroundSecondary};
          font-weight: 500;
          user-select: none;
          text-transform: none;
          border-bottom: 1px solid ${theme.border};
          z-index: 1;
        }

        @media (max-width: 640px) {
          .table-cell {
            padding: 12px 16px;
          }
        }
      `}</style>
      <Component
        className={`table-cell ${element.header ? "table-header" : ""}`}
        style={style}
        {...attributes}
      >
        {children}
      </Component>
    </>
  );
};
