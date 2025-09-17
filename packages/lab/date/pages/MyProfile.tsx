// src/lab/date/pages/MyProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MyProfile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ---------- 客户端守卫 (SSR安全) ----------
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isPaid = localStorage.getItem("isPaid") === "true";

    if (!isLoggedIn) {
      navigate("/login");
    } else if (!isPaid) {
      navigate("/pay-prompt");
    }
  }, [navigate]);

  // ---------- 退出登录状态 ----------
  const [loggedOut, setLoggedOut] = useState(false);

  // ---------- Demo 用户信息 ----------
  const demoUser = {
    avatar: "https://picsum.photos/seed/profile/150/150",
    name: i18n.language === "zh" ? "Demo 小红" : "Demo Xiaohong",
    age: 26,
    location: i18n.language === "zh" ? "上海" : "Shanghai",
    bio:
      i18n.language === "zh"
        ? "热爱旅游、阅读和音乐，寻找志同道合的朋友。"
        : "Love traveling, reading, and music. Looking for like-minded friends.",
  };

  // ---------- 操作函数 ----------
  const handleEdit = () => {
    alert(t("edit_profile_demo"));
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isPaid");
    setLoggedOut(true);
  };

  // ---------- 语言切换 ----------
  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
  };

  // ---------- 退出后显示欢迎页 ----------
  if (loggedOut) {
    return (
      <div style={style.welcome}>
        <h2>{t("welcome_title")}</h2>
        <p>{t("please_relogin")}</p>
        <button
          style={style.loginBtn}
          onClick={() => {
            navigate("/login");
          }}
        >
          {t("back_to_home")}
        </button>
      </div>
    );
  }

  return (
    <div style={style.page}>
      {/* 顶部导航栏 */}
      <nav style={style.nav}>
        <button style={style.tab} onClick={() => navigate("/match")}>
          {t("match")}
        </button>
        <button style={style.tab} onClick={() => navigate("/chat/1")}>
          {t("chat")}
        </button>
        <button style={{ ...style.tab, ...style.activeTab }}>{t("my")}</button>
        <button style={style.langBtn} onClick={toggleLanguage}>
          {i18n.language === "zh" ? "EN" : "中"}
        </button>
      </nav>

      {/* 个人资料卡片 */}
      <div style={style.profileBox}>
        <img src={demoUser.avatar} alt="头像" style={style.avatar} />
        <h2 style={style.name}>
          {demoUser.name}，{demoUser.age}
        </h2>
        <p style={style.location}>
          {t("location_label")}：{demoUser.location}
        </p>
        <p style={style.bio}>
          {t("bio_label")}：{demoUser.bio}
        </p>

        <div style={style.actions}>
          <button style={style.editBtn} onClick={handleEdit}>
            {t("edit_profile")}
          </button>
          <button style={style.logoutBtn} onClick={handleLogout}>
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- 桌面优化样式 -------------------------- */
const style = {
  page: {
    fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
    maxWidth: "520px",
    margin: "40px auto",
    padding: "0 20px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 0",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    borderRadius: "12px 12px 0 0",
  },
  tab: {
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#555",
    cursor: "pointer",
    padding: "6px 12px",
  },
  activeTab: {
    color: "#007bff",
    fontWeight: "bold",
    borderBottom: "2px solid #007bff",
  },
  langBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "4px 10px",
    fontSize: "14px",
    cursor: "pointer",
  },
  profileBox: {
    backgroundColor: "#fff",
    borderRadius: "0 0 12px 12px",
    padding: "30px 20px",
    marginTop: "0",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "16px",
    border: "3px solid #eee",
  },
  name: {
    margin: "10px 0",
    fontSize: "24px",
    color: "#222",
  },
  location: {
    margin: "6px 0",
    fontSize: "15px",
    color: "#777",
  },
  bio: {
    margin: "16px 0",
    fontSize: "15px",
    color: "#555",
    lineHeight: "1.5",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "24px",
  },
  editBtn: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  welcome: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
    backgroundColor: "#f0f8ff",
    textAlign: "center",
    padding: "20px",
  },
  loginBtn: {
    marginTop: "24px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
