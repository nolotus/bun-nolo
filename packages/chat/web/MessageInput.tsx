// chat/web/MessageInput.tsx
import { useAuth } from "auth/hooks/useAuth";
import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Content } from "../messages/types";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch } from "app/hooks";
import { handleSendMessage } from "../messages/messageSlice";

//web part
import { UploadIcon } from "@primer/octicons-react";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import toast from "react-hot-toast";

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleMessageSend = (content: Content) => {
    try {
      dispatch(handleSendMessage({ content }));
    } catch (err) {
      toast.error("Failed to send message");
    }
  };
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

    handleMessageSend(content);
    setTextContent("");
    setImagePreviewUrls([]);

    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [textContent, imagePreviewUrls, handleMessageSend]);

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

      <style>{`
        .message-input-container {
          position: relative;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 10px 16px;
          padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: ${theme.background};
          border-top: 1px solid ${theme.borderLight};
          box-shadow: 0 -2px 10px ${theme.shadowLight};
          z-index: ${zIndex.messageInputContainerZIndex};
          transition: all 0.2s ease;
        }

        .message-preview-wrapper {
          width: 100%;
          margin-bottom: 4px;
        }

        .input-controls {
          display: flex;
          gap: 8px;
          width: 100%;
          align-items: flex-end;
        }

        .message-textarea {
          flex: 1;
          height: 40px;
          max-height: 100px;
          padding: 10px 12px;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid ${theme.border};
          border-radius: 10px;
          resize: none;
          font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          transition: border-color 0.2s ease;
        }

        .message-textarea::placeholder {
          color: ${theme.textTertiary};
        }

        .message-textarea:focus {
          outline: none;
          border-color: ${theme.primary};
        }

        .upload-button {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.background};
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-button:active {
          transform: scale(0.96);
        }

        .drop-zone {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          background: ${theme.backgroundGhost};
          border: 2px dashed ${theme.primary};
          color: ${theme.primary};
          pointer-events: none;
        }

        /* 桌面端样式 */
        @media screen and (min-width: 769px) {
          .message-input-container {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
            padding: 16px;
            padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
            border-top: none;
            box-shadow: none;
          }

          .message-textarea {
            height: 44px;
            max-height: 140px;
            padding: 12px 16px;
            font-size: 15px;
          }

          .upload-button {
            width: 44px;
            height: 44px;
          }

          .upload-button:hover {
            background: ${theme.backgroundHover};
            border-color: ${theme.borderHover};
            color: ${theme.text};
          }
        }

        /* 大屏幕优化 */
        @media screen and (min-width: 1400px) {
          .message-input-container {
            max-width: 1000px;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;
