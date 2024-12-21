import {
	CommentIcon,
	DependabotIcon,
	FileAddedIcon,
	FileIcon,
	PeopleIcon,
	SearchIcon,
} from "@primer/octicons-react";
import Cybots from "ai/cybot/Cybots";
import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { selectCurrentUserId } from "auth/authSlice";
import { nolotusId } from "core/init";
import { CreateRoutePaths } from "create/routes";
import withTranslations from "i18n/withTranslations";
import { useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";

interface ButtonInfo {
	text: string;
	route: string;
	icon?: React.ReactNode;
	description?: string;
}

const Dashboard = () => {
	const navigate = useNavigate();
	const userId = useAppSelector(selectCurrentUserId);

	const buttonsInfo = useMemo(() => [
		{
			text: "Cybot",
			route: `/${CreateRoutePaths.CREATE_CYBOT}`,
			icon: <DependabotIcon size={24} />,
			description: "创建智能对话机器人",
		},
		{
			text: "空白页面",
			route: `/${CreateRoutePaths.CREATE_PAGE}`,
			icon: <FileAddedIcon size={24} />,
			description: "从空白页面开始创作",
		},
		{
			text: "提示词",
			route: `/${CreateRoutePaths.CREATE_PROMPT}`,
			icon: <CommentIcon size={24} />,
			description: "管理和创建提示词模板",
		},
	]);
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
			icon: <FileIcon size={20} />,
		})) ?? [];

	return (
		<>
			<style>
				{`
			.dashboard-container {
			  max-width: 1200px;
			  margin: 0 auto;
			  padding: 2rem;
			}
  
			.dashboard-header {
			  text-align: center;
			  margin-bottom: 2.5rem;
			}
  
			.header-title {
			  font-size: 2.4rem;
			  font-weight: 600;
			  color: ${defaultTheme.text};
			  margin-bottom: 1rem;
			}
  
			.header-subtitle {
			  font-size: 1.1rem;
			  color: ${defaultTheme.textSecondary};
			  max-width: 600px;
			  margin: 0 auto;
			}
  
			.section-title {
			  font-size: 1.5rem;
			  font-weight: 600;
			  color: ${defaultTheme.text};
			  display: flex;
			  align-items: center;
			  gap: 0.75rem;
			  margin-bottom: 1.5rem;
			}
  
			.section-title .icon {
			  color: ${defaultTheme.textSecondary};
			  opacity: 0.85;
			}
  
			.button-grid {
			  display: grid;
			  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			  gap: 1.25rem;
			  margin-bottom: 2.5rem;
			}
  
			.grid-button {
			  cursor: pointer;
			  border: none;
			  background: none;
			  width: 100%;
			  text-align: left;
			  padding: 0;
			}
  
			.button-content {
			  display: flex;
			  align-items: center;
			  padding: 1.25rem;
			  background: ${defaultTheme.background};
			  border: 1px solid ${defaultTheme.border};
			  border-radius: 12px;
			  gap: 1rem;
			  transition: all 0.2s ease;
			}
  
			.button-content:hover {
			  background: ${defaultTheme.backgroundHover};
			  transform: translateY(-2px);
			  box-shadow: 0 4px 12px ${defaultTheme.shadowLight};
			}
  
			.button-icon {
			  color: ${defaultTheme.textSecondary};
			  opacity: 0.85;
			  flex-shrink: 0;
			}
  
			.button-text {
			  flex: 1;
			}
  
			.button-title {
			  font-size: 1.1rem;
			  font-weight: 500;
			  color: ${defaultTheme.text};
			  margin-bottom: 0.35rem;
			}
  
			.button-description {
			  font-size: 0.9rem;
			  color: ${defaultTheme.textSecondary};
			  line-height: 1.5;
			}
		  `}
			</style>

			<div className="dashboard-container">
				<header className="dashboard-header">
					<h1 className="header-title">开始创建</h1>
					<p className="header-subtitle">选择合适的工具开始你的创作之旅</p>
				</header>

				<section>
					<h2 className="section-title">
						<DependabotIcon size={24} className="icon" />
						快速创建
					</h2>
					<div className="button-grid">
						{buttonsInfo.map((button) => (
							<button
								key={button.text}
								className="grid-button"
								onClick={() => navigate(button.route)}
							>
								<div className="button-content">
									{React.cloneElement(button.icon as React.ReactElement, {
										className: "button-icon",
									})}
									<div className="button-text">
										<div className="button-title">{button.text}</div>
										<div className="button-description">
											{button.description}
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</section>

				<section>
					<h2 className="section-title">
						<FileIcon size={22} className="icon" />
						从模板创建
					</h2>
					<div className="button-grid">
						{templateButtons.map((button) => (
							<button
								key={button.text}
								className="grid-button"
								onClick={() => navigate(button.route)}
							>
								<div className="button-content">
									{React.cloneElement(button.icon as React.ReactElement, {
										className: "button-icon",
									})}
									<div className="button-text">
										<div className="button-title">{button.text}</div>
										<div className="button-description">
											{button.description}
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</section>

				<section>
					<h2 className="section-title">
						<PeopleIcon size={22} className="icon" />
						我的机器人
					</h2>
					{userId && <Cybots queryUserId={userId} limit={48} />}
				</section>

				<section>
					<h2 className="section-title">
						<SearchIcon size={22} className="icon" />
						探索社区
					</h2>
					<Cybots queryUserId={nolotusId} limit={12} />
				</section>
			</div>
		</>
	);
};

export default withTranslations(Dashboard, ["chat", "ai"]);
