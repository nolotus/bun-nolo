// chat/web/MessageInput/MessageInput.tsx
import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/store";
import { compressImage } from "utils/imageUtils";
import { nanoid } from "nanoid";
import { Descendant } from "slate";

import {
  handleSendMessage,
  clearPendingAttachments,
  selectPendingFiles,
  createPageAndAddReference,
  type PendingFile,
} from "../dialog/dialogSlice";
import type { Content } from "../messages/types";
import * as XLSX from "xlsx";
import { convertExcelToSlate } from "utils/excelToSlate";
import { convertDocxToSlate } from "./docxToSlate";
import { convertPdfToSlate } from "create/editor/utils/pdfToSlate";
import { convertTxtToSlate } from "create/editor/utils/txtToSlate";

//web
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
import SendButton from "./ActionButton";
import { UploadIcon } from "@primer/octicons-react";
import toast from "react-hot-toast";

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const theme = useTheme();

  const [textContent, setTextContent] = useState("");
  const [localImagePreviews, setLocalImagePreviews] = useState<
    PendingImagePreview[]
  >([]);
  const pendingFiles = useAppSelector(selectPendingFiles);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreviewingFile, setLocalPreviewingFile] =
    useState<PendingFile | null>(null);

  // 新增状态管理
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );
  const [fileErrors, setFileErrors] = useState<Map<string, string>>(new Map());
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        const fileId = nanoid();

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setLocalImagePreviews((prev) => [
                ...prev,
                { id: fileId, url: reader.result as string },
              ]);
            }
          };
          reader.readAsDataURL(file);
          continue;
        }

        // 标记文件为处理中
        setProcessingFiles((prev) => new Set(prev).add(fileId));

        // 清除可能存在的错误状态
        setFileErrors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });

        let slateData: Descendant[];
        let jsonData: Record<string, any>[] | undefined;
        let fileType: "excel" | "docx" | "pdf" | "txt" | null = null;
        const toastId = toast.loading(
          t("processingFile", "正在处理 {{fileName}}...", {
            fileName: file.name,
          })
        );

        try {
          const fileNameLower = file.name.toLowerCase();
          const spreadsheetExtensions = [
            ".xlsx",
            ".xls",
            ".csv",
            ".ods",
            ".xlsm",
            ".xlsb",
          ];

          if (
            spreadsheetExtensions.some((ext) => fileNameLower.endsWith(ext))
          ) {
            fileType = "excel";
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            jsonData = XLSX.utils.sheet_to_json(worksheet);
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
            slateData = await convertTxtToSlate(await file.text());
          } else {
            throw new Error("不支持的文件类型");
          }

          const resultAction = await dispatch(
            createPageAndAddReference({
              slateData,
              jsonData,
              title: file.name,
              type: fileType,
              fileId, // 传递文件ID
              size: file.size, // 传递文件大小
            })
          );

          if (createPageAndAddReference.fulfilled.match(resultAction)) {
            toast.success(
              t("fileProcessedSuccess", "{{fileName}} 处理成功!", {
                fileName: file.name,
              }),
              { id: toastId }
            );
          } else {
            throw new Error(
              (resultAction.payload as string) || "创建页面引用失败"
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "处理文件时出错";

          // 标记文件错误
          setFileErrors((prev) => new Map(prev).set(fileId, errorMessage));

          toast.error(
            t("fileProcessedError", "处理 {{fileName}} 时出错: {{error}}", {
              fileName: file.name,
              error: errorMessage,
            }),
            { id: toastId }
          );
        } finally {
          // 移除处理中状态
          setProcessingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
          });
        }
      }
    },
    [dispatch, t]
  );

  const clearInputState = useCallback(() => {
    setTextContent("");
    setLocalImagePreviews([]);
    setFileErrors(new Map()); // 清理错误状态
    dispatch(clearPendingAttachments());
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [dispatch]);

  const sendMessage = useCallback(() => {
    const trimmedText = textContent.trim();
    if (!trimmedText && !localImagePreviews.length && !pendingFiles.length)
      return;

    // 检查是否有处理中的文件
    if (processingFiles.size > 0) {
      toast.error(t("waitForProcessing", "请等待文件处理完成"));
      return;
    }

    const parts: any[] = [];
    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    pendingFiles.forEach((file) => {
      parts.push({ type: file.type, name: file.name, pageKey: file.pageKey });
    });

    const imagePromises = localImagePreviews.map(async (img) => {
      try {
        const compressedUrl = await compressImage(img.url);
        return { type: "image_url", image_url: { url: compressedUrl } };
      } catch (error) {
        toast.error(t("compressionErrorMessage", "图片压缩失败，将发送原图"));
        return { type: "image_url", image_url: { url: img.url } };
      }
    });

    clearInputState();

    (async () => {
      try {
        const imageParts = await Promise.all(imagePromises);
        const finalParts = [...parts, ...imageParts];

        let messageContent: string | any[] = finalParts;
        if (finalParts.length === 1 && finalParts[0].type === "text") {
          messageContent = finalParts[0].text!;
        }

        if (finalParts.length > 0) {
          await dispatch(
            handleSendMessage({ userInput: messageContent })
          ).unwrap();
        }
      } catch (err) {
        toast.error(t("sendFailMessage", "消息发送失败"));
      }
    })();
  }, [
    textContent,
    localImagePreviews,
    pendingFiles,
    processingFiles,
    dispatch,
    clearInputState,
    t,
  ]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = window.innerWidth > 768 ? 140 : 100;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    setTextContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    processFiles(e.clipboardData.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  // 获取增强的 pendingFiles（包含错误信息）
  const enhancedPendingFiles = pendingFiles.map((file) => ({
    ...file,
    error: fileErrors.get(file.id),
  }));

  const hasContent =
    textContent.trim() ||
    localImagePreviews.length > 0 ||
    pendingFiles.length > 0;

  const isDisabled = processingFiles.size > 0;

  return (
    <>
      <style href="message-input" precedence="medium">{`
        .message-input-container {
          position: relative;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: ${theme.space[4]};
          padding-bottom: calc(${theme.space[4]} + env(safe-area-inset-bottom, 0px));
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
          background: ${theme.background};
          border-top: 1px solid ${theme.borderLight};
          box-shadow: 
            0 -4px 12px ${theme.shadowLight},
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          z-index: ${zIndex.messageInputContainerZIndex};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .message-input-container.processing {
          opacity: 0.85;
        }

        .input-controls {
          display: flex;
          gap: ${theme.space[3]};
          width: 100%;
          align-items: flex-end;
        }

        .message-textarea {
          flex: 1;
          min-height: 44px;
          max-height: 200px;
          padding: ${theme.space[3]} ${theme.space[4]};
          font-size: 0.925rem;
          line-height: 1.5;
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[3]};
          resize: none;
          overflow-y: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: -0.01em;
          box-shadow: 
            0 1px 3px ${theme.shadowLight},
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .message-textarea:disabled {
          opacity: 0.65;
          cursor: wait;
          background: ${theme.backgroundTertiary};
        }

        .message-textarea::placeholder {
          color: ${theme.placeholder};
          opacity: 1;
        }

        .message-textarea:focus {
          outline: none;
          border-color: ${theme.primary};
          background: ${theme.background};
          box-shadow: 
            0 0 0 3px ${theme.primary}20,
            0 2px 8px ${theme.shadowMedium},
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .message-textarea:hover:not(:focus):not(:disabled) {
          border-color: ${theme.borderHover};
          box-shadow: 
            0 2px 6px ${theme.shadowLight},
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .message-textarea:-webkit-autofill,
        .message-textarea:-webkit-autofill:hover,
        .message-textarea:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${theme.backgroundSecondary} inset;
          -webkit-text-fill-color: ${theme.text};
        }

        .upload-button {
          width: 44px;
          height: 44px;
          border-radius: ${theme.space[3]};
          border: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: 
            0 1px 3px ${theme.shadowLight},
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }

        .upload-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .upload-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}06 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .upload-button:hover:not(:disabled) {
          background: ${theme.background};
          color: ${theme.primary};
          border-color: ${theme.borderHover};
          transform: translateY(-2px);
          box-shadow: 
            0 4px 12px ${theme.shadowMedium},
            0 0 0 1px ${theme.primary}12,
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .upload-button:hover:not(:disabled)::before {
          opacity: 1;
        }

        .upload-button:active:not(:disabled) {
          transform: translateY(0);
          transition-duration: 0.1s;
          box-shadow: 
            0 1px 3px ${theme.shadowLight},
            inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .upload-button:focus-visible {
          outline: none;
          box-shadow: 
            0 0 0 2px ${theme.background},
            0 0 0 4px ${theme.primary},
            0 1px 3px ${theme.shadowLight};
        }

        .upload-button:focus:not(:focus-visible) {
          outline: none;
          box-shadow: 
            0 1px 3px ${theme.shadowLight},
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .drop-zone {
          position: absolute;
          inset: ${theme.space[2]};
          border-radius: ${theme.space[4]};
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.backgroundGhost};
          backdrop-filter: blur(12px);
          border: 2px dashed ${theme.primary};
          color: ${theme.primary};
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          animation: dropZoneFadeIn 0.2s ease-out forwards;
        }

        @keyframes dropZoneFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${theme.space[3]};
          font-size: 0.95rem;
          font-weight: 550;
          letter-spacing: -0.01em;
          padding: ${theme.space[5]};
          border-radius: ${theme.space[3]};
          background: ${theme.background}90;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px ${theme.shadowMedium};
        }

        .processing-indicator {
          position: absolute;
          top: ${theme.space[2]};
          right: ${theme.space[2]};
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          z-index: 5;
          box-shadow: 0 2px 8px ${theme.shadowMedium};
        }

        .processing-spinner {
          width: 12px;
          height: 12px;
          border: 1.5px solid ${theme.primary};
          border-top: 1.5px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message-textarea:focus-visible {
          outline: none;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .message-input-container {
            padding: ${theme.space[3]};
            gap: ${theme.space[2]};
          }

          .input-controls {
            gap: ${theme.space[2]};
          }

          .message-textarea {
            min-height: 40px;
            max-height: 150px;
            padding: ${theme.space[2]} ${theme.space[3]};
            font-size: 1rem;
            border-radius: ${theme.space[2]};
          }

          .upload-button {
            width: 40px;
            height: 40px;
            border-radius: ${theme.space[2]};
          }

          .drop-zone-content {
            padding: ${theme.space[4]};
            font-size: 0.875rem;
          }

          .processing-indicator {
            top: ${theme.space[1]};
            right: ${theme.space[1]};
            padding: ${theme.space[1]} ${theme.space[2]};
            font-size: 0.7rem;
          }

          .processing-spinner {
            width: 10px;
            height: 10px;
            border-width: 1px;
          }
        }

        @media (max-width: 480px) {
          .message-input-container {
            padding: ${theme.space[2]};
          }

          .message-textarea {
            padding: ${theme.space[2]};
            font-size: 1rem;
          }

          .upload-button {
            width: 36px;
            height: 36px;
          }
        }

        /* 桌面端优化 */
        @media (min-width: 769px) {
          .message-input-container {
            max-width: 900px;
            margin: 0 auto;
            padding: ${theme.space[6]} ${theme.space[4]};
            border-top: none;
            box-shadow: none;
            background: transparent;
          }

          .message-textarea {
            min-height: 48px;
            max-height: 200px;
            font-size: 1rem;
            padding: ${theme.space[3]} ${theme.space[5]};
          }

          .upload-button {
            width: 48px;
            height: 48px;
          }
        }

        @media (min-width: 1400px) {
          .message-input-container {
            max-width: 1000px;
          }
        }

        /* 可访问性和性能优化 */
        @media (prefers-reduced-motion: reduce) {
          .message-input-container,
          .message-textarea,
          .upload-button,
          .processing-spinner {
            transition: border-color 0.1s ease, background-color 0.1s ease;
            animation: none;
          }

          .upload-button:hover,
          .message-textarea:focus {
            transform: none;
          }

          .drop-zone {
            animation: none;
          }

          .processing-spinner {
            border: 2px solid ${theme.primary};
            border-radius: 50%;
          }
        }

        @media (prefers-contrast: high) {
          .message-textarea,
          .upload-button,
          .processing-indicator {
            border-width: 2px;
          }

          .drop-zone {
            border-width: 3px;
          }
        }

        @media print {
          .message-input-container {
            display: none;
          }
        }
      `}</style>
      <div
        className={`message-input-container ${isDisabled ? "processing" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        aria-label={t("messageInputArea", "消息输入区域")}
      >
        <AttachmentsPreview
          imagePreviews={localImagePreviews}
          pendingFiles={enhancedPendingFiles}
          onRemoveImage={(id) =>
            setLocalImagePreviews((prev) => prev.filter((img) => img.id !== id))
          }
          onPreviewFile={setLocalPreviewingFile}
          processingFiles={processingFiles}
          isMobile={isMobile}
        />

        <div className="input-controls">
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            title={t("uploadFile", "上传文件")}
            aria-label={t("uploadFile", "上传文件")}
            disabled={isDisabled}
          >
            <UploadIcon size={20} />
          </button>

          <textarea
            ref={textareaRef}
            className="message-textarea"
            value={textContent}
            placeholder={
              isDisabled
                ? t("waitForProcessing", "等待文件处理完成...")
                : t("messageOrFileHere", "输入消息或拖入文件...")
            }
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            aria-label={t("messageInput", "消息输入框")}
            disabled={isDisabled}
          />

          <SendButton
            onClick={sendMessage}
            disabled={!hasContent || isDisabled}
          />
        </div>

        {/* 处理状态指示器 */}
        {processingFiles.size > 0 && (
          <div className="processing-indicator">
            <div className="processing-spinner" />
            <span>
              {t("processingFiles", "处理中 {{count}} 个文件", {
                count: processingFiles.size,
              })}
            </span>
          </div>
        )}

        {isDragOver && (
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
            onClose={() => setLocalPreviewingFile(null)}
            pageKey={localPreviewingFile.pageKey}
            fileName={localPreviewingFile.name}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,.xlsx,.xls,.csv,.ods,.xlsm,.xlsb,.docx,.pdf,.txt,text/plain"
          multiple
          onChange={(e) => {
            if (!isDisabled) {
              processFiles(e.target.files);
              if (e.target) e.target.value = "";
            }
          }}
        />
      </div>
    </>
  );
};

export default MessageInput;
