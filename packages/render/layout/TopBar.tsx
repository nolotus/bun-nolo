import {
  HomeIcon,
  SignInIcon,
  GearIcon,
  PlusIcon,
} from "@primer/octicons-react"; // 导入 PlusIcon
import CybotNameChip from "ai/cybot/CybotNameChip";
import { useAppSelector, useAppDispatch } from "app/hooks"; // 导入 useAppDispatch
import { RoutePaths } from "auth/web/routes";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";
import { useAuth } from "auth/hooks/useAuth";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import EditableTitle from "chat/dialog/EditableTitle";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
  // 假设有更新对话的 action (需要创建)
  // updateDialog,
} from "chat/dialog/dialogSlice";
import type React from "react";
import { useState, useCallback } from "react"; // 导入 useCallback
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import NavListItem from "render/layout/blocks/NavListItem";
import MenuButton from "./MenuButton";
import NavIconItem from "./blocks/NavIconItem";
import { selectPageData } from "../page/pageSlice";
import { extractUserId } from "core/prefix";
import { CreateTool } from "create/CreateTool";
import { useTheme } from "app/theme";
import { Dialog } from "render/web/ui/Dialog";
import Button from "render/web/ui/Button"; // 假设有一个通用的 Button 组件

interface TopBarProps {
  theme: any; // theme prop 仍然可以保留，虽然 useTheme 更常用
  topbarContent?: ReactNode;
}

const styles = {
  height: "60px",
  spacing: "8px",
};

