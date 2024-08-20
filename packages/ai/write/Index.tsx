import React, { useState } from "react";
import { useRoute } from "server/next/RouteContext";

const WritingAiPage = () => {
  const [themeInput, setThemeInput] = useState("");
  const [characterInput, setCharacterInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const { navigate } = useRoute();

  const handleThemeInputChange = (e) => {
    setThemeInput(e.target.value);
  };

  const handleCharacterInputChange = (e) => {
    setCharacterInput(e.target.value);
  };

  const handleGenerate = () => {
    console.log(
      "Generating with theme:",
      themeInput,
      "and character:",
      characterInput,
    );
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSend = () => {
    console.log("Sending message:", userInput);
    setUserInput("");
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.sidebar}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>输入主题提示词：</label>
          <input
            value={themeInput}
            onChange={handleThemeInputChange}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>输入角色提示词：</label>
          <input
            value={characterInput}
            onChange={handleCharacterInputChange}
            style={styles.input}
          />
        </div>
        <button onClick={handleGenerate} style={styles.generateButton}>
          AI 创作
        </button>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <button onClick={() => navigate("/")} style={styles.closeButton}>
            关闭 ✕
          </button>
        </div>
        <div style={styles.aiResponseContainer}>
          <div style={styles.aiMessage}>
            <img
              src="/path-to-bot-avatar.png"
              alt="Bot"
              style={styles.botAvatar}
            />
            <p>
              欢迎使用 Cybot！请在左侧输入您的主题和角色提示词，Cybot
              将根据您的输入自动生成一个精彩的故事。
            </p>
          </div>
        </div>
        <div style={styles.inputContainer}>
          <input
            value={userInput}
            onChange={handleInputChange}
            placeholder="/"
            style={styles.userInput}
          />
          <button onClick={handleSend} style={styles.sendButton}>
            <img
              src="/path-to-send-icon.png"
              alt="Send"
              style={styles.sendIcon}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f5f5f5",
  },
  sidebar: {
    width: "300px",
    backgroundColor: "#ffffff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    borderRight: "1px solid #e0e0e0",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  },
  generateButton: {
    padding: "10px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  mainContent: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "20px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  aiResponseContainer: {
    flexGrow: 1,
    padding: "20px",
    overflowY: "auto",
  },
  aiMessage: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  botAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
  },
  inputContainer: {
    display: "flex",
    padding: "20px",
    gap: "10px",
  },
  userInput: {
    flexGrow: 1,
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  },
  sendButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  sendIcon: {
    width: "20px",
    height: "20px",
  },
};

export default WritingAiPage;
