import { useTheme } from "app/theme";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useAuth } from "auth/hooks/useAuth";
import { useAppSelector } from "app/hooks";
import { extractUserId } from "core/prefix";
import { selectPageData } from "../page/pageSlice";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import type React from "react";
import type { ReactNode } from "react";

// Web Components
import NavListItem from "render/layout/blocks/NavListItem";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import EditableTitle from "chat/dialog/EditableTitle";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import { CreateTool } from "create/CreateTool";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";
import { RoutePaths } from "auth/web/routes";
import { SignInIcon, ThreeBarsIcon } from "@primer/octicons-react";

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
                <DialogInfoPanel />
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
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

      <style>
        {`
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
            padding: 0 ${theme.space[4]}; /* 16px */
            z-index: 2;
            height: ${theme.space[12]}; /* 48px */
            box-sizing: border-box;
            border: none;
            box-shadow: none;
            transition: transform 0.3s ease; /* 添加过渡效果 */
          }
          
          .topbar-left, .topbar-right {
            display: flex;
            align-items: center;
            gap: ${theme.space[2]}; /* 8px */
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
            padding: 0 ${theme.space[5]}; /* 20px */
            overflow: visible;
            min-width: 0;
          }
          
          .topbar-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${theme.space[3]}; /* 12px */
            max-width: 800px;
            width: 100%;
          }

          .sidebar-toggle-button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            cursor: pointer;
            color: ${theme.textSecondary};
            width: ${theme.space[8]}; /* 32px */
            height: ${theme.space[8]}; /* 32px */
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

          /* --- Responsive Design --- */
          @media (max-width: 768px) {
            .topbar { 
              padding: 0 ${theme.space[3]}; /* 12px */
            }
            
            .topbar-center { 
              padding: 0 ${theme.space[2]}; /* 8px */
              gap: ${theme.space[1]}; /* 4px */
            }
            
            .topbar-right { 
              gap: ${theme.space[1]}; /* 4px */
            }
          }
          
          @media (max-width: 640px) {
            .topbar-center .editable-title {
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .topbar-content-wrapper {
              gap: ${theme.space[2]}; /* 8px */
            }
          }
          
          @media (max-width: 480px) {
            .topbar-center .editable-title {
              max-width: 70px;
            }
          }
        `}
      </style>
    </>
  );
};

export default TopBar;
