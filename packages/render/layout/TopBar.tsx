// TopBar.tsx
import { useTheme } from "app/theme";
import { useCallback } from "react";
import { extractUserId } from "core/prefix";
import { selectPageData } from "../page/pageSlice";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type React from "react";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "app/hooks";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import { CreateTool } from "create/CreateTool";
import NavIconItem from "./blocks/NavIconItem";
import NavListItem from "render/layout/blocks/NavListItem";
import { useParams } from "react-router-dom";
import EditableTitle from "chat/dialog/EditableTitle";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";
import { RoutePaths } from "auth/web/routes";
import { HomeIcon, SignInIcon } from "@primer/octicons-react";
import { addCybot } from "chat/dialog/dialogSlice"; // 引入 addCybot action
import { toast } from "react-hot-toast";

interface TopBarProps {
  topbarContent?: ReactNode;
}

const styles = {
  height: "56px",
  spacing: "8px",
};

const TopBar: React.FC<TopBarProps> = ({ topbarContent }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  const theme = useTheme();
  const dispatch = useAppDispatch(); // 使用 dispatch 来调用 action
  const { pageKey } = useParams<{ pageKey?: string }>();

  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const isNotBelongAnyone = !pageData.creator;
  const allowEdit = isCreator || isNotBelongAnyone;
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);
  const displayEditTool =
    pageKey?.startsWith("page") && allowEdit && hasPageData;

  const handleRemoveCybot = useCallback(
    (cybotIdToRemove: string) => {
      if (!currentDialogConfig) return;
      dispatch(removeCybot(cybotIdToRemove))
        .unwrap()
        .then(() => {
          toast.success(t("Cybot removed successfully"));
        })
        .catch((error) => {
          console.error("Failed to remove Cybot:", error);
          toast.error(t("Failed to remove Cybot"));
        });
    },
    [currentDialogConfig, dispatch, t]
  );

  const handleAddCybotClick = useCallback(() => {
    // 不再需要 alert，直接打开对话框，具体逻辑已在 DialogInfoPanel 中实现
    console.log(
      "Open UI to select and add a new cybot to dialog:",
      currentDialogConfig?.id
    );
  }, [currentDialogConfig]);

  const handleAddCybot = useCallback(
    (cybotId: string) => {
      if (!currentDialogConfig) return;
      dispatch(addCybot(cybotId))
        .unwrap()
        .then(() => {
          toast.success(t("Cybot added successfully"));
        })
        .catch((error) => {
          console.error("Failed to add Cybot:", error);
          toast.error(t("Failed to add Cybot"));
        });
    },
    [currentDialogConfig, dispatch, t]
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <NavIconItem path="/" icon={<HomeIcon size={16} />} />
        </div>

        <div className="topbar-center">
          <div className="topbar-content-wrapper">
            {currentDialogConfig && (
              <>
                <EditableTitle currentDialogConfig={currentDialogConfig} />
                <DialogInfoPanel
                  onAddCybotClick={handleAddCybotClick}
                  onRemoveCybot={handleRemoveCybot}
                  onAddCybot={handleAddCybot} // 传递添加 Cybot 的回调
                />
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
            padding: 0 16px;
            z-index: 2;
            height: ${styles.height};
            box-sizing: border-box;
            border: none;
            box-shadow: none;
          }
          
          .topbar-left, .topbar-right {
            display: flex;
            align-items: center;
            gap: ${styles.spacing};
            min-width: 90px;
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
            padding: 0 24px;
            overflow: visible;
            min-width: 0;
          }
          
          .topbar-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            max-width: 800px;
            width: 100%;
          }

          /* --- Responsive Design --- */
          @media (max-width: 768px) {
            .topbar { 
              padding: 0 12px;
            }
            
            .topbar-center { 
              padding: 0 10px;
              gap: 6px;
            }
            
            .topbar-right { 
              gap: 6px; 
            }
          }
          
          @media (max-width: 640px) {
            .topbar-center .editable-title {
              max-width: 110px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            
            .topbar-content-wrapper {
              gap: 8px;
            }
          }
          
          @media (max-width: 480px) {
            .topbar-center .editable-title {
              max-width: 80px;
            }
          }
        `}
      </style>
    </>
  );
};

export default TopBar;
