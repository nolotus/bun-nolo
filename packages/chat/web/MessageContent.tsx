import { useState } from "react";
import { MessageText } from "./MessageText";
import { useTheme } from "app/theme";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";
import { BaseModal } from "render/web/ui/BaseModal";
import { XIcon } from "@primer/octicons-react";

export const MessageContent = ({ content, role }) => {
  const theme = useTheme();
  const [previewingFile, setPreviewingFile] = useState<{
    item: any;
    type: "excel" | "docx" | "pdf";
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!content) return null;

  const isSelf = role === "self";

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
                    alt="消息图片"
                    className="message-image"
                    onClick={() => setSelectedImage(item.image_url.url)}
                  />
                </div>
              );
            }

            if (item.type === "excel" && item.pageKey) {
              return (
                <div
                  key={`excel-${index}`}
                  className="message-excel-placeholder"
                  onClick={() => setPreviewingFile({ item, type: "excel" })}
                  title="点击预览 Excel 文件"
                >
                  <FaFileExcel size={18} />
                  <span>Excel 文件: {item.name || "未知文件"}</span>
                </div>
              );
            }

            if (item.type === "docx" && item.pageKey) {
              return (
                <div
                  key={`docx-${index}`}
                  className="message-docx-placeholder"
                  onClick={() => setPreviewingFile({ item, type: "docx" })}
                  title="点击预览 DOCX 文件"
                >
                  <FaFileWord size={18} />
                  <span>DOCX 文件: {item.name || "未知文件"}</span>
                </div>
              );
            }

            if (item.type === "pdf" && item.pageKey) {
              return (
                <div
                  key={`pdf-${index}`}
                  className="message-pdf-placeholder"
                  onClick={() => setPreviewingFile({ item, type: "pdf" })}
                  title="点击预览 PDF 文件"
                >
                  <FaFilePdf size={18} />
                  <span>PDF 文件: {item.name || "未知文件"}</span>
                </div>
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
            onClick={(e) => e.stopPropagation()} // 防止点击图片关闭模态框
          />
        </BaseModal>
      )}

      <style href="message-content" precedence="medium">{`
        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease-out;
          animation: message-enter 0.3s ease-out forwards;
          white-space: pre-wrap;
          min-width: 100px;
          font-size: 15px;
          line-height: 1.6;
          gap: 14px;
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
          border-radius: 6px;
          max-width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          box-shadow: 0 1px 2px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .message-image:hover {
          transform: scale(1.02);
          border-color: ${theme.primary};
        }

        .message-self {
          color: ${theme.text};
        }

        .message-other {
          color: ${theme.text};
        }

        .message-unknown,
        .message-invalid {
          padding: 10px 14px;
          background-color: ${theme.backgroundGhost};
          border-radius: 6px;
          color: ${theme.textSecondary};
          font-size: 14px;
          border: 1px solid ${theme.borderLight};
        }

        .message-excel-placeholder {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .message-excel-placeholder:hover {
          background-color: ${theme.backgroundHover};
        }

        .message-docx-placeholder {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .message-docx-placeholder:hover {
          background-color: ${theme.backgroundHover};
        }

        .message-pdf-placeholder {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .message-pdf-placeholder:hover {
          background-color: ${theme.backgroundHover};
        }

        /* 图片预览模态框样式 */
        .preview-modal-image {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        @media (prefers-reduced-motion: reduce) {
          .message-image {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};
