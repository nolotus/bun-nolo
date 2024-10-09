// render/layout/Sidebar.tsx
import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, setSidebarWidth } from "app/theme/themeSlice";
import { fixedLinks, allowRule } from "auth/navPermissions";
import { RoutePaths } from "auth/client/routes";
import { useTranslation } from "react-i18next";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";
import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import NavListItem from "./blocks/NavListItem";
import { SignInIcon, ThreeBarsIcon, PlusIcon } from "@primer/octicons-react";
import { CreateMenu } from "create/blocks/CreateMenu";

// MenuButton Component
interface MenuButtonProps {
  onClick: () => void;
  theme: any;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, theme }) => (
  <button
    onClick={onClick}
    style={buttonStyle(theme)}
    onMouseEnter={(e) => handleMouseEnter(e, theme)}
    onMouseLeave={(e) => handleMouseLeave(e, theme)}
  >
    <ThreeBarsIcon size={theme.iconSize.medium} />
  </button>
);

// PlusButton Component
interface PlusButtonProps {
  onClick: () => void;
  theme: any;
}

const PlusButton: React.FC<PlusButtonProps> = ({ onClick, theme }) => (
  <button
    onClick={onClick}
    style={buttonStyle(theme)}
    onMouseEnter={(e) => handleMouseEnter(e, theme)}
    onMouseLeave={(e) => handleMouseLeave(e, theme)}
  >
    <PlusIcon size={theme.iconSize.medium} />
  </button>
);

// Sidebar Component
interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
  fullWidth?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  fullWidth = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const theme = useSelector(selectTheme);
  const auth = useAuth();
  const allowedFixedLinks = allowRule(auth?.user, fixedLinks);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handlePlusClick = useCallback(() => {
    console.log("Plus icon clicked");
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
        }
      }
    },
    [isResizing, dispatch],
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [toggleSidebar, resize, stopResizing]);

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.h100vh,
        ...themeStyles.bgColor1(theme),
      }}
    >
      <div style={buttonContainerStyles(theme, isSidebarOpen)}>
        <MenuButton onClick={toggleSidebar} theme={theme} />
        <CreateMenu />
      </div>
      <aside
        ref={sidebarRef}
        style={sidebarStyles(theme, isSidebarOpen, theme.sidebarWidth)}
      >
        <div style={sidebarContentStyles}>
          {isLoggedIn ? (
            <div style={{ marginBottom: OpenProps.size3 }}>
              <IsLoggedInMenu />
            </div>
          ) : (
            <NavListItem
              label={t("login")}
              icon={<SignInIcon size={16} />}
              path={RoutePaths.LOGIN}
            />
          )}

          <nav style={{ marginBottom: OpenProps.size4 }}>
            {allowedFixedLinks.map((item) => (
              <NavListItem key={item.path} {...item} />
            ))}
          </nav>
          <div style={scrollableContentStyles}>{sidebarContent}</div>
        </div>
        <div style={resizeHandleStyles(theme)} onMouseDown={startResizing} />
      </aside>
      <main style={contentStyles(theme, isSidebarOpen, theme.sidebarWidth)}>
        <div style={innerContentStyles(theme, fullWidth)}>{children}</div>
      </main>
    </div>
  );
};

// Shared styles and utilities
const buttonStyle = (theme: any): React.CSSProperties => ({
  ...themeStyles.bgColor1(theme),
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s",
  padding: theme.spacing.small,
  borderRadius: theme.borderRadius,
  ...themeStyles.textColor1(theme),
  boxShadow:
    theme.themeName === "light"
      ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
      : "none",
});

const handleMouseEnter = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface4 : theme.surface2;
};

const handleMouseLeave = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface3 : "white";
};

const buttonContainerStyles = (theme: any, isSidebarOpen: boolean) => ({
  ...styles.positionFixed,
  left: isSidebarOpen ? `${theme.sidebarWidth + 10}px` : "10px",
  top: "10px",
  ...styles.zIndex3,
  display: "flex",
  gap: theme.spacing.small,
  transition: "left 0.3s",
});

const sidebarStyles = (theme: any, isSidebarOpen: boolean, width: number) => ({
  width: `${width}px`,
  ...themeStyles.bgColor1(theme),
  height: "100vh",
  position: "fixed" as const,
  left: isSidebarOpen ? 0 : `-${width}px`,
  top: 0,
  transition: "left 0.3s ease-in-out",
  zIndex: 2,
  ...themeStyles.textColor1(theme),
  padding: OpenProps.size3,
  display: "flex",
  flexDirection: "column" as const,
});

const sidebarContentStyles = {
  display: "flex",
  flexDirection: "column" as const,
  height: "100%",
  overflow: "hidden",
};

const scrollableContentStyles = {
  flexGrow: 1,
  overflowY: "auto" as const,
  marginBottom: OpenProps.size4,
};

const contentStyles = (
  theme: any,
  isSidebarOpen: boolean,
  sidebarWidth: number,
) => ({
  ...styles.flexGrow1,
  marginLeft: isSidebarOpen ? `${sidebarWidth}px` : 0,
  transition: "margin-left 0.3s ease-in-out",
  width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
  overflowX: "hidden" as const,
  ...themeStyles.bgColor1(theme),
});

const innerContentStyles = (theme: any, fullWidth: boolean) => ({
  width: fullWidth ? "100%" : "100%",
  maxWidth: fullWidth ? "none" : "1200px",
  margin: fullWidth ? 0 : "0 auto",
  padding: fullWidth ? 0 : "48px 24px 24px",
  ...themeStyles.textColor1(theme),
});

const resizeHandleStyles = (theme: any) => ({
  width: "4px",
  height: "100%",
  position: "absolute" as const,
  top: 0,
  right: 0,
  cursor: "col-resize",
  backgroundColor: theme.border,
});

export default Sidebar;
