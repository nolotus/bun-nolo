import { useTheme } from "app/theme";
import React, { useState } from "react";
import { BaseModal } from "render/web/ui/BaseModal";
import { XIcon } from "@primer/octicons-react";
// 可以选择导入类型，或者直接在 Props 中定义
// import type { PendingImagePreview } from '../dialog/dialogSlice';

// 定义 Props 接口
interface ImagePreviewProps {
  // images prop 现在是包含 id 和 url 的对象数组
  images: { id: string; url: string }[];
  // onRemove 回调接收 id (string) 而不是 index (number)
  onRemove: (id: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  const theme = useTheme();
  // selectedImage 状态仍然可以存储 URL 字符串用于模态框显示
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 使用新的 props 名称检查数组是否为空
  if (images.length === 0) return null;

  return (
    <>
      <div className="image-preview-container">
        {/* 迭代 images 对象数组 */}
        {images.map((image, index) => (
          // 使用 image.id 作为 key
          <div key={image.id} className="preview-item">
            <img
              // 使用 image.url 作为 src
              src={image.url}
              alt={`Preview ${index + 1}`} // alt 文本仍然可以用 index
              className="preview-image"
              // 点击放大时，传递 image.url 给状态
              onClick={() => setSelectedImage(image.url)}
            />
            <button
              type="button"
              // 移除时，调用 onRemove 并传递 image.id
              onClick={() => onRemove(image.id)}
              className="remove-button"
              aria-label={`Remove image ${index + 1}`} // 可选：更具体的 aria-label
            >
              <XIcon size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* 模态框部分保持不变，因为它依赖于 selectedImage (url 字符串) */}
      <BaseModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        className="image-preview-modal"
      >
        <img
          src={selectedImage || ""}
          alt="Enlarged preview"
          className="preview-modal-image"
          onClick={(e) => e.stopPropagation()} // 防止点击图片关闭模态框
        />
      </BaseModal>

      {/* Style 部分保持不变 */}
      <style>{`
        .image-preview-container {
          display: flex;
          gap: 6px;
          padding: 6px;
          background: ${theme.backgroundSecondary};
          border-radius: 8px;
          border: 1px solid ${theme.border};
          max-width: 240px; /* 可以根据需要调整最大宽度 */
          flex-wrap: wrap; /* 允许多行显示 */
        }

        .preview-item {
          position: relative;
          transition: transform 0.2s ease-out;
        }

        .preview-item:hover {
          transform: translateY(-2px);
        }

        .preview-image {
          width: 48px; /* 预览图大小 */
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          cursor: pointer;
          border: 1px solid ${theme.border};
          transition: border-color 0.2s ease-out;
        }

        .preview-image:hover {
          border-color: ${theme.primary};
        }

        .remove-button {
          position: absolute;
          top: -3px;
          right: -3px;
          padding: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${theme.primary};
          color: white;
          border: 1px solid ${theme.background}; /* 背景色边框，视觉效果更好 */
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-out;
          opacity: 0.8; /* 默认稍微透明 */
        }

        .preview-item:hover .remove-button {
          opacity: 1; /* 悬停时完全显示 */
        }

        .remove-button:hover {
          background: ${theme.hover}; /* 使用主题的悬停色 */
          transform: scale(1.1);
        }

        .remove-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${theme.focus}; /* 使用主题的焦点色 */
          opacity: 1;
        }

        /* 模态框图片样式 */
        .preview-modal-image {
          max-width: 90vw;
          max-height: 85vh; /* 留出一些空间给关闭按钮等 */
          object-fit: contain;
          border-radius: 12px;
          /* 添加阴影提升效果 */
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          /* 防止图片本身接收指针事件，如果下面有其他交互元素 */
          /* pointer-events: none; */
        }

        /* 响应式设计 - 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .preview-item,
          .preview-image,
          .remove-button {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

export default ImagePreview;
