// chat/web/MessageInput.tsx
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
} from "../dialog/dialogSlice"; // Ensure path is correct

// Import the compression utility
import { compressImage } from "utils/imageUtils"; // Adjust path if needed

import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import ExcelPreview from "web/ExcelPreview";
import { UploadIcon } from "@primer/octicons-react";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview"; // Assuming this is updated as per previous step

const MessageInput: React.FC = () => {
  // --- Hooks, Refs, Local State, Redux State (remain the same) ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textContent, setTextContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const imagePreviews = useAppSelector(selectPendingImagePreviews);
  const excelFiles = useAppSelector(selectPendingExcelFiles);
  const previewingExcelFile = useAppSelector(selectPreviewingExcelFile);

  // --- Effects (remain the same) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- File Handling Callbacks (remain the same) ---
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
          toast.error(t("fileReadError") || "无法读取文件内容");
          return;
        }
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            toast.error(t("excelIsEmptyOrInvalid") || "Excel文件为空或无效");
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
            toast.error(t("excelIsEmpty") || "Excel文件内容为空");
          }
        } catch (error) {
          toast.error(t("excelParseError") || "无法解析Excel文件");
          console.error("Excel parsing error:", error);
        }
      };
      reader.onerror = () => {
        toast.error(t("fileReadError") || "读取文件时出错");
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

  // --- Input & Send Logic ---

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = window.innerWidth > 768 ? 140 : 100; // Adjust max height if needed
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

  // **** MODIFIED sendMessage FUNCTION ****
  const sendMessage = useCallback(async () => {
    // Make the function async
    // Get current state from Redux
    const currentImagePreviews = imagePreviews; // Get from selector (already done)
    const currentExcelFiles = excelFiles; // Get from selector (already done)
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

    // Add text part if exists
    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    // ** Image Compression Step **
    if (currentImagePreviews.length > 0) {
      // Add a toast notification for compression start
      const compressionToastId = toast.loading(
        t("compressingImages", "Compressing images..."),
        { duration: Infinity }
      );

      try {
        // Map over previews and compress each image URL concurrently
        const compressedUrls = await Promise.all(
          currentImagePreviews.map((img) => compressImage(img.url)) // Call the utility function
        );

        // Add compressed image parts
        compressedUrls.forEach((compressedUrl) => {
          parts.push({ type: "image_url", image_url: { url: compressedUrl } });
        });

        toast.dismiss(compressionToastId); // Dismiss loading toast on success
      } catch (error) {
        toast.dismiss(compressionToastId); // Dismiss loading toast on error
        console.error("Error during image compression batch:", error);
        toast.error(
          t(
            "compressionError",
            "Image compression failed. Sending original images."
          ),
          { duration: 4000 }
        );
        // Fallback: Add original image parts if compression fails
        currentImagePreviews.forEach((img) => {
          parts.push({ type: "image_url", image_url: { url: img.url } });
        });
      }
    }

    // Add Excel parts if they exist
    currentExcelFiles.forEach((file) => {
      parts.push({ type: "excel", name: file.name, data: file.data });
    });

    // Determine final message content structure
    if (parts.length > 1) {
      messageContent = parts; // Use the parts array for multipart messages
    } else if (parts.length === 1 && parts[0].type === "text") {
      messageContent = parts[0].text; // Use plain string for text-only messages
    } else if (parts.length === 1) {
      messageContent = parts; // Use parts array even for single non-text part
    } else {
      // This case should technically not be reached due to the initial check,
      // but handle defensively.
      console.warn("sendMessage called with no content after processing.");
      return;
    }

    // Dispatch the message
    try {
      dispatch(handleSendMessage({ userInput: messageContent }));
      clearInputState(); // Clear local text and Redux attachments
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(t("sendFail") || "发送消息失败");
    }
  }, [
    textContent,
    imagePreviews, // Dependency: Reads original previews
    excelFiles,
    dispatch,
    clearInputState, // Dependency: Memoized callback
    t, // Dependency: Translation function
    // No need to add compressImage here as it's a stable import
  ]);
  // **** END OF MODIFIED sendMessage FUNCTION ****

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        // No need to await here, just trigger the async function
        sendMessage();
      }
    },
    [sendMessage] // Dependency is the memoized async function
  );

  // --- Event Handlers (Paste, Drop, Drag, FileInput, Preview Callbacks - remain the same) ---
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

  // --- Render ---
  const hasContent =
    textContent.trim() || imagePreviews.length > 0 || excelFiles.length > 0;

  return (
    <div
      className="message-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={
        t("messageInputArea", "Message input area with file upload support") ||
        "消息输入区域，支持文件上传"
      }
    >
      {/* Attachments Preview Area */}
      <div className="attachments-preview">
        {imagePreviews.length > 0 && (
          <div className="message-preview-wrapper">
            {/* Ensure ImagePreview uses the updated props */}
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
          title={t("uploadFile") || "上传文件"}
          aria-label={t("uploadFile") || "上传文件"}
        >
          <UploadIcon size={20} />
        </button>
        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={textContent}
          placeholder={t("messageOrFileHere") || "输入消息或上传文件..."}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-label={t("messageInput", "Message input field") || "消息输入框"}
        />
        <SendButton onClick={sendMessage} disabled={!hasContent} />
      </div>

      {/* Drag Overlay */}
      {isDragOver && isDragEnabled && (
        <div className="drop-zone" aria-live="polite">
          <UploadIcon size={24} />
          <span>{t("dropToUpload") || "拖放文件到此处上传"}</span>
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
        /* ... CSS 样式保持不变 ... */
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
          /* 调大默认最大高度 */
          max-height: 200px;
          padding: 10px 12px;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid ${theme.border};
          border-radius: 10px;
          /* 只允许垂直方向拉伸 */
          resize: vertical;
          /* 拉伸后超过高度出现滚动 */
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
            /* 调大桌面端最大高度 */
            max-height: 260px;
            padding: 12px 16px;
            font-size: 15px;
            resize: vertical; /* 保持可调大小 */
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
            /* 调大手机端最大高度 */
            max-height: 180px;
            padding: 8px 10px;
            font-size: 13px;
            resize: vertical; /* 保持可调大小 */
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
