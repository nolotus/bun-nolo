// chat/web/MessageInput/AttachmentsPreview.tsx
import React, { useState } from "react";
import { FaFileExcel, FaFileWord, FaFilePdf, FaFileAlt } from "react-icons/fa";
import { XIcon, TrashIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import ImagePreviewModal from "./ImagePreviewModal";
import type { PendingFile } from "../dialog/dialogSlice";
import { removePendingFile } from "../dialog/dialogSlice";

export interface PendingImagePreview {
  id: string;
  url: string;
}

interface AttachmentsPreviewProps {
  imagePreviews: PendingImagePreview[];
  pendingFiles: (PendingFile & { error?: string })[];
  onRemoveImage: (id: string) => void;
  onPreviewFile: (file: PendingFile) => void;
  processingFiles?: Set<string>;
  isMobile?: boolean;
}

const FILE_TYPE_CONFIG = {
  excel: { icon: FaFileExcel, color: "#1D6F42", ext: "Excel" },
  docx: { icon: FaFileWord, color: "#2B579A", ext: "Word" },
  pdf: { icon: FaFilePdf, color: "#DC3545", ext: "PDF" },
  txt: { icon: FaFileAlt, color: "#6c757d", ext: "文本" },
  page: { icon: FaFileWord, color: "#FF9500", ext: "Page" },
} as const;

const AttachmentsPreview: React.FC<AttachmentsPreviewProps> = ({
  imagePreviews,
  pendingFiles,
  onRemoveImage,
  onPreviewFile,
  processingFiles = new Set(),
  isMobile = false,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleRemoveFile = (id: string) => {
    dispatch(removePendingFile(id));
  };

  const handlePreviewImage = (url: string) => {
    setSelectedImage(url);
  };

  const handleCloseImagePreview = () => {
    setSelectedImage(null);
  };

  // 截断文件名函数
  const truncateFileName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - ext!.length - 4
    );
    return `${truncatedName}...${ext}`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const hasAttachments = imagePreviews.length > 0 || pendingFiles.length > 0;
  if (!hasAttachments) return null;

  return (
    <>
      <style href="attachments-preview" precedence="medium">{`
        /* 基础布局 */
        .attachments-preview {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[2]};
          padding: 0;
          margin-bottom: ${theme.space[3]};
          align-items: flex-start;
        }

        .attachment-item {
          position: relative;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 120px;
        }

        .attachment-item:hover:not(.processing):not(.error) {
          transform: translateY(-1px);
        }

        .attachment-item.mobile {
          max-width: 110px;
        }

        .attachment-content {
          border-radius: ${theme.space[2]};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid ${theme.border};
          background: ${theme.background};
          position: relative;
          overflow: hidden;
        }

        .attachment-content:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 1px;
        }

        /* 图片样式 */
        .image-content {
          width: 40px;
          height: 40px;
          object-fit: cover;
          display: block;
        }

        .attachment-item.mobile .image-content {
          width: 44px;
          height: 44px;
        }

        .image-content:hover:not(.processing) {
          border-color: ${theme.primary};
          transform: scale(1.05);
        }

        /* 文件样式 */
        .file-content {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]};
          min-height: 40px;
          width: fit-content;
        }

        .attachment-item.mobile .file-content {
          min-height: 44px;
          padding: ${theme.space[2]} ${theme.space[3]};
        }

        .file-icon-wrapper {
          width: 20px;
          height: 20px;
          border-radius: ${theme.space[1]};
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(from var(--file-color) r g b / 0.1);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .file-icon {
          color: var(--file-color);
          transition: all 0.2s ease;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
          flex: 1;
        }

        .file-name {
          font-size: 0.7rem;
          font-weight: 500;
          color: ${theme.text};
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 70px;
        }

        .attachment-item.mobile .file-name {
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
          line-height: 1;
        }

        .attachment-item.mobile .file-ext {
          font-size: 0.65rem;
        }

        .file-size {
          font-size: 0.55rem;
          color: ${theme.textQuaternary};
          background: ${theme.backgroundTertiary};
          padding: 1px 4px;
          border-radius: 2px;
          white-space: nowrap;
        }

        .attachment-item.mobile .file-size {
          font-size: 0.6rem;
        }

        /* 悬停效果 */
        .file-content:hover:not(.processing):not(.error) {
          border-color: var(--file-color);
          background: ${theme.backgroundSecondary};
          transform: scale(1.02);
        }

        .file-content:hover:not(.processing):not(.error) .file-icon-wrapper {
          background: var(--file-color);
          transform: scale(1.1);
        }

        .file-content:hover:not(.processing):not(.error) .file-icon {
          color: white;
        }

        .file-content:hover:not(.processing):not(.error) .file-ext {
          color: var(--file-color);
        }

        /* 处理中状态 */
        .attachment-item.processing {
          opacity: 0.7;
        }

        .attachment-item.processing .attachment-content {
          cursor: wait;
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
        .attachment-item.error .attachment-content {
          border-color: ${theme.error};
          background: rgba(from ${theme.error} r g b / 0.05);
          cursor: not-allowed;
        }

        .attachment-item.error .file-icon-wrapper {
          background: rgba(from ${theme.error} r g b / 0.1);
        }

        .attachment-item.error .file-icon {
          color: ${theme.error};
        }

        .error-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          z-index: 1;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }

        /* 删除按钮 - 桌面端（悬停显示） */
        .remove-button {
          position: absolute;
          border-radius: 50%;
          background: ${theme.error};
          color: white;
          border: 1px solid ${theme.background};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .remove-button:not(.mobile) {
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          opacity: 0;
        }

        /* 移动端删除按钮（始终可见） */
        .remove-button.mobile {
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          border-width: 1.5px;
        }

        /* 桌面端悬停显示删除按钮 */
        .attachment-item:hover .remove-button:not(.mobile):not(:disabled) {
          opacity: 1;
        }

        .remove-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }

        .remove-button:hover:not(:disabled) {
          transform: scale(1.1);
          background: #dc2626;
        }

        .remove-button.mobile:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(220, 38, 38, 0.4);
        }

        .remove-button:focus {
          opacity: 1;
          outline: 1px solid ${theme.primary};
          outline-offset: 1px;
        }

        .remove-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .remove-button:not(.mobile) {
            opacity: 1;
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
          }

          .attachment-item:hover {
            transform: none;
          }

          .attachment-content:hover,
          .image-content:hover,
          .file-content:hover {
            transform: none;
          }
        }

        /* 响应式调整 */
        @media (max-width: 768px) {
          .attachments-preview {
            gap: ${theme.space[1]};
          }

          .processing-indicator,
          .error-indicator {
            top: 2px;
            right: 2px;
          }

          .processing-indicator {
            width: 10px;
            height: 10px;
          }

          .spinner {
            border-width: 1px;
          }
        }

        /* 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .attachment-item,
          .attachment-content,
          .file-icon-wrapper,
          .file-icon,
          .remove-button,
          .spinner {
            transition: none;
            animation: none;
          }
          
          .attachment-item:hover,
          .attachment-content:hover,
          .image-content:hover,
          .file-content:hover .file-icon-wrapper,
          .remove-button:hover {
            transform: none;
          }

          .spinner {
            border: 2px solid ${theme.primary};
            border-radius: 50%;
          }
        }

        /* 高对比度 */
        @media (prefers-contrast: high) {
          .attachment-content {
            border-width: 2px;
          }
          
          .file-name {
            font-weight: 600;
          }
          
          .remove-button {
            border-width: 2px;
          }

          .remove-button.mobile {
            border-width: 2px;
          }

          .file-size {
            border: 1px solid ${theme.border};
          }
        }

        /* 焦点增强 */
        .attachment-content:focus-visible {
          box-shadow: 0 0 0 3px rgba(from ${theme.primary} r g b / 0.3);
        }

        .remove-button:focus-visible {
          box-shadow: 
            0 0 0 2px ${theme.background},
            0 0 0 4px ${theme.primary};
        }
      `}</style>

      <div className="attachments-preview">
        {/* 图片预览 */}
        {imagePreviews.map((image, index) => (
          <div
            key={image.id}
            className={`attachment-item image-item ${isMobile ? "mobile" : ""}`}
          >
            <img
              src={image.url}
              alt={`预览图片 ${index + 1}`}
              className="attachment-content image-content"
              onClick={() => handlePreviewImage(image.url)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePreviewImage(image.url);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`点击查看大图 ${index + 1}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(image.id);
              }}
              className={`remove-button ${isMobile ? "mobile" : ""}`}
              aria-label={`删除图片 ${index + 1}`}
              title={`删除图片 ${index + 1}`}
            >
              {isMobile ? <TrashIcon size={10} /> : <XIcon size={8} />}
            </button>
          </div>
        ))}

        {/* 文件预览 */}
        {pendingFiles.map((file, index) => {
          const config =
            FILE_TYPE_CONFIG[file.type as keyof typeof FILE_TYPE_CONFIG];
          if (!config) return null;

          const IconComponent = config.icon;
          const truncatedName = truncateFileName(file.name);
          const isProcessing = processingFiles.has(file.id);
          const hasError = !!file.error;

          return (
            <div
              key={file.id}
              className={`attachment-item file-item ${isMobile ? "mobile" : ""} ${isProcessing ? "processing" : ""} ${hasError ? "error" : ""}`}
              style={{ "--file-color": config.color } as React.CSSProperties}
            >
              <div
                className="attachment-content file-content"
                onClick={() =>
                  !isProcessing && !hasError && onPreviewFile(file)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isProcessing && !hasError) {
                      onPreviewFile(file);
                    }
                  }
                }}
                tabIndex={isProcessing || hasError ? -1 : 0}
                role="button"
                aria-label={`点击预览文件 ${file.name}`}
                title={`${file.name}${file.size ? ` (${formatFileSize(file.size)})` : ""}${hasError ? `\n错误: ${file.error}` : ""}`}
              >
                <div className="file-icon-wrapper">
                  <IconComponent size={14} className="file-icon" />
                </div>

                <div className="file-info">
                  <span className="file-name">{truncatedName}</span>
                  <div className="file-meta">
                    <span className="file-ext">{config.ext}</span>
                    {file.size && (
                      <span className="file-size">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                </div>

                {isProcessing && (
                  <div className="processing-indicator" aria-label="处理中">
                    <div className="spinner" />
                  </div>
                )}

                {hasError && (
                  <div
                    className="error-indicator"
                    title={file.error || "处理失败"}
                    aria-label="处理失败"
                  >
                    ⚠️
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(file.id);
                }}
                className={`remove-button ${isMobile ? "mobile" : ""}`}
                disabled={isProcessing}
                aria-label={`删除文件 ${file.name}`}
                title={`删除文件 ${file.name}`}
              >
                {isMobile ? <TrashIcon size={10} /> : <XIcon size={8} />}
              </button>
            </div>
          );
        })}
      </div>

      <ImagePreviewModal
        imageUrl={selectedImage}
        onClose={handleCloseImagePreview}
        alt="放大预览图片"
      />
    </>
  );
};

export default AttachmentsPreview;
