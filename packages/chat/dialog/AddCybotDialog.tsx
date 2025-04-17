import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { Dialog } from "render/web/ui/Dialog"; // 假设 Dialog 组件路径
import { SyncIcon } from "@primer/octicons-react";
import { useUserData } from "database/hooks/useUserData";
import { DataType } from "create/types";
import { CommentDiscussionIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";

interface AddCybotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCybot: (cybotId: string) => void; // 回调函数，用于处理添加 Cybot
  queryUserId: string; // 用于加载 Cybot 列表的用户 ID
  limit?: number; // 可选的加载数量限制
}

const AddCybotDialog: React.FC<AddCybotDialogProps> = ({
  isOpen,
  onClose,
  onAddCybot,
  queryUserId,
  limit = 20,
}) => {
  const { t } = useTranslation("chat"); // 修改为 chat 命名空间，与 DialogInfoPanel 一致
  const theme = useTheme();

  // 使用 useUserData 钩子加载 Cybot 列表
  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);

  // 处理重新加载 Cybot 列表
  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  // 处理添加 Cybot 的逻辑，移除 toast 通知
  const handleAddCybot = useCallback(
    (cybotId: string) => {
      onAddCybot(cybotId); // 调用传入的回调函数
      onClose(); // 关闭对话框
    },
    [onAddCybot, onClose]
  );

  // 加载状态显示
  const renderLoading = () => (
    <div className="loading-container" style={{ color: theme.textSecondary }}>
      <SyncIcon className="icon-spin" size={16} />
      <span className="loading-text">{t("LoadingCybots")}</span>
    </div>
  );

  // 错误状态显示
  const renderError = () => (
    <div className="error-container" style={{ color: theme.textDanger }}>
      <p>{t("FailedToLoadCybots")}</p>
      <Button onClick={handleReload} size="small">
        {t("Retry")}
      </Button>
    </div>
  );

  // 空数据状态显示
  const renderEmpty = () => (
    <p className="no-cybots-text" style={{ color: theme.textTertiary }}>
      {t("NoCybots")}
    </p>
  );

  // Cybot 列表显示
  const renderCybots = () => (
    <div className="cybots-grid">
      {cybots.map((item) => (
        <div key={item.id} className="cybot-block" tabIndex={0}>
          <div className="header">
            <div className="avatar">{item.name?.[0]?.toUpperCase() || "?"}</div>
            <div className="info">
              <div className="title-row">
                <h3 className="title">{item.name || t("Unnamed")}</h3>
                {(item.inputPrice || item.outputPrice) && (
                  <div className="price-tag">
                    {(item.inputPrice || 0).toFixed(2)}/
                    {(item.outputPrice || 0).toFixed(2)}
                  </div>
                )}
              </div>
              <div className="tags">
                {item.model && <span className="tag">{item.model}</span>}
                {item.tags?.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="description">
            {item.introduction || t("NoDescription")}
          </div>
          <div className="actions">
            <Button
              icon={<CommentDiscussionIcon size={16} />}
              onClick={() => handleAddCybot(item.dbKey || item.id)}
              size="medium"
              style={{ flex: 1 }}
            >
              {t("AddCybot")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t("AddCybot")}>
      <div className="add-cybot-content">
        <p>{t("SelectCybotToAdd")}</p>
        {error
          ? renderError()
          : loading && !cybots.length
            ? renderLoading()
            : !cybots.length
              ? renderEmpty()
              : renderCybots()}
      </div>

      <style>
        {`
          .add-cybot-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-height: 60vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: ${theme.border} transparent;
          }
          .add-cybot-content::-webkit-scrollbar {
            width: 6px;
          }
          .add-cybot-content::-webkit-scrollbar-track {
            background: transparent;
          }
          .add-cybot-content::-webkit-scrollbar-thumb {
            background-color: ${theme.border};
            border-radius: 10px;
          }
          .add-cybot-content::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.borderHover};
          }
          .loading-container {
            text-align: center;
            padding: 1.5rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .icon-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .error-container {
            text-align: center;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .no-cybots-text {
            font-style: italic;
            text-align: center;
            padding: 1.5rem;
          }
          .cybots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            padding: 0.8rem;
            margin: 0 auto;
            max-width: 100%;
          }
          .cybot-block {
            background: ${theme.background};
            border-radius: 12px;
            padding: 1.25rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            border: 1px solid ${theme.border};
            transition: all 0.15s ease;
            min-width: 280px;
            position: relative;
            outline: none;
          }
          .cybot-block:hover {
            transform: translateY(-2px);
            border-color: ${theme.primary}30;
          }
          .cybot-block:focus {
            border-color: ${theme.primary};
          }
          .header {
            display: flex;
            gap: 0.875rem;
            align-items: center;
          }
          .avatar {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: 600;
            flex-shrink: 0;
            background: ${theme.primaryGhost}30;
            color: ${theme.primary};
          }
          .info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
          }
          .title {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
            color: ${theme.text};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            align-items: center;
          }
          .tag {
            font-size: 0.75rem;
            color: ${theme.textSecondary};
            padding: 0.2rem 0.5rem;
            background: ${theme.backgroundSecondary};
            border-radius: 6px;
            white-space: nowrap;
            border: 1px solid ${theme.border};
          }
          .price-tag {
            font-size: 0.75rem;
            color: ${theme.textSecondary};
            padding: 0.2rem 0.5rem;
            background: ${theme.backgroundSecondary};
            border-radius: 6px;
            white-space: nowrap;
            border: 1px solid ${theme.border};
          }
          .description {
            flex: 1;
            font-size: 0.9rem;
            line-height: 1.5;
            color: ${theme.textSecondary};
            margin: 0.2rem 0;
            overflow-wrap: break-word;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 0.5rem;
          }
          @media (max-width: 480px) {
            .cybot-block {
              padding: 1rem;
              gap: 0.875rem;
            }
            .actions {
              flex-direction: column;
              gap: 0.6rem;
            }
            .avatar {
              width: 38px;
              height: 38px;
            }
            .title {
              font-size: 0.95rem;
            }
            .description {
              font-size: 0.85rem;
              -webkit-line-clamp: 3;
            }
          }
        `}
      </style>
    </Dialog>
  );
};

export default AddCybotDialog;
