import {
	GearIcon,
	PersonIcon,
	SignOutIcon,
	TriangleDownIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { changeCurrentUser, selectUsers, signOut } from "auth/authSlice";
import { getTokensFromLocalStorage, removeToken } from "auth/client/token";
import { parseToken } from "auth/token";
import { useAuth } from "auth/useAuth";
import type React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
import DropDown from "render/ui/DropDown";
import { SettingRoutePaths } from "setting/config";

interface IconButtonProps {
	icon: React.ReactNode;
	to?: string;
	onClick?: () => void;
	isActive?: boolean;
}

const styles = {
	menu: {
		wrapper: {
			display: "flex",
			alignItems: "center",
			padding: "10px 16px",
		},
	},

	iconButton: {
		base: {
			background: "transparent",
			border: "none",
			cursor: "pointer",
			padding: "6px",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: "6px",
			transition: "all 0.15s ease",
			color: defaultTheme.text,
		},
		active: {
			backgroundColor: defaultTheme.backgroundGhost,
		},
		hover: {
			backgroundColor: defaultTheme.backgroundGhost,
		},
	},

	userTrigger: {
		base: {
			display: "flex",
			alignItems: "center",
			cursor: "pointer",
			textDecoration: "none",
			color: defaultTheme.text,
			padding: "6px 10px",
			borderRadius: "6px",
			transition: "all 0.15s ease",
		},
		active: {
			backgroundColor: defaultTheme.backgroundGhost,
		},
		hover: {
			backgroundColor: defaultTheme.backgroundGhost,
		},
		text: {
			fontSize: "14px",
			fontWeight: "500",
			marginLeft: "6px",
		},
	},

	dropDown: {
		wrapper: {
			padding: "8px",
			minWidth: "200px",
			backgroundColor: defaultTheme.background,
			borderRadius: "10px",
			boxShadow: `0 4px 12px ${defaultTheme.shadowLight}`,
			border: `1px solid ${defaultTheme.border}`,
		},
		item: {
			display: "flex",
			alignItems: "center",
			width: "100%",
			textAlign: "left",
			padding: "8px 12px",
			border: "none",
			background: "none",
			cursor: "pointer",
			borderRadius: "6px",
			transition: "all 0.15s ease",
			color: defaultTheme.text,
			fontSize: "13px",
			fontWeight: 500,
		},
		icon: {
			marginRight: "6px",
			color: defaultTheme.textSecondary,
		},
	},

	navLink: {
		textDecoration: "none",
		color: defaultTheme.text,
	},
};

const IconButton: React.FC<IconButtonProps> = ({
	icon,
	to,
	onClick,
	isActive,
}) => {
	const buttonStyle = {
		...styles.iconButton.base,
		...(isActive ? styles.iconButton.active : {}),
	};

	const content = (
		<button
			onClick={onClick}
			style={buttonStyle}
			onMouseEnter={(e) =>
				!isActive &&
				(e.currentTarget.style.backgroundColor =
					styles.iconButton.hover.backgroundColor)
			}
			onMouseLeave={(e) =>
				!isActive && (e.currentTarget.style.backgroundColor = "transparent")
			}
		>
			{icon}
		</button>
	);

	if (to) {
		return (
			<NavLink to={to} style={styles.navLink}>
				{content}
			</NavLink>
		);
	}
	return content;
};

export const IsLoggedInMenu: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const auth = useAuth();
	const dispatch = useAppDispatch();
	const users = useAppSelector(selectUsers);
	const location = useLocation();
	const isLifeActive = location.pathname === "/life";
	const currentToken = useSelector((state: any) => state.auth.currentToken);

	const changeUser = (user: any) => {
		const tokens = getTokensFromLocalStorage();
		const updatedToken = tokens.find(
			(t) => parseToken(t).userId === user.userId,
		);
		if (updatedToken) {
			const newTokens = [
				updatedToken,
				...tokens.filter((t) => t !== updatedToken),
			];
			dispatch(changeCurrentUser({ user, token: updatedToken }));
			window.localStorage.setItem("tokens", JSON.stringify(newTokens));
		}
	};

	const logout = () => {
		removeToken(currentToken);
		dispatch(signOut());
		navigate("/");
	};

	const userTrigger = (
		<div
			style={{
				...styles.userTrigger.base,
				...(isLifeActive ? styles.userTrigger.active : {}),
			}}
			onMouseEnter={(e) =>
				!isLifeActive &&
				(e.currentTarget.style.backgroundColor =
					styles.userTrigger.hover.backgroundColor)
			}
			onMouseLeave={(e) =>
				!isLifeActive && (e.currentTarget.style.backgroundColor = "transparent")
			}
		>
			<PersonIcon size={20} />
			<span style={styles.userTrigger.text}>{auth.user?.username}</span>
		</div>
	);

	const renderDropdownItem = (
		label: string,
		icon?: React.ReactNode,
		onClick?: () => void,
	) => (
		<button
			onClick={onClick}
			style={styles.dropDown.item}
			onMouseEnter={(e) =>
				(e.currentTarget.style.backgroundColor = defaultTheme.backgroundGhost)
			}
			onMouseLeave={(e) =>
				(e.currentTarget.style.backgroundColor = "transparent")
			}
		>
			{icon && <span style={styles.dropDown.icon}>{icon}</span>}
			<span>{label}</span>
		</button>
	);

	return (
		<div style={styles.menu.wrapper}>
			<NavLink to="/life" style={styles.navLink}>
				{userTrigger}
			</NavLink>

			<DropDown
				trigger={
					<IconButton
						icon={<TriangleDownIcon size={20} />}
						onClick={() => {}}
					/>
				}
				direction="bottom"
				triggerType="click"
			>
				<div style={styles.dropDown.wrapper}>
					{users.map(
						(user) =>
							user !== auth.user &&
							user &&
							renderDropdownItem(user.username, null, () => changeUser(user)),
					)}

					{renderDropdownItem(
						t("common:settings"),
						<GearIcon size={16} />,
						() => navigate(SettingRoutePaths.SETTING),
					)}

					{renderDropdownItem(
						t("common:logout"),
						<SignOutIcon size={16} />,
						logout,
					)}
				</div>
			</DropDown>
		</div>
	);
};
