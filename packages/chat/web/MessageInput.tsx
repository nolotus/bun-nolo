import { UploadIcon } from "@primer/octicons-react";
import { useAuth } from "auth/hooks/useAuth";
import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { useTheme } from "app/theme";
import { Content } from "../messages/types";

interface MessageInputProps {
  onSendMessage: (content: Content) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const auth = useAuth();
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 延迟加载拖拽功能
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = window.innerWidth > 768 ? 140 : 100;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      setTextContent(e.target.value);
    },
    []
  );

  const handleSend = useCallback(() => {
    if (!textContent.trim() && !imagePreviewUrls.length) return;

    const content: Content = imagePreviewUrls[0]
      ? [
          { type: "text", text: textContent },
          { type: "image_url", image_url: { url: imagePreviewUrls[0] } },
        ]
      : textContent;

    onSendMessage(content);
    setTextContent("");
    setImagePreviewUrls([]);

    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [textContent, imagePreviewUrls, onSendMessage]);

  const previewImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrls((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragEnabled) return;

      const files = Array.from(e.dataTransfer.files);
      files.forEach(previewImage);
      setIsDragOver(false);
    },
    [isDragEnabled, previewImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      items.forEach((item) => {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) previewImage(file);
        }
      });
    },
    [previewImage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div
      className="message-input-container"
      style={{
        background: theme.background,
      }}
      onDragOver={(e) => {
        if (!isDragEnabled) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!isDragEnabled) return;
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
              setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        </div>
      )}

      <div className="input-controls">
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          title={t("uploadImage")}
          aria-label={t("uploadImage")}
        >
          <UploadIcon size={20} />
        </button>

        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={textContent}
          placeholder={t("messageOrImageHere")}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <SendButton onClick={handleSend} />
      </div>

      {isDragOver && isDragEnabled && (
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
          e.target.value = ""; // Reset input
        }}
      />

      <style jsx>{`
        /* 移动端基础样式 */
        .message-input-container {
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 8px 12px;
          padding-bottom: calc(8px + env(safe-area-inset-bottom));
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 1000;
          box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          -webkit-overflow-scrolling: touch;
        }

        .message-preview-wrapper {
          position: relative;
          width: 100%;
          margin: 0;
        }

        .input-controls {
          display: flex;
          gap: 6px;
          width: 100%;
          margin: 0;
          padding: 0;
          align-items: flex-end;
        }

        .message-textarea {
          flex: 1;
          height: 36px;
          max-height: 100px;
          padding: 8px 10px;
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          resize: none;
          font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .message-textarea:focus {
          outline: none;
          border-color: ${theme.primary};
        }

        .upload-button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.background};
          color: ${theme.textSecondary};
          -webkit-tap-highlight-color: transparent;
          padding: 0;
          margin: 0;
        }

        .drop-zone {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          background: ${theme.backgroundGhost};
          border: 2px dashed ${theme.primary};
          color: ${theme.primary};
          pointer-events: none;
        }

        /* 桌面端样式 */
        @media screen and (min-width: 769px) {
          .message-input-container {
            position: relative;
            padding: 16px 20%;
            box-shadow: none;
          }

          .input-controls {
            gap: 8px;
          }

          .message-textarea {
            height: 48px;
            max-height: 120px;
            padding: 12px 16px;
            font-size: 15px;
            border-radius: 10px;
          }

          .upload-button {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            cursor: pointer;
          }

          .upload-button:hover {
            border-color: ${theme.primary};
            color: ${theme.primary};
            background: ${theme.backgroundSecondary};
          }

          .drop-zone {
            border-radius: 12px;
            font-size: 15px;
          }
        }

        /* 大屏幕优化 */
        @media screen and (min-width: 1201px) {
          .message-input-container {
            padding: 16px 20%;
          }
        }

        /* 中等屏幕优化 */
        @media screen and (min-width: 993px) and (max-width: 1200px) {
          .message-input-container {
            padding: 16px 15%;
          }
        }

        /* 小屏幕优化 */
        @media screen and (min-width: 769px) and (max-width: 992px) {
          .message-input-container {
            padding: 16px 10%;
          }
        }

        /* 处理安全区域 */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .message-input-container {
            padding-bottom: calc(8px + env(safe-area-inset-bottom));
          }
        }

        /* 深色模式优化 */
        @media (prefers-color-scheme: dark) {
          .message-textarea {
            background: ${theme.backgroundSecondary};
          }
        }

        /* 减少动画，提升性能 */
        @media (prefers-reduced-motion: reduce) {
          .message-input-container,
          .message-textarea,
          .upload-button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;
