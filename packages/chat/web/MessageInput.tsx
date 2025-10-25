import React, { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/store";
import { compressImage } from "utils/imageUtils";
import { nanoid } from "nanoid";

import {
  handleSendMessage,
  clearPendingAttachments,
  selectPendingFiles,
  type PendingFile,
} from "../dialog/dialogSlice";
import { processDocumentFile } from "./fileProcessor";

// web
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
import SendButton from "./ActionButton";
import FileUploadButton from "./FileUploadButton";
import { UploadIcon } from "@primer/octicons-react";
import toast from "react-hot-toast";

// 为消息体定义一个更清晰的类型
type MessagePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: string; name: string; pageKey: string };

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");

  const containerRef = useRef<HTMLDivElement>(null);

  const [textContent, setTextContent] = useState("");
  const [localImagePreviews, setLocalImagePreviews] = useState<
    PendingImagePreview[]
  >([]);
  const pendingFiles = useAppSelector(selectPendingFiles);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localPreviewingFile, setLocalPreviewingFile] =
    useState<PendingFile | null>(null);

  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );
  const [fileErrors, setFileErrors] = useState<Map<string, string>>(new Map());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.offsetHeight;
        document.documentElement.style.setProperty(
          "--message-input-height",
          `${height}px`
        );
      }
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.removeProperty("--message-input-height");
    };
  }, []);

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
        if (file.type.startsWith("image/")) {
          const fileId = nanoid();
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

        const fileId = nanoid();
        setProcessingFiles((prev) => new Set(prev).add(fileId));
        setFileErrors((prev) => {
          const m = new Map(prev);
          m.delete(fileId);
          return m;
        });

        try {
          await processDocumentFile({ file, fileId, dispatch, t, toast });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "处理文件时出错";
          setFileErrors((prev) => new Map(prev).set(fileId, msg));
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

    const parts: MessagePart[] = [];
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
        const finalParts: MessagePart[] = [...parts, ...images];
        let content: string | MessagePart[] = finalParts;
        if (finalParts.length === 1 && finalParts[0].type === "text") {
          content = finalParts[0].text!;
        }
        if (finalParts.length > 0) {
          await dispatch(handleSendMessage({ userInput: content })).unwrap();
        }
      } catch (error: any) {
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || t("sendFailMessage", "消息发送失败");
        toast.error(errorMessage);
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
    const maxH = window.innerWidth > 768 ? 200 : 140; // 增加了最大高度
    ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    setTextContent(ta.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      !isMobile &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
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
      <style href="message-input" precedence="medium">
        {`
        .message-input-container {
            --container-padding: var(--space-4);
            --container-gap: var(--space-2);
            --container-border-radius: var(--space-3); /* 略微增大圆角 */
            --element-transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            
            position: sticky; bottom: 0; width: 100%;
            padding: var(--container-padding);
            padding-bottom: calc(var(--container-padding) + env(safe-area-inset-bottom, 0px));
            background: var(--background);
            z-index: ${zIndex.messageInputContainerZIndex};
        }
        .input-wrapper { max-width: 100%; margin: 0 auto; }
        .input-controls { display: flex; gap: var(--container-gap); align-items: flex-end; width: 100%; }
        .message-textarea {
            flex: 1;
            /* --- [核心修改] 增加默认高度 --- */
            min-height: 72px;
            max-height: 200px;
            padding: 22px var(--container-padding); /* 调整内边距以适应高度 */
            font-size: 16px;
            line-height: 1.5;
            /* --- [核心修改] 增加默认边框，使其更显眼 --- */
            border: 1px solid var(--border);
            border-radius: var(--container-border-radius);
            background: var(--backgroundSecondary);
            box-shadow: inset 0 1px 2px var(--shadowLight);
            color: var(--text);
            resize: none;
            outline: none;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            transition: var(--element-transition);
            letter-spacing: -0.01em;
        }
        .message-textarea::placeholder { color: var(--textTertiary); }
        .message-textarea:focus {
            background: var(--background);
            /* --- [核心修改] 聚焦时边框变色 --- */
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--focus), inset 0 1px 2px var(--shadowMedium);
            transform: translateY(-2px);
        }
        .message-textarea:hover:not(:focus):not(:disabled) {
            border-color: var(--borderHover);
            background: var(--backgroundHover);
            box-shadow: inset 0 1px 3px var(--shadowMedium);
        }
        .message-textarea:disabled { opacity: 0.6; background: var(--backgroundTertiary); }
        .drop-zone {
            position: absolute; inset: var(--space-2); 
            background: rgba(var(--primaryBgRGB), 0.8);
            backdrop-filter: blur(10px);
            border: 2px dashed var(--primary); border-radius: var(--container-border-radius);
            display: flex; align-items: center; justify-content: center;
            color: var(--primary); font-weight: 500; letter-spacing: -0.01em;
            opacity: 0;
            animation: dropZoneFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .processing-indicator {
            position: absolute; top: var(--space-2); right: var(--space-2);
            display: flex; align-items: center; gap: var(--space-1);
            padding: var(--space-1) var(--space-2); border-radius: var(--space-1);
            background: var(--backgroundGhost); backdrop-filter: blur(4px);
            font-size: 12px; color: var(--textSecondary);
            box-shadow: 0 2px 4px var(--shadowLight);
        }
        .processing-spinner {
            width: 10px; height: 10px; border-radius: 50%;
            border: 1px solid var(--primary); border-top: 1px solid transparent;
            animation: spin 1s linear infinite;
        }
        
        @keyframes dropZoneFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
            .message-input-container { --container-padding: var(--space-3); --container-gap: var(--space-2); }
            .input-wrapper { padding-left: 0; padding-right: 0; }
            .message-textarea {
                min-height: 66px; /* 移动端高度也增加 */
                font-size: 16px;
                padding: 20px var(--space-3);
            }
        }
        @media (min-width: 768px) { .input-wrapper { padding-left: var(--space-8); padding-right: var(--space-8); } }
        @media (min-width: 1024px) { .input-wrapper { padding-left: var(--space-12); padding-right: var(--space-12); } }
        
        /* --- [核心修改] 最终版宽度，更大气 --- */
        @media (min-width: 1280px) { .input-wrapper { max-width: 940px; } }
        @media (min-width: 1440px) { .input-wrapper { max-width: 980px; } }
        @media (min-width: 1600px) { .input-wrapper { max-width: 1080px; } }

        @media (prefers-reduced-motion: reduce) {
            .message-textarea, .drop-zone, .processing-spinner { transition: none !important; animation: none !important; }
            .message-textarea:focus { transform: none; }
        }
        @media (prefers-contrast: high) {
            .message-textarea { border: 2px solid var(--border); }
            .drop-zone { border-width: 3px; }
        }
        @media print { .message-input-container { display: none; } }
      `}
      </style>

      <div
        ref={containerRef}
        className={`message-input-container ${isDisabled ? "processing" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        aria-label={t("messageInputArea", "消息输入区域")}
      >
        <div className="input-wrapper">
          <AttachmentsPreview
            imagePreviews={localImagePreviews}
            pendingFiles={enhancedPendingFiles}
            onRemoveImage={(id) =>
              setLocalImagePreviews((prev) =>
                prev.filter((img) => img.id !== id)
              )
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
              rows={1} // 初始行数，配合CSS的min-height
            />

            <SendButton
              onClick={sendMessage}
              disabled={!hasContent || isDisabled}
            />
          </div>
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
            <UploadIcon size={20} style={{ marginRight: "var(--space-2)" }} />
            {t("dropToUpload", "松开即可上传")}
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