const TopBar: React.FC<TopBarProps> = ({
  // theme: propTheme,
  topbarContent,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const dispatch = useAppDispatch(); // 获取 dispatch
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  const theme = useTheme();

  const [isCybotModalOpen, setIsCybotModalOpen] = useState(false);

  const { pageKey } = useParams<{ pageKey?: string }>();
  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const isNotBelongAnyone = !pageData.creator;
  const allowEdit = isCreator || isNotBelongAnyone;
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);
  const displayEditTool =
    pageKey?.startsWith("page") && allowEdit && hasPageData;

  const openCybotModal = () => setIsCybotModalOpen(true);
  const closeCybotModal = () => setIsCybotModalOpen(false);

  // --- Placeholder Actions ---
  // 这些函数需要连接到实际的 Redux actions 或其他逻辑

  const handleRemoveCybot = useCallback(
    (cybotIdToRemove: string) => {
      if (!currentDialogConfig) return;
      console.log(
        "TODO: Dispatch action to remove cybot:",
        cybotIdToRemove,
        "from dialog:",
        currentDialogConfig.id
      );
      // 示例：更新 Redux 状态 (需要创建相应的 reducer/action)
      // const updatedCybots = currentDialogConfig.cybots.filter(id => id !== cybotIdToRemove);
      // dispatch(updateDialog({
      //   dialogId: currentDialogConfig.id,
      //   changes: { cybots: updatedCybots }
      // }));

      // 如果移除后没有 Cybot 了，可以考虑关闭对话或提示用户
      // if (updatedCybots.length === 0) {
      //    closeCybotModal(); // Optionally close modal
      //    // Maybe show another message or navigate away
      // }
    },
    [currentDialogConfig, dispatch] // 依赖 dispatch 和 currentDialogConfig
  );

  const handleAddCybotClick = () => {
    console.log(
      "TODO: Open UI to select and add a new cybot to dialog:",
      currentDialogConfig?.id
    );
    // 这里可以打开另一个 Modal、导航到特定页面，或者显示一个下拉/搜索框
    alert("Functionality to add a new Cybot is not implemented yet.");
    // closeCybotModal(); // 可能需要先关闭当前 modal
  };
  // --- End Placeholder Actions ---

  // 计算参与者数量文本
  const participantCount = currentDialogConfig?.cybots?.length ?? 0;
  const participantsLabel = t("participant_count", { count: participantCount }); // 使用 i18n 复数形式

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <NavIconItem path="/" icon={<HomeIcon size={16} />} />
        </div>

        <div className="topbar-center">
          <div className="topbar-content-wrapper">
            {/* Dialog 相关 UI */}
            {currentDialogConfig && (
              <>
                <EditableTitle currentDialogConfig={currentDialogConfig} />

                {/* 仅当有 Cybots 时显示齿轮图标 */}
                {participantCount > 0 && (
                  <button
                    onClick={openCybotModal}
                    className="cybot-gear-button"
                    aria-label={t("Manage participants")} // 更新 aria-label
                  >
                    <GearIcon size={16} />
                  </button>
                )}

                <div className="token-counter">
                  Tokens: {currentDialogTokens}
                </div>
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </>
            )}
            {/* Page 编辑工具 */}
            {displayEditTool && <CreateTool />}
            {/* 其他可能的内容 */}
            {topbarContent}
          </div>
        </div>

        <div className="topbar-right">
          {isLoggedIn ? (
            <LoggedInMenu />
          ) : (
            <NavListItem
              label={t("login")}
              icon={<SignInIcon size={16} />}
              path={RoutePaths.LOGIN}
            />
          )}
        </div>
      </div>

      {/* Cybot 管理 Dialog */}
      {currentDialogConfig && ( // 确保 config 存在
        <Dialog
          isOpen={isCybotModalOpen}
          onClose={closeCybotModal}
          title={t("Participants")}
          className="cybot-participants-dialog"
        >
          {/* Dialog 内容 */}
          <div className="dialog-participants-content">
            {/* 显示数量 */}
            <div className="participants-count-display">
              {participantsLabel}
            </div>

            {/* Cybot 列表 */}
            <div className="cybot-dialog-list">
              {currentDialogConfig.cybots?.map((cybotId) => (
                <CybotNameChip
                  key={cybotId}
                  cybotId={cybotId}
                  onRemove={handleRemoveCybot} // 传递移除回调
                />
              )) ?? (
                <p className="no-participants-text">
                  {t("No participants in this conversation.")}
                </p> // 处理 cybots 为空或 undefined 的情况
              )}
            </div>

            {/* 添加按钮区域 */}
            <div className="add-participant-section">
              <Button
                variant="primary" // 使用 Button 组件样式
                onClick={handleAddCybotClick}
                icon={<PlusIcon size={16} />} // 添加图标
              >
                {t("Add Participant")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      <style>
        {`
          /* --- TopBar, 齿轮按钮样式 (保持不变) --- */
          .topbar { display: flex; justify-content: space-between; align-items: center; background-color: transparent; position: sticky; top: 0; right: 0; width: 100%; padding: 12px 16px; z-index: 2; height: ${styles.height}; }
          .topbar-left { display: flex; align-items: center; gap: ${styles.spacing}; min-width: 90px; }
          .topbar-center { flex: 1; display: flex; align-items: center; justify-content: center; gap: ${styles.spacing}; padding: 0 24px; overflow: hidden; }
          .topbar-content-wrapper { display: flex; align-items: center; justify-content: center; gap: ${styles.spacing}; max-width: 800px; width: 100%; }
          .token-counter { display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border-radius: 6px; background: ${theme.surface2}; color: ${theme.text2}; font-size: 14px; height: 32px; flex-shrink: 0; }
          .topbar-right { display: flex; align-items: center; gap: ${styles.spacing}; min-width: 90px; justify-content: flex-end; }
          .cybot-gear-button { background: none; border: none; padding: 4px; margin: 0; cursor: pointer; color: ${theme.text2}; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; transition: background-color 0.2s ease; }
          .cybot-gear-button:hover { background-color: ${theme.surface2}; color: ${theme.text}; }

          /* --- Dialog 内部样式 --- */
          .dialog-participants-content {
            display: flex;
            flex-direction: column;
            gap: 16px; /* 各部分之间的间距 */
          }

          .participants-count-display {
            font-size: 13px;
            color: ${theme.textSecondary};
            padding-bottom: 8px;
            /* border-bottom: 1px solid ${theme.border}; */ /* 可选的分割线 */
            text-align: center; /* 居中显示数量 */
          }

          .cybot-dialog-list {
            display: flex;
            flex-direction: column;
            gap: 10px; /* Chip 之间的垂直间距 */
            max-height: 40vh; /* 限制列表高度，超出滚动 */
            overflow-y: auto;
            padding: 4px; /* 给滚动条一点空间 */
             /* 可以添加一些内边距或边框 */
             /* background-color: ${theme.surface2}; */
             /* border-radius: 8px; */
             /* padding: 12px; */
          }

           /* 滚动条样式 (继承自 Dialog 或自定义) */
          .cybot-dialog-list::-webkit-scrollbar { width: 6px; }
          .cybot-dialog-list::-webkit-scrollbar-track { background: transparent; }
          .cybot-dialog-list::-webkit-scrollbar-thumb { background-color: ${theme.border}; border-radius: 3px; }
          .cybot-dialog-list::-webkit-scrollbar-thumb:hover { background-color: ${theme.borderHover}; }

          .no-participants-text {
             font-style: italic;
             color: ${theme.textSecondary};
             text-align: center;
             padding: 20px 0;
          }

          .add-participant-section {
            margin-top: 12px; /* 与列表的间距 */
            padding-top: 16px; /* 与列表的间距 */
            border-top: 1px solid ${theme.border}; /* 分割线 */
            display: flex;
            justify-content: center; /* 按钮居中 */
          }

          /* --- 响应式 (保持不变) --- */
          @media (max-width: 768px) {
            .topbar { padding: 8px 12px; }
            .topbar-center { padding: 0 8px; gap: 4px; }
            .topbar-right { gap: 4px; }
            .token-counter { display: none; }
            .cybot-gear-button { padding: 6px; }
          }
          @media (max-width: 640px) {
             .topbar-center .editable-title { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
             .topbar-center .create-dialog-button,
             .topbar-center .delete-dialog-button { display: none; }
          }
        `}
      </style>
    </>
  );
};

export default TopBar;
