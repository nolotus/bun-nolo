import React, { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { zIndex } from "render/styles/zIndex";
import { useSendPermission } from "../hooks/useSendPermission";
import { useAppSelector, useAppDispatch } from "app/store";
import {
  selectCurrentUserBalance,
  fetchUserProfile,
  selectUserId,
} from "auth/authSlice";
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
import DocxPreviewDialog from "render/web/DocxPreviewDialog";
import AttachmentsPreview, { PendingImagePreview } from "./AttachmentsPreview";
import SendButton from "./ActionButton";
import FileUploadButton from "./FileUploadButton";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_TEXTAREA_MAX_HEIGHT = 200;
const MOBILE_TEXTAREA_MAX_HEIGHT = 140;

const MESSAGE_INPUT_STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  .message-input {
    --container-padding: var(--space-4);
    position: sticky;
    bottom: 0;
    width: 100%;
    padding-bottom: calc(var(--container-padding) + env(safe-area-inset-bottom, 0px));
    background: var(--background);
    z-index: ${zIndex.messageInputContainerZIndex};
    transition: all 0.2s ease;
  }

  .message-input.is-processing {
    cursor: wait;
  }

  .message-input__wrapper {
    width: 100%;
    margin: 0 auto;
    position: relative;
  }

  .message-input__controls {
    display: flex;
    gap: var(--space-2);
    align-items: flex-end;
  }

 .message-input__textarea {
    flex: 1;
    max-height: ${DESKTOP_TEXTAREA_MAX_HEIGHT}px;
    padding: 22px var(--container-padding);
    font-size: 16px;
    line-height: 1.5;
    border: 1px solid var(--border);
    border-radius: var(--space-3);
    background: var(--backgroundSecondary);
    color: var(--text);
    resize: none;
    outline: none;
    transition: all 0.2s;
    box-shadow: inset 0 1px 2px var(--shadowLight);
  }

  .message-input__textarea::placeholder {
    color: var(--textTertiary);
  }

  .message-input__textarea:focus {
    background: var(--background);
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--focus), inset 0 1px 2px var(--shadowMedium);
    transform: translateY(-1px);
  }

  .message-input__textarea:disabled {
    opacity: 0.7;
    background: var(--backgroundTertiary);
    cursor: not-allowed;
  }

  .message-input__drop-zone {
    position: absolute;
    inset: -8px;
    z-index: 10;
    background: rgba(var(--backgroundRGB), 0.85);
    backdrop-filter: blur(8px);
    border: 2px dashed var(--primary);
    border-radius: var(--space-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    font-weight: 500;
    animation: fadeIn 0.2s forwards;
  }

  .message-input__indicator {
    position: absolute;
    top: -36px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--backgroundGhost);
    backdrop-filter: blur(4px);
    font-size: 12px;
    color: var(--textSecondary);
    box-shadow: 0 2px 4px var(--shadowLight);
  }

  .message-input__spinner {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid currentColor;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }

  .skel-container,
  .err-container {
    padding: var(--space-4);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    display: flex;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }

  .skel-bar,
  .err-box {
    width: 100%;
    height: 72px;
    border-radius: var(--space-3);
    background: var(--backgroundSecondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .skel-bar {
    border: 1px solid var(--border);
  }

  .err-box {
    border: 1px solid var(--error);
    color: var(--error);
    font-size: 0.875rem;
    gap: var(--space-2);
    z-index: ${zIndex.messageInputContainerZIndex};
    box-shadow: 0 2px 4px var(--shadowLight);
  }

  .loading-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--textTertiary);
    animation: pulse 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  .recharge-link {
    color: var(--primary);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .recharge-link:hover {
    color: var(--hover);
  }

  @media (max-width: ${MOBILE_BREAKPOINT}px) {
    .message-input {
      --container-padding: var(--space-3);
    }
    .message-input__textarea {
      min-height: 66px;
      max-height: ${MOBILE_TEXTAREA_MAX_HEIGHT}px;
      padding: 20px var(--space-3);
    }
    .message-input__wrapper {
      padding-left: 0;
      padding-right: 0;
    }
    .skel-container,
    .err-container {
      padding: var(--space-3);
    }
    .skel-bar,
    .err-box {
      height: 66px;
    }
  }

  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    .message-input__wrapper {
      padding-left: var(--space-8);
      padding-right: var(--space-8);
    }
  }

  @media (min-width: 1024px) {
    .message-input__wrapper {
     -left: var(--space-12);
      padding-right: var(--space-12);
    }
  }

  @media (min-width: 1280px) {
    .message-input__wrapper {
      max-width: 940px;
    }
  }

  @media (min-width: 1440px) {
    .message-input__wrapper {
      max-width: 980px;
    }
  }

  @media (min-width: 1600px) {
    .message-input__wrapper {
      max-width: 1080px;
    }
  }
`;

let fileProcessorModulePromise: Promise<
  typeof import("./fileProcessor")
> | null = null;

async function getProcessDocumentFile() {
  if (!fileProcessorModulePromise) {
    fileProcessorModulePromise = import("./fileProcessor");
  }
  const { processDocumentFile } = await fileProcessorModulePromise;
  return processDocumentFile;
}

type MessagePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: string; name: string; pageKey: string };

type FileStatus = {
  processing: boolean;
  error?: string;
};

function splitFiles(files: FileList) {
  return Array.from(files).reduce(
    (acc, file) => {
      const index = file.type.startsWith("image/") ? 0 : 1;
      acc[index].push(file);
      return acc;
    },
    [[], []] as [File[], File[]]
  );
}

async function withProcessing(
  fileId: string,
  setFileStatus: React.Dispatch<React.SetStateAction<Map<string, FileStatus>>>,
  task: () => Promise<void>
) {
  setFileStatus((prev) => {
    const next = new Map(prev);
    const prevStatus = next.get(fileId) || { processing: false };
    next.set(fileId, { ...prevStatus, processing: true, error: undefined });
    return next;
  });

  try {
    await task();
  } finally {
    setFileStatus((prev) => {
      const next = new Map(prev);
      const prevStatus = next.get(fileId) || { processing: false };
      next.set(fileId, { ...prevStatus, processing: false });
      return next;
    });
  }
}

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");

  const pendingFiles = useAppSelector(selectPendingFiles);
  const balance = useAppSelector(selectCurrentUserBalance) ?? 0;
  const canMultiImg = balance > 20;

  const [text, setText] = useState("");
  const [imgPreviews, setImgPreviews] = useState<PendingImagePreview[]>([]);
  const [fileStatus, setFileStatus] = useState<Map<string, FileStatus>>(
    new Map()
  );
  const [previewFile, setPreviewFile] = useState<PendingFile | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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
      setIsMobile(
        window.innerWidth <= MOBILE_BREAKPOINT || "ontouchstart" in window
      );
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const processImages = useCallback(
    (images: File[]) => {
      if (!images.length) return;

      const limit = canMultiImg
        ? Infinity
        : Math.max(0, 1 - imgPreviews.length);

      images.slice(0, limit).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!reader.result) return;
          setImgPreviews((prev) => [
            ...prev,
            { id: nanoid(), url: reader.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      });

      if (images.length > limit) {
        toast.error(
          t("insufficientBalanceForMultipleImages", "余额不足20，仅限1张图片")
        );
      }
    },
    [canMultiImg, imgPreviews.length, t]
  );

  const processDocs = useCallback(
    async (docs: File[]) => {
      if (!docs.length) return;

      const processDocumentFile = await getProcessDocumentFile();

      for (const file of docs) {
        const fileId = nanoid();

        await withProcessing(fileId, setFileStatus, async () => {
          try {
            await processDocumentFile({
              file,
              fileId,
              dispatch,
              t,
            });
          } catch (e: any) {
            const message = e?.message || "Error";
            setFileStatus((prev) => {
              const next = new Map(prev);
              const prevStatus = next.get(fileId) || { processing: false };
              next.set(fileId, { ...prevStatus, error: message });
              return next;
            });
          }
        });
      }
    },
    [dispatch, t]
  );

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const [images, docs] = splitFiles(files);

      if (images.length) {
        processImages(images);
      }

      if (docs.length) {
        await processDocs(docs);
      }
    },
    [processDocs, processImages]
  );

  const clearState = useCallback(() => {
    setText("");
    setImgPreviews([]);
    setFileStatus(new Map());
    dispatch(clearPendingAttachments());

    if (areaRef.current) {
      areaRef.current.style.height = "auto";
      areaRef.current.focus();
    }
  }, [dispatch]);

  const processingCount = Array.from(fileStatus.values()).filter(
    (status) => status.processing
  ).length;
  const isDisabled = processingCount > 0;
  const hasContent =
    !!text.trim() || imgPreviews.length > 0 || pendingFiles.length > 0;

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if ((!trimmed && !imgPreviews.length && !pendingFiles.length) || isDisabled)
      return;
    if (!canMultiImg && imgPreviews.length > 1) {
      toast.error(t("insufficientBalanceForMultipleImagesSend"));
      return;
    }

    const parts: MessagePart[] = [];
    if (trimmed) parts.push({ type: "text", text: trimmed });
    pendingFiles.forEach((file) =>
      parts.push({ type: file.type, name: file.name, pageKey: file.pageKey })
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
      toast.error(e?.message || t("sendFailMessage"));
    }
  }, [
    text,
    imgPreviews,
    pendingFiles,
    isDisabled,
    canMultiImg,
    clearState,
    dispatch,
    t,
  ]);

  const pendingFilesWithStatus = pendingFiles.map((file) => {
    const status = fileStatus.get(file.id);
    return { ...file, error: status?.error };
  });

  const processingFileIds = new Set(
    Array.from(fileStatus.entries())
      .filter(([, status]) => status.processing)
      .map(([id]) => id)
  );

  return (
    <>
      <style href="message-input" precedence="medium">
        {MESSAGE_INPUT_STYLES}
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
            pendingFiles={pendingFilesWithStatus}
            onRemoveImage={(id) =>
              setImgPreviews((prev) => prev.filter((img) => img.id !== id))
            }
            onPreviewFile={setPreviewFile}
            processingFiles={processingFileIds}
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
                const maxHeight =
                  window.innerWidth > MOBILE_BREAKPOINT
                    ? DESKTOP_TEXTAREA_MAX_HEIGHT
                    : MOBILE_TEXTAREA_MAX_HEIGHT;
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  maxHeight
                )}px`;
              }}
              onKeyDown={(e) => {
                if (
                  !isMobile &&
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
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

          {processingCount > 0 && (
            <div className="message-input__indicator">
              <div className="message-input__spinner" />
              <span>{t("processingFiles", { count: processingCount })}</span>
            </div>
          )}

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

const BaseShell: React.FC<{
  containerClassName: string;
  children: React.ReactNode;
}> = ({ containerClassName, children }) => (
  <div className={containerClassName}>
    <style href="message-input" precedence="medium">
      {MESSAGE_INPUT_STYLES}
    </style>
    {/* 直接复用 message-input__wrapper 的宽度和响应式布局 */}
    <div className="message-input__wrapper">{children}</div>
  </div>
);

const LoadingPlaceholder: React.FC = () => (
  <BaseShell containerClassName="skel-container">
    <div className="skel-bar">
      <div className="loading-dots">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  </BaseShell>
);

const ErrorMessage: React.FC<{
  message: string;
  showRecharge?: boolean;
  onRecharge: () => void;
}> = ({ message, showRecharge, onRecharge }) => {
  const { t } = useTranslation("chat");

  return (
    <BaseShell containerClassName="err-container">
      <div className="err-box">
        <span>{message}</span>
        {showRecharge && (
          <span className="recharge-link" onClick={onRecharge}>
            {t("recharge", "充值")}
          </span>
        )}
      </div>
    </BaseShell>
  );
};

const MessageInputContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const balance = useAppSelector(selectCurrentUserBalance);
  const userId = useAppSelector(selectUserId);
  const { sendPermission, getErrorMessage } = useSendPermission(balance ?? 0);

  const isLoading = typeof balance !== "number";

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile());
    }
  }, [userId, dispatch]);

  if (isLoading) return <LoadingPlaceholder />;

  if (!sendPermission.allowed) {
    return (
      <ErrorMessage
        message={getErrorMessage(sendPermission.reason, sendPermission.pricing)}
        showRecharge={sendPermission.reason === "INSUFFICIENT_BALANCE"}
        onRecharge={() => navigate("/recharge")}
      />
    );
  }

  return <MessageInput />;
};

export default MessageInputContainer;
