// File: chat/dialog/DialogInfoPanel.jsx

import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectCurrentDialogConfig,
  removeCybot,
  addCybot,
  selectIsUpdatingMode,
} from "chat/dialog/dialogSlice";
import { selectUserId } from "auth/authSlice";
import { PlusIcon, ChevronDownIcon, InfoIcon } from "@primer/octicons-react";
import BotNameChip from "ai/llm/web/BotNameChip";
import { toast } from "react-hot-toast";
import AddCybotDialog from "./AddCybotDialog";

interface DialogInfoPanelProps {
  limit?: number;
  isMobile?: boolean;
}

const LoadingSpinner = () => (
  <div className="dialog-info__spinner">
    <div className="spinner-ring" />
  </div>
);

const CybotList = ({
  cybots,
  onRemove,
  isUpdating,
}: {
  cybots: string[];
  onRemove: (cybotId: string) => void;
  isUpdating: boolean;
}) => {
  const { t } = useTranslation("chat");

  if (cybots.length === 0) {
    return (
      <div className="dialog-info__empty-state">
        <InfoIcon size={24} />
        <p className="empty-text">{t("NoCybots")}</p>
        <span className="empty-hint">{t("AddCybotToGetStarted")}</span>
      </div>
    );
  }

  return (
    <div className="dialog-info__cybot-list" role="list">
      {cybots.map((botKey) => (
        <div key={botKey} className="cybot-list-item">
          <BotNameChip
            botKey={botKey}
            onRemove={isUpdating ? undefined : onRemove}
            className="dialog-info__bot-chip"
          />
        </div>
      ))}
    </div>
  );
};

const AddCybotButton = ({
  onClick,
  isUpdating,
}: {
  onClick: () => void;
  isUpdating: boolean;
}) => {
  const { t } = useTranslation("chat");

  return (
    <button
      className="dialog-info__add-button"
      onClick={onClick}
      disabled={isUpdating}
      role="menuitem"
      aria-label={t("AddCybot")}
    >
      {isUpdating ? <LoadingSpinner /> : <PlusIcon size={16} />}
      <span className="button-text">{t("AddCybot")}</span>
    </button>
  );
};

const MobileCybotPreview = ({
  cybots,
  totalCount,
}: {
  cybots: string[];
  totalCount: number;
}) => {
  const { t } = useTranslation("chat");
  const previewLimit = 3;
  const hasMore = totalCount > previewLimit;

  if (totalCount === 0) {
    return (
      <div className="dialog-info__mobile-empty">
        <span className="empty-text">{t("NoCybots")}</span>
      </div>
    );
  }

  return (
    <div className="dialog-info__mobile-preview">
      {cybots.slice(0, previewLimit).map((botKey) => (
        <BotNameChip
          key={botKey}
          botKey={botKey}
          compact={true}
          className="mobile-chip"
        />
      ))}
      {hasMore && (
        <span className="more-indicator">+{totalCount - previewLimit}</span>
      )}
    </div>
  );
};

