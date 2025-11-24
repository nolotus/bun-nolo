// ImagePreviewModal.tsx
import React, { useState, useEffect } from "react";
import { BaseModal } from "render/web/ui/modal/BaseModal";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
  alt?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onClose,
  alt = "预览图片",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // 当 imageUrl 变化时，重置加载状态
  useEffect(() => {
    if (imageUrl) {
      setIsLoaded(false);
    }
  }, [imageUrl]);

  return (
    <>
      <BaseModal
        isOpen={!!imageUrl}
        onClose={onClose}
        className="image-preview-modal"
        variant="center" // 关键：使用居中变体
        preventBodyScroll={true}
        closeOnBackdrop={true}
      >
        {imageUrl && (
          <div className="preview-container">
            {/* 1. 加载指示器 */}
            {!isLoaded && (
              <div className="loading-spinner">
                <svg viewBox="0 0 24 24" fill="none" className="spinner-icon">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    className="opacity-75"
                  />
                </svg>
              </div>
            )}

            {/* 2. 图片本体 */}
            <img
              src={imageUrl}
              alt={alt}
              className={`preview-image ${isLoaded ? "loaded" : "loading"}`}
              onLoad={() => setIsLoaded(true)}
              onClick={(e) => e.stopPropagation()} // 防止点击图片触发 BaseModal 的背景关闭
            />

            {/* 3. 关闭按钮 (悬浮) */}
            <button
              className="close-button"
              onClick={onClose}
              aria-label="关闭预览"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </BaseModal>

      <style href="image-preview-modal" precedence="medium">{`
        /* 
         * 容器重置 
         * 确保 BaseModal 内部的内容容器是透明的，且能够容纳我们的自定义布局
         */
        :global(.image-preview-modal) {
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          overflow: visible !important;
          /* 这里的宽高由 BaseModal.center 控制，这里只需确保不限制内容 */
        }

        .preview-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
          min-height: 100px;
        }

        /* === 图片样式 === */
        .preview-image {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          
          border-radius: var(--space-2);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
          background-color: var(--backgroundSecondary); /* 图片加载前的底色 */
          
          /* 初始状态 (加载中) */
          opacity: 0;
          transform: scale(0.96);
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
          
          /* 禁止选中 */
          user-select: none;
          -webkit-user-select: none;
        }

        /* 加载完成状态 */
        .preview-image.loaded {
          opacity: 1;
          transform: scale(1);
        }

        /* === 加载 Loading === */
        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(255, 255, 255, 0.8);
          z-index: -1; /* 放在图片后面 */
        }
        
        .spinner-icon {
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        
        .opacity-25 { opacity: 0.25; }
        .opacity-75 { opacity: 0.75; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* === 关闭按钮 === */
        .close-button {
          position: absolute;
          top: -48px;
          right: 0;
          
          display: flex;
          align-items: center;
          justify-content: center;
          
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          backdrop-filter: blur(4px);
          cursor: pointer;
          
          transition: background-color 0.2s;
          z-index: 10;
        }

        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.75);
        }

        /* === 响应式优化 === */
        @media (max-width: 768px) {
          .preview-image {
            max-width: 100vw; /* 移动端可以更宽一点 */
            max-height: 80dvh; /* 适配动态视口高度 */
            border-radius: 0; /* 移动端全屏感更强，不需要圆角 */
          }
          
          /* 移动端关闭按钮调整位置 */
          .close-button {
            top: -50px;
            right: 16px;
            width: 36px;
            height: 36px;
          }
        }
        
        @media print {
          .image-preview-modal { display: none; }
        }
      `}</style>
    </>
  );
};

export default ImagePreviewModal;
