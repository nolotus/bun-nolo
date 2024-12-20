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
import { ICON_SIZES, commonStyles } from "./MenuButton";
import NavIconItem from "./blocks/NavIconItem";

interface TopBarProps {
	toggleSidebar?: () => void;
	theme: any;
	topbarContent?: ReactNode;
	isExpanded: boolean;
}

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
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

	return (
		<>
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
            height: 60px;
            border-bottom: 1px solid ${theme.border};
          }

          .topbar-left {
            display: flex;
            align-items: center;
            gap: ${commonStyles.spacing};
            min-width: 90px;
            height: ${commonStyles.buttonSize};
          }

          .topbar-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${commonStyles.spacing};
            padding: 0 24px;
            height: ${commonStyles.buttonSize};
          }

          .topbar-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${commonStyles.spacing};
            max-width: 800px;
            width: 100%;
          }

          .token-counter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: ${commonStyles.buttonSize};
            font-size: 14px;
            color: ${theme.text2};
            padding: 0 12px;
            border-radius: ${commonStyles.borderRadius};
            background-color: ${theme.surface2};
            border: ${commonStyles.border} solid transparent;
            opacity: 0.9;
          }

          .topbar-right {
            display: flex;
            align-items: center;
            gap: ${commonStyles.spacing};
            min-width: 90px;
            justify-content: flex-end;
            height: ${commonStyles.buttonSize};
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

			<div className="topbar">
				<div className="topbar-left">
					{toggleSidebar && (
						<MenuButton
							onClick={toggleSidebar}
							isExpanded={isExpanded}
							iconSize={ICON_SIZES.medium}
						/>
					)}
					<NavIconItem path="/" icon={<HomeIcon size={ICON_SIZES.medium} />} />
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
							icon={<SignInIcon size={ICON_SIZES.medium} />}
							path={RoutePaths.LOGIN}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default TopBar;
