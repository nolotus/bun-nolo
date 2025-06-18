// src/web/chat/MessageInput/MessageInput.tsx

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { compressImage } from "utils/imageUtils";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { UploadIcon } from "@primer/octicons-react";
import { Descendant } from "slate";
import SendButton from "./ActionButton";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
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

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
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
          continue;
        }

        let slateData: Descendant[];
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
            slateData = convertExcelToSlate(
              XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]),
              file.name
            );
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
            toast.error(
              t("unsupportedFileType", "不支持的文件类型: {{fileName}}", {
                fileName: file.name,
              }),
              { id: toastId }
            );
            continue;
          }

          const resultAction = await dispatch(
            createPageAndAddReference({
              slateData,
              title: file.name,
              type: fileType,
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
          toast.error(
            t("fileProcessedError", "处理 {{fileName}} 时出错。", {
              fileName: file.name,
            }),
            { id: toastId }
          );
        }
      }
    },
    [dispatch, t]
  );

  const clearInputState = useCallback(() => {
    setTextContent("");
    setLocalImagePreviews([]);
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

    const parts: Content = [];
    if (trimmedText) {
      parts.push({ type: "text", text: trimmedText });
    }

    const imagePromises = localImagePreviews.map(async (img) => {
      try {
        const compressedUrl = await compressImage(img.url);
        return { type: "image_url", image_url: { url: compressedUrl } };
      } catch (error) {
        toast.error(t("compressionErrorMessage", "图片压缩失败，将发送原图"));
        return { type: "image_url", image_url: { url: img.url } };
      }
    });

    pendingFiles.forEach((file) => {
      parts.push({ type: file.type, name: file.name, pageKey: file.pageKey });
    });

    clearInputState();

    (async () => {
      try {
        const imageParts = await Promise.all(imagePromises);
        const finalParts = [
          ...parts.filter((p) => p.type !== "image_url"),
          ...imageParts,
        ];
        const messageContent =
          finalParts.length === 1 && finalParts[0].type === "text"
            ? finalParts[0].text!
            : finalParts;

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

  const hasContent =
    textContent.trim() ||
    localImagePreviews.length > 0 ||
    pendingFiles.length > 0;

  return (
    <div
      className="message-input-container"
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
        pendingFiles={pendingFiles}
        onRemoveImage={(id) =>
          setLocalImagePreviews((prev) => prev.filter((img) => img.id !== id))
        }
        onPreviewFile={setLocalPreviewingFile}
      />

      <div className="input-controls">
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
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
          processFiles(e.target.files);
          e.target.value = "";
        }}
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
