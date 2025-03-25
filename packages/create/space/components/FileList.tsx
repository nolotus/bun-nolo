// create/space/components/FileList.tsx
import React from "react";
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaMarkdown,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTrash,
  FaFileImport,
} from "react-icons/fa";
import { useTheme } from "app/theme";
import EmptyState from "./EmptyState";

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
}

interface FileListProps {
  files: FileItem[];
  onViewFile?: (fileId: number) => void;
  onDownloadFile?: (fileId: number) => void;
  onRemoveFile?: (fileId: number) => void;
  onImportFile?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  gridLayout?: boolean;
}

// 文件图标映射
const fileIconMap = {
  pdf: <FaFilePdf />,
  docx: <FaFileWord />,
  doc: <FaFileWord />,
  xlsx: <FaFileExcel />,
  xls: <FaFileExcel />,
  md: <FaMarkdown />,
  txt: <FaFileAlt />,
  default: <FaFile />,
};

// 文件类型样式映射
const getFileTypeStyle = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return {
        background: "rgba(239, 68, 68, 0.15)",
        color: "rgb(239, 68, 68)",
      }; // 红色
    case "doc":
    case "docx":
      return {
        background: "rgba(37, 99, 235, 0.15)",
        color: "rgb(37, 99, 235)",
      }; // 蓝色
    case "xls":
    case "xlsx":
      return {
        background: "rgba(16, 185, 129, 0.15)",
        color: "rgb(16, 185, 129)",
      }; // 绿色
    case "md":
    case "markdown":
      return {
        background: "rgba(139, 92, 246, 0.15)",
        color: "rgb(139, 92, 246)",
      }; // 紫色
    case "txt":
      return {
        background: "rgba(245, 158, 11, 0.15)",
        color: "rgb(245, 158, 11)",
      }; // 黄色
    default:
      return {
        background: "rgba(107, 114, 128, 0.15)",
        color: "rgb(107, 114, 128)",
      }; // 灰色
  }
};

const FileList: React.FC<FileListProps> = ({
  files,
  onViewFile,
  onDownloadFile,
  onRemoveFile,
  onImportFile,
  emptyTitle = "还没有文件",
  emptyDescription = "上传您的第一个文件开始使用",
  loading = false,
  gridLayout = true,
}) => {
  const theme = useTheme();

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    return fileIconMap[fileType] || fileIconMap.default;
  };

  if (loading) {
    return (
      <div className="files-loading">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="file-skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
        <style jsx>{`
          .files-loading {
            display: grid;
            grid-template-columns: ${gridLayout
              ? "repeat(auto-fill, minmax(280px, 1fr))"
              : "1fr"};
            gap: 16px;
            padding: 20px;
          }

          .file-skeleton {
            background: ${theme.backgroundSecondary};
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
          }

          .skeleton-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(
              90deg,
              ${theme.backgroundTertiary} 25%,
              ${theme.background} 50%,
              ${theme.backgroundTertiary} 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            margin-right: 16px;
            flex-shrink: 0;
          }

          .skeleton-content {
            flex: 1;
          }

          .skeleton-line {
            height: 14px;
            width: 100%;
            background: linear-gradient(
              90deg,
              ${theme.backgroundTertiary} 25%,
              ${theme.background} 50%,
              ${theme.backgroundTertiary} 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .skeleton-line.short {
            width: 60%;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={<FaFile />}
        title={emptyTitle}
        description={emptyDescription}
        actionText={
          onImportFile && (
            <>
              <FaFileImport style={{ marginRight: "8px" }} />
              导入文件
            </>
          )
        }
        onAction={onImportFile}
        secondaryAction={{
          text: "了解更多",
          onClick: () => window.open("/help/files", "_blank"),
        }}
      />
    );
  }

  return (
    <div className={gridLayout ? "file-grid" : "file-list"}>
      {files.map((file) => (
        <div key={file.id} className="file-card">
          <div className="file-card-header">
            <div className="file-type-icon" style={getFileTypeStyle(file.type)}>
              {getFileIcon(file.type)}
            </div>
            <div className="file-actions">
              {onViewFile && (
                <button
                  className="action-button"
                  title="查看"
                  onClick={() => onViewFile(file.id)}
                >
                  <FaEye />
                </button>
              )}
              {onDownloadFile && (
                <button
                  className="action-button"
                  title="下载"
                  onClick={() => onDownloadFile(file.id)}
                >
                  <FaDownload />
                </button>
              )}
              {onRemoveFile && (
                <button
                  className="action-button delete"
                  title="删除"
                  onClick={() => onRemoveFile(file.id)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
          <div className="file-card-body">
            <h3 className="file-name" title={file.name}>
              {file.name}
            </h3>
            <div className="file-meta">
              <span className="file-size">{file.size}</span>
              <span className="file-date">{file.updatedAt}</span>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 20px;
        }

        .file-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
        }

        .file-card {
          background: ${theme.backgroundSecondary};
          border-radius: 12px;
          overflow: hidden;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .file-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .file-card-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .file-type-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 18px;
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: ${theme.background};
          color: ${theme.textSecondary};
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .action-button.delete:hover {
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 1);
        }

        .file-card-body {
          padding: 16px;
        }

        .file-name {
          font-size: 15px;
          font-weight: 500;
          color: ${theme.text};
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: ${theme.textTertiary};
        }

        @media (max-width: 768px) {
          .file-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FileList;
