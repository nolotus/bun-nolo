// render/web/ui/Table.tsx
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
          border-radius: ${theme.space[2]};
          margin: ${theme.space[3]} 0;
          max-width: 100%;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: ${theme.background};
          border-radius: ${theme.space[2]};
          border: 1px solid ${theme.border};
          overflow: hidden;
          font-size: 0.875rem;
          line-height: 1.65;
          font-family: system-ui, -apple-system, sans-serif;
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
          transition: background-color 0.15s ease;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .table-row:hover {
          background: ${theme.backgroundHover};
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
          padding: ${theme.space[3]} ${theme.space[4]};
          text-align: left;
          color: ${theme.text};
          font-size: 0.875rem;
          line-height: 1.65;
          vertical-align: top;
          word-wrap: break-word;
          hyphens: auto;
        }

        .table-header {
          background: ${theme.backgroundSecondary};
          font-weight: 550;
          color: ${theme.textSecondary};
          font-size: 0.8125rem;
          padding: ${theme.space[2]} ${theme.space[4]};
          border-bottom: 1px solid ${theme.border};
          position: sticky;
          top: 0;
          z-index: 1;
        }

        /* 减少内部段落间距 */
        .table-cell p {
          margin: 0;
        }
        
        .table-cell p:not(:last-child) {
          margin-bottom: ${theme.space[1]};
        }

        /* 代码在表格中的样式 */
        .table-cell code {
          font-size: 0.8125em;
          padding: 1px ${theme.space[1]};
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
