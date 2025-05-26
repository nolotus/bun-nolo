import { useState } from "react";
import { MessageText } from "./MessageText";
import { useTheme } from "app/theme";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import { BaseModal } from "render/web/ui/BaseModal";

interface FilePreview {
  item: any;
  type: "excel" | "docx" | "pdf" | "page";
}

interface MessageContentProps {
  content: string | Array<any>;
  role: string;
}

export const MessageContent = ({ content, role }: MessageContentProps) => {
  const theme = useTheme();
  const [previewingFile, setPreviewingFile] = useState<FilePreview | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!content) return null;

  const isSelf = role === "self";

  // 文件类型配置：图标、标题和颜色
  const FILE_TYPE_CONFIG = {
    excel: {
      icon: FaFileExcel,
      title: "Excel 文件",
      color: "#1D6F42", // Excel 绿色
    },
    docx: {
      icon: FaFileWord,
      title: "Word 文档",
      color: "#2B579A", // Word 蓝色
    },
    pdf: {
      icon: FaFilePdf,
      title: "PDF 文档",
      color: "#DC3545", // PDF 红色
    },
    page: {
      icon: FaFileWord,
      title: "Page 文档",
      color: "#FF9500", // Pages 橙色
    },
  } as const;

  // 通用的文件占位符渲染函数
  const renderFilePlaceholder = (
    item: any,
    index: number,
    type: keyof typeof FILE_TYPE_CONFIG
  ) => {
    const config = FILE_TYPE_CONFIG[type];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div
        key={`${type}-${index}`}
        className="file-placeholder"
        onClick={() => setPreviewingFile({ item, type })}
        title={`点击预览 ${config.title}`}
        role="button"
        aria-label={`${config.title}: ${item.name || "未知文件"}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPreviewingFile({ item, type });
          }
        }}
        style={{ "--file-color": config.color } as React.CSSProperties}
      >
        <IconComponent size={16} />
        <span className="file-name">{item.name || "未知文件"}</span>
      </div>
    );
  };

  return (
    <>
      <div
        className={`message-content ${isSelf ? "message-self" : "message-other"}`}
      >
        {typeof content === "string" ? (
          <MessageText content={content} role={role} />
        ) : Array.isArray(content) ? (
          content.map((item, index) => {
            if (!item || typeof item !== "object") return null;

            if (item.type === "text" && item.text) {
              return (
                <MessageText
                  key={`text-${index}`}
                  content={item.text}
                  role={role}
                />
              );
            }

            if (item.type === "image_url" && item.image_url?.url) {
              return (
                <div key={`image-${index}`} className="message-image-container">
                  <img
                    src={item.image_url.url}
                    alt={item.alt_text || "消息图片"}
                    className="message-image"
                    onClick={() => setSelectedImage(item.image_url.url)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedImage(item.image_url.url);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="点击查看大图"
                  />
                </div>
              );
            }

            // 处理文件类型：excel, docx, pdf, page
            if (
              item.pageKey &&
              FILE_TYPE_CONFIG[item.type as keyof typeof FILE_TYPE_CONFIG]
            ) {
              return renderFilePlaceholder(
                item,
                index,
                item.type as keyof typeof FILE_TYPE_CONFIG
              );
            }

            return (
              <div key={`unknown-${index}`} className="message-unknown">
                Unknown message type
              </div>
            );
          })
        ) : (
          <div className="message-invalid">Invalid content format</div>
        )}
      </div>

      {/* 统一文件预览模态框 */}
      {previewingFile && (
        <DocxPreviewDialog
          isOpen={!!previewingFile}
          onClose={() => setPreviewingFile(null)}
          pageKey={previewingFile.item.pageKey}
          fileName={previewingFile.item.name}
        />
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <BaseModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          className="image-preview-modal"
        >
          <img
            src={selectedImage}
            alt="放大预览"
            className="preview-modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </BaseModal>
      )}

      <style href="message-content" precedence="medium">{`
        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation: message-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          white-space: pre-wrap;
          min-width: 100px;
          font-size: 15px;
          line-height: 1.65;
          gap: ${theme.space[3]};
          position: relative;
        }

        .message-content p {
          margin: 0 0 0.85em 0;
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .message-content ul,
        .message-content ol {
          margin-top: 0.25em;
          margin-bottom: 0.85em;
          padding-left: 1.5em;
        }

        .message-content li {
          margin-bottom: 0.5em;
        }

        .message-content li:last-child {
          margin-bottom: 0;
        }

        .message-image-container {
          position: relative;
          display: inline-block;
        }

        .message-image {
          border-radius: ${theme.space[2]};
          max-width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          box-shadow: 0 2px 8px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .message-image:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px ${theme.shadowMedium};
          border-color: ${theme.primary};
        }

        .message-image:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .message-self {
          color: ${theme.text};
        }

        .message-other {
          color: ${theme.text};
        }

        .message-unknown,
        .message-invalid {
          padding: ${theme.space[2]} ${theme.space[3]};
          background-color: ${theme.backgroundGhost};
          border-radius: ${theme.space[2]};
          color: ${theme.textSecondary};
          font-size: 14px;
          border: 1px solid ${theme.borderLight};
        }

        /* 文件占位符统一样式 */
        .file-placeholder {
          display: inline-flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background-color: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--file-color, ${theme.textSecondary});
          font-size: 14px;
          font-weight: 500;
          max-width: 280px;
        }

        .file-placeholder:hover {
          background-color: ${theme.backgroundHover};
          border-color: ${theme.borderHover};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }

        .file-placeholder:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .file-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        /* 图片预览模态框样式 */
        .preview-modal-image {
          max-width: 92vw;
          max-height: 88vh;
          object-fit: contain;
          border-radius: ${theme.space[3]};
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .message-content {
            font-size: 14px;
            gap: ${theme.space[2]};
          }
          
          .file-placeholder {
            padding: ${theme.space[1]} ${theme.space[2]};
            max-width: 240px;
            font-size: 13px;
          }
          
          .message-image {
            max-height: 320px;
          }
        }

        /* 减少动画偏好设置 */
        @media (prefers-reduced-motion: reduce) {
          .message-content {
            animation: none;
          }
          
          .message-image,
          .file-placeholder {
            transition: none;
          }
          
          .message-image:hover,
          .file-placeholder:hover {
            transform: none;
          }
        }

        /* 打印样式 */
        @media print {
          .file-placeholder {
            border: 1px solid #ccc;
            background: #f9f9f9;
          }
          
          .message-image {
            box-shadow: none;
            border: 1px solid #ccc;
          }
        }
      `}</style>
    </>
  );
};
