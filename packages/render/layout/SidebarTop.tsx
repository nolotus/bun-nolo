import {
	FloatingFocusManager,
	autoUpdate,
	flip,
	offset,
	shift,
	size,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
	useRole,
	useTransitionStyles,
} from "@floating-ui/react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { CreateWorkSpaceForm } from "create/workspace/CreateWorkSpaceForm";
import {
	changeWorkSpace,
	deleteWorkspace,
	fetchWorkspaces,
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

import { ProjectIcon } from "@primer/octicons-react";
import { layout } from "../styles/layout";
import { zIndex } from "../styles/zIndex";
import NavIconItem from "./blocks/NavIconItem";
import { useTheme } from "app/theme";

export const SidebarTop = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const workspaces = useAppSelector(selectAllWorkspaces);
	const navigate = useNavigate();
	const currentWorkspaceName = useAppSelector(selectCurrentWorkspaceName);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const { visible, open: openModal, close: closeModal } = useModal();
	const listRef = React.useRef<Array<HTMLElement | null>>([]);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "bottom-start",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset({
				mainAxis: 4,
				alignmentAxis: 0,
			}),
			flip({
				fallbackPlacements: ["top-start"],
				padding: 8,
			}),
			shift({
				padding: 8,
			}),
			size({
				apply({ rects, elements }) {
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
						maxWidth: `${rects.reference.width}px`,
					});
				},
				padding: 8,
			}),
		],
	});

	const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
		initial: {
			opacity: 0,
			transform: "translateY(-8px)",
		},
		open: {
			opacity: 1,
			transform: "translateY(0)",
		},
		close: {
			opacity: 0,
			transform: "translateY(-8px)",
		},
		duration: {
			open: 150,
			close: 100,
		},
	});

	const click = useClick(context, {
		toggle: true,
		ignoreMouse: false,
	});

	const dismiss = useDismiss(context, {
		outsidePress: true,
	});

	const role = useRole(context);

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, role, listNavigation],
	);

	useEffect(() => {
		dispatch(fetchWorkspaces());
	}, [dispatch]);

	const getCurrentWorkspaceName = () => {
		if (!currentWorkspaceName) return t("selectSpace");
		return currentWorkspaceName === "allChats"
			? t("allChats")
			: currentWorkspaceName;
	};

	const handleOptionClick = (workspaceId?: string) => {
		navigate("/create");
		dispatch(changeWorkSpace(workspaceId));
		//todo  new db need workspace
		// dispatch(queryDialogList(workspaceId));
		setIsOpen(false);
	};

	const handleDeleteWorkspace = (workspaceId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		dispatch(deleteWorkspace(workspaceId));
	};

	const handleCreateWorkspace = (e: React.MouseEvent) => {
		e.stopPropagation();
		openModal();
		setIsOpen(false);
	};

	return (
		<div
			style={{
				...layout.flexStart,
				padding: "12px 16px",
				position: "relative",
				gap: "12px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "32px",
					height: "32px",
					borderRadius: "6px",
					transition: "background-color 0.15s ease",
				}}
			>
				<NavIconItem path="/create" icon={<ProjectIcon size={24} />} />
			</div>

			<div style={{ position: "relative" }}>
				<div
					ref={refs.setReference}
					{...getReferenceProps()}
					style={{
						...layout.flexBetween,
						width: "160px",
						height: "32px",
						padding: "0 12px",
						borderRadius: "6px",
						cursor: "pointer",
						transition: "all 0.15s ease",
						backgroundColor: theme.background,
						border: `1px solid ${isOpen ? theme.borderHover : theme.border}`,
						boxShadow: isOpen
							? `0 2px 4px ${theme.shadowLight}`
							: "none",
					}}
				>
					<span
						style={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							fontSize: "14px",
							fontWeight: 500,
							color: theme.text,
						}}
					>
						{getCurrentWorkspaceName()}
					</span>
					<RxDropdownMenu
						size={16}
						style={{
							marginLeft: "8px",
							transition: "transform 0.15s ease",
							transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
							color: theme.textSecondary,
						}}
					/>
				</div>

				{isMounted && (
					<FloatingFocusManager context={context} modal={false}>
						<div
							ref={refs.setFloating}
							style={{
								...floatingStyles,
								...transitionStyles,
								backgroundColor: theme.background,
								borderRadius: "6px",
								boxShadow: `0 4px 12px ${theme.shadowMedium}`,
								border: `1px solid ${theme.border}`,
								maxHeight: "320px",
								overflowY: "auto",
								zIndex: zIndex.dropdown,
							}}
							{...getFloatingProps()}
						>
							<div
								ref={(node) => (listRef.current[0] = node)}
								{...getItemProps({
									onClick: () => handleOptionClick(),
								})}
								style={{
									padding: "8px 12px",
									cursor: "pointer",
									fontSize: "14px",
									transition: "background-color 0.15s ease",
									backgroundColor:
										activeIndex === 0
											? theme.backgroundSecondary
											: "transparent",
									color: theme.text,
									margin: "4px",
									borderRadius: "4px",
								}}
							>
								{t("recent")}
							</div>

							{workspaces?.map((workspace: any, index: number) => (
								<div
									key={workspace.id}
									ref={(node) => (listRef.current[index + 1] = node)}
									{...getItemProps({
										onClick: () => handleOptionClick(workspace.id),
									})}
									style={{
										padding: "8px 12px",
										margin: "4px",
										borderTop:
											index === 0 ? `1px solid ${theme.border}` : "none",
									}}
								>
									<div
										style={{
											...layout.flexBetween,
											transition: "background-color 0.15s ease",
											backgroundColor:
												activeIndex === index + 1
													? theme.backgroundSecondary
													: "transparent",
											borderRadius: "4px",
											padding: "4px 8px",
										}}
									>
										<span
											style={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												fontSize: "14px",
												color: theme.text,
											}}
										>
											{workspace.name}
										</span>
										{activeIndex === index + 1 && (
											<button
												onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
												style={{
													border: "none",
													padding: "2px 8px",
													fontSize: "12px",
													color: theme.textSecondary,
													backgroundColor: "transparent",
													cursor: "pointer",
													borderRadius: "4px",
													transition: "background-color 0.15s ease",
												}}
											>
												{t("删除")}
											</button>
										)}
									</div>
								</div>
							))}

							<div
								ref={(node) => (listRef.current[workspaces?.length + 1] = node)}
								{...getItemProps({
									onClick: handleCreateWorkspace,
								})}
								style={{
									margin: "4px",
									padding: "8px 12px",
									borderTop: `1px solid ${theme.border}`,
								}}
							>
								<div
									style={{
										...layout.flexStart,
										padding: "4px 8px",
										cursor: "pointer",
										transition: "background-color 0.15s ease",
										backgroundColor:
											activeIndex === workspaces?.length + 1
												? theme.backgroundSecondary
												: "transparent",
										color: theme.primary,
										borderRadius: "4px",
									}}
								>
									<GoPlus size={16} style={{ marginRight: "8px" }} />
									<span style={{ fontSize: "14px", fontWeight: 500 }}>
										{t("新建工作区")}
									</span>
								</div>
							</div>
						</div>
					</FloatingFocusManager>
				)}
			</div>

			<Dialog isOpen={visible} onClose={closeModal}>
				<CreateWorkSpaceForm onClose={closeModal} />
			</Dialog>
		</div>
	);
};
