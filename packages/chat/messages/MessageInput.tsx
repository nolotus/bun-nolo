import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FileMediaIcon } from "@primer/octicons-react";
import { retrieveFirstToken } from "auth/client/token";
import { generateFileID } from "database/fileUpload/generateFileID";
import clsx from "clsx";
import { useAuth } from "auth/useAuth";
import TextareaAutosize from "react-textarea-autosize";

import ActionButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { setKeyPrefix } from "core/prefix";
import { messageInputStyle } from "./styles";
interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleNewMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setTextContent(event.target.value);
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
        requestOptions,
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
      prevUrls.filter((_, index) => index !== indexToRemove),
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
  return (
    <div
      className="flex items-start justify-center space-x-4 "
      style={messageInputStyle}
    >
      <div
        className={clsx(
          "relative flex flex-grow  items-end gap-2",
          isDragOver ? "border-4 border-blue-500" : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imagePreviewUrls.length > 0 && (
          <div className="absolute -top-20 right-0 z-10">
            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={(index: number) => handleRemoveImage(index)}
            />
          </div>
        )}
        <button onClick={handleFileButtonClick} title={t("uploadImage")}>
          <FileMediaIcon size={24} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
        <TextareaAutosize
          maxRows={10}
          minRows={2}
          value={textContent}
          placeholder={`${t("typeMessage")} ${t("orDragAndDropImageHere")}`}
          onChange={handleNewMessageChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={clsx(
            "w-full rounded-md border p-2 transition-colors duration-200",
            isDragOver ? "border-blue-500 bg-blue-50" : "",
          )}
        />

        <ActionButton onSend={beforeSend} />
      </div>
    </div>
  );
};

export default MessageInput;
