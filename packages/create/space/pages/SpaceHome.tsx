// create/space/pages/SpaceHome.tsx
import React, { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaFileImport,
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaFile,
  FaFilePdf,
  FaPlus,
  FaColumns,
  FaBook,
  FaInfoCircle,
} from "react-icons/fa";
import { useTheme } from "app/theme";
import { useSpaceData } from "../hooks/useSpaceData";
import FileList from "../components/FileList";
import EmptyState from "../components/EmptyState";
import FileDropZone from "../components/FileDropZone";
import toast from "react-hot-toast";

// 扩展模拟文件列表数据到6个
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

// 扩展模拟页面数据到6个
const mockPages = [
  {
    id: 101,
    title: "项目规划",
    icon: <FaFilePdf />,
    lastEdited: "2025-03-24",
    creator: "张三",
  },
  {
    id: 102,
    title: "团队任务分配",
    icon: <FaFile />,
    lastEdited: "2025-03-23",
    creator: "李四",
  },
  {
    id: 103,
    title: "产品原型设计",
    icon: <FaFile />,
    lastEdited: "2025-03-21",
    creator: "王五",
  },
  {
    id: 104,
    title: "市场调研报告",
    icon: <FaFilePdf />,
    lastEdited: "2025-03-20",
    creator: "赵六",
  },
  {
    id: 105,
    title: "竞品分析",
    icon: <FaFile />,
    lastEdited: "2025-03-19",
    creator: "钱七",
  },
  {
    id: 106,
    title: "用户反馈总结",
    icon: <FaFile />,
    lastEdited: "2025-03-17",
    creator: "孙八",
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

const SpaceHome: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(mockFiles);
  const [pages, setPages] = useState(mockPages);
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

  const handleCreatePage = () => {
    console.log("创建新页面");
    // 实现创建页面的逻辑
  };

  return (
    <FileDropZone
      onFilesAdded={handleFiles}
      acceptedTypes={acceptedFileTypes}
      disabled={uploading || loading}
    >
      <div className="space-home">
        <div className="dashboard-header">
          <div className="stats-pills">
            <div className="stat-pill">
              <div className="stat-icon files-icon">
                <FaFile />
              </div>
              <div className="stat-info">
                <span className="stat-label">文件</span>
                <span className="stat-value">{files.length}</span>
              </div>
            </div>

            <div className="stat-pill">
              <div className="stat-icon members-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <span className="stat-label">成员</span>
                <span className="stat-value">
                  {loading ? "..." : spaceData?.members?.length || 0}
                </span>
              </div>
            </div>

            <div className="stat-pill">
              <div className="stat-icon date-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <span className="stat-label">创建于</span>
                <span className="stat-value">
                  {loading
                    ? "..."
                    : new Date(
                        spaceData?.createdAt || Date.now()
                      ).toLocaleDateString()}
                </span>
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
                <FaChartBar />
              </span>
              最近文件
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
              <Link to={`/space/${spaceId}/files`} className="view-all-link">
                查看全部
              </Link>
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
              files={files.slice(0, 6)} // 显示6个文件
              onRemoveFile={handleRemoveFile}
              onViewFile={handleViewFile}
              onDownloadFile={handleDownloadFile}
              onImportFile={triggerFileInput}
              emptyTitle="开始整理您的文件"
              emptyDescription="导入您的第一个文件，开始管理和共享您的内容"
              loading={loading || uploading}
            />

            {files.length > 6 && (
              <div className="view-more">
                <Link to={`/space/${spaceId}/files`} className="view-more-link">
                  查看更多文件
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 最新页面区域 */}
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">
                <FaColumns />
              </span>
              最新页面
            </h2>
            <div className="header-actions">
              <button
                className="import-button secondary"
                onClick={handleCreatePage}
              >
                <FaPlus />
                <span>新建页面</span>
              </button>
            </div>
          </div>

          <div className="pages-container">
            {pages.length > 0 ? (
              <div className="pages-grid">
                {pages.slice(0, 6).map((page) => (
                  <div key={page.id} className="page-card">
                    <div className="page-icon">{page.icon}</div>
                    <div className="page-content">
                      <h3 className="page-title">{page.title}</h3>
                      <div className="page-meta">
                        <span className="page-creator">{page.creator}</span>
                        <span className="page-date">{page.lastEdited}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaBook />}
                title="创建您的第一个页面"
                description="页面是组织和记录信息的绝佳方式。创建您的第一个页面，开始记录想法和知识。"
                actionText={
                  <>
                    <FaPlus style={{ marginRight: "8px" }} />
                    新建页面
                  </>
                }
                onAction={handleCreatePage}
                secondaryAction={{
                  text: "查看模板",
                  onClick: () => console.log("查看模板"),
                }}
              />
            )}

            {pages.length > 6 && (
              <div className="view-more">
                <Link to="#" className="view-more-link">
                  查看更多页面
                </Link>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .space-home {
            width: 100%;
          }

          .dashboard-header {
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }

          .stats-pills {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .stat-pill {
            display: flex;
            align-items: center;
            background: ${theme.background};
            border-radius: 40px;
            padding: 6px 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          }

          .stat-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 8px;
          }

          .files-icon {
            background: ${theme.primaryLight};
            color: ${theme.primary};
          }

          .members-icon {
            background: rgba(16, 185, 129, 0.15);
            color: rgb(16, 185, 129);
          }

          .date-icon {
            background: rgba(245, 158, 11, 0.15);
            color: rgb(245, 158, 11);
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
            gap: 6px;
            font-size: 13px;
            color: ${theme.textSecondary};
            background: ${theme.backgroundTertiary};
            padding: 6px 12px;
            border-radius: 6px;
          }

          .drop-hint svg {
            color: ${theme.primary};
          }

          .content-section {
            margin-bottom: 32px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
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
            margin-right: 10px;
            width: 28px;
            height: 28px;
            background: ${theme.backgroundSecondary};
            color: ${theme.primary};
            border-radius: 6px;
          }

          .import-button {
            display: flex;
            align-items: center;
            padding: 8px 14px;
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
            margin-right: 8px;
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

          .import-button.secondary {
            background: ${theme.backgroundSecondary};
            color: ${theme.text};
          }

          .import-button.secondary:hover {
            background: ${theme.backgroundTertiary};
          }

          .view-all-link {
            color: ${theme.primary};
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .view-all-link:hover {
            text-decoration: underline;
          }

          .files-container,
          .pages-container {
            background: ${theme.background};
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .view-more {
            padding: 0 20px 20px;
            text-align: center;
          }

          .view-more-link {
            display: inline-block;
            padding: 8px 14px;
            color: ${theme.primary};
            background: ${theme.primaryLight};
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .view-more-link:hover {
            background: ${theme.primary};
            color: white;
          }

          .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            padding: 20px;
          }

          .page-card {
            background: ${theme.backgroundSecondary};
            border-radius: 10px;
            padding: 16px;
            display: flex;
            align-items: center;
            transition:
              transform 0.2s,
              box-shadow 0.2s;
            cursor: pointer;
          }

          .page-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .page-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(79, 70, 229, 0.1);
            color: rgb(79, 70, 229);
            border-radius: 8px;
            font-size: 16px;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .page-content {
            flex: 1;
            min-width: 0;
          }

          .page-title {
            font-size: 15px;
            font-weight: 500;
            color: ${theme.text};
            margin: 0 0 6px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .page-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: ${theme.textTertiary};
          }

          @media (max-width: 768px) {
            .dashboard-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .stats-pills {
              width: 100%;
              justify-content: space-between;
            }

            .section-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }

            .header-actions {
              width: 100%;
              justify-content: space-between;
            }

            .import-button {
              flex: 1;
              justify-content: center;
            }

            .pages-grid {
              grid-template-columns: 1fr;
            }

            .drop-hint {
              width: 100%;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .stats-pills {
              gap: 6px;
            }

            .stat-pill {
              padding: 4px 10px;
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

export default SpaceHome;
