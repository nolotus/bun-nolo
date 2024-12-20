import React from "react";
import { useTranslation } from "react-i18next";
import { defaultTheme } from "render/styles/colors";

const EditableTitle = ({ currentDialogConfig }) => {
	const { t } = useTranslation();

	const title = currentDialogConfig.title || t("newDialog");

	const titleContainerStyle = {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		maxWidth: "100%",
	};

	const dialogTitleStyle = {
		margin: 0,
		fontSize: "16px",
		fontWeight: 600,
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
		color: defaultTheme.text,
	};

	return (
		<div style={titleContainerStyle}>
			<h1 style={dialogTitleStyle}>{title}</h1>
		</div>
	);
};

export default React.memo(EditableTitle);
