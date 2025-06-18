// src/web/chat/MessageInput/AttachmentsPreview.tsx

import React from "react";
import {
  FaFileExcel,
  FaFileWord,
  FaFilePdf,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import { useAppDispatch } from "app/hooks";
import ImagePreview from "./ImagePreview"; // 假设这个组件已存在
import type { PendingFile } from "../dialog/dialogSlice";
import { removePendingFile } from "../dialog/dialogSlice";
import { useTheme } from "app/theme";

// 本地UI状态的类型定义
export interface PendingImagePreview {
  id: string;
  url: string; // Base64 or Blob URL
}

// --- 类型与配置 ---
interface AttachmentsPreviewProps {
  imagePreviews: PendingImagePreview[];
  pendingFiles: PendingFile[];
  onRemoveImage: (id: string) => void;
  onPreviewFile: (file: PendingFile) => void;
}

const FILE_TYPE_CONFIG = {
  excel: { icon: FaFileExcel, title: "电子表格", color: "#1D6F42" },
  docx: { icon: FaFileWord, title: "Word 文档", color: "#2B579A" },
  pdf: { icon: FaFilePdf, title: "PDF 文档", color: "#DC3545" },
  txt: { icon: FaFileAlt, title: "文本文件", color: "#6c757d" },
  page: { icon: FaFileWord, title: "Page 文档", color: "#FF9500" },
} as const;

// --- 组件定义 ---
const AttachmentsPreview: React.FC<AttachmentsPreviewProps> = ({
  imagePreviews,
  pendingFiles,
  onRemoveImage,
  onPreviewFile,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleRemoveFile = (id: string) => {
    dispatch(removePendingFile(id));
  };

  const renderFilePreview = (file: PendingFile) => {
    const config = FILE_TYPE_CONFIG[file.type as keyof typeof FILE_TYPE_CONFIG];
    if (!config) return null;
    const IconComponent = config.icon;
    return (
      <div
        key={file.id}
        className="file-attachment"
        style={{ "--file-color": config.color } as React.CSSProperties}
      >
        <div className="file-preview-content">
          <IconComponent size={16} />
          <span
            className="file-name"
            onClick={() => onPreviewFile(file)}
            title={`点击预览 ${config.title}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onPreviewFile(file);
            }}
          >
            {file.name}
          </span>
        </div>
        <button
          className="remove-file-btn"
          onClick={() => handleRemoveFile(file.id)}
          aria-label={`删除 ${file.name}`}
          title={`删除 ${file.name}`}
        >
          <FaTimes size={12} />
        </button>
      </div>
    );
  };

  const hasAttachments = imagePreviews.length > 0 || pendingFiles.length > 0;
  if (!hasAttachments) return null;

  return (
    <div className="attachments-preview">
      <div className="attachments-list">
        {imagePreviews.length > 0 && (
          <ImagePreview images={imagePreviews} onRemove={onRemoveImage} />
        )}
        {pendingFiles.map(renderFilePreview)}
      </div>
      {/* 样式被移动到主组件中，以保持样式定义集中 */}
    </div>
  );
};

export default AttachmentsPreview;
