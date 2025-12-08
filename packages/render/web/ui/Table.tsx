import React, { useState, useCallback, useMemo } from "react";
import { Path } from "slate";
import { ColumnResizer } from "create/editor/ColumnResizer";
import {
  SlateTable,
  SlateTableCell as SlateTableCellType,
} from "create/editor/transforms/fromMarkdown/table";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { LuDownload, LuFileText, LuTable } from "react-icons/lu";

// --- 通用 Props 定义 ---

interface TableBaseProps {
  attributes?: any;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// --- 导出功能相关函数 ---
const extractTableData = (tableElement: SlateTable) => {
  if (!tableElement?.children) return null;

  const headers: string[] = [];
  const rows: string[][] = [];

  tableElement.children.forEach((row: any, rowIndex: number) => {
    if (!row.children) return;

    const rowData: string[] = [];
    row.children.forEach((cell: any) => {
      // 提取单元格文本内容
      const cellText =
        cell.children
          ?.map((child: any) => {
            if (child.text) return child.text;
            if (child.children) {
              return child.children
                .map((grandChild: any) => grandChild.text || "")
                .join("");
            }
            return "";
          })
          .join("")
          .trim() || "";

      if (rowIndex === 0 && cell.header) {
        headers.push(cellText);
      } else {
        rowData.push(cellText);
      }
    });

    if (rowIndex > 0 || !headers.length) {
      rows.push(rowData);
    }
  });

  // 如果没有提取到标题行，使用默认标题
  if (headers.length === 0 && rows.length > 0) {
    const columnCount = Math.max(...rows.map((row) => row.length));
    for (let i = 0; i < columnCount; i++) {
      headers.push(`列 ${i + 1}`);
    }
  }

  return headers.length > 0 ? { headers, rows } : null;
};

const convertToCSV = (headers: string[], rows: string[][]) => {
  const escapeCSV = (str: string) => {
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvHeaders = headers.map(escapeCSV).join(",");
  const csvRows = rows.map((row) =>
    row.map((cell) => escapeCSV(cell || "")).join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
};

const convertToJSON = (headers: string[], rows: string[][]) => {
  const jsonData = rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
  return JSON.stringify(jsonData, null, 2);
};

// --- Table 组件 (增强版) ---

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
  const { t } = useTranslation("chat");
  const { columns = [] } = element || {};
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("csv");

  // 检查是否有可导出的数据
  const tableData = useMemo(() => extractTableData(element), [element]);
  const hasExportableData = Boolean(tableData);

  const handleExport = useCallback(
    (format: string) => {
      if (!tableData) return;

      const { headers, rows } = tableData;
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const baseFileName = `table-export-${timestamp}`;

      if (format === "csv") {
        const csvData = convertToCSV(headers, rows);
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseFileName}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const jsonData = convertToJSON(headers, rows);
        const blob = new Blob([jsonData], {
          type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseFileName}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "xlsx") {
        const jsonData = rows.map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || "";
          });
          return obj;
        });
        const ws = XLSX.utils.json_to_sheet(jsonData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${baseFileName}.xlsx`);
      }

      setShowExportMenu(false);
    },
    [tableData]
  );

  return (
    <>
      <style href="table-container" precedence="high">{`
        .table-container {
          overflow-x: auto;
          margin: var(--space-4) 0;
          max-width: 100%;
          position: relative;
        }

        .table-header-controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: var(--space-2);
          gap: var(--space-2);
        }

        .export-button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--space-1);
          background: var(--backgroundSecondary);
          color: var(--textSecondary);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .export-button:hover {
          background: var(--backgroundHover);
          border-color: var(--borderHover);
          color: var(--text);
        }

        .export-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-menu {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 10;
          min-width: 140px;
          margin-top: var(--space-1);
          padding: var(--space-1);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--space-2);
          box-shadow: var(--shadowMedium);
        }

        .export-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
          border-radius: var(--space-1);
          transition: background-color 0.15s ease;
        }

        .export-option:hover {
          background: var(--backgroundHover);
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

        @media (max-width: 768px) {
          .table-header-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .export-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            right: auto;
            width: 200px;
          }
        }
      `}</style>

      <div className="table-container">
        {hasExportableData && (
          <div className="table-header-controls">
            <div style={{ position: "relative" }}>
              <button
                className="export-button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!hasExportableData}
              >
                <LuDownload size={14} />
                {t("export") || "导出"}
              </button>

              {showExportMenu && (
                <div className="export-menu">
                  <button
                    className="export-option"
                    onClick={() => handleExport("csv")}
                  >
                    <LuFileText size={14} />
                    CSV
                  </button>
                  <button
                    className="export-option"
                    onClick={() => handleExport("json")}
                  >
                    <LuFileText size={14} />
                    JSON
                  </button>
                  <button
                    className="export-option"
                    onClick={() => handleExport("xlsx")}
                  >
                    <LuTable size={14} />
                    XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

      {/* 点击外部关闭菜单 */}
      {showExportMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
          onClick={() => setShowExportMenu(false)}
        />
      )}
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

// --- TableCell 组件 (保持不变) ---

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
        {isFirstRow && !isPathInvalid && (
          <ColumnResizer columnIndex={columnIndex} tablePath={tablePath} />
        )}
      </Component>
    </>
  );
};
