import { CommentDiscussionIcon } from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { CreateWorkSpaceForm } from "create/workspace/CreateWorkSpaceForm";
import {
	changeWorkSpace,
	deleteWorkspace,
	fetchWorkspaces,
	queryDialogList,
	selectAllWorkspaces,
	selectCurrentWorkspaceName,
} from "create/workspace/workspaceSlice";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoPlus } from "react-icons/go";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { layout } from "../styles/layout";
import { zIndex } from "../styles/zIndex";
import { themeStyles } from "../ui/styles";
import NavIconItem from "./blocks/NavIconItem";

export const SidebarTop = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const workspaces = useAppSelector(selectAllWorkspaces);
	const navigate = useNavigate();
	const currentWorkspaceName = useAppSelector(selectCurrentWorkspaceName);
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const { visible, open, close } = useModal();
	const theme = useAppSelector(selectTheme);
	const [dropdownHover, setDropdownHover] = useState(false);
	const [createHover, setCreateHover] = useState(false);

	useEffect(() => {
		dispatch(fetchWorkspaces());
	}, [dispatch]);

	const getCurrentWorkspaceName = () => {
		if (!currentWorkspaceName) return t("selectWorkspace");
		return currentWorkspaceName === "allChats"
			? t("allChats")
			: currentWorkspaceName;
	};

	const handleOptionClick = (workspaceId?: string) => {
		navigate("/chat");
		dispatch(changeWorkSpace(workspaceId));
		dispatch(queryDialogList(workspaceId));
		setIsOpen(false);
	};

	const handleDeleteWorkspace = (workspaceId: string) => {
		dispatch(deleteWorkspace(workspaceId));
	};

	const getHoverStyle = (isHovered: boolean) => ({
		background: isHovered ? theme.surface3 : theme.surface1,
		transform: isHovered ? "translateX(4px)" : "translateX(0)",
		borderRadius: "6px",
	});

	return (
		<div
			style={{
				...layout.flexStart,
				padding: "12px 16px",
			}}
		>
			<NavIconItem path="/chat" icon={<CommentDiscussionIcon size={22} />} />
			<div style={{ width: "160px", position: "relative" }}>
				<div
					onClick={() => setIsOpen(!isOpen)}
					onMouseEnter={() => setDropdownHover(true)}
					onMouseLeave={() => setDropdownHover(false)}
					style={{
						...layout.flexBetween,
						padding: "8px 12px",
						borderRadius: "6px",
						cursor: "pointer",
						transition: "all 0.2s ease",
						...themeStyles.surface1(theme),
						background:
							isOpen || dropdownHover ? theme.surface3 : theme.surface1,
						boxShadow:
							isOpen || dropdownHover ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
					}}
				>
					<span
						style={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							fontSize: "14px",
							fontWeight: 500,
						}}
					>
						{getCurrentWorkspaceName()}
					</span>
					<span
						style={{
							transition: "all 0.2s ease",
							marginLeft: "8px",
							transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
						}}
					>
						<RxDropdownMenu size={16} />
					</span>
				</div>

				{isOpen && (
					<div
						style={{
							position: "absolute",
							top: "calc(100% + 8px)",
							left: 0,
							right: 0,
							borderRadius: "6px",
							...layout.overflowYAuto,
							...themeStyles.surface1(theme),
							maxHeight: "320px",
							zIndex: zIndex.codeBlockActions,
							boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
							border: `1px solid ${theme.surface2}`,
						}}
					>
						<div
							onClick={() => handleOptionClick()}
							onMouseEnter={() => setHoveredItem("all")}
							onMouseLeave={() => setHoveredItem(null)}
							style={{
								padding: "8px 12px",
								cursor: "pointer",
								fontSize: "14px",
								transition: "all 0.2s ease",
								...getHoverStyle(hoveredItem === "all"),
								margin: "4px",
							}}
						>
							{t("recent")}
						</div>

						{workspaces?.map((workspace: any) => (
							<div
								key={workspace.id}
								style={{
									margin: "4px",
									borderTop: `1px solid ${theme.surface2}`,
								}}
							>
								<div
									onClick={() => handleOptionClick(workspace.id)}
									onMouseEnter={() => setHoveredItem(workspace.id)}
									onMouseLeave={() => setHoveredItem(null)}
									style={{
										...layout.flexBetween,
										padding: "8px 12px",
										fontSize: "14px",
										transition: "all 0.2s ease",
										...getHoverStyle(hoveredItem === workspace.id),
									}}
								>
									<span
										style={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{workspace.name}
									</span>
									{hoveredItem === workspace.id && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteWorkspace(workspace.id);
											}}
											style={{
												border: "none",
												padding: "4px 8px",
												fontSize: "12px",
												color: theme.text2,
												borderRadius: "4px",
												transition: "all 0.2s ease",
											}}
										>
											{t("删除")}
										</button>
									)}
								</div>
							</div>
						))}

						<div
							style={{
								margin: "4px",
								borderTop: `1px solid ${theme.surface2}`,
							}}
						>
							<div
								style={{
									...layout.flexStart,
									padding: "8px 12px",
									cursor: "pointer",
									transition: "all 0.2s ease",
									...getHoverStyle(createHover),
									color: theme.brand,
								}}
								onMouseEnter={() => setCreateHover(true)}
								onMouseLeave={() => setCreateHover(false)}
								onClick={(e) => {
									e.stopPropagation();
									open();
									setIsOpen(false);
								}}
							>
								<GoPlus size={16} style={{ marginRight: "8px" }} />
								<span style={{ fontSize: "14px", fontWeight: 500 }}>
									{t("新建工作区")}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			<Dialog isOpen={visible} onClose={close}>
				<CreateWorkSpaceForm onClose={close} />
			</Dialog>
		</div>
	);
};
