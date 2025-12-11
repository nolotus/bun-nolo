// chat/web/MessageInput/FileUploadButton.tsx
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { UploadIcon } from "@primer/octicons-react";

export interface FileUploadButtonProps {
  /** 文件选中后回调 */
  onFilesSelected: (files: FileList | null) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 接受的文件类型 - 不传则使用默认 */
  accept?: string;
  /** 是否支持多选 */
  multiple?: boolean;
}

/** 图片类 */
const ACCEPT_IMAGE = ["image/*"];

/** Excel / 表格类 */
const ACCEPT_EXCEL = [".xlsx", ".xls", ".csv", ".ods", ".xlsm", ".xlsb"];

/** 文档类（非纯文本） */
const ACCEPT_DOC = [".docx", ".pdf"];

/** 纯文本扩展名（与 fileProcessor 的 PLAIN_TEXT_EXTENSIONS 基本对齐） */
const ACCEPT_PLAIN_TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".mdx",
  ".log",
  ".ini",
  ".cfg",
  ".yaml",
  ".yml",
  ".env",
  ".toml",
  ".xml",
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".less",
];

/** 纯文本/代码类 MIME */
const ACCEPT_PLAIN_TEXT_MIME = [
  "text/plain",
  "text/markdown",
  "text/x-yaml",
  "application/x-yaml",
  "text/xml",
  "application/xml",
  "text/html",
  "application/javascript",
  "text/javascript",
  "text/css",
];

/** JSON 类（扩展名 + 常见 MIME） */
const ACCEPT_JSON = [
  ".json",
  "application/json",
  "application/ld+json",
  "application/jsonl",
];

/** 默认允许的文件类型 */
const DEFAULT_ACCEPT = [
  ...ACCEPT_IMAGE,
  ...ACCEPT_EXCEL,
  ...ACCEPT_DOC,
  ...ACCEPT_PLAIN_TEXT_EXTENSIONS,
  ...ACCEPT_PLAIN_TEXT_MIME,
  ...ACCEPT_JSON,
].join(",");

/** 按钮样式：提升到组件外，方便维护与复用 */
const FILE_UPLOAD_BUTTON_STYLES = `
  .upload-button {
    --button-size: 44px;
    width: var(--button-size);
    height: var(--button-size);
    border-radius: 50%; /* 圆形按钮 */
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--backgroundSecondary);
    color: var(--textSecondary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;
    box-shadow: 
      0 1px 3px var(--shadowLight),
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
    background: linear-gradient(135deg, var(--primaryGhost) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .upload-button:hover:not(:disabled) {
    background: var(--background);
    color: var(--primary);
    border-color: var(--borderHover);
    transform: translateY(-2px);
    box-shadow: 
      0 4px 12px var(--shadowMedium),
      0 0 0 1px var(--primaryGhost),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .upload-button:hover:not(:disabled)::before {
    opacity: 1;
  }

  .upload-button:active:not(:disabled) {
    transform: translateY(0);
    transition-duration: 0.1s;
    box-shadow: 
      0 1px 3px var(--shadowLight),
      inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  .upload-button:focus-visible {
    outline: none;
    box-shadow: 
      0 0 0 2px var(--background),
      0 0 0 4px var(--primary),
      0 1px 3px var(--shadowLight);
  }

  .upload-button:focus:not(:focus-visible) {
    outline: none;
  }

  /* 移动端调整 */
  @media (max-width: 768px) {
    .upload-button { --button-size: 40px; }
  }

  @media (max-width: 480px) {
    .upload-button { --button-size: 36px; }
  }

  @media (min-width: 769px) {
    .upload-button { --button-size: 48px; }
  }
`;

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFilesSelected,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  multiple = true,
}) => {
  const { t } = useTranslation("chat");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onFilesSelected(e.target.files);
    // 重置，以便重复选同一个文件也能触发 onChange
    e.target.value = "";
  };

  return (
    <>
      {/* 样式仍然随组件一起加载，但已抽离成常量更易维护 */}
      <style data-name="file-upload-button" precedence="medium">
        {FILE_UPLOAD_BUTTON_STYLES}
      </style>

      <button
        type="button"
        className="upload-button"
        onClick={handleButtonClick}
        title={t("uploadFile", "上传文件")}
        aria-label={t("uploadFile", "上传文件")}
        disabled={disabled}
      >
        <UploadIcon size={20} />
      </button>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
      />
    </>
  );
};

export default FileUploadButton;
