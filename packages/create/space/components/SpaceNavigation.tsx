import React from "react";
import { useParams, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "app/theme";
import { FaCog, FaUsers, FaFile, FaHome } from "react-icons/fa";
import { FiUsers, FiCalendar } from "react-icons/fi";
import { useSpaceData } from "../hooks/useSpaceData";

const SpaceNavigation: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { spaceData, loading } = useSpaceData(spaceId!);

  const currentPath = location.pathname;
  const isHomePage = currentPath === `/space/${spaceId}`;

  // 导航项配置 (包括首页)
  const navItems = [
    {
      path: `/space/${spaceId}`,
      label: "首页",
      icon: <FaHome size={16} />,
      exact: true, // 精确匹配
    },
    {
      path: `/space/${spaceId}/files`,
      label: "文件",
      icon: <FaFile size={16} />,
    },
    {
      path: `/space/${spaceId}/members`,
      label: "成员",
      icon: <FaUsers size={16} />,
    },
    {
      path: `/space/${spaceId}/settings`,
      label: "设置",
      icon: <FaCog size={16} />,
    },
  ];

  const goToHome = () => {
    navigate(`/space/${spaceId}`);
  };

  // 生成基于空间名称的渐变颜色，但使用更和谐的色调
  const generateGradient = (name: string) => {
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;

    // 降低饱和度和亮度，使外观更柔和
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 40%))`;
  };

  return (
    <div className="space-navigation">
      <div className="space-header">
        <div className="space-info">
          <div
            className="space-title"
            onClick={goToHome}
            title={
              loading
                ? "加载中..."
                : spaceData?.name || `空间 ${spaceId?.substring(0, 8)}`
            }
          >
            {loading ? (
              <div className="loading-title">
                <div className="skeleton"></div>
              </div>
            ) : (
              <>
                <div
                  className="space-icon"
                  style={{
                    background: spaceData?.name
                      ? generateGradient(spaceData.name)
                      : theme.primaryGradient,
                  }}
                >
                  {spaceData?.name?.charAt(0)?.toUpperCase() || "#"}
                </div>
                <span className="space-name">
                  {spaceData?.name || `空间 ${spaceId?.substring(0, 8)}`}
                </span>
              </>
            )}
          </div>

          {/* 新增：成员数和创建日期信息 */}
          <div className="space-meta">
            <div className="space-stat">
              <FiUsers className="stat-icon" size={12} />
              <span>
                {loading ? "..." : spaceData?.members?.length || 0} 成员
              </span>
            </div>
            <div className="space-stat">
              <FiCalendar className="stat-icon" size={12} />
              <span>
                {loading
                  ? "..."
                  : new Date(
                      spaceData?.createdAt || Date.now()
                    ).toLocaleDateString() + " 创建"}
              </span>
            </div>
          </div>
        </div>

        <nav className="space-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${item.path === `/space/${spaceId}` ? "home-nav-item" : ""} ${isActive ? "active" : ""}`
              }
              end={item.exact}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <style jsx>{`
        .space-navigation {
          background: ${theme.background};
          border-radius: 14px;
          padding: ${theme.space[3]} ${theme.space[4]};
          box-shadow:
            0 1px 3px ${theme.shadowLight},
            0 0 1px ${theme.shadow1};
          transition: all 0.2s ease;
        }

        .space-navigation:hover {
          box-shadow:
            0 2px 5px ${theme.shadowMedium},
            0 0 1px ${theme.shadow2};
        }

        .space-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .space-info {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
          min-width: 0;
          flex: 1;
        }

        .space-title {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          padding: ${theme.space[1]} ${theme.space[3]} ${theme.space[1]}
            ${theme.space[1]};
          border-radius: 10px;
          transition: all 0.2s ease;
          max-width: 100%;
          position: relative;
        }

        .space-title:hover {
          background: ${theme.backgroundHover};
        }

        .space-title:active {
          background: ${theme.backgroundSelected};
          transform: translateY(1px);
        }

        .space-meta {
          display: flex;
          gap: ${theme.space[4]};
          padding-left: ${theme.space[2]};
        }

        .space-stat {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          font-size: 12px;
          color: ${theme.textTertiary};
        }

        .stat-icon {
          opacity: 0.7;
        }

        .space-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: ${theme.space[2]};
          flex-shrink: 0;
          font-size: 14px;
          text-shadow: 0 1px 2px ${theme.shadowLight};
          box-shadow: 0 1px 2px ${theme.shadowLight};
        }

        .space-name {
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .loading-title {
          display: flex;
          align-items: center;
          width: 160px;
        }

        .skeleton {
          height: 28px;
          width: 100%;
          background: linear-gradient(
            90deg,
            ${theme.background} 25%,
            ${theme.backgroundHover} 50%,
            ${theme.background} 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .space-nav {
          display: flex;
          align-items: center;
          background: ${theme.backgroundHover};
          padding: ${theme.space[1]};
          border-radius: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: ${theme.space[1]} ${theme.space[2]};
          color: ${theme.textSecondary};
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: -0.01em;
        }

        .nav-item:hover {
          color: ${theme.text};
          background: ${theme.background};
        }

        .nav-item.active {
          color: ${theme.primary};
          background: ${theme.background};
        }

        .home-nav-item {
          color: ${theme.text};
          font-weight: 600;
        }

        .home-nav-item.active {
          color: ${theme.primary};
          font-weight: 600;
        }

        .nav-icon {
          margin-right: ${theme.space[1]};
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .space-header {
            flex-direction: column;
            align-items: stretch;
          }

          .space-info {
            margin-bottom: ${theme.space[3]};
          }

          .space-title {
            max-width: 100%;
            width: 100%;
            justify-content: center;
            padding: ${theme.space[2]} ${theme.space[3]};
            border-radius: 8px;
          }

          .space-meta {
            justify-content: center;
            padding-left: 0;
          }

          .space-nav {
            width: 100%;
            justify-content: space-between;
            padding: ${theme.space[1]};
          }

          .nav-item {
            flex: 1;
            justify-content: center;
            text-align: center;
            padding: ${theme.space[2]} ${theme.space[1]};
          }

          .nav-icon {
            margin-right: ${theme.space[1]};
          }
        }

        @media (max-width: 480px) {
          .space-navigation {
            padding: ${theme.space[2]};
          }

          .space-meta {
            flex-direction: column;
            gap: ${theme.space[1]};
            align-items: center;
          }

          .nav-item {
            padding: ${theme.space[2]} ${theme.space[1]};
            font-size: 12px;
          }

          .nav-icon {
            margin-right: ${theme.space[0]};
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceNavigation;
