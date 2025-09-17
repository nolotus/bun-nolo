// src/lab/date/components/DatingNavbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function DatingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
  };

  // 判断当前激活 tab
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.includes(path);
  };

  return (
    <nav style={styles.nav}>
      <button
        style={{
          ...styles.tab,
          ...(isActive("/match") ? styles.activeTab : {}),
        }}
        onClick={() => navigate("/match")}
      >
        {t("match")}
      </button>
      <button
        style={{
          ...styles.tab,
          ...(isActive("/chat") ? styles.activeTab : {}),
        }}
        onClick={() => navigate("/chat/1")}
      >
        {t("chat")}
      </button>
      <button
        style={{
          ...styles.tab,
          ...(isActive("/profile") ? styles.activeTab : {}),
        }}
        onClick={() => navigate("/profile")}
      >
        {t("my")}
      </button>
      <button style={styles.langBtn} onClick={toggleLanguage}>
        {i18n.language === "zh" ? "EN" : "中"}
      </button>
    </nav>
  );
}

// ----------------------- 桌面优化样式 -----------------------
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    borderRadius: "12px 12px 0 0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  tab: {
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#555",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },
  activeTab: {
    color: "#007bff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,123,255,0.08)",
  },
  langBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },
};
