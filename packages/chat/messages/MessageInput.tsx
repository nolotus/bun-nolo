import { UploadIcon } from "@primer/octicons-react";
import { retrieveFirstToken } from "auth/client/token";
import { useAuth } from "auth/useAuth";
import { setKeyPrefix } from "core/prefix";
import { generateFileID } from "database/fileUpload/generateFileID";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { useTheme } from "app/theme";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const auth = useAuth();
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
      setTextContent(e.target.value);
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (!textContent.trim()) return;

    const content = imagePreviewUrls[0]
      ? [
        { type: "text", text: textContent },
        { type: "image_url", image_url: { url: imagePreviewUrls[0] } },
      ]
      : textContent;

    onSendMessage(content);
    setTextContent("");
    setImagePreviewUrls([]);
  }, [textContent, imagePreviewUrls, onSendMessage]);

  const uploadImage = async (file: File) => {
    /* 
    const buffer = await file.arrayBuffer();
    const formData = new FormData();
    formData.append("file", file);

    const prefix = setKeyPrefix({ isHash: true, isFile: true });
    const fileID = generateFileID(buffer);
    formData.append("id", `${prefix}-${auth.user?.userId}-${fileID}`);

    const token = await retrieveFirstToken();

    try {
      const response = await fetch("http://localhost/api/v1/db/write", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Upload failed");

      const responseBody = await response.json();
      setImagePreviewUrls(prev => [
        ...prev,
        `http://localhost/api/v1/db/read/${responseBody.id}`
      ]);
    } catch (error) {
      console.error("Upload error:", error);
    }
    */
  };

  const previewImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      // uploadImage(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          previewImage(file);
        }
      });
      setIsDragOver(false);
    },
    [previewImage],
  );

  return (
    <>
      <style>
        {`
    .message-input-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px 20%;
      margin: 0;
      background: ${theme.background};
      container-type: inline-size;
    }

    .message-preview-wrapper {
      position: relative;
      width: 100%;
      margin: 0;
    }

    .input-controls {
      display: flex;
      gap: 8px;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .message-textarea {
      flex: 1;
      height: 48px;
      max-height: 120px;
      padding: 14px 16px;
      margin: 0;
      font-size: 15px;
      line-height: 20px;
      border: 1px solid ${theme.border};
      border-radius: 10px;
      background: ${theme.backgroundSecondary};
      color: ${theme.text};
      resize: none;
      font-family: -apple-system, system-ui, sans-serif;
      transition: border-color 0.2s ease-out;
    }

    .message-textarea:focus {
      border-color: ${theme.primary};
      outline: none;
    }

    .upload-button {
      width: 48px;
      height: 48px;
      margin: 0;
      padding: 0;
      border: 1px solid ${theme.border};
      border-radius: 10px;
      background: ${theme.background};
      color: ${theme.textSecondary};
      cursor: pointer;
      transition: all 0.2s ease-out;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .upload-button:hover {
      border-color: ${theme.primary};
      color: ${theme.primary};
      background: ${theme.backgroundSecondary};
    }

    .drop-zone {
      position: absolute;
      inset: 0;
      border-radius: 12px;
      background: ${theme.backgroundGhost};
      border: 2px dashed ${theme.primary};
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: ${theme.primary};
      font-size: 15px;
      opacity: ${isDragOver ? 1 : 0};
      pointer-events: ${isDragOver ? "all" : "none"};
      transition: opacity 0.2s ease-out;
      margin: 0;
    }

    @media screen and (max-width: 768px) {
      .message-input-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        padding: 12px 8px;
        gap: 6px;
        z-index: 1000;
        background: ${theme.background};
        box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
      }

      .input-controls {
        gap: 6px;
        min-height: 44px;
      }

      .message-textarea {
        height: 44px;
        max-height: 100px;
        padding: 12px;
        font-size: 16px;
        line-height: 20px;
        border-radius: 8px;
      }

      .upload-button {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        padding: 12px;
      }

      .upload-button, 
      .send-button {
        min-width: 44px;
        min-height: 44px;
      }
    }

    @media screen and (max-width: 768px) and (supports: padding-bottom: env(safe-area-inset-bottom)) {
      .message-input-container {
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
      }
    }
  `}
      </style>

      <div
        className="message-input-container"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        {imagePreviewUrls.length > 0 && (
          <div className="message-preview-wrapper">
            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={(index) => {
                setImagePreviewUrls((prev) =>
                  prev.filter((_, i) => i !== index),
                );
              }}
            />
          </div>
        )}

        <div className="input-controls">
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            title={t("uploadImage")}
          >
            <UploadIcon size={20} />
          </button>

          <textarea
            className="message-textarea"
            value={textContent}
            placeholder={t("messageOrImageHere")}
            onChange={handleMessageChange}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            onPaste={(e) => {
              const items = Array.from(e.clipboardData.items);
              items.forEach((item) => {
                if (item.type.indexOf("image") !== -1) {
                  const file = item.getAsFile();
                  if (file) previewImage(file);
                }
              });
            }}
          />

          <SendButton onClick={handleSend} />
        </div>

        {isDragOver && (
          <div className="drop-zone">
            <UploadIcon size={24} />
            <span>{t("dropToUpload")}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          multiple
          onChange={(e) => {
            Array.from(e.target.files || []).forEach(previewImage);
          }}
        />
      </div>
    </>
  );
};

export default MessageInput;
