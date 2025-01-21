import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { nolotusId } from "core/init";
import { CreateRoutePaths } from "create/routePaths";

import React from "react";

//web
import { createPage } from "render/page/pageSlice";

import { useNavigate } from "react-router-dom";
import Cybots from "ai/cybot/web/Cybots";
import {
  DependabotIcon,
  FileAddedIcon,
  PeopleIcon,
  PlusIcon,
  SearchIcon,
} from "@primer/octicons-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectCurrentUserId);
  const createNewPage = async () => {
    const id = await dispatch(createPage()).unwrap();
    console.log("id", id);
    navigate(`/${id}?edit=true`);
  };
  const handleButtonClick = (button) => {
    if (button.action) {
      button.action();
    } else if (button.route) {
      navigate(button.route);
    }
  };

  const buttonsInfo = [
    {
      text: "Cybot",
      route: `/${CreateRoutePaths.CREATE_CYBOT}`,
      icon: <DependabotIcon size={24} />,
      description: "创建智能对话机器人",
    },
    {
      text: "空白页面",
      icon: <FileAddedIcon size={24} />,
      description: "从空白页面开始创作",
      action: createNewPage,
    },
  ];

  return (
    <>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="header-title">开始创建</h1>
          <p className="header-subtitle">选择合适的工具开始你的创作之旅</p>
        </header>

        <section>
          <h2 className="section-title">
            <PlusIcon size={24} className="icon" />
            快速创建
          </h2>
          <div className="button-grid">
            {buttonsInfo.map((button) => (
              <button
                key={button.text}
                className="grid-button"
                onClick={() => handleButtonClick(button)}
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
            <DependabotIcon size={22} className="icon" />
            我的机器人
          </h2>
          {userId && <Cybots queryUserId={userId} limit={48} />}
        </section>

        <section>
          <h2 className="section-title">
            <SearchIcon size={22} className="icon" />
            探索社区
          </h2>
          <Cybots queryUserId={nolotusId} limit={18} />
        </section>
      </div>
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
			  color: ${theme.text};
			  margin-bottom: 1rem;
			}
  
			.header-subtitle {
			  font-size: 1.1rem;
			  color: ${theme.textSecondary};
			  max-width: 600px;
			  margin: 0 auto;
			}
  
			.section-title {
			  font-size: 1.5rem;
			  font-weight: 600;
			  color: ${theme.text};
			  display: flex;
			  align-items: center;
			  gap: 0.75rem;
			  margin-bottom: 1.5rem;
			}
  
			.section-title .icon {
			  color: ${theme.textSecondary};
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
			  background: ${theme.background};
			  border: 1px solid ${theme.border};
			  border-radius: 12px;
			  gap: 1rem;
			  transition: all 0.2s ease;
			}
  
			.button-content:hover {
			  background: ${theme.backgroundHover};
			  transform: translateY(-2px);
			  box-shadow: 0 4px 12px ${theme.shadowLight};
			}
  
			.button-icon {
			  color: ${theme.textSecondary};
			  opacity: 0.85;
			  flex-shrink: 0;
			}
  
			.button-text {
			  flex: 1;
			}
  
			.button-title {
			  font-size: 1.1rem;
			  font-weight: 500;
			  color: ${theme.text};
			  margin-bottom: 0.35rem;
			}
  
			.button-description {
			  font-size: 0.9rem;
			  color: ${theme.textSecondary};
			  line-height: 1.5;
			}
		  `}
      </style>
    </>
  );
};

export default Dashboard;
