import React from "react";
import { Path } from "slate";

// 导入我们创建的列宽调整器组件
import { ColumnResizer } from "create/editor/ColumnResizer";

// 从您的类型定义文件中导入 Slate 节点类型，确保 props 类型安全
// 请确保这个路径是正确的

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

// --- Table 组件 ---

interface TableProps extends TableBaseProps {
  element: SlateTable;
  path: Path; // 表格需要 path 来传递给子组件
}

export const Table: React.FC<TableProps> = ({
  attributes,
  children,
  element,
  style,
}) => {
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
          /* 关键改动: table-layout: fixed 是让列宽生效的前提 */
          table-layout: fixed;
        }
      `}</style>
      <div className="table-container">
        <table className="data-table" style={style} {...attributes}>
          {/* 关键改动: 使用 colgroup 定义每一列的宽度 */}
          <colgroup>
            {element.columns?.map((col, index) => (
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

// --- TableCell 组件 ---

interface TableCellProps extends TableBaseProps {
  element: SlateTableCellType;
  path: Path; // 单元格需要自己的 path 来计算列索引和表格路径
  isFirstRow: boolean; // 需要此属性来判断是否渲染 Resizer
}

export const TableCell: React.FC<TableCellProps> = ({
  attributes,
  children,
  element,
  path,
  isFirstRow, // 使用新 prop
  style,
}) => {
  const Component = element.header ? "th" : "td";
  const columnIndex = path[path.length - 1];
  const tablePath = path.slice(0, -2); // 计算得到父级 table 的路径

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
          
          /* 关键改动: position: relative 是 Resizer 绝对定位的前提 */
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
        {/* 关键改动: 只在第一行的单元格中渲染列宽调整器 */}
        {isFirstRow && (
          <ColumnResizer columnIndex={columnIndex} tablePath={tablePath} />
        )}
      </Component>
    </>
  );
};
