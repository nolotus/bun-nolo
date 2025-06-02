import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Dialog } from "render/web/ui/Dialog";
import {
  SyncIcon,
  PlusIcon,
  SearchIcon,
  CheckIcon,
} from "@primer/octicons-react";
import { useUserData } from "database/hooks/useUserData";
import { DataType } from "create/types";
import Button from "render/web/ui/Button";

interface AddCybotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCybot: (cybotIds: string | string[]) => void;
  queryUserId: string;
  limit?: number;
}

const AddCybotDialog: React.FC<AddCybotDialogProps> = ({
  isOpen,
  onClose,
  onAddCybot,
  queryUserId,
  limit = 50,
}) => {
  const { t } = useTranslation("chat");
  const theme = useTheme();
  const [selectedCybots, setSelectedCybots] = useState<Set<string>>(new Set());

  // 当对话框关闭时清空选中状态
  useEffect(() => {
    if (!isOpen) {
      setSelectedCybots(new Set());
    }
  }, [isOpen]);

  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);

  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  const handleAddCybot = useCallback(
    (cybotId: string) => {
      onAddCybot(cybotId);
      onClose();
    },
    [onAddCybot, onClose]
  );

  const toggleSelection = useCallback((cybotId: string) => {
    setSelectedCybots((prev) => {
      const newSet = new Set(prev);
      newSet.has(cybotId) ? newSet.delete(cybotId) : newSet.add(cybotId);
      return newSet;
    });
  }, []);

  const addSelected = useCallback(() => {
    if (selectedCybots.size > 0) {
      const ids = Array.from(selectedCybots);
      onAddCybot(ids.length === 1 ? ids[0] : ids);
      onClose();
    }
  }, [selectedCybots, onAddCybot, onClose]);

  const renderLoading = () => (
    <div className="state-container loading">
      <SyncIcon className="spin-icon" size={24} />
      <span>{t("LoadingCybots")}</span>
    </div>
  );

  const renderError = () => (
    <div className="state-container error">
      <p>{t("FailedToLoadCybots")}</p>
      <Button onClick={handleReload} size="small">
        {t("Retry")}
      </Button>
    </div>
  );

  const renderEmpty = () => (
    <div className="state-container empty">
      <SearchIcon size={24} />
      <span>{t("NoCybots")}</span>
    </div>
  );

  const renderCybots = () => (
    <div className="cybot-container">
      {selectedCybots.size > 0 && (
        <div className="batch-bar">
          <span>已选择 {selectedCybots.size} 个 Cybot</span>
          <div className="batch-actions">
            <Button onClick={addSelected} size="small" variant="primary">
              添加选中
            </Button>
            <Button
              onClick={() => setSelectedCybots(new Set())}
              size="small"
              variant="ghost"
            >
              清空
            </Button>
          </div>
        </div>
      )}

      <div className="cybot-grid">
        {cybots.map((item) => {
          const cybotId = item.dbKey || item.id;
          const isSelected = selectedCybots.has(cybotId);

          return (
            <div
              key={item.id}
              className={`cybot-card ${isSelected ? "selected" : ""}`}
            >
              <div className="card-header">
                <button
                  className="select-btn"
                  onClick={() => toggleSelection(cybotId)}
                >
                  <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                    {isSelected && <CheckIcon size={12} />}
                  </div>
                </button>

                <div className="card-info">
                  <div className="avatar">
                    {item.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="info">
                    <h3 className="title">{item.name || t("Unnamed")}</h3>
                    <div className="tags">
                      {item.model && <span className="tag">{item.model}</span>}
                      {item.tags?.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {item.outputPrice && (
                    <span className="price">
                      ¥{item.outputPrice.toFixed(2)}{" "}
                      {/* 将美元符号改为人民币符号 */}
                    </span>
                  )}
                  <button
                    className="add-btn"
                    onClick={() => handleAddCybot(cybotId)}
                  >
                    <PlusIcon size={14} />
                  </button>
                </div>
              </div>

              <div className="description">
                {item.introduction || t("NoDescription")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("AddCybot")}
      size="large"
    >
      <div className="add-cybot-content">
        {error
          ? renderError()
          : loading && !cybots.length
            ? renderLoading()
            : !cybots.length
              ? renderEmpty()
              : renderCybots()}
      </div>

      <style>{`
        .add-cybot-content {
          padding: ${theme.space[4]};
        }

        .state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[4]};
          padding: ${theme.space[12]} ${theme.space[4]};
          text-align: center;
          min-height: 300px;
          color: ${theme.textSecondary};
        }

        .state-container.loading { color: ${theme.primary}; }
        .state-container.error { color: ${theme.error}; }

        .spin-icon {
          animation: spin 1.2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cybot-container {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
        }

        .batch-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${theme.space[3]} ${theme.space[4]};
          background: ${theme.primaryGhost};
          border-radius: ${theme.space[3]};
          border: 1px solid ${theme.primary}30;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.primary};
        }

        .batch-actions {
          display: flex;
          gap: ${theme.space[2]};
        }

        .cybot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: ${theme.space[4]};
        }

        .cybot-card {
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: 12px;
          padding: ${theme.space[4]};
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
        }

        .cybot-card:hover {
          transform: translateY(-2px);
          border-color: ${theme.primary}40;
          box-shadow: 0 8px 32px -8px ${theme.shadowLight};
        }

        .cybot-card.selected {
          border-color: ${theme.primary};
          background: ${theme.primaryGhost}20;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
        }

        .select-btn {
          background: none;
          border: none;
          padding: ${theme.space[1]};
          cursor: pointer;
          border-radius: 6px;
        }

        .select-btn:hover {
          background: ${theme.backgroundHover};
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid ${theme.border};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${theme.background};
          transition: all 0.2s ease;
        }

        .checkbox.checked {
          background: ${theme.primary};
          border-color: ${theme.primary};
          color: white;
        }

        .card-info {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
          flex: 1;
          min-width: 0;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          background: ${theme.primaryGhost}40;
          color: ${theme.primary};
          flex-shrink: 0;
        }

        .info {
          min-width: 0;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 ${theme.space[1]} 0;
          color: ${theme.text};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tags {
          display: flex;
          gap: ${theme.space[1]};
          flex-wrap: wrap;
        }

        .tag {
          font-size: 11px;
          color: ${theme.textSecondary};
          background: ${theme.backgroundTertiary};
          padding: 2px ${theme.space[2]};
          border-radius: 6px;
          border: 1px solid ${theme.border};
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          flex-shrink: 0;
        }

        .price {
          font-size: 11px;
          font-weight: 600;
          color: ${theme.primary};
          background: ${theme.primaryGhost};
          padding: ${theme.space[1]} ${theme.space[2]};
          border-radius: 12px;
          font-family: monospace;
        }

        .add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${theme.primary};
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px -2px ${theme.primary}40;
        }

        .description {
          font-size: 14px;
          line-height: 1.5;
          color: ${theme.textSecondary};
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        @media (max-width: 768px) {
          .cybot-grid {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
          }

          .batch-bar {
            flex-direction: column;
            gap: ${theme.space[3]};
            text-align: center;
          }

          .batch-actions {
            justify-content: center;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default AddCybotDialog;
