import Cybots from "ai/cybot/Cybots";
import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { selectCurrentUserId } from "auth/authSlice";
import { nolotusId } from "core/init";
import { CreateRoutePaths } from "create/routes";
import withTranslations from "i18n/withTranslations";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import { RiFileAddLine, RiMessage2Line, RiRobotLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
const Button = ({
	children,
	onClick,
	style,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	style?: React.CSSProperties;
}) => (
	<button
		onClick={onClick}
		style={{
			cursor: "pointer",
			border: "none",
			background: "none",
			width: "100%",
			textAlign: "left",
			...style,
		}}
	>
		{children}
	</button>
);

interface ButtonInfo {
	text: string;
	route: string;
	icon?: React.ReactNode;
	description?: string;
}

interface ButtonGroupProps {
	buttons: ButtonInfo[];
	onButtonClick: (route: string) => void;
}

const styles = {
	container: {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "1rem", // 减小
	},

	header: {
		textAlign: "center" as const,
		marginBottom: "1.5rem", // 减小
	},

	headerTitle: {
		fontSize: "2.2rem", // 增大
		fontWeight: 600,
		marginBottom: "1.5rem", // 增加
		color: defaultTheme.text,
	},
	section: {
		marginBottom: "1rem", // 从1.5rem减到1rem
		padding: "1.2rem", // 从1.5rem减到1.2rem
		borderRadius: "16px",
	},

	sectionTitle: {
		fontSize: "1.6rem", // 增大
		fontWeight: 600,
		marginBottom: "1.5rem", // 增加
		color: defaultTheme.text,
		display: "flex",
		alignItems: "center",
		gap: "0.75rem", // 增加
	},
	buttonGroup: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // 增大
		gap: "1.25rem", // 增加
		marginTop: "1.8rem", // 增加
	},
	button: {
		display: "flex",
		alignItems: "center",
		padding: "1.5rem", // 增加
		borderRadius: "12px",
		border: `1px solid ${defaultTheme.border}`,
		background: defaultTheme.background,
		transition: "all 0.2s ease",
		gap: "16px", // 增加
		"&:hover": {
			background: defaultTheme.backgroundHover,
			transform: "translateY(-1px)",
			boxShadow: `0 2px 4px ${defaultTheme.shadowLight}`,
		},
	},
	icon: {
		color: defaultTheme.textSecondary,
		fontSize: "24px", // 新增
	},
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
	buttons,
	onButtonClick,
}) => (
	<div style={styles.buttonGroup}>
		{buttons.map((button) => (
			<Button
				key={button.text}
				onClick={() => onButtonClick(button.route)}
				style={styles.button}
			>
				{button.icon}
				<div>
					<div style={{ fontWeight: 500 }}>{button.text}</div>
					{button.description && (
						<small style={{ color: defaultTheme.textSecondary }}>
							{button.description}
						</small>
					)}
				</div>
			</Button>
		))}
	</div>
);

const ChatGuide = () => {
	const navigate = useNavigate();
	const userId = useAppSelector(selectCurrentUserId);

	const buttonsInfo = useMemo(
		() => [
			{
				text: "Cybot",
				route: `/${CreateRoutePaths.CREATE_CYBOT}`,
				icon: <RiRobotLine size={24} style={styles.icon} />,
				description: "创建智能对话机器人",
			},
			{
				text: "空白页面",
				route: `/${CreateRoutePaths.CREATE_PAGE}`,
				icon: <RiFileAddLine size={24} style={styles.icon} />,
				description: "从空白页面开始创作",
			},
			{
				text: "提示词",
				route: `/${CreateRoutePaths.CREATE_PROMPT}`,
				icon: <RiMessage2Line size={24} style={styles.icon} />,
				description: "管理和创建提示词模板",
			},
		],
		[],
	);

	const { data: templates } = useQueryData({
		queryUserId: nolotusId,
		options: {
			isJSON: true,
			condition: { is_template: true },
			limit: 20,
		},
	});

	const templateButtons =
		templates?.map((template) => ({
			text: template.title,
			route: `/create/page?id=${template.id}`,
			description: template.description || "使用此模板快速开始",
			icon: <HiOutlineTemplate size={16} style={styles.icon} />,
		})) ?? [];

	return (
		<div style={styles.container}>
			<header style={styles.header}>
				<h1 style={styles.headerTitle}>开始创建</h1>
			</header>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>
					<RiRobotLine size={24} style={styles.icon} /> 快速创建
				</h2>

				<ButtonGroup buttons={buttonsInfo} onButtonClick={navigate} />
			</section>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>
					<HiOutlineTemplate size={20} style={styles.icon} /> 从模板创建
				</h2>
				<p style={styles.description}>使用精心设计的模板，快速开始你的项目</p>
				<ButtonGroup buttons={templateButtons} onButtonClick={navigate} />
			</section>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>
					<FiUsers size={20} style={styles.icon} /> 我的机器人
				</h2>
				{userId && <Cybots queryUserId={userId} limit={48} />}
			</section>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>
					<BiSearch size={20} style={styles.icon} /> 探索社区
				</h2>
				<Cybots queryUserId={nolotusId} limit={12} />
			</section>
		</div>
	);
};

export default withTranslations(ChatGuide, ["chat", "ai"]);
