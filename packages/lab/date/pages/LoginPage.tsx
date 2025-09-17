// src/lab/date/pages/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import i18n from "app/i18n";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(i18n.language); // "zh" 或 "en"

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    navigate("/pay-prompt");
  };

  const toggleLanguage = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {lang === "zh" ? "欢迎来到缘遇" : "Welcome to MatchLink"}
        </h1>
        <p style={styles.desc}>
          {lang === "zh"
            ? "体验智能匹配，开启你的缘分之旅"
            : "Experience smart matching, start your journey"}
        </p>

        <button style={styles.loginBtn} onClick={handleLogin}>
          {lang === "zh" ? "演示登录 (一键登录)" : "Demo Login"}
        </button>

        <div style={styles.langSwitch}>
          <span>{lang === "zh" ? "语言：" : "Language: "}</span>
          <button style={styles.langBtn} onClick={toggleLanguage}>
            {lang === "zh" ? "English" : "中文"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 内联样式
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: `'Helvetica Neue', Arial, sans-serif`,
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px 20px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "90%",
    maxWidth: "360px",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "22px",
    color: "#333",
  },
  desc: {
    margin: "0 0 20px",
    fontSize: "14px",
    color: "#666",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  langSwitch: {
    fontSize: "14px",
    color: "#666",
  },
  langBtn: {
    background: "none",
    border: "none",
    color: "#1877f2",
    textDecoration: "underline",
    cursor: "pointer",
    marginLeft: "6px",
  },
};
