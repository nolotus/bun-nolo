// ImagePreviewModal.tsx
import { useTheme } from "app/theme";
import React from "react";
import { BaseModal } from "render/web/ui/BaseModal";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onClose,
  alt = "放大预览",
}) => {
  const theme = useTheme();

  return (
    <>
      <BaseModal
        isOpen={!!imageUrl}
        onClose={onClose}
        className="image-preview-modal"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={alt}
            className="preview-modal-image"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              }
            }}
          />
        )}
      </BaseModal>

      <style href="image-preview-modal" precedence="medium">{`
        .preview-modal-image {
          max-width: 92vw;
          max-height: 88vh;
          object-fit: contain;
          border-radius: ${theme.space[3]};
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .preview-modal-image {
            max-width: 95vw;
            max-height: 85vh;
            border-radius: ${theme.space[2]};
          }
        }

        /* 减少动画偏好设置 */
        @media (prefers-reduced-motion: reduce) {
          .preview-modal-image {
            transition: none;
          }
        }

        /* 打印样式 */
        @media print {
          .image-preview-modal {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default ImagePreviewModal;
