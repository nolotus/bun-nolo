// src/lab/date/pages/ChatDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ChatDetail() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ---------- 客户端守卫逻辑 ----------
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isPaid = localStorage.getItem("isPaid") === "true";

    if (!isLoggedIn) {
      navigate("/login");
    } else if (!isPaid) {
      navigate("/pay-prompt");
    }
  }, [navigate]);

  // ---------- 合作对象信息 ----------
  const defaultPartner = {
    id: 0,
    name: t("demo_user"),
    img: "https://picsum.photos/seed/default/80/80",
  };

  const partner = partnerId
    ? {
        id: Number(partnerId),
        name: `${t("user")} #${partnerId}`,
        img: `https://picsum.photos/seed/${partnerId}/80/80`,
      }
    : defaultPartner;

  // ---------- 消息状态 ----------
  const [messages, setMessages] = useState([
    { id: 1, from: "partner", text: t("hi_sample") },
    { id: 2, from: "partner", text: t("how_are_you") },
  ]);
  const [input, setInput] = useState("");

  // ---------- 发送消息 + 模拟回复 ----------
  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // 模拟对方回复
    const replies = [
      t("got_it"),
      t("interesting"),
      t("sounds_good"),
      t("lets_continue"),
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "partner", text: reply },
      ]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------- 语言切换 ----------
  const toggleLanguage = () => {
    const newLang = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={style.page}>
      {/* 头部 */}
      <header style={style.header}>
        <button style={style.backBtn} onClick={() => navigate("/match")}>
          ← {t("back_to_match")}
        </button>
        <img src={partner.img} alt={partner.name} style={style.avatar} />
        <span style={style.partnerName}>{partner.name}</span>
        <button style={style.langBtn} onClick={toggleLanguage}>
          {i18n.language === "zh" ? "EN" : "中"}
        </button>
      </header>

      {/* 消息区 */}
      <div style={style.chatArea}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...style.messageBubble,
              ...(msg.from === "me" ? style.myBubble : style.partnerBubble),
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <footer style={style.inputBar}>
        <textarea
          rows={1}
          placeholder={t("send_message_placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={style.textInput}
        />
        <button onClick={sendMessage} style={style.sendBtn}>
          {t("send")}
        </button>
      </footer>
    </div>
  );
}

// ----------------------- 桌面优化样式 -----------------------
const style = {
  page: {
    fontFamily: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 40px)",
    maxWidth: "520px",
    margin: "20px auto",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "15px",
    cursor: "pointer",
    marginRight: "12px",
    color: "#007bff",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "12px",
  },
  partnerName: {
    fontSize: "17px",
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "left",
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
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#eaeaea",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "10px 14px",
    margin: "8px 0",
    borderRadius: "16px",
    lineHeight: "1.5",
    wordBreak: "break-word",
    fontSize: "15px",
  },
  myBubble: {
    backgroundColor: "#0084ff",
    color: "#fff",
    alignSelf: "flex-end",
    borderTopRightRadius: "0",
  },
  partnerBubble: {
    backgroundColor: "#fff",
    color: "#000",
    alignSelf: "flex-start",
    borderTopLeftRadius: "0",
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#fff",
    borderTop: "1px solid #ddd",
  },
  textInput: {
    flex: 1,
    resize: "none",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    marginRight: "10px",
    outline: "none",
  },
  sendBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "15px",
    cursor: "pointer",
  },
};