const DialogInfoPanel: React.FC<DialogInfoPanelProps> = ({
  limit = 20,
  isMobile = false,
}) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isUpdatingMode = useAppSelector(selectIsUpdatingMode);
  const currentUserId = useAppSelector(selectUserId);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddCybotDialogOpen, setIsAddCybotDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const cybots = currentDialogConfig?.cybots || [];
  const participantCount = cybots.length;

  // 移动端时防止页面滚动
  useEffect(() => {
    if (isPanelOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isPanelOpen, isMobile]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isPanelOpen) return;

      const target = event.target as HTMLElement;
      const isClickInsidePanel = panelRef.current?.contains(target);
      const isClickInsideTrigger = triggerRef.current?.contains(target);
      const isClickInsideModal =
        target.closest(".modal-backdrop") ||
        target.closest(".modal-content") ||
        target.closest(".dialog-add-cybot-modal");

      if (!isClickInsidePanel && !isClickInsideTrigger && !isClickInsideModal) {
        setIsPanelOpen(false);
      }
    };

    const eventType = isMobile ? "touchstart" : "mousedown";

    if (isPanelOpen) {
      document.addEventListener(eventType, handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener(
        eventType,
        handleClickOutside as EventListener
      );
    };
  }, [isPanelOpen, isMobile]);

  // ESC键关闭面板
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPanelOpen) {
        setIsPanelOpen(false);
      }
    };

    if (!isMobile && isPanelOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPanelOpen, isMobile]);

  const handleRemoveCybot = useCallback(
    async (cybotId: string) => {
      if (isProcessing || isUpdatingMode) return;

      setIsProcessing(true);
      try {
        await dispatch(removeCybot(cybotId)).unwrap();
        toast.success(t("CybotRemovedSuccess"));
      } catch (error) {
        console.error("Failed to remove Cybot:", error);
        toast.error(t("CybotRemoveFailed"));
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, t, isProcessing, isUpdatingMode]
  );

  const handleAddCybot = useCallback(
    async (cybotId: string | string[]) => {
      if (isProcessing) return;

      const cybotIds = Array.isArray(cybotId) ? cybotId : [cybotId];
      setIsProcessing(true);

      try {
        const addPromises = cybotIds.map((id) =>
          dispatch(addCybot(id)).unwrap()
        );
        await Promise.all(addPromises);

        const message =
          cybotIds.length > 1
            ? t("MultipleCybotsAddedSuccess", { count: cybotIds.length })
            : t("CybotAddedSuccess");

        toast.success(message);
        setIsAddCybotDialogOpen(false);
      } catch (error) {
        console.error("Failed to add Cybot:", error);
        toast.error(t("CybotAddFailed"));
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, t, isProcessing]
  );

  const handleAddCybotClick = useCallback(() => {
    setIsAddCybotDialogOpen(true);
  }, []);

  const handleCloseAddCybotDialog = useCallback(() => {
    setIsAddCybotDialogOpen(false);
  }, []);

  // 移动端渲染
  if (isMobile) {
    return (
      <>
        <div className="dialog-info__mobile-content">
          <div className="dialog-info__mobile-section">
            <div className="section-header">
              <InfoIcon size={14} />
              <h4 className="section-title">{t("Cybots")}</h4>
              <span className="count-badge">({participantCount})</span>
            </div>

            <div className="section-summary">
              <div className="summary-item">
                <span className="summary-label">{t("Participants")}:</span>
                <span className="summary-value">{participantCount}</span>
              </div>
            </div>

            <MobileCybotPreview cybots={cybots} totalCount={participantCount} />

            <div className="mobile-actions">
              <AddCybotButton
                onClick={handleAddCybotClick}
                isUpdating={isProcessing || isUpdatingMode}
              />
            </div>
          </div>
        </div>

        <AddCybotDialog
          isOpen={isAddCybotDialogOpen}
          onClose={handleCloseAddCybotDialog}
          onAddCybot={handleAddCybot}
          queryUserId={currentUserId}
          limit={limit}
        />
      </>
    );
  }

  // 桌面端渲染
  return (
    <>
      <div className="dialog-info__panel-wrapper">
        <button
          ref={triggerRef}
          className="dialog-info__panel-trigger"
          onClick={togglePanel}
          aria-expanded={isPanelOpen}
          aria-controls="dialog-info-panel-content"
          aria-label={t("ShowDialogConfigInfo")}
          aria-haspopup="true"
          disabled={isUpdatingMode}
        >
          <ChevronDownIcon
            size={16}
            className={`trigger-icon ${isPanelOpen ? "trigger-icon--open" : ""}`}
          />
        </button>

        {isPanelOpen && (
          <div
            ref={panelRef}
            id="dialog-info-panel-content"
            className="dialog-info__panel"
            role="menu"
          >
            <div className="dialog-info__panel-content">
              <div className="dialog-info__section">
                <div className="section-header">
                  <h4 className="section-title">{t("Cybots")}</h4>
                  <span className="count-badge">({participantCount})</span>
                </div>

                <CybotList
                  cybots={cybots}
                  onRemove={handleRemoveCybot}
                  isUpdating={isProcessing || isUpdatingMode}
                />

                <AddCybotButton
                  onClick={handleAddCybotClick}
                  isUpdating={isProcessing || isUpdatingMode}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <AddCybotDialog
        isOpen={isAddCybotDialogOpen}
        onClose={handleCloseAddCybotDialog}
        onAddCybot={handleAddCybot}
        queryUserId={currentUserId}
        limit={limit}
      />

      <style>{`
        /* 基础容器样式 */
        .dialog-info__panel-wrapper {
          position: relative;
          display: inline-flex;
        }

        .dialog-info__panel-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--space-8);
          height: var(--space-8);
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--textSecondary);
          cursor: pointer;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .dialog-info__panel-trigger:hover:not(:disabled),
        .dialog-info__panel-trigger[aria-expanded="true"]:not(:disabled) {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .dialog-info__panel-trigger:active:not(:disabled) {
          transform: scale(0.95);
        }

        .dialog-info__panel-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trigger-icon {
          transition: transform 0.2s ease;
        }

        .trigger-icon--open {
          transform: rotate(180deg);
        }

        .dialog-info__panel {
          position: absolute;
          top: calc(100% + var(--space-2));
          left: 50%;
          transform: translateX(-50%);
          min-width: 320px;
          max-width: 420px;
          background: var(--background);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow:
            0 20px 40px -12px var(--shadowMedium),
            0 8px 16px -8px var(--shadowLight),
            0 0 0 1px var(--borderLight);
          z-index: 1000;
          animation: panelShow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: calc(100vh - 120px);
          overflow: hidden;
        }

        @keyframes panelShow {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .dialog-info__panel-content {
          padding: var(--space-5);
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .dialog-info__panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .dialog-info__panel-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dialog-info__panel-content::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }

        .dialog-info__panel-content::-webkit-scrollbar-thumb:hover {
          background: var(--borderHover);
        }

        /* 区块样式 */
        .dialog-info__section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-1);
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--textTertiary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .count-badge {
          font-size: 10px;
          color: var(--textQuaternary);
          font-weight: 500;
          background: var(--backgroundTertiary);
          padding: 2px var(--space-1);
          border-radius: 4px;
          font-family: ui-monospace, 'SF Mono', 'Monaco', monospace;
        }

        /* Cybot 列表样式 */
        .dialog-info__cybot-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .dialog-info__cybot-list::-webkit-scrollbar {
          width: 4px;
        }

        .dialog-info__cybot-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .dialog-info__cybot-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 2px;
        }

        .cybot-list-item {
          transition: transform 0.15s ease;
        }

        .cybot-list-item:hover {
          transform: translateX(2px);
        }

        .dialog-info__bot-chip {
          width: 100%;
        }

        /* 空状态样式 */
        .dialog-info__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-6) var(--space-4);
          background: var(--backgroundGhost);
          border-radius: var(--space-2);
          border: 1px dashed var(--border);
          color: var(--textTertiary);
        }

        .dialog-info__empty-state svg {
          margin-bottom: var(--space-2);
          opacity: 0.6;
        }

        .empty-text {
          font-size: 13px;
          font-weight: 500;
          margin: 0 0 var(--space-1) 0;
          color: var(--textSecondary);
        }

        .empty-hint {
          font-size: 11px;
          color: var(--textTertiary);
        }

        /* 添加按钮样式 */
        .dialog-info__add-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: 1px solid var(--primary);
          border-radius: var(--space-2);
          color: var(--primary);
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }

        .dialog-info__add-button:hover:not(:disabled) {
          background: var(--primary);
          color: var(--background);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -4px var(--primary);
        }

        .dialog-info__add-button:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .dialog-info__add-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-text {
          font-size: 13px;
          font-weight: 500;
        }

        /* 加载动画 */
        .dialog-info__spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .spinner-ring {
          width: 12px;
          height: 12px;
          border: 2px solid var(--border);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 移动端样式 */
        .dialog-info__mobile-content {
          width: 100%;
          padding: var(--space-3) 0;
        }

        .dialog-info__mobile-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .section-summary {
          display: flex;
          gap: var(--space-4);
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 12px;
        }

        .summary-label {
          color: var(--textTertiary);
          font-weight: 500;
        }

        .summary-value {
          color: var(--text);
          font-weight: 600;
          background: var(--backgroundTertiary);
          padding: 2px var(--space-2);
          border-radius: 4px;
          font-family: ui-monospace, 'SF Mono', 'Monaco', monospace;
          font-size: 11px;
        }

        .dialog-info__mobile-preview {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .mobile-chip {
          flex-shrink: 0;
        }

        .more-indicator {
          display: flex;
          align-items: center;
          background: var(--backgroundTertiary);
          color: var(--textTertiary);
          padding: var(--space-1) var(--space-2);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid var(--borderLight);
        }

        .dialog-info__mobile-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: var(--backgroundGhost);
          border-radius: var(--space-2);
          border: 1px dashed var(--border);
        }

        .dialog-info__mobile-empty .empty-text {
          font-size: 12px;
          color: var(--textTertiary);
          font-style: italic;
        }

        .mobile-actions {
          display: flex;
          gap: var(--space-2);
        }

        /* 响应式和无障碍 */
        @media (prefers-reduced-motion: reduce) {
          .dialog-info__panel,
          .trigger-icon,
          .cybot-list-item,
          .dialog-info__add-button,
          .spinner-ring {
            animation: none;
            transition: none;
          }

          .cybot-list-item:hover,
          .dialog-info__add-button:hover:not(:disabled) {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .dialog-info__panel {
            border: 2px solid var(--text);
          }

          .dialog-info__add-button {
            border: 2px solid var(--primary);
          }

          .dialog-info__empty-state {
            border: 2px dashed var(--border);
          }
        }

        @media (max-width: 480px) {
          .dialog-info__panel {
            min-width: 280px;
            max-width: calc(100vw - var(--space-4));
          }

          .dialog-info__mobile-preview {
            gap: var(--space-1);
          }
        }
      `}</style>
    </>
  );
};

export default DialogInfoPanel;
