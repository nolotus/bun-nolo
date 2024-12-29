import Cybots from "ai/cybot/web/Cybots";
import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { selectCurrentUserId } from "auth/authSlice";
import { nolotusId } from "core/init";
import { CreateRoutePaths } from "create/routePaths";
import withTranslations from "i18n/withTranslations";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import { RiFileAddLine, RiMessage2Line, RiRobotLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";

const Button = ({
	children,
	onClick,
	className = "",
}: {
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}) => {
	const theme = useAppSelector(selectTheme);

	return (
		<>
			<style>{`
        .guide-button {
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          color: ${theme.text};
        }
      `}</style>
			<button onClick={onClick} className={`guide-button ${className}`}>
				{children}
			</button>
		</>
	);
};

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

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons, onButtonClick }) => {
	const theme = useAppSelector(selectTheme);

	return (
		<>
			<style>{`
        .button-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .group-button {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .group-button:hover {
          background-color: ${theme.backgroundSecondary};
        }
        .button-description {
          color: ${theme.textSecondary};
          font-size: 0.875rem;
        }
        .button-title {
          font-weight: 500;
        }
      `}</style>
			<div className="button-group">
				{buttons.map((button) => (
					<Button
						key={button.text}
						onClick={() => onButtonClick(button.route)}
						className="group-button"
					>
						{button.icon}
						<div>
							<div className="button-title">{button.text}</div>
							{button.description && (
								<small className="button-description">
									{button.description}
								</small>
							)}
						</div>
					</Button>
				))}
			</div>
		</>
	);
};

const ChatGuide = () => {
	const navigate = useNavigate();
	const userId = useAppSelector(selectCurrentUserId);
	const theme = useAppSelector(selectTheme);

	const buttonsInfo = useMemo(
		() => [
			{
				text: "Cybot",
				route: `/${CreateRoutePaths.CREATE_CYBOT}`,
				icon: <RiRobotLine size={24} className="section-icon" />,
				description: "创建智能对话机器人",
			},
			{
				text: "空白页面",
				route: `/${CreateRoutePaths.CREATE_PAGE}`,
				icon: <RiFileAddLine size={24} className="section-icon" />,
				description: "从空白页面开始创作",
			},
			{
				text: "提示词",
				route: `/${CreateRoutePaths.CREATE_PROMPT}`,
				icon: <RiMessage2Line size={24} className="section-icon" />,
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
			icon: <HiOutlineTemplate size={16} className="section-icon" />,
		})) ?? [];

	return (
		<>
			<style>{`
        .guide-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .guide-header {
          margin-bottom: 32px;
        }
        .header-title {
          font-size: 28px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
        }
        .guide-section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 500;
          color: ${theme.text};
          display: flex;
          align-items: center;
          margin: 0 0 16px 0;
        }
        .section-description {
          color: ${theme.textSecondary};
          margin: 0 0 16px 0;
        }
        .section-icon {
          margin-right: 12px;
          color: ${theme.primary};
        }
      `}</style>

			<div className="guide-container">
				<header className="guide-header">
					<h1 className="header-title">开始创建</h1>
				</header>

				<section className="guide-section">
					<h2 className="section-title">
						<RiRobotLine size={24} className="section-icon" /> 快速创建
					</h2>
					<ButtonGroup buttons={buttonsInfo} onButtonClick={navigate} />
				</section>

				<section className="guide-section">
					<h2 className="section-title">
						<HiOutlineTemplate size={20} className="section-icon" /> 从模板创建
					</h2>
					<p className="section-description">
						使用精心设计的模板，快速开始你的项目
					</p>
					<ButtonGroup buttons={templateButtons} onButtonClick={navigate} />
				</section>

				<section className="guide-section">
					<h2 className="section-title">
						<FiUsers size={20} className="section-icon" /> 我的机器人
					</h2>
					{userId && <Cybots queryUserId={userId} limit={48} />}
				</section>

				<section className="guide-section">
					<h2 className="section-title">
						<BiSearch size={20} className="section-icon" /> 探索社区
					</h2>
					<Cybots queryUserId={nolotusId} limit={12} />
				</section>
			</div>
		</>
	);
};

export default withTranslations(ChatGuide, ["chat", "ai"]);
