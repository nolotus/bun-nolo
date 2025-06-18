import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
  removeCybot,
  addCybot,
  updateDialogMode,
  selectIsUpdatingMode,
} from "chat/dialog/dialogSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { DialogInvocationMode } from "chat/dialog/types";
import {
  PlusIcon,
  ChevronDownIcon,
  XIcon,
  InfoIcon,
} from "@primer/octicons-react";
import BotNameChip from "ai/bot/web/BotNameChip";
import { toast } from "react-hot-toast";
import AddCybotDialog from "./AddCybotDialog";

interface DialogInfoPanelProps {
  limit?: number;
  isMobile?: boolean; // 新增属性支持移动端模式
}

const DialogInfoPanel: React.FC<DialogInfoPanelProps> = ({
  limit = 20,
  isMobile = false,
}) => {
  const { t } = useTranslation("chat");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const isUpdatingMode = useAppSelector(selectIsUpdatingMode);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddCybotDialogOpen, setIsAddCybotDialogOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 防止移动端滚动穿透
  useEffect(() => {
    if (isPanelOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isPanelOpen, isMobile]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  // 点击外部关闭逻辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isPanelOpen &&
        panelRef.current &&
        triggerRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (
          target.closest(".modal-backdrop") ||
          target.closest(".modal-content") ||
          target.closest(".dialog-info-backdrop") ||
          target.closest(".mobile-menu-backdrop") ||
          target.closest(".mobile-menu-dropdown")
        ) {
          return;
        }
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

    if (!isMobile) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPanelOpen, isMobile]);

  const handleRemoveCybot = useCallback(
    (cybotId: string) => {
      dispatch(removeCybot(cybotId))
        .unwrap()
        .then(() => {
          toast.success(t("CybotRemovedSuccess"));
        })
        .catch((error) => {
          console.error("Failed to remove Cybot:", error);
          toast.error(t("CybotRemoveFailed"));
        });
    },
    [dispatch, t]
  );

  const handleAddCybot = useCallback(
    (cybotId: string | string[]) => {
      const cybotIds = Array.isArray(cybotId) ? cybotId : [cybotId];
      const addPromises = cybotIds.map((id) => dispatch(addCybot(id)).unwrap());

      Promise.all(addPromises)
        .then(() => {
          const message =
            cybotIds.length > 1
              ? `成功添加 ${cybotIds.length} 个 Cybot`
              : t("CybotAddedSuccess");
          toast.success(message);
        })
        .catch((error) => {
          console.error("Failed to add Cybot:", error);
          toast.error(t("CybotAddFailed"));
        });
    },
    [dispatch, t]
  );

  const handleAddCybotClick = useCallback(() => {
    setIsAddCybotDialogOpen(true);
  }, []);

  const handleCloseAddCybotDialog = useCallback(() => {
    setIsAddCybotDialogOpen(false);
  }, []);

  const handleModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newMode = event.target.value as DialogInvocationMode;
      dispatch(updateDialogMode(newMode))
        .unwrap()
        .then(() => {
          toast.success(t("ModeUpdatedSuccess"));
        })
        .catch((error) => {
          console.error("Failed to update mode:", error);
          toast.error(t("ModeUpdateFailed"));
        });
    },
    [dispatch, t]
  );

  const participantCount = currentDialogConfig?.cybots?.length ?? 0;

  // 移动端简化显示内容
  if (isMobile) {
    return (
      <>
        <div className="dialog-info-mobile-content">
          <div className="dialog-info-section">
            <h4 className="dialog-info-section-header">
              <InfoIcon size={14} />
              {t("DialogConfiguration")}
            </h4>

            <div className="dialog-info-summary">
              <div className="summary-item">
                <span className="summary-label">{t("Cybots")}:</span>
                <span className="summary-value">{participantCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t("Tokens")}:</span>
                <span className="summary-value">
                  {currentDialogTokens?.toLocaleString() || "0"}
                </span>
              </div>
            </div>

            {participantCount > 0 && (
              <div className="dialog-cybot-preview">
                {currentDialogConfig?.cybots
                  ?.slice(0, 3)
                  .map((cybotKey) => (
                    <CybotNameChip
                      key={cybotKey}
                      cybotKey={cybotKey}
                      onRemove={handleRemoveCybot}
                      compact={true}
                    />
                  ))}
                {participantCount > 3 && (
                  <span className="more-indicator">
                    +{participantCount - 3}
                  </span>
                )}
              </div>
            )}

            <div className="mobile-actions">
              <button
                className="mobile-action-button add-button"
                onClick={handleAddCybotClick}
              >
                <PlusIcon size={14} />
                <span>{t("AddCybot")}</span>
              </button>
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

        <style>{`
          .dialog-info-mobile-content {
            width: 100%;
            padding: ${theme.space[3]} 0;
          }

          .dialog-info-summary {
            display: flex;
            gap: ${theme.space[4]};
            margin-bottom: ${theme.space[3]};
          }

          .summary-item {
            display: flex;
            align-items: center;
            gap: ${theme.space[1]};
            font-size: 12px;
          }

          .summary-label {
            color: ${theme.textTertiary};
            font-weight: 500;
          }

          .summary-value {
            color: ${theme.text};
            font-weight: 600;
            background: ${theme.backgroundTertiary};
            padding: 2px ${theme.space[2]};
            border-radius: 4px;
            font-family: ui-monospace, 'SF Mono', 'Monaco', monospace;
            font-size: 11px;
          }

          .dialog-cybot-preview {
            display: flex;
            flex-wrap: wrap;
            gap: ${theme.space[1]};
            margin-bottom: ${theme.space[3]};
          }

          .more-indicator {
            background: ${theme.backgroundTertiary};
            color: ${theme.textTertiary};
            padding: ${theme.space[1]} ${theme.space[2]};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            display: flex;
            align-items: center;
          }

          .mobile-actions {
            display: flex;
            gap: ${theme.space[2]};
          }

          .mobile-action-button {
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
            background: ${theme.primaryGhost};
            color: ${theme.primary};
            border: none;
            border-radius: 6px;
            padding: ${theme.space[2]} ${theme.space[3]};
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .mobile-action-button:hover {
            background: ${theme.primary};
            color: ${theme.background};
            transform: translateY(-1px);
          }

          .dialog-info-section {
            display: flex;
            flex-direction: column;
            gap: ${theme.space[2]};
          }
          
          .dialog-info-section-header {
            font-size: 11px;
            font-weight: 600;
            color: ${theme.textTertiary};
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
          }
        `}</style>
      </>
    );
  }

  // 桌面端完整面板
  return (
    <>
      <div className="dialog-info-panel-wrapper">
        <button
          ref={triggerRef}
          className="dialog-info-panel-trigger action-button"
          onClick={togglePanel}
          aria-expanded={isPanelOpen}
          aria-controls="dialog-info-panel-content"
          aria-label={t("ShowDialogConfigInfo")}
          aria-haspopup="true"
        >
          <ChevronDownIcon
            size={16}
            style={{
              transform: isPanelOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {isPanelOpen && (
          <div
            ref={panelRef}
            id="dialog-info-panel-content"
            className="dialog-info-panel"
            role="menu"
          >
            <div className="dialog-info-content">
              <div className="dialog-info-section participants-section">
                <h4 className="dialog-info-section-header">
                  {t("Cybots")}{" "}
                  <span className="count-badge">({participantCount})</span>
                </h4>

                <div className="dialog-cybot-list" role="list">
                  {participantCount > 0 ? (
                    currentDialogConfig?.cybots?.map((botKey) => (
                      <BotNameChip
                        key={botKey}
                        botKey={botKey}
                        onRemove={handleRemoveCybot}
                        className="dialog-info-list-item"
                      />
                    ))
                  ) : (
                    <p className="dialog-no-participants-text">
                      {t("NoCybots")}
                    </p>
                  )}
                </div>

                <button
                  className="dialog-info-item dialog-add-participant-button"
                  onClick={handleAddCybotClick}
                  role="menuitem"
                >
                  <PlusIcon size={16} />
                  <span>{t("AddCybot")}</span>
                </button>
              </div>

              <div className="dialog-info-divider" role="separator"></div>

              <div className="dialog-info-section token-section">
                <h4 className="dialog-info-section-header">{t("Info")}</h4>

                <div className="dialog-info-item dialog-token-info">
                  <span>{t("Tokens")}:</span>
                  <span className="token-count">
                    {currentDialogTokens?.toLocaleString() || "0"}
                  </span>
                </div>

                <div className="dialog-info-item dialog-mode-info">
                  <span>{t("Mode")}:</span>
                  <select
                    value={
                      currentDialogConfig?.mode || DialogInvocationMode.FIRST
                    }
                    onChange={handleModeChange}
                    className="dialog-mode-select"
                    disabled={!currentDialogConfig || isUpdatingMode}
                  >
                    <option value={DialogInvocationMode.FIRST}>
                      {t("First")}
                    </option>
                    <option value={DialogInvocationMode.SEQUENTIAL}>
                      {t("Sequential")}
                    </option>
                    <option value={DialogInvocationMode.PARALLEL}>
                      {t("Parallel")}
                    </option>
                    <option value={DialogInvocationMode.ORCHESTRATED}>
                      {t("Orchestrated")}
                    </option>
                  </select>
                </div>
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
        .dialog-info-panel-trigger.action-button {
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${theme.space[8]};
          height: ${theme.space[8]};
          border-radius: 6px;
          transition: all 0.15s ease;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        .dialog-info-panel-trigger.action-button:hover,
        .dialog-info-panel-trigger.action-button[aria-expanded="true"] {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .dialog-info-panel-trigger.action-button:active {
          transform: scale(0.95);
        }

        .dialog-info-panel-wrapper {
          position: relative;
          display: inline-flex;
        }

        .dialog-info-panel {
          position: absolute;
          top: calc(100% + ${theme.space[2]});
          left: 50%;
          transform: translateX(-50%);
          min-width: 420px;
          max-width: 500px;
          background: ${theme.background};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${theme.border};
          border-radius: 12px;
          box-shadow: 
            0 20px 40px -12px ${theme.shadowMedium}, 
            0 8px 16px -8px ${theme.shadowMedium}, 
            0 0 0 1px ${theme.border};
          z-index: 1000;
          animation: dialog-info-show 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: calc(100vh - 120px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        @keyframes dialog-info-show {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .dialog-info-content {
          display: flex;
          gap: ${theme.space[4]};
          padding: ${theme.space[5]};
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }

        .dialog-info-content::-webkit-scrollbar { 
          width: 6px; 
        }
        .dialog-info-content::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .dialog-info-content::-webkit-scrollbar-thumb { 
          background: ${theme.border}; 
          border-radius: 3px; 
        }

        .dialog-info-section {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
        }
        
        .dialog-info-section-header {
          font-size: 11px;
          font-weight: 600;
          color: ${theme.textTertiary};
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
        }

        .count-badge {
          font-size: 10px;
          color: ${theme.textQuaternary};
          font-weight: 500;
        }

        .participants-section {
          flex: 1;
          min-width: 240px;
        }
        
        .token-section {
          flex-shrink: 0;
          min-width: 140px;
        }

        .dialog-cybot-list {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
          max-height: 160px;
          overflow-y: auto;
          padding-right: ${theme.space[1]};
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }

        .dialog-cybot-list::-webkit-scrollbar { 
          width: 4px; 
        }
        .dialog-cybot-list::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .dialog-cybot-list::-webkit-scrollbar-thumb { 
          background: ${theme.border}; 
          border-radius: 2px; 
        }
        .dialog-cybot-list::-webkit-scrollbar-thumb:hover { 
          background: ${theme.borderHover}; 
        }

        .dialog-no-participants-text {
          font-style: italic;
          color: ${theme.textQuaternary};
          font-size: 13px;
          text-align: center;
          padding: ${theme.space[6]} 0;
          margin: 0;
          background: ${theme.backgroundGhost};
          border-radius: ${theme.space[2]};
        }

        .dialog-info-list-item {
          transition: transform 0.15s ease;
        }
        
        .dialog-info-list-item:hover {
          transform: translateX(2px);
        }

        .dialog-info-item {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} 0;
          white-space: nowrap;
          text-align: left;
          background: none;
          border: none;
          width: 100%;
          color: inherit;
          font-size: 13px;
          cursor: default;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .dialog-add-participant-button {
          cursor: pointer;
          color: ${theme.primary};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: ${theme.space[2]};
          transition: all 0.15s ease;
          font-weight: 500;
          justify-content: flex-start;
          touch-action: manipulation;
        }
        
        .dialog-add-participant-button:hover {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
          transform: translateX(2px);
        }

        .dialog-add-participant-button:active {
          transform: translateX(2px) scale(0.98);
        }

        .dialog-token-info {
          justify-content: space-between;
          color: ${theme.textSecondary};
        }

        .token-count {
          font-weight: 600;
          color: ${theme.text};
          background: ${theme.backgroundTertiary};
          padding: 2px ${theme.space[2]};
          border-radius: 8px;
          font-size: 12px;
          font-family: ui-monospace, 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.5px;
        }

        .dialog-mode-info {
          justify-content: space-between;
          color: ${theme.textSecondary};
        }

        .dialog-mode-select {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          padding: 6px ${theme.space[2]};
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          min-width: 90px;
          transition: all 0.15s ease;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right ${theme.space[2]} center;
          background-size: 12px;
          padding-right: ${theme.space[6]};
        }
        
        .dialog-mode-select:hover:not(:disabled) {
          border-color: ${theme.primary};
          background-color: ${theme.background};
          box-shadow: 0 0 0 1px ${theme.primaryGhost};
        }
        
        .dialog-mode-select:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px ${theme.primaryGhost};
        }
        
        .dialog-mode-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: ${theme.backgroundTertiary};
        }

        .dialog-info-divider {
          width: 1px;
          background: linear-gradient(
            to bottom, 
            transparent, 
            ${theme.border} 20%, 
            ${theme.border} 80%, 
            transparent
          );
          align-self: stretch;
          margin: ${theme.space[2]} 0;
        }

        /* 减少动画模式下的优化 */
        @media (prefers-reduced-motion: reduce) {
          .dialog-info-panel {
            animation: none;
          }
          
          .dialog-info-panel-trigger.action-button svg,
          .dialog-info-list-item,
          .dialog-add-participant-button {
            transition: none;
          }
          
          .dialog-info-list-item:hover,
          .dialog-add-participant-button:hover {
            transform: none;
          }
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .dialog-info-panel {
            border: 2px solid ${theme.text};
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
};

export default DialogInfoPanel;
