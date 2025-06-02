import { useTheme } from "app/theme";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "auth/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { extractUserId } from "core/prefix";
import { selectPageData } from "../page/pageSlice";
import {
  selectCurrentDialogConfig,
  deleteCurrentDialog,
} from "chat/dialog/dialogSlice";
import { useState } from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import toast from "react-hot-toast";
import type React from "react";
import type { ReactNode } from "react";

// Web Components
import NavListItem from "render/layout/blocks/NavListItem";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import { CreateTool } from "create/CreateTool";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";
import { RoutePaths } from "auth/web/routes";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "web/ui/ConfirmModal";
import {
  SignInIcon,
  ThreeBarsIcon,
  HomeIcon,
  KebabHorizontalIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { TbMessageCirclePlus } from "react-icons/tb";

// 集成的加载动画组件
const Spinner = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <div className="spinner" />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid ${theme.borderLight};
          border-top: 2px solid ${theme.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

// 集成的创建对话按钮
const CreateDialogButton = ({ dialogConfig, isMobile = false }) => {
  const { isLoading, createNewDialog } = useCreateDialog();
  const { t } = useTranslation("chat");
  const theme = useAppSelector(selectTheme);

  const handleCreateClick = () => {
    createNewDialog({
      cybots: dialogConfig.cybots,
    });
  };

  const buttonContent = (
    <button
      onClick={handleCreateClick}
      disabled={isLoading}
      className={`action-button ${isMobile ? "mobile-action-button" : ""}`}
    >
      {isLoading ? <Spinner /> : <TbMessageCirclePlus size={16} />}
      {isMobile && <span className="mobile-button-text">{t("newchat")}</span>}
    </button>
  );

  if (isMobile) {
    return buttonContent;
  }

  return (
    <Tooltip content={t("newchat")} placement="bottom">
      {buttonContent}
    </Tooltip>
  );
};

// 集成的删除对话按钮
const DeleteDialogButton = ({ dialogConfig, isMobile = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const deleteKey = dialogConfig.dbKey || dialogConfig.id;
      await dispatch(deleteCurrentDialog(deleteKey));
      toast.success(t("deleteSuccess"));
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete dialog:", error);
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const buttonContent = (
    <button
      className={`action-button delete-button ${isMobile ? "mobile-action-button" : ""}`}
      onClick={() => setIsOpen(true)}
      disabled={isDeleting}
    >
      <TrashIcon size={16} />
      {isMobile && <span className="mobile-button-text">{t("delete")}</span>}
    </button>
  );

  return (
    <>
      {isMobile ? (
        buttonContent
      ) : (
        <Tooltip content={t("delete")} placement="bottom">
          {buttonContent}
        </Tooltip>
      )}

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: dialogConfig.title })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
    </>
  );
};

// 简化后的 EditableTitle 组件
const EditableTitle = ({ currentDialogConfig }) => {
  const theme = useAppSelector(selectTheme);
  const title = currentDialogConfig.title;

  return <h1 className="dialog-title">{title}</h1>;
};

// 移动端下拉菜单组件
const MobileDialogMenu = ({ currentDialogConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAppSelector(selectTheme);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="mobile-dialog-menu">
        <button
          className="mobile-menu-trigger"
          onClick={toggleMenu}
          aria-label="打开对话选项"
        >
          <KebabHorizontalIcon size={16} />
        </button>

        {isOpen && (
          <>
            <div
              className="mobile-menu-backdrop"
              onClick={handleBackdropClick}
            />
            <div className="mobile-menu-dropdown">
              <div className="mobile-menu-item info-panel-item">
                <DialogInfoPanel isMobile={true} />
              </div>

              <div className="mobile-menu-section">
                <div className="mobile-menu-item">
                  <CreateDialogButton
                    dialogConfig={currentDialogConfig}
                    isMobile={true}
                  />
                </div>
                <div className="mobile-menu-item">
                  <DeleteDialogButton
                    dialogConfig={currentDialogConfig}
                    isMobile={true}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .mobile-dialog-menu {
          position: relative;
          display: none;
        }

        .mobile-menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          width: ${theme.space[8]};
          height: ${theme.space[8]};
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .mobile-menu-trigger:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .mobile-menu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 998;
          background: transparent;
        }

        .mobile-menu-dropdown {
          position: absolute;
          top: calc(100% + ${theme.space[2]});
          right: 0;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          box-shadow: 0 4px 16px ${theme.shadowMedium};
          z-index: 999;
          min-width: 220px;
          padding: ${theme.space[3]};
          animation: slideDown 0.2s ease-out;
        }

        .mobile-menu-section {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }

        .mobile-menu-item {
          width: 100%;
        }

        .info-panel-item {
          margin-bottom: ${theme.space[3]};
          padding-bottom: ${theme.space[3]};
          border-bottom: 1px solid ${theme.borderLight};
        }

        .mobile-action-button {
          width: 100% !important;
          justify-content: flex-start !important;
          gap: ${theme.space[3]} !important;
          padding: ${theme.space[3]} ${theme.space[4]} !important;
          text-align: left;
        }

        .mobile-button-text {
          font-size: 14px;
          color: ${theme.text};
        }

        .delete-button.mobile-action-button:hover {
          background: ${theme.error}10 !important;
          color: ${theme.error} !important;
        }

        .delete-button.mobile-action-button .mobile-button-text {
          color: inherit;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 移动端显示菜单，隐藏原始组件 */
        @media (max-width: 768px) {
          .mobile-dialog-menu {
            display: block;
          }

          .desktop-dialog-actions {
            display: none;
          }
        }

        /* 桌面端显示原始组件，隐藏菜单 */
        @media (min-width: 769px) {
          .mobile-dialog-menu {
            display: none;
          }

          .desktop-dialog-actions {
            display: flex;
            align-items: center;
            gap: ${theme.space[3]};
          }
        }
      `}</style>
    </>
  );
};

interface TopBarProps {
  topbarContent?: ReactNode;
  toggleSidebar?: (e?: React.MouseEvent) => void;
  isSidebarOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  topbarContent,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const theme = useTheme();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  const { pageKey } = useParams<{ pageKey?: string }>();

  // 编辑权限逻辑
  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const isNotBelongAnyone = !pageData.creator;
  const allowEdit = isCreator || isNotBelongAnyone;
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);
  const displayEditTool =
    pageKey?.startsWith("page") && allowEdit && hasPageData;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          {!isLoggedIn && (
            <NavListItem
              label={t("home")}
              icon={<HomeIcon size={16} />}
              path="/"
            />
          )}
          {toggleSidebar && (
            <button
              className="sidebar-toggle-button"
              onClick={toggleSidebar}
              aria-label={
                isSidebarOpen ? t("close_sidebar") : t("open_sidebar")
              }
              title={isSidebarOpen ? t("close_sidebar") : t("open_sidebar")}
            >
              <ThreeBarsIcon size={16} />
            </button>
          )}
        </div>

        <div className="topbar-center">
          <div className="topbar-content-wrapper">
            {currentDialogConfig && (
              <>
                <EditableTitle currentDialogConfig={currentDialogConfig} />

                {/* 桌面端显示的原始组件 */}
                <div className="desktop-dialog-actions">
                  <DialogInfoPanel />
                  <CreateDialogButton dialogConfig={currentDialogConfig} />
                  <DeleteDialogButton dialogConfig={currentDialogConfig} />
                </div>

                {/* 移动端折叠菜单 */}
                <MobileDialogMenu currentDialogConfig={currentDialogConfig} />
              </>
            )}
            {displayEditTool && <CreateTool />}
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

      <style href="topbar" precedence="default">{`
        /* --- TopBar Basic Layout --- */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: ${theme.background};
          position: sticky;
          top: 0;
          right: 0;
          width: 100%;
          padding: 0 ${theme.space[4]};
          z-index: 2;
          height: ${theme.space[12]};
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .topbar-left,
        .topbar-right {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          min-width: 80px;
          flex-shrink: 0;
        }

        .topbar-right {
          justify-content: flex-end;
        }

        .topbar-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 ${theme.space[5]};
          overflow: visible;
          min-width: 0;
        }

        .topbar-content-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[3]};
          max-width: 800px;
          width: 100%;
        }

        /* 简化后的 title 样式 */
        .dialog-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* 统一的按钮样式 */
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          width: ${theme.space[8]};
          height: ${theme.space[8]};
          border-radius: 6px;
          flex-shrink: 0;
          transition: all 0.15s ease;
          position: relative;
        }

        .action-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .delete-button:hover {
          background: ${theme.error}10;
          color: ${theme.error};
        }

        .sidebar-toggle-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          width: ${theme.space[8]};
          height: ${theme.space[8]};
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .sidebar-toggle-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .sidebar-toggle-button:focus-visible {
          outline: none;
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        /* --- 优化移动端显示的响应式设计 --- */
        @media (max-width: 768px) {
          .topbar {
            padding: 0 ${theme.space[3]};
          }

          .topbar-center {
            padding: 0 ${theme.space[2]};
          }

          .dialog-title {
            font-size: 14px;
            max-width: 150px;
          }
        }

        @media (max-width: 640px) {
          .dialog-title {
            font-size: 13px;
            max-width: 120px;
          }

          .topbar-content-wrapper {
            gap: ${theme.space[2]};
          }
        }

        @media (max-width: 480px) {
          .dialog-title {
            font-size: 12px;
            max-width: 100px;
          }

          .topbar-left,
          .topbar-right {
            min-width: 60px;
            gap: ${theme.space[1]};
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
