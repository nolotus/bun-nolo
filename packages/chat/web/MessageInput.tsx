// src/web/chat/MessageInput/MessageInput.tsx

import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Content } from "../messages/types";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { handleSendMessage } from "../messages/messageSlice";
import { compressImage } from "utils/imageUtils";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { UploadIcon } from "@primer/octicons-react";
import {
  FaFileExcel,
  FaFileWord,
  FaFilePdf,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import { Descendant } from "slate";

// --- Redux Actions & Selectors (使用新的 Thunk) ---
import {
  removePendingFile,
  clearPendingAttachments,
  selectPendingFiles,
  createPageAndAddReference,
  type PendingFile,
} from "../dialog/dialogSlice";

// --- 重新引入特定于 Web 的解析库和工具函数 ---
import * as XLSX from "xlsx";
import { convertExcelToSlate } from "utils/excelToSlate";
import { convertDocxToSlate } from "./docxToSlate";
import { convertPdfToSlate } from "create/editor/utils/pdfToSlate";
import { convertTxtToSlate } from "create/editor/utils/txtToSlate";

// --- 配置 PDF.js Worker ---
// 这一行非常重要，确保它在组件文件顶部或应用的入口处被调用

// 本地UI状态的类型定义
interface PendingImagePreview {
  id: string;
  url: string; // Base64 or Blob URL
}

const MessageInput: React.FC = () => {
  // --- Hooks, Refs, and State ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textContent, setTextContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [localImagePreviews, setLocalImagePreviews] = useState<
    PendingImagePreview[]
  >([]);
  const [localPreviewingFile, setLocalPreviewingFile] =
    useState<PendingFile | null>(null);
  const pendingFiles = useAppSelector(selectPendingFiles);

  // --- 文件类型配置 ---
  const FILE_TYPE_CONFIG = {
    excel: { icon: FaFileExcel, title: "电子表格", color: "#1D6F42" }, // --- MODIFICATION --- 标题更通用
    docx: { icon: FaFileWord, title: "Word 文档", color: "#2B579A" },
    pdf: { icon: FaFilePdf, title: "PDF 文档", color: "#DC3545" },
    txt: { icon: FaFileAlt, title: "文本文件", color: "#6c757d" },
    page: { icon: FaFileWord, title: "Page 文档", color: "#FF9500" },
  } as const;

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsDragEnabled(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      localPreviewingFile &&
      !pendingFiles.some((file) => file.id === localPreviewingFile.id)
    ) {
      setLocalPreviewingFile(null);
    }
  }, [pendingFiles, localPreviewingFile]);

  // --- File Handling Callbacks ---
  const handleAddImagePreview = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setLocalImagePreviews((prev) => [
          ...prev,
          { id: nanoid(), url: reader.result as string },
        ]);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (file.type.startsWith("image/")) {
        handleAddImagePreview(file);
        return;
      }

      let slateData: Descendant[];
      let fileType: "excel" | "docx" | "pdf" | "txt" | null = null;
      const toastId = toast.loading(`正在处理 ${file.name}...`);

      try {
        const fileNameLower = file.name.toLowerCase();

        // --- MODIFICATION START: 扩展支持的电子表格格式 ---
        const spreadsheetExtensions = [
          ".xlsx",
          ".xls",
          ".csv",
          ".ods",
          ".xlsm",
          ".xlsb",
        ];
        if (spreadsheetExtensions.some((ext) => fileNameLower.endsWith(ext))) {
          // --- MODIFICATION END ---
          fileType = "excel";
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          slateData = convertExcelToSlate(jsonData, file.name);
        } else if (fileNameLower.endsWith(".docx")) {
          fileType = "docx";
          slateData = await convertDocxToSlate(file);
        } else if (fileNameLower.endsWith(".pdf")) {
          fileType = "pdf";
          slateData = await convertPdfToSlate(file);
        } else if (
          fileNameLower.endsWith(".txt") ||
          file.type === "text/plain"
        ) {
          fileType = "txt";
          const text = await file.text();
          slateData = convertTxtToSlate(text);
        } else {
          toast.error(
            t("unsupportedFileType", `不支持的文件类型: ${file.name}`),
            { id: toastId }
          );
          return;
        }

        const resultAction = await dispatch(
          createPageAndAddReference({
            slateData,
            title: file.name,
            type: fileType,
          })
        );

        if (createPageAndAddReference.fulfilled.match(resultAction)) {
          toast.success(`${file.name} 处理成功!`, { id: toastId });
        } else {
          throw new Error("创建页面或添加引用失败");
        }
      } catch (error) {
        console.error(`处理文件 ${file.name} 失败:`, error);
        toast.error(`处理 ${file.name} 时出错。`, { id: toastId });
      }
    },
    [dispatch, handleAddImagePreview, t]
  );

  // --- Input & Send Logic ---
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
    setLocalImagePreviews([]);
    dispatch(clearPendingAttachments());
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [dispatch]);

  const sendMessage = useCallback(async () => {
    const trimmedText = textContent.trim();
    if (!trimmedText && !localImagePreviews.length && !pendingFiles.length)
      return;

    const parts: Content = [];
    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    if (localImagePreviews.length > 0) {
      const compressionToastId = toast.loading(
        t("compressingImagesMessage", "正在压缩图片..."),
        { duration: Infinity }
      );
      try {
        const compressedUrls = await Promise.all(
          localImagePreviews.map((img) => compressImage(img.url))
        );
        compressedUrls.forEach((url) =>
          parts.push({ type: "image_url", image_url: { url } })
        );
        toast.dismiss(compressionToastId);
      } catch (error) {
        toast.dismiss(compressionToastId);
        console.error("图片压缩失败:", error);
        toast.error(t("compressionErrorMessage", "图片压缩失败，将发送原图"), {
          duration: 4000,
        });
        localImagePreviews.forEach((img) =>
          parts.push({ type: "image_url", image_url: { url: img.url } })
        );
      }
    }

    pendingFiles.forEach((file) => {
      parts.push({ type: file.type, name: file.name, pageKey: file.pageKey });
    });

    const messageContent =
      parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;

    try {
      if (parts.length > 0) {
        dispatch(handleSendMessage({ userInput: messageContent }));
        clearInputState();
      }
    } catch (err) {
      console.error("发送消息失败:", err);
      toast.error(t("sendFailMessage", "消息发送失败"));
    }
  }, [
    textContent,
    localImagePreviews,
    pendingFiles,
    dispatch,
    clearInputState,
    t,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // --- Event Handlers ---
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
      if (isDragEnabled) Array.from(e.dataTransfer.files).forEach(processFile);
    },
    [isDragEnabled, processFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (isDragEnabled) {
        e.preventDefault();
        setIsDragOver(true);
      }
    },
    [isDragEnabled]
  );

  const handleDragLeave = useCallback(() => {
    if (isDragEnabled) setIsDragOver(false);
  }, [isDragEnabled]);

  const triggerFileInput = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) Array.from(e.target.files).forEach(processFile);
      e.target.value = "";
    },
    [processFile]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setLocalImagePreviews((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleRemoveFile = useCallback(
    (id: string) => {
      dispatch(removePendingFile(id));
    },
    [dispatch]
  );

  const handlePreviewFile = useCallback((file: PendingFile) => {
    setLocalPreviewingFile(file);
  }, []);

  const handleClosePreview = useCallback(
    () => setLocalPreviewingFile(null),
    []
  );

  // --- Render Functions ---
  const renderFilePreview = (file: PendingFile) => {
    const config = FILE_TYPE_CONFIG[file.type as keyof typeof FILE_TYPE_CONFIG];
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
            onClick={() => handlePreviewFile(file)}
            title={`点击预览 ${config.title}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePreviewFile(file);
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

  const hasContent =
    textContent.trim() ||
    localImagePreviews.length > 0 ||
    pendingFiles.length > 0;
  const hasAttachments =
    localImagePreviews.length > 0 || pendingFiles.length > 0;

  // --- JSX Output ---
  return (
    <div
      className="message-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={t("messageInputArea", "消息输入区域")}
    >
      {hasAttachments && (
        <div className="attachments-preview">
          <div className="attachments-list">
            {localImagePreviews.length > 0 && (
              <ImagePreview
                images={localImagePreviews}
                onRemove={handleRemoveImage}
              />
            )}
            {pendingFiles.map(renderFilePreview)}
          </div>
        </div>
      )}
      <div className="input-controls">
        <button
          className="upload-button"
          onClick={triggerFileInput}
          title={t("uploadFile", "上传文件")}
          aria-label={t("uploadFile", "上传文件")}
        >
          <UploadIcon size={20} />
        </button>
        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={textContent}
          placeholder={t("messageOrFileHere", "输入消息或拖入文件...")}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          aria-label={t("messageInput", "消息输入框")}
        />
        <SendButton onClick={sendMessage} disabled={!hasContent} />
      </div>
      {isDragOver && isDragEnabled && (
        <div className="drop-zone" aria-live="polite">
          <div className="drop-zone-content">
            <UploadIcon size={32} />
            <span>{t("dropToUpload", "松开即可上传")}</span>
          </div>
        </div>
      )}
      {localPreviewingFile && (
        <DocxPreviewDialog
          isOpen={!!localPreviewingFile}
          onClose={handleClosePreview}
          pageKey={localPreviewingFile.pageKey}
          fileName={localPreviewingFile.name}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        // --- MODIFICATION START: 更新 accept 属性以包含更多电子表格格式 ---
        accept="image/*,.xlsx,.xls,.csv,.ods,.xlsm,.xlsb,.docx,.pdf,.txt,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
        // --- MODIFICATION END ---
        multiple
        onChange={handleFileInputChange}
      />
      <style href="message-input" precedence="medium">{`
        .message-input-container { position: relative; bottom: 0; left: 0; right: 0; width: 100%; padding: ${theme.space[2]} ${theme.space[4]}; padding-bottom: calc(${theme.space[2]} + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; gap: ${theme.space[2]}; background: ${theme.background}; border-top: 1px solid ${theme.borderLight}; box-shadow: 0 -2px 12px ${theme.shadowLight}; z-index: ${zIndex.messageInputContainerZIndex}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .attachments-preview { width: 100%; }
        .attachments-list { display: flex; flex-wrap: wrap; gap: ${theme.space[2]}; padding: ${theme.space[1]} 0; align-items: flex-start; }
        .file-attachment { display: flex; align-items: center; justify-content: space-between; padding: ${theme.space[2]} ${theme.space[3]}; background: ${theme.backgroundSecondary}; border: 1px solid ${theme.border}; border-radius: ${theme.space[2]}; max-width: 200px; min-width: 120px; position: relative; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
        .file-attachment:hover { background: ${theme.backgroundHover}; border-color: ${theme.borderHover}; transform: translateY(-1px); box-shadow: 0 2px 8px ${theme.shadowLight}; }
        .file-preview-content { display: flex; align-items: center; gap: ${theme.space[2]}; flex: 1; min-width: 0; color: var(--file-color, ${theme.textSecondary}); }
        .file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; font-size: 13px; font-weight: 500; transition: text-decoration 0.15s ease; }
        .file-name:hover { text-decoration: underline; }
        .file-name:focus { outline: 2px solid ${theme.primary}; outline-offset: 2px; border-radius: 2px; }
        .remove-file-btn { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: ${theme.error}; border: 2px solid ${theme.background}; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; font-size: 10px; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); z-index: 2; opacity: 0; }
        .file-attachment:hover .remove-file-btn { opacity: 1; }
        .remove-file-btn:hover { transform: scale(1.1); background: #dc2626; }
        .remove-file-btn:focus { opacity: 1; outline: 2px solid ${theme.primary}; outline-offset: 2px; }
        .input-controls { display: flex; gap: ${theme.space[2]}; width: 100%; align-items: flex-end; }
        .message-textarea { flex: 1; min-height: 40px; max-height: 200px; padding: ${theme.space[2]} ${theme.space[3]}; font-size: 14px; line-height: 1.5; border: 1px solid ${theme.border}; border-radius: ${theme.space[2]}; resize: none; overflow-y: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: ${theme.backgroundSecondary}; color: ${theme.text}; transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .message-textarea::placeholder { color: ${theme.placeholder}; }
        .message-textarea:focus { outline: none; border-color: ${theme.primary}; }
        .upload-button { width: 40px; height: 40px; border-radius: ${theme.space[2]}; border: 1px solid ${theme.border}; display: flex; align-items: center; justify-content: center; background: ${theme.background}; color: ${theme.textSecondary}; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .upload-button:hover { background: ${theme.backgroundHover}; color: ${theme.text}; transform: translateY(-1px); }
        .upload-button:active { transform: translateY(0); }
        .upload-button:focus { outline: 2px solid ${theme.primary}; outline-offset: 2px; }
        .drop-zone { position: absolute; inset: 0; border-radius: ${theme.space[2]}; display: flex; align-items: center; justify-content: center; background: ${theme.backgroundGhost}; backdrop-filter: blur(8px); border: 2px dashed ${theme.primary}; color: ${theme.primary}; pointer-events: none; z-index: 10; }
        .drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: ${theme.space[2]}; font-size: 15px; font-weight: 500; }
        @media (max-width: 768px) {
          .message-input-container { padding: ${theme.space[1]} ${theme.space[3]}; }
          .attachments-list { gap: ${theme.space[1]}; }
          .file-attachment { max-width: 150px; min-width: 100px; padding: ${theme.space[1]} ${theme.space[2]}; }
          .file-name { font-size: 12px; }
          .message-textarea { max-height: 150px; font-size: 13px; }
          .upload-button { width: 36px; height: 36px; }
        }
        @media (min-width: 769px) {
          .message-input-container { max-width: 900px; margin: 0 auto; padding: ${theme.space[4]}; border-top: none; box-shadow: none; }
          .file-attachment { max-width: 240px; min-width: 140px; }
          .file-name { font-size: 14px; }
          .message-textarea { min-height: 44px; max-height: 200px; padding: ${theme.space[3]} ${theme.space[4]}; font-size: 15px; }
          .upload-button { width: 44px; height: 44px; }
        }
        @media (min-width: 1400px) { .message-input-container { max-width: 1000px; } }
        @media (prefers-reduced-motion: reduce) { .message-input-container, .file-attachment, .upload-button, .message-textarea { transition: none; } .upload-button:hover, .file-attachment:hover { transform: none; } }
        @media print { .message-input-container { display: none; } }
      `}</style>
    </div>
  );
};

export default MessageInput;
