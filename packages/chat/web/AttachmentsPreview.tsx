// AttachmentsPreview.tsx - 修改后版本
import React, { useState, useCallback, memo } from "react";
import { XIcon, TrashIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/store";
import ImagePreviewModal from "./ImagePreviewModal";
import { FileItem } from "chat/messages/web/FileItem";
import type { PendingFile } from "../dialog/dialogSlice";
import { removePendingFile } from "../dialog/dialogSlice";
import DocxPreviewDialog from "render/web/DocxPreviewDialog";

export interface PendingImagePreview {
  id: string;
  url: string;
}

interface AttachmentsPreviewProps {
  imagePreviews: PendingImagePreview[];
  pendingFiles: (PendingFile & { error?: string })[];
  onRemoveImage: (id: string) => void;
  processingFiles?: Set<string>;
  isMobile?: boolean;
}

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
  processingFiles = new Set(),
  isMobile = false,
}) => {
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PendingFile | null>(null);

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

  const handlePreviewFile = useCallback((file: PendingFile) => {
    setPreviewFile(file);
  }, []);

  const handleCloseFilePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const hasAttachments = imagePreviews.length > 0 || pendingFiles.length > 0;
  if (!hasAttachments) return null;

  return (
    <>
      <style href="attachments-preview-fixed" precedence="high">{`
        .attachments-preview {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
        }

        .attachment-item {
          position: relative;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          max-width: 120px;
        }

        .attachment-item:hover:not(.processing):not(.error) {
          transform: translateY(-1px);
        }

        .attachment-item.mobile {
          max-width: 110px;
        }

        .image-content {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: block;
        }

        .image-content:hover {
          border-color: var(--primary);
          transform: scale(1.05);
          box-shadow: 0 4px 12px var(--shadowMedium);
        }

        .image-content:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
          border-color: var(--primary);
        }

        .remove-button {
          position: absolute;
          border-radius: 50%;
          background: var(--error);
          color: white;
          border: 1px solid var(--background);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2;
          box-shadow: 0 2px 4px var(--shadowMedium);
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
          width: 26px;
          height: 26px;
          opacity: 1;
          box-shadow: 0 2px 8px var(--shadowHeavy);
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
          box-shadow: 0 4px 12px var(--shadowHeavy);
        }

        .remove-button:focus-visible {
          opacity: 1;
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        .remove-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .attachments-preview {
            gap: var(--space-1);
            justify-content: flex-start;
            align-items: flex-start;
            overflow-x: visible;
          }

          .attachment-item {
            min-width: 44px;
          }

          .attachment-item.mobile {
            max-width: 100px;
          }

          .remove-button.mobile {
            width: 28px;
            height: 28px;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .remove-button:not(.mobile) {
            opacity: 1;
            top: -6px;
            right: -6px;
            width: 22px;
            height: 22px;
          }

          .attachment-item:hover,
          .image-content:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .image-content {
            border-width: 2px;
          }

          .remove-button {
            border-width: 2px;
          }
        }

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

        .attachment-item.error {
          opacity: 0.7;
        }

        .attachment-item.error .image-content {
          border-color: var(--error);
        }

        .attachment-item.processing {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>

      <div className="attachments-preview" role="group" aria-label="附件预览">
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

        {pendingFiles.map((file) => {
          const isProcessing = processingFiles.has(file.id);

          return (
            <div
              key={file.id}
              className={`attachment-item file-item ${isMobile ? "mobile" : ""} ${isProcessing ? "processing" : ""} ${file.error ? "error" : ""}`}
              role="group"
              aria-label={`文件附件 ${file.name}`}
            >
              <FileItem
                file={file}
                variant="attachment"
                isMobile={isMobile}
                isProcessing={isProcessing}
                error={file.error}
                onPreview={() =>
                  !isProcessing && !file.error && handlePreviewFile(file)
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

      {previewFile && (
        <DocxPreviewDialog
          isOpen={!!previewFile}
          onClose={handleCloseFilePreview}
          pageKey={previewFile.pageKey}
          fileName={previewFile.name}
        />
      )}
    </>
  );
};

export default memo(AttachmentsPreview);
