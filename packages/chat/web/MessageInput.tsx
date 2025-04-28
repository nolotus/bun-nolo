import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Content } from "../messages/types";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { handleSendMessage } from "../messages/messageSlice";
import {
  addPendingImagePreview,
  addPendingExcelFile,
  removePendingImagePreview,
  removePendingExcelFile,
  setPreviewingExcelFile,
  clearPendingAttachments,
  selectPendingImagePreviews,
  selectPendingExcelFiles,
  selectPreviewingExcelFile,
  type PendingImagePreview,
  type PendingExcelFile,
} from "../dialog/dialogSlice";
import { compressImage } from "utils/imageUtils";
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import ExcelPreview from "web/ExcelPreview";
import { UploadIcon } from "@primer/octicons-react";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";

const MessageInput: React.FC = () => {
  // Hooks, Refs, Local State, Redux State
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textContent, setTextContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const imagePreviews = useAppSelector(selectPendingImagePreviews);
  const excelFiles = useAppSelector(selectPendingExcelFiles);
  const previewingExcelFile = useAppSelector(selectPreviewingExcelFile);

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // File Handling Callbacks
  const handleAddImagePreview = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          dispatch(addPendingImagePreview(reader.result as string));
        }
      };
      reader.readAsDataURL(file);
    },
    [dispatch]
  );

  const handleParseAndAddExcel = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          toast.error(t("fileReadError"));
          return;
        }
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            toast.error(t("excelIsEmptyOrInvalid"));
            return;
          }
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length > 0) {
            const newExcelFile: PendingExcelFile = {
              id: nanoid(),
              name: file.name,
              data: jsonData,
            };
            dispatch(addPendingExcelFile(newExcelFile));
          } else {
            toast.error(t("excelIsEmpty"));
          }
        } catch (error) {
          toast.error(t("excelParseError"));
          console.error("Excel parsing error:", error);
        }
      };
      reader.onerror = () => {
        toast.error(t("fileReadError"));
      };
      reader.readAsArrayBuffer(file);
    },
    [dispatch, t]
  );

  const processFile = useCallback(
    (file: File) => {
      const fileNameLower = file.name.toLowerCase();
      if (file.type.startsWith("image/")) {
        handleAddImagePreview(file);
      } else if (
        fileNameLower.endsWith(".xlsx") ||
        fileNameLower.endsWith(".xls") ||
        fileNameLower.endsWith(".csv") ||
        file.type.includes("excel") ||
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        handleParseAndAddExcel(file);
      }
    },
    [handleAddImagePreview, handleParseAndAddExcel]
  );

  // Input & Send Logic
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = window.innerWidth > 768 ? 140 : 100;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      setTextContent(e.target.value);
    },
    []
  );

  const clearInputState = useCallback(() => {
    setTextContent("");
    dispatch(clearPendingAttachments());
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [dispatch]);

  const sendMessage = useCallback(async () => {
    const currentImagePreviews = imagePreviews;
    const currentExcelFiles = excelFiles;
    const trimmedText = textContent.trim();

    if (
      !trimmedText &&
      !currentImagePreviews.length &&
      !currentExcelFiles.length
    ) {
      return;
    }

    let messageContent: Content;
    const parts: ({ type: string } & Record<string, any>)[] = [];

    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    if (currentImagePreviews.length > 0) {
      const compressionToastId = toast.loading(t("compressingImages"), {
        duration: Infinity,
      });
      try {
        const compressedUrls = await Promise.all(
          currentImagePreviews.map((img) => compressImage(img.url))
        );
        compressedUrls.forEach((compressedUrl) => {
          parts.push({ type: "image_url", image_url: { url: compressedUrl } });
        });
        toast.dismiss(compressionToastId);
      } catch (error) {
        toast.dismiss(compressionToastId);
        console.error("Error during image compression batch:", error);
        toast.error(t("compressionError"), { duration: 4000 });
        currentImagePreviews.forEach((img) => {
          parts.push({ type: "image_url", image_url: { url: img.url } });
        });
      }
    }

    currentExcelFiles.forEach((file) => {
      parts.push({ type: "excel", name: file.name, data: file.data });
    });

    if (parts.length > 1) {
      messageContent = parts;
    } else if (parts.length === 1 && parts[0].type === "text") {
      messageContent = parts[0].text;
    } else if (parts.length === 1) {
      messageContent = parts;
    } else {
      console.warn("sendMessage called with no content after processing.");
      return;
    }

    try {
      dispatch(handleSendMessage({ userInput: messageContent }));
      clearInputState();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(t("sendFail"));
    }
  }, [textContent, imagePreviews, excelFiles, dispatch, clearInputState, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Event Handlers
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      Array.from(e.clipboardData.items).forEach((item) => {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleAddImagePreview(file);
        }
      });
    },
    [handleAddImagePreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!isDragEnabled) return;
      Array.from(e.dataTransfer.files).forEach(processFile);
    },
    [isDragEnabled, processFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDragEnabled) return;
      e.preventDefault();
      setIsDragOver(true);
    },
    [isDragEnabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!isDragEnabled) return;
      setIsDragOver(false);
    },
    [isDragEnabled]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Array.from(e.target.files || []).forEach(processFile);
      e.target.value = "";
    },
    [processFile]
  );

  const handleRemoveImage = useCallback(
    (idToRemove: string) => {
      dispatch(removePendingImagePreview(idToRemove));
    },
    [dispatch]
  );

  const handleRemoveExcel = useCallback(
    (idToRemove: string) => {
      dispatch(removePendingExcelFile(idToRemove));
    },
    [dispatch]
  );

  const handlePreviewExcel = useCallback(
    (idToPreview: string) => {
      dispatch(setPreviewingExcelFile(idToPreview));
    },
    [dispatch]
  );

  const handleCloseExcelPreview = useCallback(() => {
    dispatch(setPreviewingExcelFile(null));
  }, [dispatch]);

  // Render Logic
  const hasContent =
    textContent.trim() || imagePreviews.length > 0 || excelFiles.length > 0;

  return (
    <div
      className="message-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={t("messageInputArea")}
    >
      {/* Attachments Preview Area */}
      <div className="attachments-preview">
        {imagePreviews.length > 0 && (
          <div className="message-preview-wrapper">
            <ImagePreview images={imagePreviews} onRemove={handleRemoveImage} />
          </div>
        )}
        {excelFiles.length > 0 && (
          <ExcelPreview
            excelFiles={excelFiles}
            onRemove={handleRemoveExcel}
            onPreview={handlePreviewExcel}
            previewingFile={previewingExcelFile}
            closePreview={handleCloseExcelPreview}
          />
        )}
      </div>

      {/* Input Controls Area */}
      <div className="input-controls">
        <button
          className="upload-button"
          onClick={triggerFileInput}
          title={t("uploadFile")}
          aria-label={t("uploadFile")}
        >
          <UploadIcon size={20} />
        </button>
        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={textContent}
          placeholder={t("messageOrFileHere")}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-label={t("messageInput")}
        />
        <SendButton onClick={sendMessage} disabled={!hasContent} />
      </div>

      {/* Drag Overlay */}
      {isDragOver && isDragEnabled && (
        <div className="drop-zone" aria-live="polite">
          <UploadIcon size={24} />
          <span>{t("dropToUpload")}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple
        onChange={handleFileInputChange}
      />

      {/* Styles */}
      <style jsx>{`
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

        .attachments-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
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
          min-height: 40px;
          max-height: 200px;
          padding: 10px 12px;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid ${theme.border};
          border-radius: 10px;
          resize: vertical;
          overflow-y: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }
        .message-textarea::placeholder {
          color: ${theme.textTertiary};
        }
        .message-textarea:focus {
          outline: none;
          border-color: ${theme.primary};
        }
        .message-textarea::-webkit-resizer {
          cursor: ns-resize;
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
          flex-shrink: 0;
        }
        .upload-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .upload-button:active {
          transform: scale(0.96);
        }

        .drop-zone {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          background: ${theme.backgroundGhost};
          backdrop-filter: blur(4px);
          border: 2px dashed ${theme.primary};
          color: ${theme.primary};
          pointer-events: none;
          z-index: 10;
        }

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
            min-height: 44px;
            max-height: 260px;
            padding: 12px 16px;
            font-size: 15px;
            resize: vertical;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          .upload-button {
            width: 44px;
            height: 44px;
          }
        }

        @media screen and (min-width: 1400px) {
          .message-input-container {
            max-width: 1000px;
          }
        }

        @media screen and (max-width: 480px) {
          .message-textarea {
            max-height: 180px;
            padding: 8px 10px;
            font-size: 13px;
            resize: vertical;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          .upload-button {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;
