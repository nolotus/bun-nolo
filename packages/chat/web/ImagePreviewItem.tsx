// ImagePreviewItem.tsx
import { useTheme } from "app/theme";
import React from "react";
import { XIcon } from "@primer/octicons-react";

interface ImagePreviewItemProps {
  image: { id: string; url: string };
  index: number;
  onRemove: (id: string) => void;
  onPreview: (url: string) => void;
}

const ImagePreviewItem: React.FC<ImagePreviewItemProps> = ({
  image,
  index,
  onRemove,
  onPreview,
}) => {
  const theme = useTheme();

  return (
    <>
      <div className="preview-item">
        <img
          src={image.url}
          alt={`预览图片 ${index + 1}`}
          className="preview-image"
          onClick={() => onPreview(image.url)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPreview(image.url);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`点击查看大图 ${index + 1}`}
        />
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="remove-button"
          aria-label={`删除图片 ${index + 1}`}
          title={`删除图片 ${index + 1}`}
        >
          <XIcon size={10} />
        </button>
      </div>

      <style href="image-preview-item" precedence="medium">{`
        .preview-item {
          position: relative;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .preview-item:hover {
          transform: translateY(-2px);
        }

        .preview-image {
          width: 60px;
          height: 60px;
          border-radius: ${theme.space[2]};
          object-fit: cover;
          cursor: pointer;
          border: 1px solid ${theme.border};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
        }

        .preview-image:hover {
          border-color: ${theme.primary};
          transform: scale(1.05);
        }

        .preview-image:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .remove-button {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme.error};
          color: white;
          border: 2px solid ${theme.background};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          z-index: 2;
        }

        .preview-item:hover .remove-button {
          opacity: 1;
        }

        .remove-button:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .remove-button:focus {
          opacity: 1;
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .preview-image {
            width: 50px;
            height: 50px;
          }

          .remove-button {
            width: 18px;
            height: 18px;
          }
        }

        @media (min-width: 769px) {
          .preview-image {
            width: 80px;
            height: 80px;
          }
        }

        /* 减少动画偏好设置 */
        @media (prefers-reduced-motion: reduce) {
          .preview-item,
          .preview-image,
          .remove-button {
            transition: none;
          }
          
          .preview-item:hover,
          .preview-image:hover,
          .remove-button:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};
export default ImagePreviewItem;
