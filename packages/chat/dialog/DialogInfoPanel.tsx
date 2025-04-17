// DialogInfoPanel.tsx
import { PlusIcon, InfoIcon } from "@primer/octicons-react";
import CybotNameChip from "ai/cybot/CybotNameChip";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import type React from "react";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
  removeCybot,
} from "chat/dialog/dialogSlice";
import { selectCurrentUserId } from "auth/authSlice"; // 假设这是获取当前用户 ID 的 selector
import { toast } from "react-hot-toast";
import AddCybotDialog from "./AddCybotDialog"; // 引入添加 Cybot 的对话框组件

interface DialogInfoPanelProps {
  onAddCybotClick: () => void;
  onRemoveCybot: (cybotId: string) => void;
  onAddCybot: (cybotId: string) => void; // 新增回调，用于处理添加 Cybot
  limit?: number; // 可选的加载数量限制
}

const DialogInfoPanel: React.FC<DialogInfoPanelProps> = ({
  onAddCybotClick,
  onRemoveCybot,
  onAddCybot,
  limit = 20,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentUserId = useAppSelector(selectCurrentUserId); // 在组件内部获取当前用户 ID
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddCybotDialogOpen, setIsAddCybotDialogOpen] = useState(false);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const handleRemoveCybot = useCallback(
    (cybotId: string) => {
      dispatch(removeCybot(cybotId))
        .unwrap()
        .then(() => {
          onRemoveCybot(cybotId);
          toast.success(t("Cybot removed successfully"));
        })
        .catch((error) => {
          console.error("Failed to remove Cybot:", error);
          toast.error(t("Failed to remove Cybot"));
        });
    },
    [dispatch, onRemoveCybot, t]
  );

  // 处理打开添加 Cybot 对话框
  const handleAddCybotClick = useCallback(() => {
    setIsAddCybotDialogOpen(true);
    onAddCybotClick(); // 调用传入的回调（如果有其他逻辑）
  }, [onAddCybotClick]);

  // 处理关闭添加 Cybot 对话框
  const handleCloseAddCybotDialog = useCallback(() => {
    setIsAddCybotDialogOpen(false);
  }, []);

  const participantCount = currentDialogConfig?.cybots?.length ?? 0;

  return (
    <>
      <div className="dialog-info-panel-wrapper">
        <button
          className="dialog-info-panel-trigger icon-button"
          onClick={togglePanel}
          aria-expanded={isPanelOpen}
          aria-controls="dialog-info-panel-content"
          aria-label={t("Show dialog configuration and info")}
          aria-haspopup="true"
        >
          <InfoIcon size={16} />
        </button>

        {isPanelOpen && (
          <div
            id="dialog-info-panel-content"
            className="dialog-info-panel"
            role="menu"
          >
            <div className="dialog-info-section participants-section">
              <h4 className="dialog-info-section-header">
                {t("Participants")} ({participantCount})
              </h4>
              <div className="dialog-cybot-list" role="list">
                {participantCount > 0 ? (
                  currentDialogConfig?.cybots?.map((cybotId) => (
                    <CybotNameChip
                      key={cybotId}
                      cybotId={cybotId}
                      onRemove={handleRemoveCybot}
                      className="dialog-info-list-item"
                    />
                  ))
                ) : (
                  <p className="dialog-no-participants-text">
                    {t("No participants yet.")}
                  </p>
                )}
              </div>
              <button
                className="dialog-info-item dialog-add-participant-button"
                onClick={handleAddCybotClick}
                role="menuitem"
              >
                <PlusIcon size={16} />
                <span>{t("Add Participant")}</span>
              </button>
            </div>

            <div className="dialog-info-divider" role="separator"></div>

            <div className="dialog-info-section token-section">
              <h4 className="dialog-info-section-header">{t("Info")}</h4>
              <div className="dialog-info-item dialog-token-info">
                <span>{t("Tokens")}:</span>
                <span>{currentDialogTokens}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 添加 Cybot 的对话框 */}
      <AddCybotDialog
        isOpen={isAddCybotDialogOpen}
        onClose={handleCloseAddCybotDialog}
        onAddCybot={onAddCybot}
        queryUserId={currentUserId} // 使用内部获取的 currentUserId
        limit={limit}
      />

      <style>
        {`
          /* --- Dialog Info Panel Trigger Button --- */
          .dialog-info-panel-trigger.icon-button {
            background: none;
            border: none;
            padding: 8px;
            margin: 0;
            cursor: pointer;
            color: ${theme.textSecondary};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: color 0.2s ease, background-color 0.2s ease;
          }
          
          .dialog-info-panel-trigger.icon-button:hover,
          .dialog-info-panel-trigger.icon-button[aria-expanded="true"] {
            background-color: ${theme.primaryGhost || theme.backgroundHover};
            color: ${theme.primary};
          }

          /* --- Dialog Info Panel Positioning Wrapper --- */
          .dialog-info-panel-wrapper {
            position: relative;
            display: inline-flex;
          }

          /* --- Dialog Info Panel Container --- */
          .dialog-info-panel {
            position: absolute;
            top: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) scale(0.95);
            min-width: 440px;
            max-width: 520px;
            border-radius: 12px;
            background: ${theme.backgroundSecondary};
            border: 1px solid ${theme.borderLight};
            color: ${theme.text};
            font-size: 14px;
            z-index: 10;
            display: flex;
            flex-direction: row;
            gap: 16px;
            padding: 16px;
            box-sizing: border-box;
            box-shadow: 0 4px 12px ${theme.shadowLight};
            opacity: 0;
            visibility: hidden;
            transition: transform 0.25s ease-out, opacity 0.25s ease-out, visibility 0.25s ease-out;
          }
          
          .dialog-info-panel-wrapper:hover .dialog-info-panel,
          .dialog-info-panel-trigger[aria-expanded="true"] + .dialog-info-panel {
            transform: translateX(-50%) scale(1);
            opacity: 1;
            visibility: visible;
          }

          /* --- Dialog Info Sections --- */
          .dialog-info-section {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }
          
          .dialog-info-section-header {
            font-size: 12px;
            font-weight: 600;
            color: ${theme.textSecondary};
            margin: 0 0 10px 0;
            padding: 0;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }

          .participants-section {
            flex: 1;
            min-width: 220px;
          }
          
          .token-section {
            flex-shrink: 0;
            min-width: 120px;
            justify-content: flex-start;
            padding-top: 0;
          }

          /* --- Cybot List within Dialog Info Panel --- */
          .dialog-cybot-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 180px;
            overflow-y: auto;
            padding-right: 6px;
            margin-bottom: 12px;
            scrollbar-width: thin;
            scrollbar-color: ${theme.border} transparent;
          }
          
          .dialog-cybot-list::-webkit-scrollbar { width: 4px; }
          .dialog-cybot-list::-webkit-scrollbar-track { background: transparent; }
          .dialog-cybot-list::-webkit-scrollbar-thumb { background-color: ${theme.border}; border-radius: 10px; }
          .dialog-cybot-list::-webkit-scrollbar-thumb:hover { background-color: ${theme.borderHover}; }

          .dialog-no-participants-text {
            font-style: italic;
            color: ${theme.textTertiary};
            font-size: 13px;
            text-align: center;
            padding: 12px 0;
            margin: 0;
          }

          .dialog-info-list-item {
            transition: transform 0.15s ease;
          }
          
          .dialog-info-list-item:hover {
            transform: translateX(2px);
          }

          /* --- General Dialog Info Item Styling --- */
          .dialog-info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            white-space: nowrap;
            text-align: left;
            background: none;
            border: none;
            width: 100%;
            color: inherit;
            font-size: inherit;
            cursor: default;
            box-sizing: border-box;
          }

          /* --- Add Participant Button in Dialog Info Panel --- */
          .dialog-add-participant-button {
            cursor: pointer;
            color: ${theme.primary};
            padding: 10px 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
            margin-top: 4px;
          }
          
          .dialog-add-participant-button:hover {
            background-color: ${theme.primaryGhost || theme.backgroundHover};
            color: ${theme.primaryHover || theme.primary};
          }
          
          .dialog-add-participant-button svg {
            color: ${theme.primary};
            flex-shrink: 0;
            transition: color 0.2s ease;
          }
          
          .dialog-add-participant-button:hover svg {
            color: ${theme.primaryHover || theme.primary};
          }
          
          .dialog-add-participant-button span {
            flex-grow: 1;
            font-weight: 500;
          }

          /* --- Token Info Item in Dialog Info Panel --- */
          .dialog-token-info {
            color: ${theme.textSecondary};
            font-size: 13px;
            justify-content: space-between;
            padding: 10px 0;
          }
          
          .dialog-token-info span:last-child {
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.backgroundActive || theme.backgroundTertiary};
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
          }

          /* --- Dialog Info Divider Line --- */
          .dialog-info-divider {
            width: 1px;
            background-color: ${theme.borderLight};
            align-self: stretch;
            margin: 0;
            flex-shrink: 0;
          }

          /* --- Responsive Design --- */
          @media (max-width: 768px) {
            .dialog-info-panel {
              flex-direction: column;
              min-width: 260px;
              max-width: 320px;
              gap: 12px;
              padding: 14px;
              border-radius: 10px;
            }
            
            .participants-section, .token-section {
              min-width: unset;
              width: 100%;
            }
            
            .token-section {
              padding-top: 4px;
              align-items: stretch;
            }
            
            .dialog-info-divider {
              width: auto;
              height: 1px;
              align-self: auto;
              margin: 2px 0;
            }
            
            .dialog-token-info {
              justify-content: space-between;
            }
          }
          
          @media (max-width: 640px) {
            .dialog-info-panel-trigger.icon-button {
              padding: 6px;
            }
          }
          
          @media (max-width: 480px) {
            .dialog-info-panel {
              min-width: 220px;
              padding: 12px;
              gap: 8px;
            }
          }
        `}
      </style>
    </>
  );
};

export default DialogInfoPanel;
