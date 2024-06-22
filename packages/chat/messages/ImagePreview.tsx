import React from "react";
import { XIcon } from "@primer/octicons-react";
import { Modal, useModal } from "render/ui/Modal"; // 假设 ModalComponent 是包含 useModal 的文件名

interface ImagePreviewProps {
  imageUrls: string[];
  onRemove: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrls, onRemove }) => {
  const { visible, open, close, modalState } = useModal();

  if (imageUrls.length === 0) {
    return null;
  }

  const handleImageClick = (imageUrl: string) => {
    open(imageUrl); // 设置当前点击的图片 URL 以便之后放大显示
  };

  return (
    <>
      <div className="flex min-w-0 shrink space-x-2 p-2">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Preview ${index}`}
              className="h-16 w-16 cursor-pointer rounded object-cover"
              onClick={() => handleImageClick(url)}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-0 top-0 rounded-full bg-blue-500 p-1 text-xs leading-none text-white"
              style={{ transform: "translate(25%, -25%)" }}
              aria-label="Remove image"
            >
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* 图片放大展示的模态 */}
      <Modal isOpen={visible} onClose={close}>
        <img
          src={modalState}
          alt="Enlarged preview"
          className="max-h-full max-w-full object-contain"
        />
      </Modal>
    </>
  );
};

export default ImagePreview;
