// chat/web/shared/FileItem.tsx
import React, { memo } from "react";
import { FaFileExcel, FaFileWord, FaFilePdf, FaFileAlt } from "react-icons/fa";

const FILE_TYPE_CONFIG = {
  excel: { icon: FaFileExcel, color: "#1D6F42", ext: "Excel" },
  docx: { icon: FaFileWord, color: "#2B579A", ext: "Word" },
  pdf: { icon: FaFilePdf, color: "#DC3545", ext: "PDF" },
  txt: { icon: FaFileAlt, color: "#6c757d", ext: "文本" },
  page: { icon: FaFileWord, color: "#FF9500", ext: "Page" },
};

export const FileItem = memo(
  ({
    file,
    variant = "message", // "message" | "attachment"
    onPreview,
    isProcessing = false,
    error,
    isMobile = false,
  }) => {
    const config = FILE_TYPE_CONFIG[file?.type];
    if (!config) return null;

    const IconComponent = config.icon;
    const isAttachment = variant === "attachment";
    const disabled = isProcessing || !!error;

    const truncate = (name: string, max = 12) => {
      if (!isAttachment || !name) return name || "未知文件";
      if (name.length <= max) return name;
      const dot = name.lastIndexOf(".");
      const ext = dot > -1 ? name.slice(dot + 1) : "";
      const base = dot > -1 ? name.slice(0, dot) : name;
      const keep = Math.max(1, max - ext.length - 4);
      return `${base.slice(0, keep)}...${ext}`;
    };

    const formatSize = (bytes?: number) => {
      if (!bytes) return "";
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / 1048576).toFixed(1)}MB`;
    };

    const displayName = truncate(file?.name);

    return (
      <>
        <div
          className={[
            "file-item",
            variant,
            isMobile ? "mobile" : "",
            isProcessing ? "processing" : "",
            error ? "error" : "",
          ].join(" ")}
          style={{ "--file-color": config.color } as React.CSSProperties}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-busy={isProcessing || undefined}
          aria-disabled={disabled || undefined}
          title={error || undefined}
          onClick={() => !disabled && onPreview?.(file)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              onPreview?.(file);
            }
          }}
        >
          <div className="file-icon-wrapper">
            <IconComponent
              size={isAttachment ? 14 : 16}
              className="file-icon"
            />
          </div>

          {isAttachment ? (
            <div className="file-info">
              <span className="file-name">{displayName}</span>
              <div className="file-meta">
                <span className="file-ext">{config.ext}</span>
                {file?.size ? (
                  <span className="file-size">{formatSize(file.size)}</span>
                ) : null}
              </div>
            </div>
          ) : (
            <span className="file-name">{file?.name || "未知文件"}</span>
          )}

          {isAttachment && isProcessing && (
            <div className="processing-indicator">
              <div className="spinner" />
            </div>
          )}

          {isAttachment && error && <div className="error-indicator">⚠️</div>}
        </div>

        <style href="file-item-shared" precedence="medium">{`
          .file-item {
            display: inline-flex;
            align-items: center;
            position: relative;
            cursor: pointer;
            transition: transform .2s ease, background .2s ease, border-color .2s ease;
            color: var(--file-color, var(--textSecondary));
            border-radius: var(--space-2);
            font-weight: 500;
            border: 1px solid var(--border);
            background: var(--background);
          }

          /* 消息模式 */
          .file-item.message {
            gap: var(--space-2);
            padding: var(--space-2) var(--space-3);
            background: var(--backgroundSecondary);
            font-size: 14px;
            max-width: 280px;
          }

          /* 附件模式 */
          .file-item.attachment {
            gap: var(--space-2);
            padding: var(--space-2);
            width: fit-content;
            max-width: 120px;
            min-height: 44px;
          }
          .file-item.attachment.mobile {
            max-width: 110px;
            padding: var(--space-2) var(--space-3);
          }

          .file-item:hover:not(.processing):not(.error) {
            background: var(--backgroundHover);
            border-color: var(--file-color);
          }
          .file-item.message:hover:not(.processing):not(.error) {
            transform: translateY(-1px);
          }
          .file-item.attachment:hover:not(.processing):not(.error) {
            transform: scale(1.02);
          }

          .file-item:focus-visible {
            outline: 2px solid color-mix(in srgb, var(--primary) 25%, transparent);
            outline-offset: 2px;
          }

          .file-icon-wrapper {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform .2s ease, background .2s ease;
          }
          .file-item.attachment .file-icon-wrapper {
            width: 20px;
            height: 20px;
            border-radius: var(--space-1);
            background: color-mix(in srgb, var(--file-color) 10%, transparent);
          }

          .file-icon { color: var(--file-color); }

          .file-item:hover:not(.processing):not(.error) .file-icon-wrapper {
            background: var(--file-color);
            transform: scale(1.1);
          }
          .file-item:hover:not(.processing):not(.error) .file-icon {
            color: #fff;
          }

          .file-info {
            display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1;
          }
          .file-name {
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
          }
          .file-item.message .file-name { font-size: 14px; }
          .file-item.attachment .file-name { font-size: .7rem; line-height: 1.2; max-width: 70px; }
          .file-item.attachment.mobile .file-name { font-size: .75rem; max-width: 60px; }

          .file-meta { display: flex; gap: var(--space-1); align-items: center; }
          .file-ext { font-size: .6rem; color: var(--textTertiary); font-weight: 400; }
          .file-size {
            font-size: .55rem; color: var(--textQuaternary);
            background: var(--backgroundTertiary);
            padding: 1px 4px; border-radius: 2px; white-space: nowrap;
          }

          /* 处理中 */
          .file-item.processing { opacity: .7; pointer-events: none; }
          .processing-indicator { position: absolute; top: 4px; right: 4px; width: 12px; height: 12px; z-index: 1; }
          .spinner {
            width: 100%; height: 100%;
            border: 1.5px solid var(--primary);
            border-top: 1.5px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* 错误 */
          .file-item.error {
            border-color: var(--error);
            background: color-mix(in srgb, var(--error) 5%, transparent);
            pointer-events: none;
          }
          .error-indicator { position: absolute; top: 2px; right: 2px; font-size: 10px; z-index: 1; }

          @media (max-width: 768px) {
            .file-item.message { max-width: 200px; font-size: 13px; }
          }

          @media (prefers-reduced-motion: reduce) {
            .file-item, .file-icon-wrapper, .spinner { transition: none; animation: none; }
            .file-item:hover .file-icon-wrapper { transform: none; }
            .spinner { border: 2px solid var(--primary); border-top-color: transparent; }
          }
        `}</style>
      </>
    );
  }
);

export default FileItem;
