import React from "react";

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
  return (
    <>
      {/* 
        我们不再需要在容器上设置边框了，
        所有的边框逻辑都交由 <table> 自身处理。
      */}
      <style href="table-container" precedence="high">{`
        .table-container {
          overflow-x: auto;
          margin: var(--space-4) 0;
          max-width: 100%;
        }

        .data-table {
          width: 100%;
          /* 关键改动 (1): 切换到 separate 模式以启用 border-radius */
          border-collapse: separate;
          /* 关键改动 (2): 移除单元格间距 */
          border-spacing: 0;
          /* 关键改动 (3): 表格自身拥有边框和圆角 */
          border: 1px solid var(--border);
          border-radius: var(--space-2);
          overflow: hidden; /* 确保子元素被剪裁以适应圆角 */
          
          background: var(--background);
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
  return (
    <>
      <style href="table-row" precedence="high">{`
        .table-row {
          transition: background-color 0.15s ease;
        }
        /* 关键改动 (4): 移除最后一行的下边框，避免与 table 的外框重叠 */
        .table-row:last-child .table-cell {
          border-bottom: none;
        }
        .table-row:hover {
          background: var(--backgroundHover);
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
  const Component = element.header ? "th" : "td";

  return (
    <>
      <style href="table-cell" precedence="high">{`
        .table-cell {
          padding: var(--space-3) var(--space-4);
          text-align: left;
          color: var(--text);
          font-size: 0.875rem;
          line-height: 1.65;
          vertical-align: top;
          word-wrap: break-word;
          hyphens: auto;
          
          /* 关键改动 (5): 为每个单元格绘制下边框和右边框 */
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }

        /* 关键改动 (6): 移除最后一列的右边框，避免与 table 的外框重叠 */
        .table-cell:last-child {
          border-right: none;
        }

        .table-header {
          background: var(--backgroundSecondary);
          font-weight: 550;
          color: var(--textSecondary);
          font-size: 0.8125rem;
          padding: var(--space-2) var(--space-4);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .table-cell p {
          margin: 0;
        }
        
        .table-cell p:not(:last-child) {
          margin-bottom: var(--space-1);
        }

        .table-cell code {
          font-size: 0.8125em;
          padding: 1px var(--space-1);
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
