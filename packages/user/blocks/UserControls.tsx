import { useAppSelector } from "app/hooks";
import { RoutePaths } from "auth/client/routes";
import React from "react";
import { useTranslation } from "react-i18next";

import { UserMenu } from "./UserMenu";
import { SignInIcon } from "@primer/octicons-react";
import { NavLink } from "react-router-dom";

const AuthLinks = () => {
	const { t } = useTranslation();

	return (
		<div style={{ display: "flex", alignItems: "center" }}>
			<NavLink
				target="_self"
				to={RoutePaths.LOGIN}
				style={{
					display: "flex",
					alignItems: "center",
					marginRight: "16px",
					fontSize: "16px",
					color: "#444", // Gray color for login link
					fontWeight: "500",
				}}
			>
				<span
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginRight: "8px",
						height: "16px", // Ensure this matches the icon size
					}}
				>
					<SignInIcon size={24} />
				</span>
				{t("login")}
			</NavLink>
			<NavLink
				target="_self"
				to={RoutePaths.REGISTER}
				style={{
					display: "inline-block",
					fontSize: "16px",
					color: "#FFFFFF",
					backgroundColor: "#10B981", // Emerald color for signup button
					fontWeight: "600",
					padding: "8px 16px",
					textDecoration: "none",
					boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
					transition: "background-color 0.2s ease",
				}}
				onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
				onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#10B981")}
			>
				{t("signup")}
			</NavLink>
		</div>
	);
};

export default AuthLinks;
export const UserControls = () => {
	const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

	return (
		<div className="flex items-center">
			{isLoggedIn ? <UserMenu /> : <AuthLinks />}
		</div>
	);
};
