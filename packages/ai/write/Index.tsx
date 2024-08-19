import React, { useState } from "react";

const WritingAiPage = () => {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [userInput, setUserInput] = useState("");
  const [hoveredButton, setHoveredButton] = useState(null);

  const themes = [
    "Theme",
    "Character",
    "Plot",
    "Conflict",
    "Point of View",
    "Imagine Story",
  ];
  const themeOptions = [
    "Courage",
    "Betrayal and Trust",
    "Justice vs. Revenge",
    "Friendship",
  ];

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
  };

  const handleGenerate = () => {
    console.log("Generating with theme:", selectedTheme);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSend = () => {
    console.log("Sending message:", userInput);
    setUserInput("");
  };

  const handleMouseEnter = (buttonName) => {
    setHoveredButton(buttonName);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  const getButtonStyle = (buttonName) => {
    return {
      ...styles.button,
      ...(hoveredButton === buttonName ? styles.buttonHover : {}),
      ...(buttonName === "generate" ? styles.generateButton : {}),
      ...(buttonName === "send" ? styles.sendButton : {}),
      ...(hoveredButton === buttonName &&
      (buttonName === "generate" || buttonName === "send")
        ? styles.blueButtonHover
        : {}),
    };
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.sidebar}>
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => handleThemeClick(theme)}
            style={getButtonStyle(theme)}
            onMouseEnter={() => handleMouseEnter(theme)}
            onMouseLeave={handleMouseLeave}
          >
            {theme}
          </button>
        ))}
        <button
          onClick={handleGenerate}
          style={getButtonStyle("generate")}
          onMouseEnter={() => handleMouseEnter("generate")}
          onMouseLeave={handleMouseLeave}
        >
          Generate
        </button>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Writing AI</h1>
          <button
            style={getButtonStyle("close")}
            onMouseEnter={() => handleMouseEnter("close")}
            onMouseLeave={handleMouseLeave}
          >
            Close
          </button>
        </div>
        <div style={styles.aiResponseContainer}>
          <p style={styles.aiMessage}>
            Start by adding a theme to your story. The theme or moral serves as
            a framework for everything else, so it's a good idea to think of it
            first.
          </p>
          <p style={styles.aiMessage}>
            Sure, here are some theme options that could serve as the foundation
            for a story:
          </p>
          <div style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <button
                key={option}
                style={getButtonStyle(option)}
                onMouseEnter={() => handleMouseEnter(option)}
                onMouseLeave={handleMouseLeave}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.inputContainer}>
          <input
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            style={styles.input}
          />
          <button
            onClick={handleSend}
            style={getButtonStyle("send")}
            onMouseEnter={() => handleMouseEnter("send")}
            onMouseLeave={handleMouseLeave}
          >
            Send
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
  },
  sidebar: {
    width: "200px",
    backgroundColor: "#f0f0f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  mainContent: {
    flexGrow: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    margin: 0,
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonHover: {
    backgroundColor: "#e0e0e0",
  },
  aiResponseContainer: {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    flexGrow: 1,
    overflowY: "auto",
  },
  aiMessage: {
    margin: "0 0 10px 0",
  },
  themeOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },
  generateButton: {
    backgroundColor: "#1a73e8",
    color: "white",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  input: {
    flexGrow: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  sendButton: {
    backgroundColor: "#1a73e8",
    color: "white",
  },
  blueButtonHover: {
    backgroundColor: "#1765cc",
  },
};

export default WritingAiPage;
