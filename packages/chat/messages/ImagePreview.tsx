import { XIcon } from "@primer/octicons-react";
import React, { useState } from "react";
import { defaultTheme } from "render/styles/colors";
import { BaseModal } from 'render/ui/BaseModal';

interface ImagePreviewProps {
  imageUrls: string[];
  onRemove: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrls, onRemove }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (imageUrls.length === 0) return null;

  return (
    <>
      <div className="image-preview-container">
        {imageUrls.map((url, index) => (
          <div key={url + index} className="preview-item">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="preview-image"
              onClick={() => setSelectedImage(url)}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="remove-button"
              aria-label="Remove image"
            >
              <XIcon size={10} />
            </button>
          </div>
        ))}
      </div>

      <BaseModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        className="image-preview-modal"
      >
        <img
          src={selectedImage || ''}
          alt="Enlarged preview"
          className="preview-modal-image"
          onClick={e => e.stopPropagation()}
        />
      </BaseModal>

      <style href="image-preview" >
        {`
          .image-preview-container {
            display: flex;
            gap: 6px;
            padding: 6px;
            background: ${defaultTheme.backgroundSecondary};
            border-radius: 8px;
            border: 1px solid ${defaultTheme.border};
            max-width: 240px;
            flex-wrap: wrap;
          }

          .preview-item {
            position: relative;
            transition: transform 0.2s ease-out;
          }

          .preview-item:hover {
            transform: translateY(-2px);
          }

          .preview-image {
            width: 48px;
            height: 48px;
            border-radius: 6px;
            object-fit: cover;
            cursor: pointer;
            border: 1px solid ${defaultTheme.border};
            transition: border-color 0.2s ease-out;
          }

          .preview-image:hover {
            border-color: ${defaultTheme.primary};
          }

          .remove-button {
            position: absolute;
            top: -3px;
            right: -3px;
            padding: 2px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${defaultTheme.primary};
            color: white;
            border: 1px solid ${defaultTheme.background};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease-out;
          }

          .remove-button:hover {
            background: ${defaultTheme.hover};
            transform: scale(1.1);
          }

          .remove-button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px ${defaultTheme.focus};
          }

          .preview-modal-image {
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 12px;
          }

          @media (prefers-reduced-motion: reduce) {
            .preview-item,
            .preview-image,
            .remove-button {
              transition: none;
            }
          }
        `}
      </style>
    </>
  );
};

export default ImagePreview;
