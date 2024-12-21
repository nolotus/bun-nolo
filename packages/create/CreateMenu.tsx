import {
	flip,
	offset,
	shift,
	useFloating,
	useHover,
	useInteractions,
} from "@floating-ui/react";
import {
	CommentIcon,
	DependabotIcon,
	FileAddedIcon,
	LocationIcon,
	PlusIcon,
} from "@primer/octicons-react";
import Cybots from "ai/cybot/Cybots";
import { selectTheme } from "app/theme/themeSlice";
import { useAuth } from "auth/useAuth";
import { nolotusId } from "core/init";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { CreateRoutePaths } from "./routes";

export const CreateMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { isLoggedIn, user } = useAuth();
	const { t } = useTranslation();
	const theme = useSelector(selectTheme);
	const {
		visible: AIsModalVisible,
		open: openAIsModal,
		close: closeAIsModal,
	} = useModal();

	const buttonItems = [
		{
			tooltip: "新建页面",
			icon: <FileAddedIcon size={16} />,
			path: `/${CreateRoutePaths.CREATE_PAGE}`,
		},
		{
			tooltip: "添加Cybot",
			icon: <DependabotIcon size={16} />,
			path: `/${CreateRoutePaths.CREATE_CYBOT}`,
		},
		{
			tooltip: "添加地点",
			icon: <LocationIcon size={16} />,
			path: `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
		},
		{
			tooltip: "新建对话",
			icon: <CommentIcon size={16} />,
			onClick: openAIsModal,
		},
	];

	const { x, y, strategy, refs, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		middleware: [offset(8), flip(), shift()],
	});

	const hover = useHover(context, {
		delay: { open: 0, close: 100 },
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

	return (
		<>
			<style>
				{`
			.create-menu {
			  position: relative;
			}
	  
			.menu-button {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			  width: 30px;
			  height: 30px;
			  border-radius: 4px;
			  border: 1px solid ${defaultTheme.border};
			  background: transparent;
			  color: ${defaultTheme.textSecondary};
			  cursor: pointer;
			  transition: all 0.2s ease;
			}
	  
			.menu-button:hover {
			  color: ${defaultTheme.primary};
			  border-color: ${defaultTheme.primary}80;
			  background: ${defaultTheme.backgroundSecondary}40;
			}
	  
			.menu-button svg {
			  transition: transform 0.2s ease;
			}
	  
			.menu-button.open svg {
			  transform: rotate(45deg);
			}
	  
			.dropdown {
			  background: ${defaultTheme.background}; 
			  border: 1px solid ${defaultTheme.border};
			  border-radius: 4px;
			  padding: 4px;
			  min-width: 160px;
			  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
			}
	  
			.menu-item {
			  display: flex;
			  align-items: center;
			  padding: 6px 10px;
			  color: ${defaultTheme.textSecondary};
			  text-decoration: none;
			  border-radius: 3px;
			  transition: all 0.15s ease;
			  margin: 1px 0;
			}
	  
			.menu-item:hover {
			  background: ${defaultTheme.backgroundSecondary}30;
			  color: ${defaultTheme.primary};
			}
	  
			.menu-item svg {
			  margin-right: 8px;
			  flex-shrink: 0;
			  opacity: 0.8;
			}
	  
			.menu-item span {
			  font-size: 13px;
			  font-weight: 400;
			  letter-spacing: 0.1px;
			}
		  `}
			</style>

			<div className="create-menu">
				<button
					ref={refs.setReference}
					className={`menu-button ${isOpen ? "open" : ""}`}
					{...getReferenceProps()}
				>
					<PlusIcon size={16} />
				</button>

				{isOpen && (
					<div
						className="dropdown"
						ref={refs.setFloating}
						style={{
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
							zIndex: 1000,
						}}
						{...getFloatingProps()}
					>
						{buttonItems.map((item, index) =>
							item.path ? (
								<Link
									key={index}
									to={item.path}
									className="menu-item"
									onClick={() => setIsOpen(false)}
								>
									{item.icon}
									<span>{item.tooltip}</span>
								</Link>
							) : (
								<div
									key={index}
									className="menu-item"
									onClick={() => {
										item.onClick();
										setIsOpen(false);
									}}
								>
									{item.icon}
									<span>{item.tooltip}</span>
								</div>
							),
						)}
					</div>
				)}

				<Dialog
					isOpen={AIsModalVisible}
					onClose={closeAIsModal}
					title={<h2>{t("createDialog")}</h2>}
				>
					{isLoggedIn && (
						<>
							<h3 style={{ marginBottom: "1rem" }}>我的 AIs</h3>
							<Cybots queryUserId={user?.userId} closeModal={closeAIsModal} />
						</>
					)}
					<h3 style={{ marginBottom: "1rem" }}>公共 AIs</h3>
					<Cybots queryUserId={nolotusId} closeModal={closeAIsModal} />
				</Dialog>
			</div>
		</>
	);
};
