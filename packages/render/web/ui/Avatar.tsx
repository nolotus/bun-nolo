// render/web/ui/Avatar.jsx
import React, { useMemo } from "react";
import { LuUser, LuBot, LuSparkles } from "react-icons/lu"; // 替换为 Lucide 图标

/**
 * 通用头像组件
 *
 * 优化说明：
 * 1. 样式完全基于 CSS 变量，移除 Redux 主题依赖，提升性能。
 * 2. 引入 "react-icons/lu" 替代旧图标库。
 * 3. 增加微拟物风格 (渐变、阴影) 和去边框化设计。
 */
export const Avatar = ({
  name = "",
  type = "auto", // 'user' | 'robot' | 'cybot' | 'auto'
  size = "medium", // 'small' | 'medium' | 'large'
  src,
  className = "",
  onClick,
  style = {},
  ...props
}) => {
  // 自动判断类型逻辑保持不变
  const avatarType = useMemo(() => {
    return type === "auto" ? (name === "robot" ? "robot" : "user") : type;
  }, [type, name]);

  // 根据尺寸获取图标大小 (保持纤细感，图标稍微调小一点点)
  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 24;
      case "medium":
      default:
        return 20;
    }
  };

  const renderContent = () => {
    if (src) {
      return <img src={src} alt={name} className="avatar-image" />;
    }

    const iconSize = getIconSize();

    // 字体/图标内容
    switch (avatarType) {
      case "robot":
        // 机器人使用 Bot 图标
        return name ? (
          <span className="avatar-text">{name[0]?.toUpperCase()}</span>
        ) : (
          <LuBot size={iconSize} />
        );
      case "cybot":
        // Cybot 使用 Sparkles 或特殊图标体现智能感
        return <LuSparkles size={iconSize} />;
      case "user":
      default:
        // 用户使用 User 图标
        return name ? (
          <span className="avatar-text">{name[0]?.toUpperCase() || "U"}</span>
        ) : (
          <LuUser size={iconSize} />
        );
    }
  };

  return (
    <div
      className={`avatar avatar--${size} avatar--${avatarType} ${onClick ? "avatar--clickable" : ""} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {renderContent()}

      <style href="avatar" precedence="medium">{`
        .avatar {
          /* 布局与基础模型 */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
          
          /* 字体与排版 */
          font-family: inherit;
          font-weight: 500; /* 稍微降低字重，符合“纤细”感 */
          line-height: 1;
          user-select: none;
          
          /* 初始过渡 */
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          
          /* 默认使用 CSS 变量定义的基础背景 (兜底) */
          background: var(--backgroundTertiary);
          color: var(--textSecondary);
          
          /* 边框处理：使用内阴影替代实线边框，减少视觉干扰 */
          box-shadow: inset 0 0 0 1px var(--borderLight); 
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
        }

        .avatar-text {
          position: relative;
          z-index: 1;
        }

        /* ====================
           尺寸变体 (CSS Variables 驱动)
           ==================== */
        .avatar--small {
          width: 32px;
          height: 32px;
          font-size: 0.75rem;
          border-radius: var(--space-2); /* 8px - 圆角矩形，更现代 */
        }

        .avatar--medium {
          width: 40px;
          height: 40px;
          font-size: 1rem;
          border-radius: var(--space-3); /* 12px */
        }

        .avatar--large {
          width: 48px;
          height: 48px;
          font-size: 1.125rem;
          border-radius: var(--space-4); /* 16px */
        }

        /* ====================
           类型变体 (风格核心)
           ==================== */
        
        /* 1. 机器人/Cybot: 强调科技感与品牌色 */
        .avatar--robot,
        .avatar--cybot {
          /* 背景：使用 Ghost 风格或极淡的品牌背景 */
          background: var(--primaryBg); 
          color: var(--primary);
          
          /* 边框：品牌色的微弱内描边 */
          box-shadow: inset 0 0 0 1px rgba(var(--primary), 0.1); 
        }

        /* 2. 普通用户: 强调中性与简洁 */
        .avatar--user {
          background: var(--backgroundTertiary);
          color: var(--textSecondary);
          box-shadow: inset 0 0 0 1px var(--border);
        }

        /* ====================
           交互状态 (顺滑、愉悦)
           ==================== */
        .avatar--clickable {
          cursor: pointer;
        }

        .avatar--clickable:hover {
          transform: translateY(-2px); /* 悬浮感 */
          box-shadow: 
            0 4px 12px var(--shadowMedium), /* 外部投影 */
            inset 0 0 0 1px transparent;    /* 隐藏内描边 */
        }

        /* 机器人 Hover: 增加一点“拟物”的高光渐变感 */
        .avatar--clickable.avatar--robot:hover,
        .avatar--clickable.avatar--cybot:hover {
          background: var(--primaryGhost);
          color: var(--primaryDark);
        }

        /* 用户 Hover */
        .avatar--clickable.avatar--user:hover {
          background: var(--backgroundSecondary);
          color: var(--text);
          box-shadow: 
            0 4px 12px var(--shadowLight),
            inset 0 0 0 1px var(--borderHover);
        }

        /* 点击反馈 */
        .avatar--clickable:active {
          transform: translateY(0);
          box-shadow: none;
        }

        /* ====================
           响应式微调
           ==================== */
        @media (max-width: 480px) {
          .avatar--large { width: 40px; height: 40px; font-size: 1rem; }
          .avatar--medium { width: 32px; height: 32px; font-size: 0.875rem; }
        }
      `}</style>
    </div>
  );
};

export default Avatar;
