import { HomeIcon, SignInIcon } from "@primer/octicons-react";
import CybotNameChip from "ai/cybot/CybotNameChip";
import { useAppSelector } from "app/hooks";
import { RoutePaths } from "auth/client/routes";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import { useAuth } from "auth/useAuth";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import EditableTitle from "chat/dialog/EditableTitle";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import { CreateMenu } from "create/CreateMenu";
import type React from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import useMediaQuery from "react-responsive";
import NavListItem from "render/layout/blocks/NavListItem";
import MenuButton from "./MenuButton";
import NavIconItem from "./blocks/NavIconItem";
import { selectPageData } from "../page/pageSlice";
import { useParams } from "react-router";
import { extractUserId } from "core/prefix";
//web
import { CreateTool } from "create/CreateTool";
interface TopBarProps {
  toggleSidebar?: () => void;
  theme: any;
  topbarContent?: ReactNode;
  isExpanded: boolean;
}

const styles = {
  height: "60px",
  spacing: "8px",
};

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  theme,
  topbarContent,
  isExpanded,
}) => {
  const { t } = useTranslation();

  const { isLoggedIn } = useAuth();
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  console.log("pageData", pageData);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { pageId } = useParams();

  const auth = useAuth();
  const dataCreator = pageId ? extractUserId(pageId) : undefined;

  const isCreator = dataCreator === auth.user?.userId;
  // const isNotBelongAnyone = !data.creator;

  const allowEdit = isCreator;
  const hasPageData = pageData.conetent || pageData.slateData;
  const displayEditTool = allowEdit && hasPageData;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          {toggleSidebar && (
            <MenuButton onClick={toggleSidebar} isExpanded={isExpanded} />
          )}
          <NavIconItem path="/" icon={<HomeIcon size={16} />} />
        </div>

        <div className="topbar-center">
          <div className="topbar-content-wrapper">
            {currentDialogConfig && (
              <>
                <EditableTitle currentDialogConfig={currentDialogConfig} />
                {currentDialogConfig.cybots?.map((cybotId) => (
                  <CybotNameChip key={cybotId} cybotId={cybotId} />
                ))}
                {!isMobile && currentDialogTokens > 0 && (
                  <div className="token-counter">
                    Tokens: {currentDialogTokens}
                  </div>
                )}
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </>
            )}
            {displayEditTool && <CreateTool />}
            {topbarContent}
          </div>
        </div>

        <div className="topbar-right">
          <CreateMenu />
          {isLoggedIn ? (
            <IsLoggedInMenu />
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
          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: transparent;
            position: sticky;
            top: 0;
            right: 0;
            width: 100%;
            padding: 12px 16px;
            z-index: 2;
            height: ${styles.height};
          }

          .topbar-left {
            display: flex;
            align-items: center;
            gap: ${styles.spacing};
            min-width: 90px;
          }

          .topbar-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${styles.spacing};
            padding: 0 24px;
          }

          .topbar-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${styles.spacing};
            max-width: 800px;
            width: 100%;
          }

          .token-counter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 12px;
            border-radius: 6px;
            background: ${theme.surface2};
            color: ${theme.text2};
            font-size: 14px;
          }

          .topbar-right {
            display: flex;
            align-items: center;
            gap: ${styles.spacing};
            min-width: 90px;
            justify-content: flex-end;
          }

          @media (max-width: 768px) {
            .topbar {
              padding: 8px 12px;
            }
            
            .topbar-center {
              padding: 0 12px;
              gap: 4px;
            }

            .topbar-right {
              gap: 4px;
            }
          }
        `}
      </style>
    </>
  );
};

export default TopBar;
