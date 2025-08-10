// 文件路径: render/layout/SidebarBottom.tsx

import React, { useEffect, useState } from "react";
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
} from "react-icons/lu";

import { useAuth } from "auth/hooks/useAuth";
import { useBalance } from "auth/hooks/useBalance";
import { useAppSelector } from "app/store";
import { SettingRoutePaths } from "app/settings/config";
import {
  selectUsers,
  signOut,
  changeUser,
  selectUserId,
  User,
} from "auth/authSlice";
import DropdownMenu from "render/web/ui/DropDownMenu";
import { Tooltip } from "render/web/ui/Tooltip";

// 1. 代码简化：提取为可复用的 MenuItem 子组件
const MenuItem = ({ icon: Icon, text, onClick, className = "" }) => (
  <button onClick={onClick} className={`dd-item ${className}`}>
    <Icon size={14} />
    <span>{text}</span>
  </button>
);

const SidebarBottom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useAuth();
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);
  const { balance, loading, error } = useBalance();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const isLowBalance = !loading && !error && balance < 10;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUserChange = (user: User) => {
    dispatch(changeUser(user));
  };

  const handleLogout = () => {
    dispatch(signOut())
      .unwrap()
      .then(() => navigate("/"));
  };

  const handleRecharge = () => {
    navigate("/recharge");
  };

  const handleInviteFriend = async () => {
    const inviteUrl = `${window.location.origin}/invite-signup?inviterId=${currentUserId}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("邀请链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const otherUsers = users.filter(
    (user) => user && user.userId !== currentUserId
  );

  if (!authUser) return null;

  return (
    <>
      <div className="SidebarBottom">
        <div className="left-content">
          <Tooltip content="当前登录账户" placement="top" disabled={isMobile}>
            <NavLink
              to="/life"
              className={({ isActive }) =>
                `user-info-link ${isActive ? "active" : ""}`
              }
            >
              <LuUser size={16} />
              <span className="username">{authUser.username}</span>
            </NavLink>
          </Tooltip>
          <span className={`balance ${isLowBalance ? "low" : ""}`}>
            {loading ? "..." : error ? "N/A" : `¥${balance.toFixed(2)}`}
          </span>
        </div>

        <div className="right-content">
          <button className="recharge-btn" onClick={handleRecharge}>
            {t("recharge", "充值")}
          </button>
          <DropdownMenu
            trigger={
              <button className="menu-trigger">
                <LuChevronUp size={16} />
              </button>
            }
            direction="top"
            triggerType={isMobile ? "click" : "hover"}
          >
            <div className="compact-dropdown">
              {otherUsers.length > 0 && (
                <>
                  {otherUsers.map((user) => (
                    <MenuItem
                      key={`user-${user.userId}`}
                      icon={LuUser}
                      text={user.username}
                      onClick={() => handleUserChange(user)}
                    />
                  ))}
                  <div className="divider" />
                </>
              )}
              <MenuItem
                icon={LuPlus}
                text={t("inviteFriend", "邀请朋友")}
                onClick={handleInviteFriend}
                className="invite"
              />
              <MenuItem
                icon={LuSettings}
                text={t("settings.title", "设置")}
                onClick={() => navigate(SettingRoutePaths.SETTING)}
              />
              <MenuItem
                icon={LuLogOut}
                text={t("logout", "退出")}
                onClick={handleLogout}
                className="logout"
              />
            </div>
          </DropdownMenu>
        </div>
      </div>

      <style href="SidebarBottom-compact" precedence="medium">{`
        .SidebarBottom {
          display: flex;
          align-items: center;
          justify-content: space-between; /* 2. 布局优化：左右内容分离 */
          padding: 0 var(--space-3);
          border-top: 1px solid var(--border);
          background: var(--background);
          height: 48px;
          flex-shrink: 0;
          gap: var(--space-2);
        }

        .left-content, .right-content {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .left-content {
          flex: 1; /* 3. 兼容长用户名：让左侧区域自适应伸缩 */
          min-width: 0;
        }

        .right-content {
          flex-shrink: 0;
        }

        .user-info-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1; /* 3. 兼容长用户名：让链接填满可用空间 */
          min-width: 0; /* 允许 flex item 收缩到比内容还小 */
          padding: var(--space-1) var(--space-2);
          text-decoration: none;
          color: var(--text);
          border-radius: 4px;
          transition: background 0.15s ease;
        }

        .user-info-link:hover {
          background: var(--backgroundHover);
        }

        .user-info-link.active {
          background: var(--backgroundSelected);
          font-weight: 500;
        }

        .user-info-link svg {
          color: var(--textTertiary);
          flex-shrink: 0;
        }

        .username {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis; /* 3. 兼容长用户名：超长时显示省略号 */
        }

        .balance {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          white-space: nowrap;
          font-feature-settings: 'tnum';
        }

        .balance.low {
          color: var(--error);
        }

        .recharge-btn {
          background: var(--primaryGhost);
          color: var(--primary);
          border: 1px solid transparent;
          border-radius: 4px;
          padding: var(--space-1) var(--space-2);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .recharge-btn:hover {
          background: var(--primaryHover);
          border-color: var(--primary);
        }

        .recharge-btn:active {
          transform: scale(0.96);
        }

        .menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: var(--space-1);
          border-radius: 4px;
          color: var(--textTertiary);
          transition: all 0.15s ease;
        }
        
        .menu-trigger:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .menu-trigger:active {
          transform: scale(0.92);
        }

        .compact-dropdown {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: var(--space-1);
          min-width: 180px;
          box-shadow: var(--shadowMedium);
          margin-bottom: var(--space-1);
        }

        .dd-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2);
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          color: var(--textSecondary);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          text-align: left;
        }
        
        .dd-item:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .dd-item svg {
          color: var(--textQuaternary);
        }

        .dd-item:hover svg {
          color: var(--textTertiary);
        }
        
        .dd-item.invite { color: var(--primary); }
        .dd-item.invite:hover { background: var(--primaryHover); }
        .dd-item.invite svg { color: var(--primary); }

        .dd-item.logout:hover {
          background: color-mix(in srgb, var(--error) 10%, transparent);
          color: var(--error);
        }
        .dd-item.logout:hover svg { color: var(--error); }

        .divider {
          height: 1px;
          background: var(--border);
          margin: var(--space-1);
        }

        @media (max-width: 768px) {
          .SidebarBottom { padding: 0 var(--space-2); gap: var(--space-1); }
          .left-content, .right-content { gap: var(--space-2); }
          .balance { display: none; } /* 在移动端窄视图下隐藏余额 */
        }
      `}</style>
    </>
  );
};

export default SidebarBottom;
