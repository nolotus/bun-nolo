import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { UploadIcon } from "@primer/octicons-react";
import { retrieveFirstToken } from "auth/client/token";
import { generateFileID } from "database/fileUpload/generateFileID";
import { useAuth } from "auth/useAuth";

import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { setKeyPrefix } from "core/prefix";
import { useAppSelector } from "app/hooks";
import { selectIsDarkMode } from "app/theme/themeSlice";
import { COLORS } from "render/styles/colors";

const inputStyle = {
  flex: 1,
  height: "48px",
  padding: "12px 16px",
  fontSize: "15px",
  lineHeight: "1.5",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "10px",
  backgroundColor: COLORS.backgroundGhost,
  resize: "none",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  outline: "none",
  color: COLORS.text,
};

const uploadButtonStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.background,
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  color: COLORS.textSecondary,
  "&:hover": {
    backgroundColor: COLORS.backgroundGhost,
    borderColor: COLORS.primary,
    color: COLORS.primary,
    transform: "scale(1.02)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
};

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${newHeight}px`;

    setTextContent(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      beforeSend();
    }
  };
  const beforeSend = () => {
    if (!textContent.trim()) {
      return;
    }
    const content = imagePreviewUrls[0]
      ? [
          {
            type: "text",
            text: textContent,
          },
          {
            type: "image_url",
            image_url: {
              url: imagePreviewUrls[0],
            },
          },
        ]
      : textContent;
    onSendMessage(content);

    setTextContent("");
    setImagePreviewUrls([]);
  };

  const uploadImage = async (file: File) => {
    // 读取文件内容以生成哈希ID
    const buffer = await file.arrayBuffer();

    // 创建FormData对象来发送文件数据
    const formData = new FormData();
    formData.append("file", file); // 使用文件内容的哈希值作为文件名

    const prefix = setKeyPrefix({ isHash: true, isFile: true });
    const fileID = generateFileID(buffer);
    formData.append("id", `${prefix}-${auth.user?.userId}-${fileID}`); // 添加计算出的文件名

    // 获取token
    const token = await retrieveFirstToken();

    // 初始化上传请求的参数
    const requestOptions = {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, //携带token
      },
    };

    try {
      // 发送文件上传请求
      const response = await fetch(
        "http://localhost/api/v1/db/write",
        requestOptions
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      // 获取响应体，可能根据实际接口结构有所不同
      const responseBody = await response.json();
      setImagePreviewUrls((prevUrls) => [
        ...prevUrls,
        `http://localhost/api/v1/db/read/${responseBody.id}`,
      ]);
    } catch (error) {}
  };

  const previewImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrls((prevUrls) => [...prevUrls, reader.result as string]);
      // 此处调用上传任务
      // uploadImage(file);
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviewUrls((prevUrls) =>
      prevUrls.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true); // 当文件在组件上方时，设置高亮
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false); // 当文件离开组件时，取消高亮
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { files } = event.dataTransfer;
    if (files) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          previewImage(file);
        }
      }
    }
    setIsDragOver(false); // 文件放下后，取消高亮
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        previewImage(file);
      }
    }
  };
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) previewImage(file);
      }
    }
  }, []);

  const dropZoneStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDragOver ? COLORS.dropZoneActive : "transparent",
    border: isDragOver ? `2px dashed ${COLORS.primary}` : "none",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    color: COLORS.primary,
    pointerEvents: isDragOver ? "all" : "none",
    transition: "all 0.2s ease",
  };

  return (
    <>
      <style>
        {`
    .input-area {
      position: relative;
      display: flex;
      gap: 8px;
      padding: 10px 20%; 
      padding-bottom: 20px;
      background-color: ${COLORS.background};
      container-type: inline-size;
    }

    /* 容器查询 */
    @container (max-width: 768px) {
      .input-area {
        padding: 8px 12px !important;
        gap: 6px !important;
      }

      textarea {
        font-size: 14px !important;
        padding: 8px 12px !important;
      }

      .upload-button {
        width: 40px !important;
        height: 40px !important;
      }
    }

    @container (min-width: 769px) and (max-width: 1024px) {
      .input-area {
        padding: 10px 10% !important;
      }
    }

    /* 媒体查询 */ 
    @media screen and (max-width: 768px) {
      .input-area {
        padding: 8px 12px;
        gap: 6px;
      }

      textarea {
        font-size: 14px;
        padding: 8px 12px;
      }

      .upload-button {
        width: 40px;
        height: 40px;
      }
    }

    @media screen and (min-width: 769px) and (max-width: 1024px) {
      .input-area {
        padding: 10px 10%;
      }
    }
  `}
      </style>

      <div
        className="input-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div style={dropZoneStyle}>
            <UploadIcon size={24} />
            <span style={{ marginLeft: "8px" }}>释放鼠标上传文件</span>
          </div>
        )}

        {imagePreviewUrls.length > 0 && (
          <div className="absolute -top-20 right-0 z-10">
            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={(index: number) => handleRemoveImage(index)}
            />
          </div>
        )}
        <button
          className="upload-button"
          style={uploadButtonStyle}
          onClick={handleFileButtonClick}
          title={t("uploadImage")}
        >
          <UploadIcon size={20} />
        </button>

        <textarea
          style={inputStyle}
          value={textContent}
          placeholder={`${t("messageOrImageHere")}`}
          onChange={handleNewMessageChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}

          // style={{
          //   backgroundColor: isDarkMode ? "#171a1c" : "",
          //   color: isDarkMode ? "#868e96" : "",
          // }}
        />

        <SendButton
          onClick={beforeSend}
          // disabled={isLoading || (!input.trim() && !selectedFile)}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
      </div>
    </>
  );
};

export default MessageInput;
