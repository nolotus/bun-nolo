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
      <style href="table-container" precedence="medium">{`
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: ${theme.background};
          border-radius: 8px;
          box-shadow: 0 1px 3px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          overflow: hidden;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .table-container {
            margin-top: 0.75rem;
          }
        }
      `}</style>
      <div className="table-container">
        <table className="data-table" style={style} {...attributes}>
          {children}
        </table>
      </div>
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
      <style href="table-row" precedence="medium">{`
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
      <style href="table-cell" precedence="medium">{`
        .table-cell {
          padding: ${element.header ? "0.875rem 1rem" : "1rem"};
          text-align: left;
          color: ${element.header ? theme.textSecondary : theme.text};
          font-size: ${element.header ? "0.813rem" : "0.875rem"};
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

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: ${theme.backgroundSecondary};
          color: ${theme.primary};
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .table-cell {
            padding: 0.75rem;
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
