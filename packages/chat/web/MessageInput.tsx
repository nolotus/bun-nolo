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
  addPendingFile,
  removePendingImagePreview,
  removePendingFile,
  setPreviewingFile,
  clearPendingAttachments,
  selectPendingImagePreviews,
  selectPendingFiles,
  selectPreviewingFileObject,
} from "../dialog/dialogSlice";
import { compressImage } from "utils/imageUtils";
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { UploadIcon } from "@primer/octicons-react";
import { FaFileExcel, FaFileWord, FaFilePdf, FaTimes } from "react-icons/fa";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { convertDocxToSlate } from "./docxToSlate";
import { convertPdfToSlate } from "./pdfToSlate";
import { convertExcelToSlate } from "utils/excelToSlate";
import { createPage } from "render/page/pageSlice";

interface PendingFile {
  id: string;
  name: string;
  pageKey: string;
  type: "excel" | "docx" | "pdf" | "page";
}

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
  const pendingFiles = useAppSelector(selectPendingFiles);
  const previewingFile = useAppSelector(selectPreviewingFileObject);

  // 文件类型配置：与 MessageContent 保持一致
  const FILE_TYPE_CONFIG = {
    excel: {
      icon: FaFileExcel,
      title: "Excel 文件",
      color: "#1D6F42", // Excel 绿色
    },
    docx: {
      icon: FaFileWord,
      title: "Word 文档",
      color: "#2B579A", // Word 蓝色
    },
    pdf: {
      icon: FaFilePdf,
      title: "PDF 文档",
      color: "#DC3545", // PDF 红色
    },
    page: {
      icon: FaFileWord,
      title: "Page 文档",
      color: "#FF9500", // Pages 橙色
    },
  } as const;

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
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          toast.error(t("fileReadErrorMessage"));
          return;
        }
        try {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            toast.error(t("excelEmptyMessage"));
            return;
          }
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length > 0) {
            const slateContent = convertExcelToSlate(jsonData, file.name);
            const pageKey = await dispatch(
              createPage({
                slateData: slateContent,
                title: file.name,
              })
            ).unwrap();

            const newExcelFile: PendingFile = {
              id: nanoid(),
              name: file.name,
              pageKey: pageKey,
              type: "excel",
            };
            dispatch(addPendingFile(newExcelFile));
            toast.success(t("excelUploadSuccess"));
          } else {
            toast.error(t("excelNoDataMessage"));
          }
        } catch (error) {
          toast.error(t("excelParseErrorMessage"));
          console.error("Excel parsing error:", error);
        }
      };
      reader.onerror = () => {
        toast.error(t("fileReadErrorMessage"));
      };
      reader.readAsArrayBuffer(file);
    },
    [dispatch, t]
  );

  const handleParseDocx = useCallback(
    async (file: File) => {
      try {
        const slateContent = await convertDocxToSlate(file);
        const pageKey = await dispatch(
          createPage({
            slateData: slateContent,
            title: file.name,
          })
        ).unwrap();

        const newDocxFile: PendingFile = {
          id: nanoid(),
          name: file.name,
          pageKey: pageKey,
          type: "docx",
        };
        dispatch(addPendingFile(newDocxFile));
        toast.success(t("docxUploadSuccess"));
      } catch (error) {
        console.error("处理 DOCX 文件失败：", error);
        toast.error(t("docxUploadError"));
      }
    },
    [dispatch, t]
  );

  const handleParsePdf = useCallback(
    async (file: File) => {
      try {
        const slateContent = await convertPdfToSlate(file);
        const pageKey = await dispatch(
          createPage({
            slateData: slateContent,
            title: file.name,
          })
        ).unwrap();

        const newPdfFile: PendingFile = {
          id: nanoid(),
          name: file.name,
          pageKey: pageKey,
          type: "pdf",
        };
        dispatch(addPendingFile(newPdfFile));
        toast.success(t("pdfUploadSuccess"));
      } catch (error) {
        console.error("处理 PDF 文件失败：", error);
        toast.error(t("pdfUploadError"));
      }
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
      } else if (fileNameLower.endsWith(".docx")) {
        handleParseDocx(file);
      } else if (fileNameLower.endsWith(".pdf")) {
        handleParsePdf(file);
      }
    },
    [
      handleAddImagePreview,
      handleParseAndAddExcel,
      handleParseDocx,
      handleParsePdf,
    ]
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
    const currentFiles = pendingFiles;
    const trimmedText = textContent.trim();

    if (!trimmedText && !currentImagePreviews.length && !currentFiles.length) {
      return;
    }

    let messageContent: Content;
    const parts: ({ type: string } & Record<string, any>)[] = [];

    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    if (currentImagePreviews.length > 0) {
      const compressionToastId = toast.loading(t("compressingImagesMessage"), {
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
        toast.error(t("compressionErrorMessage"), { duration: 4000 });
        currentImagePreviews.forEach((img) => {
          parts.push({ type: "image_url", image_url: { url: img.url } });
        });
      }
    }

    currentFiles.forEach((file) => {
      parts.push({
        type: file.type,
        name: file.name,
        pageKey: file.pageKey,
      });
    });

    if (parts.length > 1) {
      messageContent = parts;
    } else if (parts.length === 1 && parts[0].type === "text") {
      messageContent = parts[0].text;
    } else if (parts.length === 1) {
      messageContent = parts;
    } else {
      return;
    }

    try {
      dispatch(handleSendMessage({ userInput: messageContent }));
      clearInputState();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(t("sendFailMessage"));
    }
  }, [textContent, imagePreviews, pendingFiles, dispatch, clearInputState, t]);

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

  const handleRemoveFile = useCallback(
    (idToRemove: string) => {
      dispatch(removePendingFile(idToRemove));
    },
    [dispatch]
  );

  const handlePreviewFile = useCallback(
    (idToPreview: string, type: keyof typeof FILE_TYPE_CONFIG) => {
      dispatch(setPreviewingFile({ id: idToPreview, type }));
    },
    [dispatch]
  );

  const handleClosePreview = useCallback(() => {
    dispatch(setPreviewingFile(null));
  }, [dispatch]);

  // 文件预览渲染函数 - 与 MessageContent 保持一致
  const renderFilePreview = (file: PendingFile) => {
    const config = FILE_TYPE_CONFIG[file.type];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div
        key={file.id}
        className="file-attachment"
        style={{ "--file-color": config.color } as React.CSSProperties}
      >
        <div className="file-preview-content">
          <IconComponent size={16} />
          <span
            className="file-name"
            onClick={() => handlePreviewFile(file.id, file.type)}
            title={`点击预览 ${config.title}`}
            role="button"
            aria-label={`${config.title}: ${file.name}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePreviewFile(file.id, file.type);
              }
            }}
          >
            {file.name}
          </span>
        </div>
        <button
          className="remove-file-btn"
          onClick={() => handleRemoveFile(file.id)}
          aria-label={`删除 ${file.name}`}
          title={`删除 ${file.name}`}
        >
          <FaTimes size={12} />
        </button>
      </div>
    );
  };

  // Render Logic
  const hasContent =
    textContent.trim() || imagePreviews.length > 0 || pendingFiles.length > 0;

  const hasAttachments = imagePreviews.length > 0 || pendingFiles.length > 0;

  return (
    <div
      className="message-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={t("messageInputArea")}
    >
      {/* 统一的附件预览区域 - 横向排列 */}
      {hasAttachments && (
        <div className="attachments-preview">
          <div className="attachments-list">
            {/* 使用新的 ImagePreview 组件 */}
            {imagePreviews.length > 0 && (
              <ImagePreview
                images={imagePreviews}
                onRemove={handleRemoveImage}
              />
            )}
            {/* 渲染文件预览 */}
            {pendingFiles.map(renderFilePreview)}
          </div>
        </div>
      )}

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
          <div className="drop-zone-content">
            <UploadIcon size={32} />
            <span>{t("dropToUpload")}</span>
          </div>
        </div>
      )}

      {/* Unified File Preview Dialog */}
      {previewingFile && (
        <DocxPreviewDialog
          isOpen={!!previewingFile}
          onClose={handleClosePreview}
          pageKey={previewingFile.pageKey}
          fileName={previewingFile.name}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.xlsx,.xls,.csv,.docx,.pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
        multiple
        onChange={handleFileInputChange}
      />

      {/* Styles */}
      <style href="message-input" precedence="medium">{`
        .message-input-container {
          position: relative;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: ${theme.space[2]} ${theme.space[4]};
          padding-bottom: calc(${theme.space[2]} + env(safe-area-inset-bottom, 0px));
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
          background: ${theme.background};
          border-top: 1px solid ${theme.borderLight};
          box-shadow: 0 -2px 12px ${theme.shadowLight};
          z-index: ${zIndex.messageInputContainerZIndex};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .attachments-preview {
          width: 100%;
        }

        .attachments-list {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[2]};
          padding: ${theme.space[1]} 0;
          align-items: flex-start;
        }

        /* 文件附件样式 */
        .file-attachment {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          max-width: 200px;
          min-width: 120px;
          position: relative;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .file-attachment:hover {
          background: ${theme.backgroundHover};
          border-color: ${theme.borderHover};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }

        .file-preview-content {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          flex: 1;
          min-width: 0;
          color: var(--file-color, ${theme.textSecondary});
        }

        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: text-decoration 0.15s ease;
        }

        .file-name:hover {
          text-decoration: underline;
        }

        .file-name:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
          border-radius: 2px;
        }

        /* 删除文件按钮样式 */
        .remove-file-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme.error};
          border: 2px solid ${theme.background};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
          opacity: 0;
        }

        .file-attachment:hover .remove-file-btn {
          opacity: 1;
        }

        .remove-file-btn:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .remove-file-btn:focus {
          opacity: 1;
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .input-controls {
          display: flex;
          gap: ${theme.space[2]};
          width: 100%;
          align-items: flex-end;
        }

        .message-textarea {
          flex: 1;
          min-height: 40px;
          max-height: 200px;
          padding: ${theme.space[2]} ${theme.space[3]};
          font-size: 14px;
          line-height: 1.5;
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          resize: vertical;
          overflow-y: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .message-textarea::placeholder {
          color: ${theme.placeholder};
        }

        .message-textarea:focus {
          outline: none;
          border-color: ${theme.primary};
        }

        .upload-button {
          width: 40px;
          height: 40px;
          border-radius: ${theme.space[2]};
          border: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.background};
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .upload-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
          transform: translateY(-1px);
        }

        .upload-button:active {
          transform: translateY(0);
        }

        .upload-button:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .drop-zone {
          position: absolute;
          inset: 0;
          border-radius: ${theme.space[2]};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.backgroundGhost};
          backdrop-filter: blur(8px);
          border: 2px dashed ${theme.primary};
          color: ${theme.primary};
          pointer-events: none;
          z-index: 10;
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${theme.space[2]};
          font-size: 15px;
          font-weight: 500;
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .message-input-container {
            padding: ${theme.space[1]} ${theme.space[3]};
          }

          .attachments-list {
            gap: ${theme.space[1]};
          }
          
          .file-attachment {
            max-width: 150px;
            min-width: 100px;
            padding: ${theme.space[1]} ${theme.space[2]};
          }

          .file-name {
            font-size: 12px;
          }
          
          .message-textarea {
            max-height: 150px;
            font-size: 13px;
          }

          .upload-button {
            width: 36px;
            height: 36px;
          }
        }

        @media (min-width: 769px) {
          .message-input-container {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
            padding: ${theme.space[4]};
            border-top: none;
            box-shadow: none;
          }

          .file-attachment {
            max-width: 240px;
            min-width: 140px;
          }

          .file-name {
            font-size: 14px;
          }

          .message-textarea {
            min-height: 44px;
            max-height: 200px;
            padding: ${theme.space[3]} ${theme.space[4]};
            font-size: 15px;
          }

          .upload-button {
            width: 44px;
            height: 44px;
          }
        }

        @media (min-width: 1400px) {
          .message-input-container {
            max-width: 1000px;
          }
        }

        /* 减少动画偏好设置 */
        @media (prefers-reduced-motion: reduce) {
          .message-input-container,
          .file-attachment,
          .upload-button,
          .message-textarea {
            transition: none;
          }
          
          .upload-button:hover,
          .file-attachment:hover {
            transform: none;
          }
        }

        /* 打印样式 */
        @media print {
          .message-input-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageInput;
