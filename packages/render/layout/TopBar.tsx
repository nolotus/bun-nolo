// render/layout/TopBar.tsx

import type React from "react";
import type { ReactNode } from "react";

import { SignInIcon } from "@primer/octicons-react";
import { HomeIcon } from "@primer/octicons-react";
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
import { useTranslation } from "react-i18next";
import NavListItem from "render/layout/blocks/NavListItem";

import { motion } from "framer-motion";
import useMediaQuery from "react-responsive";
import { layout } from "../styles/layout";
import MenuButton from "./MenuButton";
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
		<div
			style={{
				...layout.flex,
				...layout.flexBetween,
				backgroundColor: "transparent",
				position: "sticky",
				top: 0,
				right: 0,
				width: "100%",
				padding: "12px 16px",
				zIndex: 2,
				height: "60px",
			}}
		>
			{toggleSidebar && (
				<MenuButton
					onClick={toggleSidebar}
					theme={theme}
					isExpanded={isExpanded}
				/>
			)}
			<NavIconItem path="/" icon={<HomeIcon size={24} />} />

			<div
				style={{
					flex: 1,
					...layout.flexCenter,
					...layout.flexWrap,
					marginLeft: toggleSidebar ? undefined : "16px",
				}}
			>
				{currentDialogConfig && (
					<>
						<EditableTitle currentDialogConfig={currentDialogConfig} />
						{currentDialogConfig.cybots?.map((cybotId) => (
							<CybotNameChip key={cybotId} cybotId={cybotId} />
						))}
						{!isMobile && currentDialogTokens > 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<div
									style={{
										...layout.flexEnd,
										fontSize: "14px",
										color: theme.text2,
										padding: "0 16px",
										borderRadius: "8px",
										backgroundColor: theme.surface2,
									}}
								>
									Tokens: {currentDialogTokens}
								</div>
							</motion.div>
						)}
						<CreateDialogButton dialogConfig={currentDialogConfig} />
						<DeleteDialogButton dialogConfig={currentDialogConfig} />
					</>
				)}
				{topbarContent}
			</div>

			<div style={layout.flexEnd}>
				<CreateMenu />
				{isLoggedIn ? (
					<div>
						<IsLoggedInMenu />
					</div>
				) : (
					<NavListItem
						label={t("login")}
						icon={<SignInIcon size={16} />}
						path={RoutePaths.LOGIN}
					/>
				)}
			</div>
		</div>
	);
};

export default TopBar;
