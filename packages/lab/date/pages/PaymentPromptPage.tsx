// src/lab/date/pages/PaymentPromptPage.tsx
import { useNavigate } from "react-router-dom";
import i18n from "app/i18n";
import { useState } from "react";

export default function PaymentPromptPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(i18n.language); // "zh" or "en"

  const handlePay = () => {
    localStorage.setItem("isPaid", "true");
    alert(lang === "zh" ? "支付成功！" : "Payment successful!");
    navigate("/match");
  };

  const toggleLanguage = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {lang === "zh" ? "开通会员" : "Activate Membership"}
        </h2>
        <p style={styles.desc}>
          {lang === "zh"
            ? "开通会员即可解锁无限配对和聊天功能"
            : "Unlock unlimited matches and chat"}
        </p>
        <div style={styles.priceBox}>
          <span style={styles.price}>$9.99</span>
          <span style={styles.unit}>{lang === "zh" ? "/ 月" : "/ month"}</span>
        </div>
        <button style={styles.payBtn} onClick={handlePay}>
          {lang === "zh" ? "立即开通" : "Activate Now"}
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
    fontSize: "20px",
    color: "#333",
  },
  desc: {
    margin: "0 0 20px",
    fontSize: "14px",
    color: "#666",
  },
  priceBox: {
    margin: "20px 0",
  },
  price: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
  },
  unit: {
    fontSize: "14px",
    color: "#777",
    marginLeft: "4px",
  },
  payBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#42b549",
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
