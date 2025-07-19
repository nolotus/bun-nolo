import React, { useCallback, useRef, useState, useEffect } from "react";
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
import * as XLSX from "xlsx";
import { convertExcelToSlate } from "utils/excelToSlate";
import { convertDocxToSlate } from "./docxToSlate";
import { convertPdfToSlate } from "create/editor/utils/pdfToSlate";
import { convertTxtToSlate } from "create/editor/utils/txtToSlate";

// web
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
import SendButton from "./ActionButton";
import FileUploadButton from "./FileUploadButton";
import { UploadIcon } from "@primer/octicons-react"; // <--- 修正：重新导入 UploadIcon
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreviewingFile, setLocalPreviewingFile] =
    useState<PendingFile | null>(null);

  // 文件处理状态
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

        // 标记为处理中
        setProcessingFiles((prev) => new Set(prev).add(fileId));
        setFileErrors((prev) => {
          const m = new Map(prev);
          m.delete(fileId);
          return m;
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
          const name = file.name.toLowerCase();
          const sheetExts = [".xlsx", ".xls", ".csv", ".ods", ".xlsm", ".xlsb"];
          if (sheetExts.some((ext) => name.endsWith(ext))) {
            fileType = "excel";
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(buf, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(ws);
            slateData = convertExcelToSlate(jsonData, file.name);
          } else if (name.endsWith(".docx")) {
            fileType = "docx";
            slateData = await convertDocxToSlate(file);
          } else if (name.endsWith(".pdf")) {
            fileType = "pdf";
            slateData = await convertPdfToSlate(file);
          } else if (name.endsWith(".txt") || file.type === "text/plain") {
            fileType = "txt";
            slateData = await convertTxtToSlate(await file.text());
          } else {
            throw new Error("不支持的文件类型");
          }

          const result = await dispatch(
            createPageAndAddReference({
              slateData,
              jsonData,
              title: file.name,
              type: fileType,
              fileId,
              size: file.size,
            })
          );

          if (createPageAndAddReference.fulfilled.match(result)) {
            toast.success(
              t("fileProcessedSuccess", "{{fileName}} 处理成功!", {
                fileName: file.name,
              }),
              { id: toastId }
            );
          } else {
            throw new Error((result.payload as string) || "创建页面引用失败");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "处理文件时出错";
          setFileErrors((prev) => new Map(prev).set(fileId, msg));
          toast.error(
            t("fileProcessedError", "处理 {{fileName}} 时出错: {{error}}", {
              fileName: file.name,
              error: msg,
            }),
            { id: toastId }
          );
        } finally {
          setProcessingFiles((prev) => {
            const s = new Set(prev);
            s.delete(fileId);
            return s;
          });
        }
      }
    },
    [dispatch, t]
  );

  const clearInputState = useCallback(() => {
    setTextContent("");
    setLocalImagePreviews([]);
    setFileErrors(new Map());
    dispatch(clearPendingAttachments());
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [dispatch]);

  const sendMessage = useCallback(() => {
    const trimmed = textContent.trim();
    if (!trimmed && !localImagePreviews.length && !pendingFiles.length) return;
    if (processingFiles.size > 0) {
      toast.error(t("waitForProcessing", "请等待文件处理完成"));
      return;
    }

    const parts: any[] = [];
    if (trimmed) parts.push({ type: "text", text: trimmed });
    pendingFiles.forEach((f) => {
      parts.push({ type: f.type, name: f.name, pageKey: f.pageKey });
    });

    const imgPromises = localImagePreviews.map(async (img) => {
      try {
        const url = await compressImage(img.url);
        return { type: "image_url", image_url: { url } };
      } catch {
        toast.error(t("compressionErrorMessage", "图片压缩失败，将发送原图"));
        return { type: "image_url", image_url: { url: img.url } };
      }
    });

    clearInputState();

    (async () => {
      try {
        const images = await Promise.all(imgPromises);
        const finalParts = [...parts, ...images];
        let content: string | any[] = finalParts;
        if (finalParts.length === 1 && finalParts[0].type === "text") {
          content = finalParts[0].text!;
        }
        if (finalParts.length > 0) {
          await dispatch(handleSendMessage({ userInput: content })).unwrap();
        }
      } catch {
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
    const ta = e.target;
    ta.style.height = "auto";
    const maxH = window.innerWidth > 768 ? 140 : 100;
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    setTextContent(ta.value);
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

  const enhancedPendingFiles = pendingFiles.map((f) => ({
    ...f,
    error: fileErrors.get(f.id),
  }));

  const hasContent =
    textContent.trim() ||
    localImagePreviews.length > 0 ||
    pendingFiles.length > 0;
  const isDisabled = processingFiles.size > 0;

  return (
    <>
      <style href="message-input" precedence="medium">{`
        /* ... 样式代码和之前一样，保持不变 ... */
        .message-input-container {
          --container-padding: var(--space-4);
          --container-gap: var(--space-3);
          --container-border-radius: var(--space-3);
          --element-transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          bottom: 0; left: 0; right: 0; width: 100%;
          padding: var(--container-padding);
          padding-bottom: calc(var(--container-padding)+env(safe-area-inset-bottom,0px));
          display: flex; flex-direction: column; gap: var(--container-gap);
          background: var(--background);
          border-top: 1px solid var(--borderLight);
          box-shadow: 0 -4px 12px var(--shadowLight), inset 0 1px 0 rgba(255,255,255,0.05);
          z-index: ${zIndex.messageInputContainerZIndex};
          transition: var(--element-transition);
        }
        .message-input-container.processing { opacity: 0.85; }
        .input-controls { display: flex; gap: var(--container-gap); width:100%; align-items:flex-end; }
        .message-textarea {
          flex:1; min-height:44px; max-height:200px;
          padding: var(--container-gap) var(--container-padding);
          font-size:0.925rem; line-height:1.5;
          border:1px solid var(--border);
          border-radius:var(--container-border-radius);
          resize:none; overflow-y:auto; scroll-behavior:smooth; -webkit-overflow-scrolling: touch;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;
          background:var(--backgroundSecondary); color:var(--text);
          transition:var(--element-transition); letter-spacing:-0.01em;
          box-shadow:0 1px 3px var(--shadowLight), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .message-textarea::placeholder { color:var(--placeholder); opacity:1; }
        .message-textarea:disabled { opacity:0.65; cursor:wait; background:var(--backgroundTertiary); }
        .message-textarea:focus {
          outline:none; border-color:var(--primary); background:var(--background);
          box-shadow:0 0 0 3px var(--focus),0 2px 8px var(--shadowMedium),inset 0 1px 0 rgba(255,255,255,0.05);
          transform:translateY(-1px);
        }
        .message-textarea:hover:not(:focus):not(:disabled) {
          border-color:var(--borderHover);
          box-shadow:0 2px 6px var(--shadowLight), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .drop-zone {
          position:absolute; inset:var(--space-2); border-radius:var(--space-4);
          display:flex; align-items:center; justify-content:center;
          background:var(--backgroundGhost); backdrop-filter:blur(12px);
          border:2px dashed var(--primary); color:var(--primary); pointer-events:none;
          z-index:10; opacity:0; animation:dropZoneFadeIn 0.2s ease-out forwards;
        }
        @keyframes dropZoneFadeIn {
          from { opacity:0; transform:scale(0.95); }
          to { opacity:1; transform:scale(1); }
        }
        @keyframes spin {
          0% { transform:rotate(0deg); }
          100% { transform:rotate(360deg); }
        }
        .drop-zone-content {
          display:flex; flex-direction:column; align-items:center; gap:var(--space-3);
          font-size:0.95rem; font-weight:550; letter-spacing:-0.01em;
          padding:var(--space-5); border-radius:var(--container-border-radius);
          background:rgba(var(--background),0.9); backdrop-filter:blur(8px);
          box-shadow:0 4px 20px var(--shadowMedium);
        }
        .processing-indicator {
          position:absolute; top:var(--space-2); right:var(--space-2);
          display:flex; align-items:center; gap:var(--space-2);
          padding:var(--space-2) var(--space-3);
          background:var(--backgroundSecondary); border:1px solid var(--border);
          border-radius:var(--space-2); font-size:0.75rem; color:var(--textSecondary);
          z-index:5; box-shadow:0 2px 8px var(--shadowMedium);
        }
        .processing-spinner {
          width:12px; height:12px;
          border:1.5px solid var(--primary); border-top:1.5px solid transparent;
          border-radius:50%; animation:spin 1s linear infinite;
        }
        @media (max-width:768px) {
          .message-input-container { --container-padding:var(--space-3); --container-gap:var(--space-2); --container-border-radius:var(--space-2); }
          .message-textarea { min-height:40px; max-height:150px; padding:var(--space-2) var(--space-3); font-size:1rem; }
          .drop-zone-content { padding:var(--space-4); font-size:0.875rem; }
          .processing-indicator { top:var(--space-1); right:var(--space-1); padding:var(--space-1) var(--space-2); font-size:0.7rem; }
          .processing-spinner { width:10px; height:10px; border-width:1px; }
        }
        @media (max-width:480px) {
          .message-input-container { --container-padding:var(--space-2); }
          .message-textarea { padding:var(--space-2); font-size:1rem; }
        }
        @media (min-width:769px) {
          .message-input-container {
            max-width:900px; margin:0 auto; padding:var(--space-6) var(--container-padding);
            border-top:none; box-shadow:none; background:transparent;
          }
          .message-textarea { min-height:48px; max-height:200px; font-size:1rem; padding:var(--space-3) var(--space-5); }
        }
        @media (min-width:1400px) {
          .message-input-container { max-width:1000px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .message-input-container, .message-textarea, .processing-spinner {
            transition:border-color 0.1s ease, background-color 0.1s ease; animation:none;
          }
          .message-textarea:hover, .message-textarea:focus { transform:none; }
          .drop-zone { animation:none; }
          .processing-spinner { border:2px solid var(--primary); border-radius:50%; }
        }
        @media (prefers-contrast:high) {
          .message-textarea, .processing-indicator { border-width:2px; }
          .drop-zone { border-width:3px; }
        }
        @media print {
          .message-input-container { display:none; }
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
          <FileUploadButton
            disabled={isDisabled}
            onFilesSelected={(files) => {
              if (!isDisabled) processFiles(files);
            }}
          />

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
              {/* 修正：现在可以正确找到 UploadIcon */}
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
      </div>
    </>
  );
};

export default MessageInput;
