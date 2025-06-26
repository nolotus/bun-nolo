// chat/web/AttachmentsPreview.tsx
import React, { useState, useCallback, memo } from "react";
import { XIcon, TrashIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import ImagePreviewModal from "./ImagePreviewModal";
import { FileItem } from "chat/messages/web/FileItem"; // 使用共用组件
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

// 图片预览项组件
const ImageItem = memo(({ image, index, isMobile, onPreview, onRemove }) => {
  const handlePreview = useCallback(
    () => onPreview(image.url),
    [image.url, onPreview]
  );
  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      onRemove(image.id);
    },
    [image.id, onRemove]
  );

  return (
    <div className={`attachment-item image-item ${isMobile ? "mobile" : ""}`}>
      <img
        src={image.url}
        alt={`预览图片 ${index + 1}`}
        className="image-content"
        onClick={handlePreview}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePreview();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`点击查看大图 ${index + 1}`}
      />
      <button
        type="button"
        onClick={handleRemove}
        className={`remove-button ${isMobile ? "mobile" : ""}`}
        aria-label={`删除图片 ${index + 1}`}
        title={`删除图片 ${index + 1}`}
      >
        {isMobile ? <TrashIcon size={10} /> : <XIcon size={8} />}
      </button>
    </div>
  );
});

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

  const handleRemoveFile = useCallback(
    (id: string) => {
      dispatch(removePendingFile(id));
    },
    [dispatch]
  );

  const handlePreviewImage = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseImagePreview = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const hasAttachments = imagePreviews.length > 0 || pendingFiles.length > 0;
  if (!hasAttachments) return null;

  return (
    <>
      <style href="attachments-preview" precedence="medium">{`
        .attachments-preview {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[2]};
          margin-bottom: ${theme.space[3]};
          align-items: flex-start;
        }

        .attachment-item {
          position: relative;
          transition: transform 0.2s ease;
          max-width: 120px;
        }

        .attachment-item:hover:not(.processing):not(.error) {
          transform: translateY(-1px);
        }

        .attachment-item.mobile {
          max-width: 110px;
        }

        /* 图片样式 */
        .image-content {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: ${theme.space[2]};
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s ease;
          display: block;
        }

        .image-content:hover {
          border-color: ${theme.primary};
          transform: scale(1.05);
        }

        .image-content:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        /* 删除按钮样式 */
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
          transition: all 0.15s ease;
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

        .remove-button.mobile {
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          opacity: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          border-width: 1.5px;
        }

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

        .remove-button:focus-visible {
          opacity: 1;
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
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
          .attachment-item:hover,
          .image-content:hover {
            transform: none;
          }
        }

        /* 响应式调整 */
        @media (max-width: 768px) {
          .attachments-preview {
            gap: ${theme.space[1]};
          }
        }

        /* 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .attachment-item,
          .image-content,
          .remove-button {
            transition: none;
          }
          .attachment-item:hover,
          .image-content:hover,
          .remove-button:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="attachments-preview">
        {/* 图片预览 */}
        {imagePreviews.map((image, index) => (
          <ImageItem
            key={image.id}
            image={image}
            index={index}
            isMobile={isMobile}
            onPreview={handlePreviewImage}
            onRemove={onRemoveImage}
          />
        ))}

        {/* 文件预览 - 使用共用 FileItem 组件 */}
        {pendingFiles.map((file) => {
          const isProcessing = processingFiles.has(file.id);

          return (
            <div
              key={file.id}
              className={`attachment-item file-item ${isMobile ? "mobile" : ""} ${isProcessing ? "processing" : ""} ${file.error ? "error" : ""}`}
            >
              <FileItem
                file={file}
                variant="attachment"
                isMobile={isMobile}
                isProcessing={isProcessing}
                error={file.error}
                onPreview={() =>
                  !isProcessing && !file.error && onPreviewFile(file)
                }
              />

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

export default memo(AttachmentsPreview);
