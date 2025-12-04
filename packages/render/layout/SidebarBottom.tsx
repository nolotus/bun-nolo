// 文件路径: render/layout/SidebarBottom.tsx

import React, { useEffect, useState, useRef } from "react";
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
import { Tooltip } from "render/web/ui/Tooltip";

const SidebarBottom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useAuth();

  // Redux Data
  const users = useAppSelector(selectUsers);
  const currentUserId = useAppSelector(selectUserId);
  const balance = useAppSelector(selectCurrentUserBalance);

  // Local State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const balanceValue = typeof balance === "number" ? balance : 0;
  const isLoading = typeof balance !== "number";
  const otherUsers = users.filter((u) => u && u.userId !== currentUserId);

  // 初始化
  useEffect(() => {
    if (currentUserId) dispatch(fetchUserProfile());
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentUserId, dispatch]);

  // 菜单交互逻辑
  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(timerRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timerRef.current = setTimeout(() => setMenuOpen(false), 200);
  };

  // 动作处理
  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/invite-signup?inviterId=${currentUserId}`
      );
      toast.success("邀请链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const handleLogout = () =>
    dispatch(signOut())
      .unwrap()
      .then(() => navigate("/"));

  // 渲染菜单项辅助函数
  const renderItem = (
    Icon: any,
    text: string,
    onClick: () => void,
    className = ""
  ) => (
    <button
      onClick={(e) => {
        onClick();
        setMenuOpen(false);
      }}
      className={`menu-item ${className}`}
    >
      <Icon size={14} />
      <span>{text}</span>
    </button>
  );

  if (!authUser) return null;

  return (
    <>
      <div className="SidebarBottom">
        {/* 左侧：用户信息 + 余额 */}
        <div className="left-content">
          <Tooltip content="当前账户" placement="top" disabled={isMobile}>
            <NavLink
              to="/life"
              className={({ isActive }) =>
                `user-link ${isActive ? "active" : ""}`
              }
            >
              <div className="avatar">
                <LuUser size={14} />
              </div>
              <span className="username">{authUser.username}</span>
            </NavLink>
          </Tooltip>

          <div className="balance-box">
            <span
              className={`balance-text ${!isLoading && balanceValue < 10 ? "low" : ""}`}
            >
              {isLoading ? "..." : `¥${balanceValue.toFixed(2)}`}
            </span>
            <Tooltip content={t("recharge", "充值")} placement="top">
              <button
                className="btn-add"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/recharge");
                }}
              >
                <LuPlus size={10} strokeWidth={3} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 右侧：合并后的菜单 */}
        <div
          className="right-content"
          ref={menuRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`menu-trigger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <LuChevronUp size={16} />
          </button>

          <div className={`menu-popup ${menuOpen ? "open" : ""}`}>
            {otherUsers.map((u) => (
              <React.Fragment key={u.userId}>
                {renderItem(LuUser, u.username, () => dispatch(changeUser(u)))}
              </React.Fragment>
            ))}
            {otherUsers.length > 0 && <div className="divider" />}

            {renderItem(
              LuPlus,
              t("inviteFriend", "邀请朋友"),
              handleInvite,
              "invite"
            )}
            {renderItem(LuSettings, t("settings.title", "设置"), () =>
              navigate(SettingRoutePaths.SETTING)
            )}
            {renderItem(LuLogOut, t("logout", "退出"), handleLogout, "logout")}
          </div>
        </div>
      </div>

      <style href="SidebarBottom-v2" precedence="high">{`
        .SidebarBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-2) 0 var(--space-3);
          background: var(--background);
          height: 48px;
          flex-shrink: 0;
          box-shadow: 0 -1px 0 rgba(0,0,0,0.03), 0 -4px 12px -2px rgba(0,0,0,0.03);
          z-index: 10;
        }

        .left-content { display: flex; align-items: center; flex: 1; min-width: 0; gap: var(--space-3); }
        
        .user-link {
          display: flex; alignItems: center; gap: 8px; text-decoration: none;
          color: var(--text); padding: 4px; border-radius: 6px; transition: opacity 0.2s;
          min-width: 0; overflow: hidden;
        }
        .user-link:hover { opacity: 0.8; }
        .user-link.active .avatar { background: var(--primary); color: #fff; }
        
        .avatar {
          width: 20px; height: 20px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; background: var(--backgroundSecondary);
          color: var(--textTertiary); transition: all 0.2s;
        }
        .username { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .balance-box {
          display: flex; align-items: center; gap: 6px; padding-left: 12px;
          border-left: 1px solid var(--border); height: 20px;
        }
        .balance-text { font-family: monospace; font-size: 12px; font-weight: 600; color: var(--textSecondary); letter-spacing: -0.02em; }
        .balance-text.low { color: var(--error); }
        
        .btn-add {
          width: 16px; height: 16px; border-radius: 50%; background: var(--primaryGhost);
          color: var(--primary); border: none; cursor: pointer; display: flex;
          align-items: center; justify-content: center; padding: 0; transition: all 0.2s;
        }
        .btn-add:hover { background: var(--primary); color: #fff; transform: scale(1.1); }
        
        .right-content { position: relative; display: flex; align-items: center; }
        
        .menu-trigger {
          background: transparent; border: none; cursor: pointer; width: 28px; height: 28px;
          border-radius: 4px; color: var(--textTertiary); display: flex; align-items: center; justify-content: center;
          transition: 0.15s;
        }
        .menu-trigger:hover, .menu-trigger.active { background: var(--backgroundHover); color: var(--text); }

        .menu-popup {
          position: absolute; bottom: 100%; right: 0; margin-bottom: 8px;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 8px; padding: 4px; min-width: 150px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          opacity: 0; visibility: hidden; transform: translateY(8px) scale(0.96);
          transition: all 0.15s cubic-bezier(0.2, 0, 0.2, 1);
          pointer-events: none;
        }
        .menu-popup.open { opacity: 1; visibility: visible; transform: translateY(0) scale(1); pointer-events: auto; }
        /* 隐形桥梁防止 Hover 中断 */
        .menu-popup::before { content: ''; position: absolute; top: 100%; left: 0; width: 100%; height: 10px; }

        .menu-item {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px;
          background: transparent; border: none; border-radius: 4px;
          font-size: 13px; color: var(--textSecondary); cursor: pointer; text-align: left;
        }
        .menu-item:hover { background: var(--backgroundHover); color: var(--text); }
        .menu-item.invite { color: var(--primary); }
        .menu-item.invite:hover { background: var(--primaryHover); }
        .menu-item.logout:hover { background: var(--errorBg); color: var(--error); }
        
        .divider { height: 1px; background: var(--border); margin: 4px 0; }

        @media (max-width: 768px) {
          .SidebarBottom { padding: 0 var(--space-2); }
          .balance-box { display: none; }
        }
      `}</style>
    </>
  );
};

export default SidebarBottom;
