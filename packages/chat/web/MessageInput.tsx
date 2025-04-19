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
import { nanoid } from "nanoid";

// 定义Excel文件类型
interface ExcelFile {
  id: string;
  name: string;
  data: any[]; // 保持any[]以匹配XLSX输出，或定义更具体的类型
}

const MessageInput: React.FC = () => {
  // --- Hooks ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t } = useTranslation();
  // const auth = useAuth(); // auth 未在组件中使用，可以移除或注释掉

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- State ---
  const [textContent, setTextContent] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [previewingFileId, setPreviewingFileId] = useState<string | null>(null); // 只保存ID更轻量
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(false); // 用于延迟启用拖放

  // --- Effects ---
  // 延迟加载拖拽功能，避免初始加载时意外触发
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragEnabled(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- File Handling Callbacks ---

  // 解析图片文件并生成预览URL
  const addImagePreviewUrl = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  }, []); // 依赖项: setImagePreviewUrls (setState是稳定的，可以省略)

  // 解析Excel文件
  const parseAndAddExcelFile = useCallback(
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
            const newExcelFile: ExcelFile = {
              id: nanoid(),
              name: file.name,
              data: jsonData,
            };
            setExcelFiles((prev) => [...prev, newExcelFile]);
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
    [t]
  ); // 依赖项: setExcelFiles (setState稳定), t (来自i18n，可能变化)

  // 根据文件类型处理文件
  const processFile = useCallback(
    (file: File) => {
      const fileNameLower = file.name.toLowerCase();
      if (file.type.startsWith("image/")) {
        addImagePreviewUrl(file);
      } else if (
        fileNameLower.endsWith(".xlsx") ||
        fileNameLower.endsWith(".xls") ||
        fileNameLower.endsWith(".csv") || // CSV 也视为Excel处理
        file.type.includes("excel") || // 更通用的检查
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        parseAndAddExcelFile(file);
      } else {
        // 可以选择性地提示不支持的文件类型
        // toast.info(`${file.name} ${t('unsupportedFileType') || 'is not supported'}`);
      }
    },
    [addImagePreviewUrl, parseAndAddExcelFile]
  ); // 依赖项: memoized callbacks

  // --- Input & Send Logic ---

  // 处理文本输入变化及高度自适应
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      // 重置高度以获取正确scrollHeight
      textarea.style.height = "auto";
      // 计算最大高度 (响应式)
      const maxHeight = window.innerWidth > 768 ? 140 : 100;
      // 设置新高度，但不超过最大值
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      setTextContent(e.target.value);
    },
    [] // 依赖项: setTextContent (setState稳定)
  );

  // 清理输入状态
  const clearInputState = useCallback(() => {
    setTextContent("");
    setImagePreviewUrls([]);
    setExcelFiles([]);
    setPreviewingFileId(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // 重置高度
    }
  }, []); // 依赖项: setState 都是稳定的

  // 发送消息
  const sendMessage = useCallback(() => {
    const trimmedText = textContent.trim();
    if (!trimmedText && !imagePreviewUrls.length && !excelFiles.length) {
      return; // 没有内容则不发送
    }

    let messageContent: Content;

    // 构建多部分内容
    if (imagePreviewUrls.length > 0 || excelFiles.length > 0) {
      const parts: ({ type: string } & Record<string, any>)[] = [];

      if (trimmedText) {
        parts.push({ type: "text", text: trimmedText });
      }
      imagePreviewUrls.forEach((url) =>
        parts.push({ type: "image_url", image_url: { url } })
      );
      excelFiles.forEach((file) =>
        parts.push({ type: "excel", name: file.name, data: file.data })
      ); // 假设后端能处理 excel 类型

      messageContent = parts;
    } else {
      // 纯文本内容
      messageContent = trimmedText;
    }

    try {
      dispatch(handleSendMessage({ userInput: messageContent }));
      clearInputState(); // 发送成功后清理
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(t("sendFail") || "发送消息失败");
    }
  }, [textContent, imagePreviewUrls, excelFiles, dispatch, clearInputState, t]); // 依赖项: state, dispatch, t, 和 memoized clearInputState

  // 处理键盘事件（Enter发送）
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // MetaKey (Cmd on Mac) + Enter 或 Ctrl + Enter 用于换行 (如果需要)
      // if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      //   // 允许换行，不做任何事
      //   return;
      // }

      // Enter 发送 (排除输入法组合状态)
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault(); // 阻止默认换行行为
        sendMessage();
      }
    },
    [sendMessage] // 依赖项: memoized sendMessage
  );

  // --- Event Handlers ---

  // 处理文件粘贴
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      Array.from(e.clipboardData.items).forEach((item) => {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) addImagePreviewUrl(file);
        }
        // Note: 粘贴 Excel 文件通常不直接支持，浏览器行为不一
      });
    },
    [addImagePreviewUrl] // 依赖项: memoized addImagePreviewUrl
  );

  // 处理文件拖放
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false); // 结束拖放状态
      if (!isDragEnabled) return; // 检查拖放功能是否已启用

      Array.from(e.dataTransfer.files).forEach(processFile);
    },
    [isDragEnabled, processFile] // 依赖项: isDragEnabled state, memoized processFile
  );

  // 处理拖放悬停进入
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDragEnabled) return;
      e.preventDefault(); // 必须阻止默认行为以允许 drop
      setIsDragOver(true);
    },
    [isDragEnabled]
  ); // 依赖项: isDragEnabled state

  // 处理拖放悬停离开
  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!isDragEnabled) return;
      // // 可选：更精确地判断是否真的离开区域，防止在子元素上触发 leave
      // if (e.currentTarget.contains(e.relatedTarget as Node)) {
      //   return;
      // }
      setIsDragOver(false);
    },
    [isDragEnabled]
  ); // 依赖项: isDragEnabled state

  // 打开文件选择对话框
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []); // 无依赖

  // 处理文件输入变化 (来自 input[type=file])
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Array.from(e.target.files || []).forEach(processFile);
      // 重置 input 值，允许再次选择相同文件
      e.target.value = "";
    },
    [processFile]
  ); // 依赖项: memoized processFile

  // --- Preview Component Callbacks (Memoized) ---

  // 移除指定索引的图片预览
  const removeImagePreview = useCallback((indexToRemove: number) => {
    setImagePreviewUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }, []); // 依赖项: setImagePreviewUrls (stable)

  // 移除指定ID的Excel文件
  const removeExcelFile = useCallback(
    (idToRemove: string) => {
      setExcelFiles((prev) => prev.filter((file) => file.id !== idToRemove));
      // 如果移除的是正在预览的文件，则关闭预览
      if (previewingFileId === idToRemove) {
        setPreviewingFileId(null);
      }
    },
    [previewingFileId]
  ); // 依赖项: previewingFileId, setExcelFiles/setPreviewingFileId (stable)

  // 设置要预览的Excel文件ID
  const previewExcelFile = useCallback((idToPreview: string) => {
    setPreviewingFileId(idToPreview);
  }, []); // 依赖项: setPreviewingFileId (stable)

  // 关闭Excel预览
  const closeExcelPreview = useCallback(() => {
    setPreviewingFileId(null);
  }, []); // 依赖项: setPreviewingFileId (stable)

  // --- Derived State ---
  const previewingExcelFile =
    excelFiles.find((file) => file.id === previewingFileId) || null;

  // --- Render ---
  return (
    <div
      className="message-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // 添加 aria-label 增强可访问性
      aria-label={
        t("messageInputArea", "Message input area with file upload support") ||
        "消息输入区域，支持文件上传"
      }
    >
      {/* 附件预览区域 */}
      <div className="attachments-preview">
        {imagePreviewUrls.length > 0 && (
          <div className="message-preview-wrapper">
            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={removeImagePreview} // 使用 memoized callback
            />
          </div>
        )}

        {excelFiles.length > 0 && (
          <ExcelPreview
            excelFiles={excelFiles}
            onRemove={removeExcelFile} // 使用 memoized callback
            onPreview={previewExcelFile} // 使用 memoized callback
            previewingFile={previewingExcelFile} // 使用派生状态
            closePreview={closeExcelPreview} // 使用 memoized callback
          />
        )}
      </div>

      {/* 输入控件区域 */}
      <div className="input-controls">
        <button
          className="upload-button"
          onClick={triggerFileInput} // 使用 memoized callback
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
          onChange={handleTextareaChange} // 使用 memoized callback
          onKeyDown={handleKeyDown} // 使用 memoized callback
          onPaste={handlePaste} // 使用 memoized callback
          // rows={1} // 移除 rows={1} 以恢复原始行为
          aria-label={t("messageInput", "Message input field") || "消息输入框"}
        />

        <SendButton
          onClick={sendMessage} // 使用 memoized callback
          disabled={
            !textContent.trim() &&
            imagePreviewUrls.length === 0 &&
            excelFiles.length === 0
          } // 根据是否有内容禁用按钮
        />
      </div>

      {/* 拖放覆盖提示 */}
      {isDragOver && isDragEnabled && (
        <div className="drop-zone" aria-live="polite">
          {" "}
          {/* aria-live 用于屏幕阅读器 */}
          <UploadIcon size={24} />
          <span>{t("dropToUpload") || "拖放文件到此处上传"}</span>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // 更精确的 accept 类型
        multiple
        onChange={handleFileInputChange} // 使用 memoized callback
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
            resize: vertical;
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
            resize: vertical;
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
