import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect, useRef } from "react";
import type React from "react";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
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
import { PlusIcon, ChevronDownIcon } from "@primer/octicons-react";
import CybotNameChip from "ai/cybot/CybotNameChip";
import { toast } from "react-hot-toast";
import AddCybotDialog from "./AddCybotDialog";

interface DialogInfoPanelProps {
  limit?: number;
}

const DialogInfoPanel: React.FC<DialogInfoPanelProps> = ({ limit = 20 }) => {
  const { t } = useTranslation("chat");
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const isUpdatingMode = useAppSelector(selectIsUpdatingMode);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddCybotDialogOpen, setIsAddCybotDialogOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
          target.closest(".modal-content")
        ) {
          return;
        }
        setIsPanelOpen(false);
      }
    };

    if (isPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen]);

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

      // 处理批量添加
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

  return (
    <>
      <div className="dialog-info-panel-wrapper">
        <button
          ref={triggerRef}
          className="dialog-info-panel-trigger icon-button"
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
            <div className="dialog-info-section participants-section">
              <h4 className="dialog-info-section-header">
                {t("Cybots")}{" "}
                <span className="count-badge">({participantCount})</span>
              </h4>

              <div className="dialog-cybot-list" role="list">
                {participantCount > 0 ? (
                  currentDialogConfig?.cybots?.map((cybotKey) => (
                    <CybotNameChip
                      key={cybotKey}
                      cybotKey={cybotKey}
                      onRemove={handleRemoveCybot}
                      className="dialog-info-list-item"
                    />
                  ))
                ) : (
                  <p className="dialog-no-participants-text">{t("NoCybots")}</p>
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
                <span>{currentDialogTokens?.toLocaleString() || "0"}</span>
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
        .dialog-info-panel-trigger.icon-button {
          background: none;
          border: none;
          padding: ${theme.space[2]};
          cursor: pointer;
          color: ${theme.textTertiary};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: ${theme.space[2]};
          transition: all 0.15s ease;
        }
        
        .dialog-info-panel-trigger.icon-button:hover,
        .dialog-info-panel-trigger.icon-button[aria-expanded="true"] {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
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
            0 20px 40px -12px ${theme.shadowLight}, 
            0 8px 16px -8px ${theme.shadowMedium}, 
            0 0 0 1px ${theme.border};
          z-index: 1000;
          display: flex;
          gap: ${theme.space[4]};
          padding: ${theme.space[5]};
          animation: dialog-info-show 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes dialog-info-show {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
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
        }

        .dialog-add-participant-button {
          cursor: pointer;
          color: ${theme.primary};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: ${theme.space[2]};
          transition: all 0.15s ease;
          font-weight: 500;
          justify-content: flex-start;
        }
        
        .dialog-add-participant-button:hover {
          background: ${theme.primaryGhost};
          color: ${theme.primaryHover || theme.primary};
          transform: translateX(2px);
        }

        .dialog-token-info {
          justify-content: space-between;
          color: ${theme.textSecondary};
        }

        .dialog-token-info span:last-child {
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
          padding: 3px ${theme.space[2]};
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          min-width: 90px;
          transition: all 0.15s ease;
          outline: none;
        }
        
        .dialog-mode-select:hover:not(:disabled) {
          border-color: ${theme.primary};
          background: ${theme.background};
          box-shadow: 0 0 0 1px ${theme.primaryGhost};
        }
        
        .dialog-mode-select:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px ${theme.primaryGhost};
        }
        
        .dialog-mode-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: ${theme.backgroundTertiary};
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

        @media (max-width: 768px) {
          .dialog-info-panel {
            flex-direction: column;
            min-width: 300px;
            max-width: 340px;
            left: auto;
            right: 0;
            transform: none;
            padding: ${theme.space[4]};
          }
          
          .participants-section, .token-section {
            min-width: unset;
            width: 100%;
          }
          
          .dialog-info-divider {
            width: auto;
            height: 1px;
            background: linear-gradient(
              to right, 
              transparent, 
              ${theme.border} 20%, 
              ${theme.border} 80%, 
              transparent
            );
            margin: ${theme.space[3]} 0;
          }
        }

        @media (max-width: 480px) {
          .dialog-info-panel {
            min-width: 280px;
            padding: ${theme.space[3]};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dialog-info-panel {
            animation: none;
          }
          
          .dialog-info-panel-trigger.icon-button svg {
            transition: none;
          }
          
          .dialog-info-list-item,
          .dialog-add-participant-button {
            transition: none;
          }
          
          .dialog-info-list-item:hover,
          .dialog-add-participant-button:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default DialogInfoPanel;
