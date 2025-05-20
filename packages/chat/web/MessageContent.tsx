import { useState } from "react";
import { MessageText } from "./MessageText";
import { useTheme } from "app/theme";
import ExcelPreview from "web/ExcelPreview";
import DocxPreviewDialog from "web/DocxPreviewDialog";
import { FaFileExcel, FaFileWord, FaFilePdf } from "react-icons/fa";

export const MessageContent = ({ content, role }) => {
  const theme = useTheme();
  const [previewingExcel, setPreviewingExcel] = useState(null);
  const [previewingDocx, setPreviewingDocx] = useState(null); // 用于控制 DOCX 和 PDF 预览

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
                <picture key={`image-${index}`}>
                  <source srcSet={item.image_url.url} />
                  <img
                    src={item.image_url.url}
                    alt="Generated content"
                    className="message-image"
                  />
                </picture>
              );
            }

            if (item.type === "excel" && item.data) {
              // 不直接展示 Excel 数据，而显示一个可点击的占位区域
              return (
                <div
                  key={`excel-${index}`}
                  className="message-excel-placeholder"
                  onClick={() => setPreviewingExcel(item)}
                  title="点击预览 Excel 文件"
                >
                  <FaFileExcel size={18} />
                  <span>Excel 文件: {item.name || "未知文件"}</span>
                </div>
              );
            }

            if (item.type === "docx" && item.pageKey) {
              // 不直接展示 DOCX 内容，而显示一个可点击的占位区域
              return (
                <div
                  key={`docx-${index}`}
                  className="message-docx-placeholder"
                  onClick={() => setPreviewingDocx(item)}
                  title="点击预览 DOCX 文件"
                >
                  <FaFileWord size={18} />
                  <span>DOCX 文件: {item.name || "未知文件"}</span>
                </div>
              );
            }

            if (item.type === "pdf" && item.pageKey) {
              // 不直接展示 PDF 内容，而显示一个可点击的占位区域
              return (
                <div
                  key={`pdf-${index}`}
                  className="message-pdf-placeholder"
                  onClick={() => setPreviewingDocx(item)}
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

      {/* 当点击 Excel 占位区域后，显示预览模态框 */}
      {previewingExcel && (
        <ExcelPreview
          excelFiles={[previewingExcel]}
          // 对于消息中的 Excel 文件，不需要删除或预览操作，这里传入空函数
          onRemove={(id) => {}}
          onPreview={(id) => {}}
          previewingFile={previewingExcel}
          closePreview={() => setPreviewingExcel(null)}
        />
      )}

      {/* 当点击 DOCX 或 PDF 占位区域后，显示预览模态框 */}
      {previewingDocx && (
        <DocxPreviewDialog
          isOpen={!!previewingDocx}
          onClose={() => setPreviewingDocx(null)}
          pageKey={previewingDocx.pageKey}
          fileName={previewingDocx.name}
        />
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

        .message-image {
          border-radius: 6px;
          max-width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          box-shadow: 0 1px 2px ${theme.shadowLight};
          border: 1px solid ${theme.border};
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
      `}</style>
    </>
  );
};
