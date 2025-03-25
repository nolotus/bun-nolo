// create/space/components/FileDropZone.tsx
import React, { useState } from "react";
import { useTheme } from "app/theme";
import { FaFileUpload, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast";

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number; // 最大文件大小，单位字节
  children: React.ReactNode;
  disabled?: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesAdded,
  acceptedTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".md",
    ".markdown",
  ],
  maxSize = 50 * 1024 * 1024, // 默认50MB
  children,
  disabled = false,
}) => {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: FileList): File[] => {
    // 检查文件类型和大小
    const invalidTypes: string[] = [];
    const oversizedFiles: string[] = [];

    const validFiles = Array.from(files).filter((file) => {
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      const mimeType = file.type;

      // 检查扩展名或MIME类型是否被接受
      const validType =
        acceptedTypes.includes(fileExt) ||
        acceptedTypes.some((type) => mimeType.includes(type.replace(".", "")));

      if (!validType) {
        invalidTypes.push(file.name);
        return false;
      }

      if (file.size > maxSize) {
        oversizedFiles.push(file.name);
        return false;
      }

      return true;
    });

    // 设置错误信息
    if (invalidTypes.length > 0) {
      toast.error(`不支持的文件类型: ${invalidTypes.join(", ")}`, {
        duration: 4000,
      });
    }

    if (oversizedFiles.length > 0) {
      toast.error(
        `文件过大: ${oversizedFiles.join(", ")}. 最大支持${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        {
          duration: 4000,
        }
      );
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
        // 显示成功提示
        toast.success(`已添加 ${validFiles.length} 个文件`);
      }
    }
  };

  return (
    <div
      className={`file-drop-zone ${dragActive ? "active" : ""} ${disabled ? "disabled" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {children}

      {dragActive && !disabled && (
        <div className="drop-indicator">
          <div className="indicator-content">
            <div className="indicator-icon">
              <FaFileUpload size={36} />
            </div>
            <p>释放鼠标添加文件</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .file-drop-zone {
          position: relative;
          width: 100%;
          min-height: 100px;
        }

        .file-drop-zone.disabled {
          pointer-events: none;
        }

        .drop-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${theme.backgroundGhost || "rgba(249, 250, 251, 0.95)"};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 16px;
          border: 2px dashed ${theme.primary};
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.9;
          }
        }

        .indicator-content {
          text-align: center;
          padding: 24px;
        }

        .indicator-icon {
          width: 80px;
          height: 80px;
          background: ${theme.primary};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto 16px auto;
        }

        .indicator-content p {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: ${theme.primary};
        }

        @media (max-width: 768px) {
          .indicator-icon {
            width: 60px;
            height: 60px;
          }

          .indicator-content p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default FileDropZone;
