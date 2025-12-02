// 文件路径: render/layout/SidebarBottom.tsx

import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  LuSettings,
  LuUser,
  LuPlus,
  LuLogOut,
  LuChevronUp,
  LuWallet,
} from "react-icons/lu";

import { useAuth } from "auth/hooks/useAuth";
import { useAppSelector } from "app/store";
import { SettingRoutePaths } from "app/settings/config";
import {
  selectUsers,
  signOut,
  changeUser,
  selectUserId,
  User,
  fetchUserProfile,
  selectCurrentUserBalance,
} from "auth/authSlice";
import DropdownMenu from "render/web/ui/DropDownMenu";
import { Tooltip } from "render/web/ui/Tooltip";

// 提取 MenuItem 为纯展示组件，增加 memo 优化
const MenuItem = React.memo(
  ({ icon: Icon, text, onClick, className = "", danger = false }: any) => (
    <button
      onClick={onClick}
      className={`dd-item ${className} ${danger ? "danger" : ""}`}
    >
      <Icon size={15} className="dd-icon" />
      <span className="dd-text">{text}</span>
    </button>
  )
);

const SidebarBottom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: authUser } = useAuth();
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);
  const balance = useAppSelector(selectCurrentUserBalance);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const isLoading = typeof balance !== "number";
  const isLowBalance = !isLoading && balance < 10;

  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchUserProfile());
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUserChange = (user: User) => dispatch(changeUser(user));

  const handleLogout = () => {
    dispatch(signOut())
      .unwrap()
      .then(() => navigate("/"));
  };

  const handleInviteFriend = async () => {
    const inviteUrl = `${window.location.origin}/invite-signup?inviterId=${currentUserId}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success(t("linkCopied", "邀请链接已复制"));
    } catch {
      toast.error(t("copyFailed", "复制失败"));
    }
  };

  // Memoize users list
  const otherUsers = useMemo(
    () => users.filter((user) => user && user.userId !== currentUserId),
    [users, currentUserId]
  );

  if (!authUser) return null;

  return (
    <>
      <div className="SidebarBottom">
        <div className="section-user">
          <Tooltip
            content={t("currentAccount", "当前账户")}
            placement="top"
            disabled={isMobile}
          >
            <NavLink
              to="/life"
              className={({ isActive }) =>
                `user-card ${isActive ? "active" : ""}`
              }
            >
              <div className="avatar-placeholder">
                <LuUser size={16} />
              </div>
              <div className="user-meta">
                <span className="username">{authUser.username}</span>
                <div className={`balance-tag ${isLowBalance ? "low" : ""}`}>
                  <LuWallet size={10} className="balance-icon" />
                  <span>{isLoading ? "..." : `¥${balance.toFixed(2)}`}</span>
                </div>
              </div>
            </NavLink>
          </Tooltip>
        </div>

        <div className="section-actions">
          <button
            className="btn-recharge"
            onClick={() => navigate("/recharge")}
          >
            {t("recharge", "充值")}
          </button>

          <DropdownMenu
            trigger={
              <button className="btn-menu-trigger">
                <LuChevronUp size={16} />
              </button>
            }
            direction="top"
            triggerType={isMobile ? "click" : "hover"}
            width="200px" // 给定宽度，让菜单更稳重
          >
            <div className="menu-list">
              {otherUsers.length > 0 && (
                <>
                  <div className="menu-label">
                    {t("switchAccount", "切换账户")}
                  </div>
                  {otherUsers.map((user) => (
                    <MenuItem
                      key={`user-${user.userId}`}
                      icon={LuUser}
                      text={user.username}
                      onClick={() => handleUserChange(user)}
                    />
                  ))}
                  <div className="menu-divider" />
                </>
              )}

              <MenuItem
                icon={LuPlus}
                text={t("inviteFriend", "邀请朋友")}
                onClick={handleInviteFriend}
                className="highlight"
              />
              <MenuItem
                icon={LuSettings}
                text={t("settings.title", "设置")}
                onClick={() => navigate(SettingRoutePaths.SETTING)}
              />
              <div className="menu-divider" />
              <MenuItem
                icon={LuLogOut}
                text={t("logout", "退出登录")}
                onClick={handleLogout}
                danger
              />
            </div>
          </DropdownMenu>
        </div>
      </div>

      <style href="SidebarBottom-styles" precedence="medium">{`
        .SidebarBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-3);
          height: 64px; /* 稍微增加高度，更显大气 */
          flex-shrink: 0;
          background: var(--backgroundSecondary); /* 稍微区分于主内容区的背景 */
          border-top: 1px solid var(--border);
          gap: var(--space-2);
          user-select: none;
        }

        .section-user {
          flex: 1;
          min-width: 0;
          display: flex;
        }

        .section-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        /* User Card Styling */
        .user-card {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 6px 8px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text);
          transition: background 0.2s ease;
          width: 100%;
          max-width: 180px;
        }

        .user-card:hover {
          background: var(--backgroundHover);
        }

        .user-card.active .avatar-placeholder {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--background);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--textTertiary);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .username {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        /* Balance Styling */
        .balance-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--textTertiary);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .balance-tag.low {
          color: var(--error);
        }
        
        .balance-tag.low .balance-icon {
          color: var(--error);
        }

        /* Actions */
        .btn-recharge {
          height: 28px;
          padding: 0 12px;
          border-radius: 14px; /* 胶囊按钮 */
          border: 1px solid var(--border);
          background: transparent;
          color: var(--textSecondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-recharge:hover {
          color: var(--primary);
          border-color: var(--primaryLight);
          background: var(--primaryGhost);
        }
        
        .btn-menu-trigger {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--textTertiary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-menu-trigger:hover, 
        .btn-menu-trigger:active { // 也可以根据 Dropdown 状态添加 .active 类
          background: var(--backgroundHover);
          color: var(--text);
        }

        /* Dropdown Content */
        .menu-list {
          padding: 4px;
        }
        
        .menu-label {
          padding: 8px 10px 4px;
          font-size: 11px;
          color: var(--textQuaternary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .menu-divider {
          height: 1px;
          background: var(--borderLight);
          margin: 4px 0;
        }

        .dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease-out;
          color: var(--textSecondary);
          text-align: left;
        }

        .dd-item:hover {
          background: var(--backgroundHover);
          color: var(--text);
          transform: translateX(2px); /* 细微的位移反馈 */
        }

        .dd-icon {
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .dd-item:hover .dd-icon {
          opacity: 1;
        }

        .dd-text {
          font-size: 13px;
          flex: 1;
        }
        
        .dd-item.highlight {
          color: var(--primary);
        }
        .dd-item.highlight:hover {
          background: var(--primaryGhost);
        }
        
        .dd-item.danger {
          color: var(--error);
        }
        .dd-item.danger:hover {
          background: color-mix(in srgb, var(--error) 8%, transparent);
        }

        @media (max-width: 768px) {
          .SidebarBottom { 
            padding: 0 var(--space-2); 
            height: 56px; 
          }
          .balance-tag { display: none; }
          .username { max-width: 100px; }
        }
      `}</style>
    </>
  );
};

export default SidebarBottom;
