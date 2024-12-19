import { useQueryData } from "app/hooks/useQueryData";
import { nolotusId } from "core/init";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { BASE_COLORS } from "render/styles/colors";
import { Button } from "render/ui/Button";

import { YourTemplates } from "./YourTemplates";
import { CreateRoutePaths } from "./routes";

const ButtonGroup = ({ buttons, onButtonClick }) => (
	<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
		{buttons.map((button) => (
			<Button key={button.text} onClick={() => onButtonClick(button.route)}>
				{button.text}
			</Button>
		))}
	</div>
);

const Create = () => {
	const navigate = useNavigate();

	const buttonsInfo = useMemo(
		() => [
			{ text: "Cybot", route: `/${CreateRoutePaths.CREATE_CYBOT}` },
			{ text: "空白页面", route: `/${CreateRoutePaths.CREATE_PAGE}` },
			{ text: "提示词", route: `/${CreateRoutePaths.CREATE_PROMPT}` },
		],
		[],
	);

	const options = {
		isJSON: true,
		condition: { is_template: true },
		limit: 20,
	};

	const queryConfig = useMemo(
		() => ({
			queryUserId: nolotusId,
			options,
		}),
		[options],
	);

	const { data: templates, isLoading, error } = useQueryData(queryConfig);

	const handleButtonClick = (route) => {
		navigate(route);
	};
	const templateButtons = useMemo(
		() =>
			templates?.map((template) => ({
				text: template.title,
				route: `/create/page?id=${template.id}`,
			})) ?? [],
		[templates],
	);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div
			style={{
				maxWidth: "1200px",
				margin: "0 auto",
				padding: "2rem",
			}}
		>
			{/* 基础创建部分 */}
			<section
				style={{
					background: BASE_COLORS.light.backgroundSecondary,
					borderRadius: "8px",
					padding: "24px",
					marginBottom: "24px",
					border: `1px solid ${BASE_COLORS.light.border}`,
				}}
			>
				<h2
					style={{
						fontSize: "1.5em",
						fontWeight: "bold",
						marginBottom: "16px",
						color: BASE_COLORS.light.text,
					}}
				>
					快速创建
				</h2>
				<ButtonGroup buttons={buttonsInfo} onButtonClick={handleButtonClick} />
			</section>

			{/* 模板创建部分 */}
			<section
				style={{
					background: BASE_COLORS.light.backgroundSecondary,
					borderRadius: "8px",
					padding: "24px",
					marginBottom: "24px",
					border: `1px solid ${BASE_COLORS.light.border}`,
				}}
			>
				<h2
					style={{
						fontSize: "1.5em",
						fontWeight: "bold",
						marginBottom: "16px",
						color: BASE_COLORS.light.text,
					}}
				>
					从模板创建
				</h2>
				<ButtonGroup
					buttons={templateButtons}
					onButtonClick={handleButtonClick}
				/>
			</section>

			<YourTemplates />
		</div>
	);
};

export default Create;
