// render/web/ui/Avatar.jsx
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { PersonIcon, GearIcon } from "@primer/octicons-react";

/**
 * 通用头像组件
 * @param {Object} props
 * @param {string} props.name - 显示名称，用于生成首字母
 * @param {string} props.type - 头像类型：'user' | 'robot' | 'cybot' | 'auto'
 * @param {'small'|'medium'|'large'} props.size - 头像尺寸
 * @param {string} props.src - 头像图片地址（可选）
 * @param {string} props.className - 自定义样式类
 * @param {Function} props.onClick - 点击事件
 * @param {Object} props.style - 内联样式
 */
export const Avatar = ({
  name = "",
  type = "auto",
  size = "medium",
  src,
  className = "",
  onClick,
  style = {},
  ...props
}) => {
  const theme = useAppSelector(selectTheme);

  // 自动判断类型
  const avatarType =
    type === "auto" ? (name === "robot" ? "robot" : "user") : type;

  // 获取显示内容
  const getDisplayContent = () => {
    if (src) {
      return <img src={src} alt={name} className="avatar-image" />;
    }

    switch (avatarType) {
      case "robot":
      case "cybot":
        return name ? (
          <span className="avatar-text">{name[0]?.toUpperCase() || "?"}</span>
        ) : (
          <GearIcon size={getSizeValue() * 0.5} />
        );
      case "user":
      default:
        return name ? (
          <span className="avatar-text">{name[0]?.toUpperCase() || "U"}</span>
        ) : (
          <PersonIcon size={getSizeValue() * 0.5} />
        );
    }
  };

  // 获取尺寸数值
  const getSizeValue = () => {
    switch (size) {
      case "small":
        return 32;
      case "large":
        return 48;
      case "medium":
      default:
        return 40;
    }
  };

  // 获取字体大小
  const getFontSize = () => {
    switch (size) {
      case "small":
        return "0.75rem";
      case "large":
        return "1.125rem";
      case "medium":
      default:
        return "1rem";
    }
  };

  // 获取主题色
  const getThemeColors = () => {
    switch (avatarType) {
      case "robot":
      case "cybot":
        return {
          background: theme.primaryGhost,
          color: theme.primary,
          border: `${theme.primary}20`,
        };
      case "user":
      default:
        return {
          background: theme.backgroundTertiary,
          color: theme.textSecondary,
          border: theme.border,
        };
    }
  };

  const colors = getThemeColors();
  const sizeValue = getSizeValue();

  return (
    <div
      className={`avatar avatar--${size} avatar--${avatarType} ${className}`}
      onClick={onClick}
      style={{
        width: `${sizeValue}px`,
        height: `${sizeValue}px`,
        borderRadius: theme.space[2],
        background: colors.background,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontSize: getFontSize(),
        ...style,
      }}
      {...props}
    >
      {getDisplayContent()}

      <style href="avatar" precedence="medium">{`
        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: 600;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: ${onClick ? "pointer" : "default"};
          position: relative;
          overflow: hidden;
        }

        .avatar:hover {
          ${
            onClick
              ? `
            transform: translateY(-1px);
            box-shadow: 0 2px 8px ${theme.shadowLight};
          `
              : ""
          }
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
        }

        .avatar-text {
          user-select: none;
          letter-spacing: -0.01em;
        }

        /* 尺寸变体 */
        .avatar--small {
          border-radius: ${theme.space[1]};
        }

        .avatar--large {
          border-radius: ${theme.space[3]};
        }

        /* 类型变体 */
        .avatar--robot,
        .avatar--cybot {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
          border-color: ${theme.primary}20;
        }

        .avatar--robot:hover,
        .avatar--cybot:hover {
          ${
            onClick
              ? `
            background: ${theme.primary}15;
            border-color: ${theme.primary}30;
          `
              : ""
          }
        }

        .avatar--user {
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
          border-color: ${theme.border};
        }

        .avatar--user:hover {
          ${
            onClick
              ? `
            background: ${theme.backgroundHover};
            border-color: ${theme.borderHover};
          `
              : ""
          }
        }

        /* 响应式优化 */
        @media (max-width: 480px) {
          .avatar--large {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
          
          .avatar--medium {
            width: 36px;
            height: 36px;
            font-size: 0.9375rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .avatar {
            transition: none;
          }
          .avatar:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Avatar;
