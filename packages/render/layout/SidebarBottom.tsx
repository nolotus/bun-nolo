// 文件路径: render/layout/SidebarBottom.tsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  GearIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  ChevronUpIcon,
} from "@primer/octicons-react";

import { useAuth } from "auth/hooks/useAuth";
import { useBalance } from "auth/hooks/useBalance";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
import { SettingRoutePaths } from "app/settings/config";
import {
  selectUsers,
  signOut,
  changeUser,
  selectUserId,
  User,
} from "auth/authSlice";
import DropdownMenu from "render/web/ui/DropDownMenu";
import { Tooltip } from "render/web/ui/Tooltip"; // 如果无此组件，可移除Tooltip包裹

const SidebarBottom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useAuth();
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);
  const theme = useAppSelector(selectTheme);
  const [isMobile, setIsMobile] = useState(false);
  const { balance, loading, error } = useBalance();

  const isLowBalance = !loading && !error && balance < 10;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
    const inviteUrl = `/invite-signup?inviterId=${currentUserId}`;
    try {
      await navigator.clipboard.writeText(window.location.origin + inviteUrl);
      toast.success("邀请链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const otherUsers = users.filter(
    (user) => user && user.userId !== currentUserId
  );

  if (!auth.user) return null;

  return (
    <>
      <div className="SidebarBottom">
        <Tooltip content="当前登录账户" placement="top" disabled={isMobile}>
          <NavLink
            to="/life"
            className={({ isActive }) =>
              `user-info-link ${isActive ? "active" : ""}`
            }
          >
            <div className="user-info">
              <PersonIcon size={16} /> {/* 增大图标 */}
              <span className="username">{auth.user.username}</span>
            </div>
          </NavLink>
        </Tooltip>

        <div className="balance-info">
          <span className={`balance ${isLowBalance ? "low" : ""}`}>
            {loading ? "..." : error ? "N/A" : `¥${balance.toFixed(2)}`}
          </span>
          <button className="recharge-btn" onClick={handleRecharge}>
            充值
          </button>
        </div>

        <DropdownMenu
          trigger={
            <button className="menu-trigger">
              <ChevronUpIcon size={12} />
            </button>
          }
          direction="top"
          triggerType={isMobile ? "click" : "hover"}
        >
          <div className="compact-dropdown">
            {otherUsers.length > 0 && (
              <>
                {otherUsers.map((user) => (
                  <button
                    key={`user-${user.userId}`}
                    onClick={() => handleUserChange(user)}
                    className="dd-item"
                  >
                    <PersonIcon size={12} />
                    <span>{user.username}</span>
                  </button>
                ))}
                <div className="divider"></div>
              </>
            )}

            <button onClick={handleInviteFriend} className="dd-item invite">
              <PlusIcon size={12} />
              <span>邀请朋友</span>
            </button>

            <button
              onClick={() => navigate(SettingRoutePaths.SETTING)}
              className="dd-item"
            >
              <GearIcon size={12} />
              <span>{t("settings.title", "设置")}</span>
            </button>

            <button onClick={handleLogout} className="dd-item logout">
              <SignOutIcon size={12} />
              <span>{t("logout", "退出")}</span>
            </button>
          </div>
        </DropdownMenu>
      </div>

      <style href="SidebarBottom-compact" precedence="medium">
        {`
          .SidebarBottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-2) var(--space-3);
            border-top: 1px solid var(--borderLight);
            background: var(--background);
            flex-shrink: 0;
            height: 44px; /* 略微增高 */
            gap: var(--space-3); /* 增加gap，提供呼吸感 */
          }

          .user-info-link {
            text-decoration: none;
            color: inherit;
            display: block;
            flex: 1;
            min-width: 0;
            border-radius: 3px;
            transition: background 0.15s ease, color 0.15s ease;
          }

          .user-info-link:hover {
            background: var(--backgroundHover);
          }

          .user-info-link.active {
            background: var(--backgroundSelected);
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: var(--space-2); /* 调整gap以匹配更大图标 */
            padding: var(--space-1);
          }

          .user-info svg {
            color: var(--textTertiary);
            flex-shrink: 0;
          }

          .username {
            font-size: 12px;
            font-weight: 400;
            color: var(--text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .balance-info {
            display: flex;
            align-items: center;
            gap: var(--space-2); /* 增加gap */
            flex-shrink: 0;
          }

          .balance {
            font-size: 11px;
            font-weight: 500;
            color: var(--primary);
            white-space: nowrap;
          }

          .balance.low {
            color: var(--error);
          }

          .recharge-btn {
            background: var(--primary);
            color: var(--background);
            border: none;
            border-radius: 3px;
            padding: var(--space-1) var(--space-2);
            font-size: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s ease, transform 0.15s ease;
            white-space: nowrap;
          }

          .recharge-btn:hover {
            background: var(--hover);
          }

          .recharge-btn:active {
            transform: scale(0.95);
          }

          .menu-trigger {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: var(--space-1);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 3px;
            transition: background 0.15s ease, color 0.15s ease;
            color: var(--textTertiary);
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
          }

          .menu-trigger:hover {
            background: var(--backgroundHover);
            color: var(--textSecondary);
          }

          .menu-trigger:active {
            background: var(--backgroundSelected);
            transform: scale(0.95);
          }

          .compact-dropdown {
            background: var(--background);
            border: 1px solid var(--borderLight);
            border-radius: 6px;
            padding: var(--space-2);
            min-width: 160px;
            box-shadow: var(--shadowLight);
            margin-bottom: var(--space-1);
          }

          .dd-item {
            display: flex;
            align-items: center;
            gap: var(--space-1);
            width: 100%;
            padding: var(--space-1) var(--space-2);
            background: transparent;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            color: var(--textSecondary);
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
            text-align: left;
            height: 30px; /* 略微增高item以匹配整体 */
          }

          .dd-item:hover {
            background: var(--backgroundHover);
            color: var(--text);
          }

          .dd-item:active {
            background: var(--backgroundSelected);
            transform: scale(0.98);
          }

          .dd-item svg {
            color: var(--textTertiary);
            flex-shrink: 0;
          }

          .dd-item:hover svg {
            color: var(--textSecondary);
          }

          .dd-item.invite {
            background: var(--primaryGhost);
            color: var(--primary);
          }

          .dd-item.invite svg {
            color: var(--primary);
          }

          .dd-item.invite:hover {
            background: var(--primaryHover);
          }

          .dd-item.logout:hover {
            background: color-mix(in srgb, var(--error) 8%, transparent);
            color: var(--error);
          }

          .dd-item.logout:hover svg {
            color: var(--error);
          }

          .divider {
            height: 1px;
            background: var(--borderLight);
            margin: var(--space-1) 0;
          }

          @media (max-width: 768px) {
            .SidebarBottom {
              padding: var(--space-1) var(--space-2);
              height: 40px; /* 移动端略微增高 */
              gap: var(--space-2);
            }

            .username {
              font-size: 11px;
            }

            .balance {
              font-size: 10px;
            }

            .recharge-btn {
              font-size: 9px;
              padding: var(--space-1) var(--space-1);
            }

            .dd-item {
              font-size: 11px;
              height: 28px;
            }

            .compact-dropdown {
              min-width: 140px;
              padding: var(--space-1);
            }
          }
        `}
      </style>
    </>
  );
};

export default SidebarBottom;
