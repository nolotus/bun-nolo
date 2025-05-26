// ImagePreview.tsx
import { useTheme } from "app/theme";
import React, { useState } from "react";
import ImagePreviewItem from "./ImagePreviewItem";
import ImagePreviewModal from "./ImagePreviewModal";

interface ImagePreviewProps {
  images: { id: string; url: string }[];
  onRemove: (id: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  const handlePreviewImage = (url: string) => {
    setSelectedImage(url);
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="image-preview-container">
        {images.map((image, index) => (
          <ImagePreviewItem
            key={image.id}
            image={image}
            index={index}
            onRemove={onRemove}
            onPreview={handlePreviewImage}
          />
        ))}
      </div>

      <ImagePreviewModal
        imageUrl={selectedImage}
        onClose={handleClosePreview}
        alt="放大预览图片"
      />

      <style href="image-preview" precedence="medium">{`
        .image-preview-container {
          display: flex;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
          align-items: flex-start;
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .image-preview-container {
            gap: ${theme.space[1]};
          }
        }
      `}</style>
    </>
  );
};

export default ImagePreview;
