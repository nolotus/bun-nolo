import React from "react";
import { Path } from "slate";
import { ColumnResizer } from "create/editor/ColumnResizer";
import {
  SlateTable,
  SlateTableCell as SlateTableCellType,
} from "create/editor/transforms/fromMarkdown/table";

// --- 通用 Props 定义 ---

interface TableBaseProps {
  attributes?: any;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// --- Table 组件 (已优化，保持不变) ---

interface TableProps extends TableBaseProps {
  element: SlateTable;
  path: Path;
}

export const Table: React.FC<TableProps> = ({
  attributes,
  children,
  element,
  style,
}) => {
  const { columns = [] } = element || {};

  return (
    <>
      <style href="table-container" precedence="high">{`
        .table-container {
          overflow-x: auto;
          margin: var(--space-4) 0;
          max-width: 100%;
        }

        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid var(--border);
          border-radius: var(--space-2);
          overflow: hidden;
          background: var(--background);
          font-size: 0.875rem;
          line-height: 1.65;
          font-family: system-ui, -apple-system, sans-serif;
          table-layout: fixed;
        }
      `}</style>
      <div className="table-container">
        <table className="data-table" style={style} {...attributes}>
          <colgroup>
            {columns.map((col, index) => (
              <col
                key={index}
                style={{ width: col.width ? `${col.width}px` : "auto" }}
              />
            ))}
          </colgroup>
          {children}
        </table>
      </div>
    </>
  );
};

// --- TableRow 组件 (保持不变) ---

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

// --- TableCell 组件 (已优化) ---

interface TableCellProps extends TableBaseProps {
  element: SlateTableCellType;
  path: Path;
  isFirstRow: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  attributes,
  children,
  element,
  path,
  isFirstRow,
  style,
}) => {
  const Component = element.header ? "th" : "td";

  // --- 关键改动: 添加卫语句 (Guard Clause) ---
  // 在使用 path 之前，先检查它是否存在且是一个有效的数组。
  // 如果 path 无效，我们将无法计算列索引和表格路径。
  // 此时，渲染一个不带 ColumnResizer 的基础单元格，以避免程序崩溃。
  // 这样可以优雅地处理异常情况，增强组件的健壮性。
  const isPathInvalid = !path || !Array.isArray(path) || path.length < 2;

  const columnIndex = isPathInvalid ? 0 : path[path.length - 1];
  const tablePath = isPathInvalid ? [] : path.slice(0, -2);

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
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
          position: relative; 
        }

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
        {/* 现在，只有在 path 有效且是第一行时，才渲染调整器 */}
        {isFirstRow && !isPathInvalid && (
          <ColumnResizer columnIndex={columnIndex} tablePath={tablePath} />
        )}
      </Component>
    </>
  );
};
