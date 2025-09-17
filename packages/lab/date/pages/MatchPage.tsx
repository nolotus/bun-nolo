// src/lab/date/pages/MatchPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MatchPage() {
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

  // ---------- Demo 数据 ----------
  const demoUsers = [
    {
      id: 1,
      name: i18n.language === "zh" ? "小明" : "Xiao Ming",
      age: 25,
      location: i18n.language === "zh" ? "北京" : "Beijing",
      bio:
        i18n.language === "zh"
          ? "喜欢旅行和摄影，期待遇见有趣的你。"
          : "Love traveling and photography. Looking for someone interesting.",
      img: "https://picsum.photos/seed/1/300/300",
    },
    {
      id: 2,
      name: i18n.language === "zh" ? "Emma" : "Emma",
      age: 27,
      location: i18n.language === "zh" ? "伦敦" : "London",
      bio:
        i18n.language === "zh"
          ? "咖啡爱好者，喜欢深入交流。"
          : "Coffee lover. Looking for a deep conversation.",
      img: "https://picsum.photos/seed/2/300/300",
    },
    {
      id: 3,
      name: i18n.language === "zh" ? "张伟" : "Zhang Wei",
      age: 30,
      location: i18n.language === "zh" ? "上海" : "Shanghai",
      bio:
        i18n.language === "zh"
          ? "热爱美食和音乐，想和你一起玩转城市。"
          : "Love food and music. Want to explore the city with you.",
      img: "https://picsum.photos/seed/3/300/300",
    },
  ];

  // ---------- 状态 ----------
  const [curIdx, setCurIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matched, setMatched] = useState(null);

  const MATCH_TARGET = 2;

  // ---------- 操作 ----------
  const goNext = (action) => {
    if (action === "like" && curIdx === MATCH_TARGET) {
      setMatched(demoUsers[curIdx]);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurIdx((prev) => (prev + 1) % demoUsers.length);
    }, 500);
  };

  const startChat = () => {
    navigate(`/chat/${matched.id}`);
  };

  const user = demoUsers[curIdx];

  // ---------- 语言切换 ----------
  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={styles.page}>
      {/* 顶部导航 + 语言切换 */}
      <nav style={styles.nav}>
        <button style={{ ...styles.tab, ...styles.activeTab }}>
          {t("match")}
        </button>
        <button style={styles.tab} onClick={() => navigate("/chat/1")}>
          {t("chat")}
        </button>
        <button style={styles.tab} onClick={() => navigate("/profile")}>
          {t("my")}
        </button>
        <button style={styles.langBtn} onClick={toggleLanguage}>
          {i18n.language === "zh" ? "EN" : "中"}
        </button>
      </nav>

      {/* 卡片或匹配成功弹窗 */}
      <div style={styles.cardContainer}>
        {matched ? (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>
                {t("match_success", { name: matched.name })}
              </h2>
              <button style={styles.chatBtn} onClick={startChat}>
                {t("start_chat")}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            {loading && <div style={styles.loader}>{t("loading")}</div>}
            <img src={user.img} alt={user.name} style={styles.avatar} />
            <h3 style={styles.name}>
              {user.name}，{user.age}
            </h3>
            <p style={styles.location}>{user.location}</p>
            <p style={styles.bio}>{user.bio}</p>

            <div style={styles.actions}>
              <button
                style={{ ...styles.actionBtn, ...styles.skipBtn }}
                onClick={() => goNext("skip")}
              >
                ❌ <span style={styles.actionLabel}>{t("skip")}</span>
              </button>
              <button
                style={{ ...styles.actionBtn, ...styles.likeBtn }}
                onClick={() => goNext("like")}
              >
                ❤️ <span style={styles.actionLabel}>{t("like")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------- 桌面优化样式 -------------------------- */
const styles = {
  page: {
    fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
    maxWidth: "520px", // 桌面加宽
    margin: "40px auto",
    padding: "0 20px", // 桌面加大左右边距
    textAlign: "center",
    position: "relative",
  },
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "1px solid #ddd",
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
  cardContainer: { position: "relative", minHeight: "520px" },
  card: {
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "24px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  name: { margin: "8px 0 6px", fontSize: "22px", color: "#222" },
  location: { margin: "0 0 10px", fontSize: "15px", color: "#777" },
  bio: {
    fontSize: "15px",
    color: "#555",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  actions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "16px",
  },
  actionBtn: {
    flex: "1 1 40%",
    padding: "12px",
    fontSize: "17px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  likeBtn: { backgroundColor: "#e91e63", color: "#fff", marginLeft: "12px" },
  skipBtn: { backgroundColor: "#9e9e9e", color: "#fff", marginRight: "12px" },
  actionLabel: { marginLeft: "8px" },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "16px 28px",
    borderRadius: "10px",
    fontSize: "16px",
    color: "#333",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 10,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
  },
  modalTitle: { fontSize: "20px", marginBottom: "24px", color: "#222" },
  chatBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    fontSize: "17px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },
};
