import React, { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch, useAppSelector } from "app/store";
import { compressImage } from "utils/imageUtils";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { UploadIcon } from "@primer/octicons-react";

import {
  handleSendMessage,
  clearPendingAttachments,
  selectPendingFiles,
  type PendingFile,
} from "../dialog/dialogSlice";
import { processDocumentFile } from "./fileProcessor";
import { selectCurrentUserBalance } from "auth/authSlice";

import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
import SendButton from "./ActionButton";
import FileUploadButton from "./FileUploadButton";

// --- 样式常量 (恢复原始类名以确保兼容性) ---
const STYLES = `
  /* 主容器 */
  .message-input {
    --container-padding: var(--space-4);
    position: sticky; bottom: 0; width: 100%;
    padding: var(--container-padding);
    padding-bottom: calc(var(--container-padding) + env(safe-area-inset-bottom, 0px));
    background: var(--background);
    z-index: ${zIndex.messageInputContainerZIndex};
    transition: all 0.2s ease;
  }
  
  /* 禁用/处理中状态 */
  .message-input.is-processing { cursor: wait; }

  /* 内部包装器 (用于宽度限制) */
  .message-input__wrapper {
    width: 100%; margin: 0 auto; position: relative;
  }

  /* 操作区 Flex 布局 */
  .message-input__controls {
    display: flex; gap: var(--space-2); align-items: flex-end;
  }

  /* 输入框 */
  .message-input__textarea {
    flex: 1;
    min-height: 72px; max-height: 200px;
    padding: 22px var(--container-padding);
    font-size: 16px; line-height: 1.5;
    border: 1px solid var(--border);
    border-radius: var(--space-3);
    background: var(--backgroundSecondary);
    color: var(--text);
    resize: none; outline: none;
    transition: all 0.2s;
    box-shadow: inset 0 1px 2px var(--shadowLight);
  }
  .message-input__textarea::placeholder { color: var(--textTertiary); }
  .message-input__textarea:focus {
    background: var(--background);
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus), inset 0 1px 2px var(--shadowMedium);
    transform: translateY(-1px);
  }
  .message-input__textarea:disabled {
    opacity: 0.7; background: var(--backgroundTertiary); cursor: not-allowed;
  }

  /* 拖拽上传覆盖层 */
  .message-input__drop-zone {
    position: absolute; inset: -8px; z-index: 10;
    background: rgba(var(--backgroundRGB), 0.85);
    backdrop-filter: blur(8px);
    border: 2px dashed var(--primary);
    border-radius: var(--space-3);
    display: flex; align-items: center; justify-content: center;
    color: var(--primary); font-weight: 500;
    animation: fadeIn 0.2s forwards;
  }

  /* 处理进度指示器 (右上角) */
  .message-input__indicator {
    position: absolute; top: -36px; right: 0;
    display: flex; align-items: center; gap: 6px;
    padding: 4px 8px; border-radius: 4px;
    background: var(--backgroundGhost);
    backdrop-filter: blur(4px);
    font-size: 12px; color: var(--textSecondary);
    box-shadow: 0 2px 4px var(--shadowLight);
  }
  .message-input__spinner {
    width: 10px; height: 10px; border-radius: 50%;
    border: 1px solid currentColor; border-top-color: transparent;
    animation: spin 1s linear infinite;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* 响应式设计 (与骨架屏严格对齐) */
  @media (max-width: 768px) {
    .message-input { --container-padding: var(--space-3); }
    .message-input__textarea { min-height: 66px; padding: 20px var(--space-3); }
    .message-input__wrapper { padding-left: 0; padding-right: 0; }
  }
  @media (min-width: 768px) { .message-input__wrapper { padding-left: var(--space-8); padding-right: var(--space-8); } }
  @media (min-width: 1024px) { .message-input__wrapper { padding-left: var(--space-12); padding-right: var(--space-12); } }
  @media (min-width: 1280px) { .message-input__wrapper { max-width: 940px; } }
  @media (min-width: 1440px) { .message-input__wrapper { max-width: 980px; } }
  @media (min-width: 1600px) { .message-input__wrapper { max-width: 1080px; } }
`;

type MessagePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: string; name: string; pageKey: string };

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");

  // Redux & State
  const pendingFiles = useAppSelector(selectPendingFiles);
  const balance = useAppSelector(selectCurrentUserBalance) ?? 0;
  const canMultiImg = balance > 20;

  const [text, setText] = useState("");
  const [imgPreviews, setImgPreviews] = useState<PendingImagePreview[]>([]);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const [previewFile, setPreviewFile] = useState<PendingFile | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      document.documentElement.style.setProperty(
        "--message-input-height",
        `${entries[0].target.clientHeight}px`
      );
    });
    obs.observe(container);

    const checkMobile = () =>
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Handlers
  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const [imgs, docs] = Array.from(files).reduce(
        (acc, f) => {
          acc[f.type.startsWith("image/") ? 0 : 1].push(f);
          return acc;
        },
        [[], []] as [File[], File[]]
      );

      // Handle Images
      if (imgs.length) {
        const limit = canMultiImg
          ? Infinity
          : Math.max(0, 1 - imgPreviews.length);
        imgs.slice(0, limit).forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            reader.result &&
            setImgPreviews((p) => [
              ...p,
              { id: nanoid(), url: reader.result as string },
            ]);
          reader.readAsDataURL(file);
        });
        if (imgs.length > limit)
          toast.error(
            t("insufficientBalanceForMultipleImages", "余额不足20，仅限1张图片")
          );
      }

      // Handle Docs
      for (const file of docs) {
        const fid = nanoid();
        setProcessing((p) => new Set(p).add(fid));
        setErrors((p) => {
          const m = new Map(p);
          m.delete(fid);
          return m;
        });
        try {
          await processDocumentFile({ file, fileId: fid, dispatch, t, toast });
        } catch (e: any) {
          setErrors((p) => new Map(p).set(fid, e.message || "Error"));
        } finally {
          setProcessing((p) => {
            const s = new Set(p);
            s.delete(fid);
            return s;
          });
        }
      }
    },
    [dispatch, t, imgPreviews.length, canMultiImg]
  );

  const clearState = useCallback(() => {
    setText("");
    setImgPreviews([]);
    setErrors(new Map());
    dispatch(clearPendingAttachments());
    if (areaRef.current) {
      areaRef.current.style.height = "auto";
      areaRef.current.focus();
    }
  }, [dispatch]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (
      (!trimmed && !imgPreviews.length && !pendingFiles.length) ||
      processing.size > 0
    )
      return;
    if (!canMultiImg && imgPreviews.length > 1)
      return toast.error(t("insufficientBalanceForMultipleImagesSend"));

    const parts: MessagePart[] = [];
    if (trimmed) parts.push({ type: "text", text: trimmed });
    pendingFiles.forEach((f) =>
      parts.push({ type: f.type, name: f.name, pageKey: f.pageKey })
    );

    clearState();

    try {
      const uploadedImgs = await Promise.all(
        imgPreviews.map(
          async (img) =>
            ({
              type: "image_url",
              image_url: {
                url: await compressImage(img.url).catch(() => img.url),
              },
            }) as MessagePart
        )
      );

      const finalParts = [...parts, ...uploadedImgs];
      if (finalParts.length) {
        const payload =
          finalParts.length === 1 && finalParts[0].type === "text"
            ? (finalParts[0] as any).text
            : finalParts;
        await dispatch(handleSendMessage({ userInput: payload })).unwrap();
      }
    } catch (e: any) {
      toast.error(e.message || t("sendFailMessage"));
    }
  }, [
    text,
    imgPreviews,
    pendingFiles,
    processing,
    canMultiImg,
    clearState,
    dispatch,
    t,
  ]);

  const isDisabled = processing.size > 0;
  const hasContent =
    !!text.trim() || imgPreviews.length > 0 || pendingFiles.length > 0;

  return (
    <>
      {/* 使用原始的 message-input 作为 href ID，确保覆盖原样式 */}
      <style href="message-input" precedence="medium">
        {STYLES}
      </style>

      <div
        ref={rootRef}
        className={`message-input ${isDisabled ? "is-processing" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDrag(true);
        }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDrag(false);
          processFiles(e.dataTransfer.files);
        }}
      >
        <div className="message-input__wrapper">
          <AttachmentsPreview
            imagePreviews={imgPreviews}
            pendingFiles={pendingFiles.map((f) => ({
              ...f,
              error: errors.get(f.id),
            }))}
            onRemoveImage={(id) =>
              setImgPreviews((p) => p.filter((i) => i.id !== id))
            }
            onPreviewFile={setPreviewFile}
            processingFiles={processing}
            isMobile={isMobile}
          />

          <div className="message-input__controls">
            <FileUploadButton
              disabled={isDisabled}
              onFilesSelected={processFiles}
            />

            <textarea
              ref={areaRef}
              className="message-input__textarea"
              value={text}
              rows={1}
              disabled={isDisabled}
              placeholder={
                isDisabled ? t("waitForProcessing") : t("messageOrFileHere")
              }
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, window.innerWidth > 768 ? 200 : 140)}px`;
              }}
              onKeyDown={(e) =>
                !isMobile &&
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                (e.preventDefault(), sendMessage())
              }
              onPaste={(e) => processFiles(e.clipboardData.files)}
            />

            <SendButton
              onClick={sendMessage}
              disabled={
                !hasContent ||
                isDisabled ||
                (!canMultiImg && imgPreviews.length > 1)
              }
            />
          </div>

          {/* 状态指示器 */}
          {processing.size > 0 && (
            <div className="message-input__indicator">
              <div className="message-input__spinner" />
              <span>{t("processingFiles", { count: processing.size })}</span>
            </div>
          )}

          {/* 拖拽遮罩 */}
          {isDrag && (
            <div className="message-input__drop-zone">
              <UploadIcon size={20} className="mr-2" /> {t("dropToUpload")}
            </div>
          )}
        </div>

        {previewFile && (
          <DocxPreviewDialog
            isOpen={!!previewFile}
            onClose={() => setPreviewFile(null)}
            pageKey={previewFile.pageKey}
            fileName={previewFile.name}
          />
        )}
      </div>
    </>
  );
};

export default MessageInput;
