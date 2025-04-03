// ExcelPreview.tsx

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { BaseModal } from "render/web/ui/BaseModal";

import { Table, TableRow, TableCell } from "web/ui/Table";
import { FaFileExcel } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import * as XLSX from "xlsx";

interface ExcelFile {
  id: string;
  name: string;
  data: any[];
}

interface ExcelPreviewProps {
  excelFiles: ExcelFile[];
  onRemove: (id: string) => void;
  onPreview: (id: string) => void;
  previewingFile: ExcelFile | null;
  closePreview: () => void;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  excelFiles,
  onRemove,
  onPreview,
  previewingFile,
  closePreview,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // 用于选择下载的文件格式
  const [selectedFormat, setSelectedFormat] = useState("csv");

  // 获取当前预览文件的列名
  const headers = previewingFile?.data.length
    ? Object.keys(previewingFile.data[0])
    : [];

  // 将数据转换为 CSV 格式（简单实现，有特殊字符时可能需要进一步处理）
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const values = headers.map((header) => {
        let cell = row[header] || "";
        // 如果有需要，可对值中包含的双引号转义
        cell =
          typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell;
        return cell;
      });
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  };

  // 下载文件的处理函数，根据选中的格式生成对应文件
  const handleDownload = useCallback(() => {
    if (!previewingFile) return;
    if (selectedFormat === "csv") {
      const csvData = convertToCSV(previewingFile.data);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = previewingFile.name
        ? `${previewingFile.name}.csv`
        : "data.csv";
      link.click();
      URL.revokeObjectURL(url);
    } else if (selectedFormat === "json") {
      const jsonData = JSON.stringify(previewingFile.data, null, 2);
      const blob = new Blob([jsonData], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = previewingFile.name
        ? `${previewingFile.name}.json`
        : "data.json";
      link.click();
      URL.revokeObjectURL(url);
    } else if (selectedFormat === "xlsx") {
      // 使用 XLSX 库将 JSON 数据转换为工作表，再生成 Excel 文件
      const ws = XLSX.utils.json_to_sheet(previewingFile.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const fileName = previewingFile.name
        ? `${previewingFile.name}.xlsx`
        : "data.xlsx";
      XLSX.writeFile(wb, fileName);
    } else {
      console.warn("未知的文件格式选择：", selectedFormat);
    }
  }, [previewingFile, selectedFormat]);

  return (
    <>
      {/* Excel 文件图标列表 */}
      <div className="excel-files-list">
        {excelFiles.map((file) => (
          <div key={file.id} className="excel-file-item">
            <div
              className="excel-icon-wrapper"
              onClick={() => onPreview(file.id)}
              title={t("clickToPreviewExcel") || "点击预览 Excel"}
            >
              <FaFileExcel size={18} />
              <span className="excel-icon-text">{file.name}</span>
            </div>
            <button
              className="excel-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              title={t("removeFile") || "移除文件"}
            >
              <IoClose size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Excel 预览模态框 */}
      <BaseModal
        isOpen={!!previewingFile}
        onClose={closePreview}
        className="excel-modal"
      >
        {previewingFile && (
          <>
            <div className="modal-header">
              <h4 title={previewingFile.name}>{previewingFile.name}</h4>
              <button className="modal-close-button" onClick={closePreview}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <Table>
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <TableCell key={header} element={{ header: true }}>
                          <div className="header-cell" title={header}>
                            {header}
                          </div>
                        </TableCell>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewingFile.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map((header) => (
                          <TableCell key={header} element={{ header: false }}>
                            <div className="data-cell" title={row[header]}>
                              {String(row[header] || "")}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="modal-footer">
              {/* 下拉菜单选择文件格式 */}
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">XLSX</option>
              </select>
              <button onClick={handleDownload}>
                {t("downloadExcel") || "下载文件"}
              </button>
              <button onClick={closePreview}>
                {t("closePreview") || "关闭预览"}
              </button>
            </div>
          </>
        )}
      </BaseModal>

      <style jsx>{`
        .excel-files-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .excel-file-item {
          position: relative;
          display: flex;
          align-items: center;
        }

        .excel-icon-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 8px;
          cursor: pointer;
          max-width: 250px;
          transition: all 0.2s ease;
        }

        .excel-icon-wrapper:hover {
          background: ${theme.backgroundHover};
          transform: translateY(-1px);
          box-shadow: 0 2px 5px ${theme.shadowLight};
        }

        .excel-icon-text {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .excel-remove-btn {
          position: absolute;
          right: -6px;
          top: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme.dangerLight};
          color: ${theme.danger};
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 1;
        }

        .excel-remove-btn:hover {
          background: ${theme.danger};
          color: white;
          transform: scale(1.1);
        }

        /* 模态框样式优化 */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .modal-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.text};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 90%;
        }

        .modal-close-button {
          border: none;
          background: transparent;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          color: ${theme.textSecondary};
          transition: color 0.2s;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-button:hover {
          color: ${theme.text};
        }

        .modal-body {
          padding: 0;
          max-height: calc(80vh - 120px);
        }

        .table-container {
          overflow: auto;
          max-height: calc(80vh - 130px);
          padding: 0 16px;
        }

        .table-container table {
          width: 100%;
          border-collapse: collapse;
        }

        .header-cell,
        .data-cell {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 8px 12px;
        }

        .modal-footer {
          padding: 12px 16px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          border-top: 1px solid ${theme.borderLight};
          margin-top: 0;
          gap: 10px;
        }

        .modal-footer select {
          padding: 6px 8px;
          border: 1px solid ${theme.borderLight};
          border-radius: 4px;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
        }

        .modal-footer button {
          padding: 8px 16px;
          border: none;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-footer button:hover {
          background: ${theme.backgroundHover};
        }

        @media screen and (max-width: 600px) {
          .excel-icon-text {
            max-width: 140px;
          }

          .excel-icon-wrapper {
            padding: 4px 10px;
          }

          .modal-body {
            max-height: 60vh;
          }

          .header-cell,
          .data-cell {
            max-width: 180px;
            padding: 6px 8px;
            font-size: 13px;
          }

          .table-container {
            max-height: calc(70vh - 100px);
          }
        }
      `}</style>
    </>
  );
};

export default ExcelPreview;
