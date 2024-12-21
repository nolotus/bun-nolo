import * as Ariakit from "@ariakit/react";
import { defaultTheme } from "render/styles/colors";

import React from "react";

export interface MenuItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	submenu?: MenuItem[];
}

interface ContextMenuProps {
	menu: Ariakit.MenuStore;
	anchorRect: { x: number; y: number };
	items: MenuItem[];
	theme?: typeof defaultTheme;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
	menu,
	anchorRect,
	items,
	theme = defaultTheme,
}) => {
	const menuStyle: React.CSSProperties = {
		backgroundColor: "#ffffff",
		color: "#000000",
		border: "1px solid #e5e7eb",
		borderRadius: "8px",
		padding: "4px 0",
		boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
		minWidth: "180px",
		fontSize: "14px",
		zIndex: 2,
	};

	const iconStyle: React.CSSProperties = {
		marginRight: "8px",
		color: theme.primary,
		flexShrink: 0,
	};

	const arrowStyle: React.CSSProperties = {
		marginLeft: "auto",
		fontSize: "12px",
		color: theme.primary,
	};

	const renderMenuItem = (item: MenuItem) => {
		if (item.submenu) {
			const submenuStore = Ariakit.useMenuStore({
				placement: "right-start",
				shift: 10,
				gutter: 4,
			});

			return (
				<React.Fragment key={item.id}>
					<Ariakit.MenuButton
						store={submenuStore}
						className="menu-item"
						disabled={item.disabled}
					>
						{item.icon && <span style={iconStyle}>{item.icon}</span>}
						{item.label}
						<span style={arrowStyle}>▶</span>
					</Ariakit.MenuButton>

					<Ariakit.Menu store={submenuStore} style={menuStyle}>
						{item.submenu.map(renderMenuItem)}
					</Ariakit.Menu>
				</React.Fragment>
			);
		}

		return (
			<Ariakit.MenuItem
				key={item.id}
				onClick={item.disabled ? undefined : item.onClick}
				className="menu-item"
				disabled={item.disabled}
			>
				{item.icon && <span style={iconStyle}>{item.icon}</span>}
				{item.label}
			</Ariakit.MenuItem>
		);
	};

	return (
		<>
			<style>
				{`
          .menu-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            cursor: pointer;
            color: #000000;
            transition: background-color 0.2s ease;
            user-select: none;
            width: 100%;
            border: none;
            background: none;
            text-align: left;
            font-size: inherit;
          }

          .menu-item:not(:disabled):hover {
            background-color: ${theme.primaryBg};
          }

          .menu-item:disabled {
            opacity: 0.5;
            cursor: default;
          }
        `}
			</style>
			<Ariakit.Menu
				store={menu}
				modal
				getAnchorRect={() => anchorRect}
				style={menuStyle}
			>
				{items.map(renderMenuItem)}
			</Ariakit.Menu>
		</>
	);
};
