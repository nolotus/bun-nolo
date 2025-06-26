// chat/web/shared/FileItem.tsx (更新版本)
import React, { memo } from "react";
import { FaFileExcel, FaFileWord, FaFilePdf, FaFileAlt } from "react-icons/fa";
import { useTheme } from "app/theme";

const FILE_TYPE_CONFIG = {
  excel: { icon: FaFileExcel, color: "#1D6F42", ext: "Excel" },
  docx: { icon: FaFileWord, color: "#2B579A", ext: "Word" },
  pdf: { icon: FaFilePdf, color: "#DC3545", ext: "PDF" },
  txt: { icon: FaFileAlt, color: "#6c757d", ext: "文本" },
  page: { icon: FaFileWord, color: "#FF9500", ext: "Page" },
};

export const FileItem = memo(
  ({
    file,
    variant = "message", // "message" | "attachment"
    onPreview,
    isProcessing = false,
    error,
    isMobile = false,
  }) => {
    const theme = useTheme();
    const config = FILE_TYPE_CONFIG[file.type];
    if (!config) return null;

    const IconComponent = config.icon;
    const isAttachment = variant === "attachment";

    // 文件名截断（仅附件模式）
    const truncateFileName = (name, maxLength = 12) => {
      if (!isAttachment || name.length <= maxLength) return name;
      const ext = name.split(".").pop();
      const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
      const truncatedName = nameWithoutExt.substring(
        0,
        maxLength - ext.length - 4
      );
      return `${truncatedName}...${ext}`;
    };

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return "";
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const displayName = truncateFileName(file.name);
    const hasError = !!error;

    return (
      <>
        <div
          className={`file-item-content ${variant} ${isProcessing ? "processing" : ""} ${hasError ? "error" : ""} ${isMobile ? "mobile" : ""}`}
          style={{ "--file-color": config.color }}
          onClick={() => !isProcessing && !hasError && onPreview?.(file)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isProcessing && !hasError) onPreview?.(file);
            }
          }}
          role="button"
          tabIndex={isProcessing || hasError ? -1 : 0}
        >
          <div className="file-icon-wrapper">
            <IconComponent
              size={isAttachment ? 14 : 16}
              className="file-icon"
            />
          </div>

          {isAttachment ? (
            <div className="file-info">
              <span className="file-name">{displayName}</span>
              <div className="file-meta">
                <span className="file-ext">{config.ext}</span>
                {file.size && (
                  <span className="file-size">{formatFileSize(file.size)}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="file-name">{file.name || "未知文件"}</span>
          )}

          {/* 处理中指示器 - 仅附件模式显示 */}
          {isAttachment && isProcessing && (
            <div className="processing-indicator">
              <div className="spinner" />
            </div>
          )}

          {/* 错误指示器 - 仅附件模式显示 */}
          {isAttachment && hasError && (
            <div className="error-indicator" title={error}>
              ⚠️
            </div>
          )}
        </div>

        <style href="file-item-shared" precedence="medium">{`
        .file-item-content {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--file-color, ${theme.textSecondary});
          border-radius: ${theme.space[2]};
          position: relative;
          font-weight: 500;
          border: 1px solid ${theme.border};
          background: ${theme.background};
        }

        /* 消息模式样式 */
        .file-item-content.message {
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          font-size: 14px;
          max-width: 280px;
        }

        /* 附件模式样式 */
        .file-item-content.attachment {
          gap: ${theme.space[2]};
          padding: ${theme.space[2]};
          width: fit-content;
          max-width: 120px;
          min-height: 44px;
        }

        .file-item-content.attachment.mobile {
          max-width: 110px;
          padding: ${theme.space[2]} ${theme.space[3]};
        }

        .file-item-content:hover:not(.processing):not(.error) {
          background: ${theme.backgroundHover};
          transform: translateY(-1px);
          border-color: var(--file-color);
        }

        .file-item-content.attachment:hover:not(.processing):not(.error) {
          transform: scale(1.02);
        }

        .file-item-content:focus-visible {
          outline: 2px solid ${theme.primary}40;
          outline-offset: 2px;
        }

        .file-icon-wrapper {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .file-item-content.attachment .file-icon-wrapper {
          width: 20px;
          height: 20px;
          border-radius: ${theme.space[1]};
          background: rgba(from var(--file-color) r g b / 0.1);
        }

        .file-icon {
          color: var(--file-color);
        }

        .file-item-content:hover:not(.processing):not(.error) .file-icon-wrapper {
          background: var(--file-color);
          transform: scale(1.1);
        }

        .file-item-content:hover:not(.processing):not(.error) .file-icon {
          color: white;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
          flex: 1;
        }

        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .file-item-content.message .file-name {
          font-size: 14px;
        }

        .file-item-content.attachment .file-name {
          font-size: 0.7rem;
          line-height: 1.2;
          max-width: 70px;
        }

        .file-item-content.attachment.mobile .file-name {
          font-size: 0.75rem;
          max-width: 60px;
        }

        .file-meta {
          display: flex;
          gap: ${theme.space[1]};
          align-items: center;
        }

        .file-ext {
          font-size: 0.6rem;
          color: ${theme.textTertiary};
          font-weight: 400;
        }

        .file-size {
          font-size: 0.55rem;
          color: ${theme.textQuaternary};
          background: ${theme.backgroundTertiary};
          padding: 1px 4px;
          border-radius: 2px;
          white-space: nowrap;
        }

        /* 处理中状态 */
        .file-item-content.processing {
          opacity: 0.7;
          pointer-events: none;
        }

        .processing-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 12px;
          height: 12px;
          z-index: 1;
        }

        .spinner {
          width: 100%;
          height: 100%;
          border: 1.5px solid ${theme.primary};
          border-top: 1.5px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 错误状态 */
        .file-item-content.error {
          border-color: ${theme.error};
          background: rgba(from ${theme.error} r g b / 0.05);
          pointer-events: none;
        }

        .error-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .file-item-content.message {
            max-width: 200px;
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .file-item-content,
          .file-icon-wrapper,
          .spinner {
            transition: none;
            animation: none;
          }
          .file-item-content:hover .file-icon-wrapper {
            transform: none;
          }
          .spinner {
            border: 2px solid ${theme.primary};
          }
        }
      `}</style>
      </>
    );
  }
);

export default FileItem;
