import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFileImport, FaFile, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "app/theme";
import { useSpaceData } from "../hooks/useSpaceData";
import FileList from "../components/FileList";
import FileDropZone from "../components/FileDropZone";
import toast from "react-hot-toast";

// 模拟文件列表数据
const mockFiles = [
  {
    id: 1,
    name: "项目简介.pdf",
    type: "pdf",
    size: "2.4 MB",
    updatedAt: "2025-03-20",
  },
  {
    id: 2,
    name: "会议记录.docx",
    type: "docx",
    size: "1.1 MB",
    updatedAt: "2025-03-22",
  },
  {
    id: 3,
    name: "数据分析.xlsx",
    type: "xlsx",
    size: "3.7 MB",
    updatedAt: "2025-03-24",
  },
  {
    id: 4,
    name: "客户反馈汇总.pdf",
    type: "pdf",
    size: "1.8 MB",
    updatedAt: "2025-03-19",
  },
  {
    id: 5,
    name: "营销计划.docx",
    type: "docx",
    size: "2.2 MB",
    updatedAt: "2025-03-18",
  },
  {
    id: 6,
    name: "财务报表.xlsx",
    type: "xlsx",
    size: "4.5 MB",
    updatedAt: "2025-03-17",
  },
];

// 接受的文件类型
const acceptedFileTypes = [
  ".txt",
  ".md",
  ".markdown",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const SpaceFiles: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(mockFiles);
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();
  const { spaceData, loading } = useSpaceData(spaceId!);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    handleFiles(Array.from(selectedFiles));

    // 重置文件输入，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFiles = (newFiles: File[]) => {
    setUploading(true);

    try {
      // 检查文件类型
      const invalidFiles = newFiles.filter((file) => {
        const fileType = file.type;
        const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

        return !acceptedFileTypes.some(
          (type) => fileType.includes(type.replace(".", "")) || type === fileExt
        );
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `不支持的文件类型: ${invalidFiles.map((f) => f.name).join(", ")}`
        );
        setUploading(false);
        return;
      }

      // 模拟上传延迟
      setTimeout(() => {
        // 添加文件到列表
        const newFileItems = newFiles.map((file) => ({
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.name.split(".").pop() || "unknown",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          updatedAt: new Date().toISOString().split("T")[0],
        }));

        setFiles((prev) => [...newFileItems, ...prev]);
        setUploading(false);

        if (newFiles.length === 1) {
          toast.success(`文件 ${newFiles[0].name} 已上传`);
        } else {
          toast.success(`${newFiles.length} 个文件已上传`);
        }
      }, 1000);
    } catch (err) {
      setUploading(false);
      toast.error("文件上传失败");
      console.error("Upload error:", err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (fileId: number) => {
    setFiles(files.filter((file) => file.id !== fileId));
    toast.success("文件已删除");
  };

  const handleViewFile = (fileId: number) => {
    console.log("查看文件", fileId);
    // 这里应该实现查看文件的逻辑
  };

  const handleDownloadFile = (fileId: number) => {
    console.log("下载文件", fileId);
    // 这里应该实现下载文件的逻辑
    toast.success("文件下载中...");
  };

  return (
    <FileDropZone
      onFilesAdded={handleFiles}
      acceptedTypes={acceptedFileTypes}
      disabled={uploading || loading}
    >
      <div className="space-files">
        <div className="dashboard-header">
          <div className="stats-pills">
            <div className="stat-pill">
              <div className="stat-icon files-icon">
                <FaFile />
              </div>
              <div className="stat-info">
                <span className="stat-label">文件数量</span>
                <span className="stat-value">{files.length}</span>
              </div>
            </div>
          </div>

          <div className="drop-hint">
            <FaInfoCircle />
            <span>将文件拖放到此页面即可上传</span>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">
                <FaFile />
              </span>
              所有文件
            </h2>
            <div className="header-actions">
              <button
                className={`import-button ${uploading ? "loading" : ""}`}
                onClick={triggerFileInput}
                disabled={uploading}
              >
                <FaFileImport />
                <span>{uploading ? "上传中..." : "导入文件"}</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".txt,.md,.markdown,.pdf,.doc,.docx,.xls,.xlsx"
              multiple
            />
          </div>

          <div className="files-container">
            <FileList
              files={files}
              onRemoveFile={handleRemoveFile}
              onViewFile={handleViewFile}
              onDownloadFile={handleDownloadFile}
              onImportFile={triggerFileInput}
              emptyTitle="开始整理您的文件"
              emptyDescription="导入您的第一个文件，开始管理和共享您的内容"
              loading={loading || uploading}
            />
          </div>
        </div>

        <style jsx>{`
          .space-files {
            width: 100%;
          }

          .dashboard-header {
            margin-bottom: ${theme.space[6]};
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: ${theme.space[3]};
          }

          .stats-pills {
            display: flex;
            gap: ${theme.space[2]};
            flex-wrap: wrap;
          }

          .stat-pill {
            display: flex;
            align-items: center;
            background: ${theme.background};
            border-radius: 40px;
            padding: ${theme.space[1]} ${theme.space[3]};
            box-shadow: 0 1px 2px ${theme.shadowLight};
          }

          .stat-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: ${theme.space[2]};
          }

          .files-icon {
            background: ${theme.primaryLight};
            color: ${theme.primary};
          }

          .stat-info {
            display: flex;
            flex-direction: column;
          }

          .stat-label {
            font-size: 11px;
            color: ${theme.textSecondary};
            line-height: 1;
          }

          .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: ${theme.text};
          }

          .drop-hint {
            display: flex;
            align-items: center;
            gap: ${theme.space[1]};
            font-size: 13px;
            color: ${theme.textSecondary};
            background: ${theme.backgroundHover};
            padding: ${theme.space[1]} ${theme.space[3]};
            border-radius: 6px;
          }

          .drop-hint svg {
            color: ${theme.primary};
          }

          .content-section {
            margin-bottom: ${theme.space[8]};
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: ${theme.space[4]};
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: ${theme.space[4]};
          }

          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: ${theme.text};
            margin: 0;
            display: flex;
            align-items: center;
          }

          .title-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: ${theme.space[2]};
            width: 28px;
            height: 28px;
            background: ${theme.backgroundHover};
            color: ${theme.primary};
            border-radius: 6px;
          }

          .import-button {
            display: flex;
            align-items: center;
            padding: ${theme.space[2]} ${theme.space[3]};
            border: none;
            background: ${theme.primary};
            color: white;
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          }

          .import-button svg {
            margin-right: ${theme.space[2]};
          }

          .import-button:hover {
            background: ${theme.primaryDark};
            transform: translateY(-1px);
          }

          .import-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .import-button.loading:after {
            content: "";
            position: absolute;
            left: -45px;
            top: 0;
            height: 100%;
            width: 40px;
            background: linear-gradient(
              to right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: loading 1s infinite;
          }

          @keyframes loading {
            0% {
              left: -45px;
            }
            100% {
              left: 100%;
            }
          }

          .files-container {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px ${theme.shadowLight};
          }

          @media (max-width: 768px) {
            .dashboard-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .stats-pills {
              width: 100%;
            }

            .section-header {
              flex-direction: column;
              align-items: flex-start;
              gap: ${theme.space[3]};
            }

            .header-actions {
              width: 100%;
            }

            .import-button {
              flex: 1;
              justify-content: center;
            }

            .drop-hint {
              width: 100%;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .stats-pills {
              gap: ${theme.space[1]};
            }

            .stat-pill {
              padding: ${theme.space[1]} ${theme.space[2]};
            }

            .stat-icon {
              width: 20px;
              height: 20px;
              font-size: 10px;
            }

            .stat-value {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </FileDropZone>
  );
};

export default SpaceFiles;
