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

// 获取文件类型样式，使用主题变量
const getFileTypeStyle = (fileType: string, theme) => {
  switch (fileType) {
    case "pdf":
      return {
        background: theme.errorLight || "rgba(239, 68, 68, 0.15)",
        color: theme.error || "rgb(239, 68, 68)",
      };
    case "doc":
    case "docx":
      return {
        background: theme.primaryLight,
        color: theme.primary,
      };
    case "xls":
    case "xlsx":
      return {
        background: "rgba(16, 185, 129, 0.15)",
        color: "rgb(16, 185, 129)",
      };
    case "md":
    case "markdown":
      return {
        background: "rgba(139, 92, 246, 0.15)",
        color: "rgb(139, 92, 246)",
      };
    case "txt":
      return {
        background: "rgba(245, 158, 11, 0.15)",
        color: "rgb(245, 158, 11)",
      };
    default:
      return {
        background: theme.backgroundTertiary,
        color: theme.textSecondary,
      };
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
            gap: ${theme.space[4]};
            padding: ${theme.space[5]};
          }

          .file-skeleton {
            background: ${theme.backgroundSecondary};
            border-radius: 12px;
            padding: ${theme.space[4]};
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
            margin-right: ${theme.space[4]};
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
            margin-bottom: ${theme.space[2]};
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
              <FaFileImport style={{ marginRight: theme.space[2] }} />
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
            <div
              className="file-type-icon"
              style={getFileTypeStyle(file.type, theme)}
            >
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
          gap: ${theme.space[4]};
          padding: ${theme.space[5]};
        }

        .file-list {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
          padding: ${theme.space[5]};
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
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .file-card-header {
          padding: ${theme.space[4]};
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
          gap: ${theme.space[2]};
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
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .action-button.delete:hover {
          background: ${theme.errorLight || "rgba(220, 38, 38, 0.1)"};
          color: ${theme.error || "rgba(220, 38, 38, 1)"};
        }

        .file-card-body {
          padding: ${theme.space[4]};
        }

        .file-name {
          font-size: 15px;
          font-weight: 500;
          color: ${theme.text};
          margin: 0 0 ${theme.space[2]} 0;
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

          .file-actions {
            gap: ${theme.space[1]};
          }

          .action-button {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default FileList;
