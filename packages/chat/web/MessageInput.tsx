// MessageInput.tsx
import { useAuth } from "auth/hooks/useAuth";
import type React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Content } from "../messages/types";
import { zIndex } from "render/styles/zIndex";
import { useAppDispatch } from "app/hooks";
import { handleSendMessage } from "../messages/messageSlice";
import { UploadIcon } from "@primer/octicons-react";
import SendButton from "./ActionButton";
import ImagePreview from "./ImagePreview";
import ExcelPreview from "web/ExcelPreview"; // 新的组件
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { nanoid } from "nanoid"; // 添加此依赖用于生成唯一ID

// 定义Excel文件类型
interface ExcelFile {
  id: string;
  name: string;
  data: any[];
}

const MessageInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();
  const auth = useAuth();

  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  // 保存多个Excel文件
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  // 当前正在预览的Excel文件
  const [previewingFile, setPreviewingFile] = useState<ExcelFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 延迟加载拖拽功能
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMessageSend = (userInput: Content) => {
    try {
      dispatch(handleSendMessage({ userInput }));
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = window.innerWidth > 768 ? 140 : 100;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      setTextContent(e.target.value);
    },
    []
  );

  // 使用 sheetjs 解析 Excel 文件，并添加到文件列表中
  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log("jsonData", jsonData);
        if (jsonData.length > 0) {
          const newExcelFile: ExcelFile = {
            id: nanoid(),
            name: file.name,
            data: jsonData,
          };

          setExcelFiles((prev) => [...prev, newExcelFile]);
        } else {
          toast.error("Excel文件为空");
        }
      } catch (error) {
        toast.error("无法解析Excel文件");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const previewImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrls((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSend = useCallback(() => {
    if (
      !textContent.trim() &&
      !imagePreviewUrls.length &&
      excelFiles.length === 0
    )
      return;

    let content: Content;

    // 构建要发送的内容
    if (imagePreviewUrls.length > 0 || excelFiles.length > 0) {
      content = [
        { type: "text", text: textContent },
        ...(imagePreviewUrls.length > 0
          ? imagePreviewUrls.map((url) => ({
              type: "image_url",
              image_url: { url },
            }))
          : []),
        ...(excelFiles.length > 0
          ? excelFiles.map((file) => ({
              type: "excel",
              name: file.name,
              data: file.data,
            }))
          : []),
      ];
    } else {
      content = textContent;
    }

    handleMessageSend(content);
    setTextContent("");
    setImagePreviewUrls([]);
    setExcelFiles([]);
    setPreviewingFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [textContent, imagePreviewUrls, excelFiles, handleMessageSend]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isDragEnabled) return;
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          previewImage(file);
        } else if (
          file.name.toLowerCase().endsWith(".xlsx") ||
          file.name.toLowerCase().endsWith(".xls") ||
          file.type.includes("excel") ||
          file.name.toLowerCase().endsWith(".csv")
        ) {
          parseExcelFile(file);
        }
      });
      setIsDragOver(false);
    },
    [isDragEnabled, previewImage, parseExcelFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      items.forEach((item) => {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) previewImage(file);
        }
      });
    },
    [previewImage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleRemoveExcelFile = useCallback(
    (id: string) => {
      setExcelFiles((prev) => prev.filter((file) => file.id !== id));
      if (previewingFile?.id === id) {
        setPreviewingFile(null);
      }
    },
    [previewingFile]
  );

  const handlePreviewExcelFile = useCallback(
    (id: string) => {
      const fileToPreview = excelFiles.find((file) => file.id === id) || null;
      setPreviewingFile(fileToPreview);
    },
    [excelFiles]
  );

  return (
    <div
      className="message-input-container"
      onDragOver={(e) => {
        if (!isDragEnabled) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!isDragEnabled) return;
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <div className="attachments-preview">
        {imagePreviewUrls.length > 0 && (
          <div className="message-preview-wrapper">
            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={(index) =>
                setImagePreviewUrls((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
            />
          </div>
        )}

        {/* 使用新的 ExcelPreview 组件处理多个Excel文件 */}
        {excelFiles.length > 0 && (
          <ExcelPreview
            excelFiles={excelFiles}
            onRemove={handleRemoveExcelFile}
            onPreview={handlePreviewExcelFile}
            previewingFile={previewingFile}
            closePreview={() => setPreviewingFile(null)}
          />
        )}
      </div>

      <div className="input-controls">
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
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
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <SendButton onClick={handleSend} />
      </div>

      {isDragOver && isDragEnabled && (
        <div className="drop-zone">
          <UploadIcon size={24} />
          <span>{t("dropToUpload") || "拖放文件到此处上传"}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.xlsx,.xls,.csv"
        multiple
        onChange={(e) => {
          Array.from(e.target.files || []).forEach((file) => {
            if (file.type.startsWith("image/")) {
              previewImage(file);
            } else if (
              file.name.toLowerCase().endsWith(".xlsx") ||
              file.name.toLowerCase().endsWith(".xls") ||
              file.type.includes("excel") ||
              file.name.toLowerCase().endsWith(".csv")
            ) {
              parseExcelFile(file);
            }
          });
          e.target.value = ""; // 重置 input
        }}
      />

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
          max-height: 100px;
          padding: 10px 12px;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid ${theme.border};
          border-radius: 10px;
          resize: none;
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
          box-shadow: 0 0 0 2px ${theme.primaryLight};
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
            max-height: 140px;
            padding: 12px 16px;
            font-size: 15px;
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
            padding: 8px 10px;
            font-size: 13px;
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
