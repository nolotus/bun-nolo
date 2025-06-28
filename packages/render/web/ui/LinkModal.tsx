// render/web/ui/LinkModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "render/web/ui/Dialog";
import Button from "render/web/ui/Button";
// 假设你有一个标准化的 Input 组件，如果没有，可以使用下面的样式化 input
// import Input from "render/web/ui/Input";
import { LinkIcon, TrashIcon } from "@primer/octicons-react";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 当用户确认时调用，传入最终的 URL
   */
  onConfirm: (url: string) => void;
  /**
   * 当用户点击移除链接时调用
   */
  onRemove: () => void;
  /**
   * 用于编辑模式下，传入当前链接的 URL
   */
  initialUrl?: string;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onRemove,
  initialUrl = "",
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState(initialUrl);

  // 当弹窗打开或初始 URL 变化时，同步更新输入框的值
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || "");
    }
  }, [initialUrl, isOpen]);

  const handleConfirm = useCallback(() => {
    // 简单验证，确保 URL 不为空
    if (url.trim()) {
      onConfirm(url.trim());
      onClose();
    }
  }, [url, onConfirm, onClose]);

  const handleRemove = useCallback(() => {
    onRemove();
    onClose();
  }, [onRemove, onClose]);

  // 支持在输入框中按 Enter 键确认
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  const isEditing = !!initialUrl;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t("linkModal.editTitle", "编辑链接")
          : t("linkModal.addTitle", "添加链接")
      }
      size="small"
    >
      <div className="link-modal-container">
        <div className="input-wrapper">
          <LinkIcon size={16} className="input-icon" />
          <input
            type="text"
            className="link-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("linkModal.placeholder", "https://example.com")}
            autoFocus
          />
        </div>

        <div className="actions-wrapper">
          {isEditing && (
            <Button
              onClick={handleRemove}
              variant="secondary"
              status="error"
              size="small"
            >
              <TrashIcon size={14} />
              <span style={{ marginLeft: "4px" }}>
                {t("common.remove", "移除")}
              </span>
            </Button>
          )}
          <div className="spacer" />
          <Button onClick={onClose} variant="secondary" size="small">
            {t("common.cancel", "取消")}
          </Button>
          <Button onClick={handleConfirm} size="small" disabled={!url.trim()}>
            {isEditing ? t("common.save", "保存") : t("common.add", "添加")}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .link-modal-container {
          display: flex;
          flex-direction: column;
          gap: 24px; /* 间距 */
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: var(--theme-textTertiary); /* 使用 CSS 变量或 theme 对象 */
        }

        /* 这是一个基础的 Input 样式，如果项目中有标准 Input 组件，请替换 */
        .link-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px; /* 左侧留出图标空间 */
          box-sizing: border-box;
          border-radius: 8px;
          border: 1px solid var(--theme-border, #e5e7eb);
          background-color: var(--theme-backgroundSecondary, #f9fafb);
          color: var(--theme-text, #111827);
          font-size: 14px;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }

        .link-input:focus {
          outline: none;
          border-color: var(--theme-primary, #3b82f6);
          box-shadow: 0 0 0 2px
            var(--theme-primary-light, rgba(59, 130, 246, 0.2));
        }

        .actions-wrapper {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px; /* 按钮间距 */
        }

        .spacer {
          flex-grow: 1;
        }
      `}</style>
    </Dialog>
  );
};
