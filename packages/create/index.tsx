import { useQueryData } from "app/hooks/useQueryData";
import { nolotusId } from "core/init";
import type React from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
import { Button } from "render/ui/Button";
import { YourTemplates } from "./YourTemplates";
import { CreateRoutePaths } from "./routes";

interface ButtonInfo {
	text: string;
	route: string;
}

interface ButtonGroupProps {
	buttons: ButtonInfo[];
	onButtonClick: (route: string) => void;
}

const styles = {
	container: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "2rem",
	},
	buttonGroup: {
		display: "flex",
		flexWrap: "wrap" as const,
		gap: "12px",
	},
	section: {
		background: defaultTheme.backgroundSecondary,
		borderRadius: "12px",
		padding: "24px",
		marginBottom: "24px",
		border: `1px solid ${defaultTheme.border}`,
		boxShadow: `0 1px 3px ${defaultTheme.shadowLight}`,
	},
	sectionTitle: {
		fontSize: "20px",
		fontWeight: 600,
		marginBottom: "20px",
		color: defaultTheme.text,
	},
	loadingError: {
		textAlign: "center" as const,
		padding: "24px",
		color: defaultTheme.textSecondary,
	},
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
	buttons,
	onButtonClick,
}) => (
	<div style={styles.buttonGroup}>
		{buttons.map((button) => (
			<Button key={button.text} onClick={() => onButtonClick(button.route)}>
				{button.text}
			</Button>
		))}
	</div>
);

const Create: React.FC = () => {
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
	const handleButtonClick = (route: string) => {
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

	if (isLoading) return <div style={styles.loadingError}>加载中...</div>;
	if (error)
		return <div style={styles.loadingError}>错误: {error.message}</div>;

	return (
		<div style={styles.container}>
			{/* 基础创建部分 */}
			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>快速创建</h2>
				<ButtonGroup buttons={buttonsInfo} onButtonClick={handleButtonClick} />
			</section>

			{/* 模板创建部分 */}
			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>从模板创建</h2>
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
