// create/space/components/SpaceNavigation.tsx
import React from "react";
import { useParams, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "app/theme";
import { FaCog, FaUsers, FaFile, FaHome } from "react-icons/fa";
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

  // 生成基于空间名称的渐变颜色
  const generateGradient = (name: string) => {
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;

    return `linear-gradient(135deg, hsl(${hue1}, 80%, 55%), hsl(${hue2}, 80%, 45%))`;
  };

  return (
    <div className="space-navigation">
      <div className="space-header">
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
          padding: 12px 16px;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 1px rgba(0, 0, 0, 0.08);
          transition: box-shadow 0.3s ease;
        }

        .space-navigation:hover {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 0 1px rgba(0, 0, 0, 0.1);
        }

        .space-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          padding: 6px 12px 6px 6px;
          border-radius: 10px;
          transition: all 0.2s ease;
          max-width: 45%;
          position: relative;
        }

        .space-title:hover {
          background: ${theme.backgroundSecondary};
        }

        .space-title:active {
          background: ${theme.backgroundTertiary};
          transform: translateY(1px);
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
          margin-right: 8px;
          flex-shrink: 0;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
            ${theme.backgroundSecondary} 25%,
            ${theme.backgroundTertiary} 50%,
            ${theme.backgroundSecondary} 75%
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
          background: ${theme.backgroundSecondary};
          padding: 4px;
          border-radius: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 6px 10px;
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
          background: ${theme.backgroundTertiary};
        }

        .nav-item.active {
          color: ${theme.primary};
          background: ${theme.background};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
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
          margin-right: 6px;
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .space-header {
            flex-direction: column;
            align-items: stretch;
          }

          .space-title {
            margin-bottom: 12px;
            max-width: 100%;
            width: 100%;
            justify-content: center;
            padding: 8px 12px;
            border-radius: 8px;
          }

          .space-nav {
            width: 100%;
            justify-content: space-between;
            padding: 4px;
          }

          .nav-item {
            flex: 1;
            justify-content: center;
            text-align: center;
            padding: 8px 6px;
          }

          .nav-icon {
            margin-right: 4px;
          }
        }

        @media (max-width: 480px) {
          .space-navigation {
            padding: 10px;
          }

          .nav-item {
            padding: 8px 6px;
            font-size: 12px;
          }

          .nav-icon {
            margin-right: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceNavigation;
