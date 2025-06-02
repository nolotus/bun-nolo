// app/pages/Recharge.jsx (或 .tsx)
import React, { useState } from "react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";

const RechargePage = () => {
  const theme = useAppSelector(selectTheme); // 获取当前主题，以便样式适应

  // 示例：可以添加一些状态来管理充值金额输入
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleAmountChange = (e) => {
    // 允许输入数字和小数点
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmitRecharge = (e) => {
    e.preventDefault();
    if (parseFloat(amount) > 0) {
      // 实际的充值逻辑会在这里调用后端API或支付SDK
      // 例如：dispatch(rechargeAction(amount));
      setMessage(`正在充值 ${amount} 元... (此为模拟，实际会调用支付接口)`);
      console.log("充值金额:", amount);
      // 模拟充值成功
      setTimeout(() => {
        setMessage("充值成功！您的余额已更新。");
        setAmount(""); // 清空输入框
      }, 2000);
    } else {
      setMessage("请输入有效的充值金额。");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px",
        borderRadius: "10px",
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
        color: theme.text,
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "25px",
          textAlign: "center",
          color: theme.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        账户充值
      </h1>

      <p
        style={{
          textAlign: "center",
          color: theme.textSecondary,
          marginBottom: "30px",
          lineHeight: "1.6",
        }}
      >
        请输入您希望充值的金额。充值成功后，您的余额将自动更新，以便您继续使用
        Cybot 服务。
      </p>

      <form
        onSubmit={handleSubmitRecharge}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <label
            htmlFor="recharge-amount"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              color: theme.text,
            }}
          >
            充值金额 (元):
          </label>
          <input
            id="recharge-amount"
            type="text" // 使用 text 类型以便更好地控制输入格式
            value={amount}
            onChange={handleAmountChange}
            placeholder="例如: 100.00"
            style={{
              width: "100%",
              padding: "12px 15px",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.backgroundLight,
              color: theme.text,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary;
              e.target.style.boxShadow = `0 0 0 3px ${theme.primary}50`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {message && (
          <p
            style={{
              textAlign: "center",
              color: message.includes("成功") ? "green" : "orange", // 简单地根据消息内容改变颜色
              marginTop: "10px",
              fontSize: "0.95rem",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: "15px 25px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: theme.primary,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s ease, transform 0.2s ease",
            marginTop: "20px",
            boxShadow: `0 5px 15px ${theme.primary}40`,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = theme.primaryDark)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = theme.primary)
          }
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "translateY(1px)")
          }
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          立即充值
        </button>
      </form>

      <div
        style={{
          marginTop: "40px",
          borderTop: `1px dashed ${theme.border}`,
          paddingTop: "25px",
          textAlign: "center",
          color: theme.textSecondary,
          fontSize: "0.85rem",
        }}
      >
        <p>如有任何充值问题，请联系客服支持。</p>
        <p>客服邮箱：support@yourcybot.com</p> {/* 替换为您的实际邮箱 */}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RechargePage;
