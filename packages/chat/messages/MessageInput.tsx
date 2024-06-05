import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileMediaIcon } from "@primer/octicons-react";
import { retrieveFirstToken } from "auth/client/token";
import { generateFileID } from "database/fileUpload/generateFileID";
import clsx from "clsx";
import { useAuth } from "auth/useAuth";
import Sizes from "open-props/src/sizes";
import TextareaAutosize from "react-textarea-autosize";

import ActionButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { setKeyPrefix } from "core/prefix";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  onCancel,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false); // 新增状态来追踪是否有文件被拖到组件上

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
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        previewImage(file);
      }
    }
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
      console.log("File uploaded successfully:", responseBody.id);
      setImagePreviewUrls((prevUrls) => [
        ...prevUrls,
        `http://localhost/api/v1/db/read/${responseBody.id}`,
      ]);
    } catch (error) {
      console.error("Image upload error:", error);
    }
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

  return (
    <div
      className="flex items-start justify-center space-x-4"
      style={{
        paddingTop: Sizes["--size-fluid-1"],
        paddingBottom: Sizes["--size-fluid-1"],
        paddingLeft: Sizes["--size-13"],
        paddingRight: Sizes["--size-13"],
      }}
    >
      <div
        className={clsx(
          "relative flex flex-grow  items-end gap-2",
          isDragOver ? "border-4 border-blue-500" : "",
        )}
      >
        <button className="px-3 py-1">
          <label className="cursor-pointer ">
            <FileMediaIcon size={24} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              multiple
            />
          </label>
        </button>

        <TextareaAutosize
          value={textContent}
          placeholder={`${t("typeMessage")} ${t("orDragAndDropImageHere")}`}
          onChange={handleNewMessageChange}
          onKeyDown={handleKeyDown}
          className="w-full"
        />

        {/* <textarea
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ height: Sizes["--size-fluid-6"] }}
        /> */}

        <div className="absolute inset-x-0 bottom-0 left-auto right-0 m-2 flex min-w-[160px] items-center justify-end space-x-2">
          <ImagePreview
            imageUrls={imagePreviewUrls}
            onRemove={(index: number) => handleRemoveImage(index)}
          />
        </div>
        <ActionButton
          isSending={isLoading}
          onSend={beforeSend}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

export default MessageInput;
