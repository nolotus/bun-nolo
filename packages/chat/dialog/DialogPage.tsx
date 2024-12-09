import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, UploadIcon, XIcon } from "@primer/octicons-react";

// 添加全局样式
<style>
  {`
    textarea:focus {
      border-color: #7C3AED !important;
      background-color: #FFFFFF !important;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
    }
    
    .message-enter {
      opacity: 0;
      transform: translateY(20px);
    }
    
    .message-enter-active {
      opacity: 1;
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    @keyframes typing {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
  `}
</style>;

const COLORS = {
  primary: "#7C3AED",
  primaryLight: "#9F7AEA",
  primaryGhost: "rgba(124, 58, 237, 0.1)",
  background: "#FFFFFF",
  backgroundGhost: "#F9FAFB",
  text: "#111827",
  textSecondary: "#4B5563",
  placeholder: "#9CA3AF",
  border: "#E5E7EB",
  borderHover: "#D1D5DB",
  dropZoneActive: "rgba(124, 58, 237, 0.08)",
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatContainerStyle = {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.background,
    overflow: "hidden",
  };

  const messageContainerStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "20px 20%",
    paddingBottom: "10px",
    backgroundColor: COLORS.background,

    scrollBehavior: "smooth",
    scrollbarWidth: "thin",
    scrollbarColor: `${COLORS.border} transparent`,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: COLORS.border,
      borderRadius: "3px",
      "&:hover": {
        background: COLORS.borderHover,
      },
    },
  };

  const messageStyle = {
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "16px",
    maxWidth: "85%",
    minWidth: "100px",
    fontSize: "15px",
    lineHeight: "1.6",
    backgroundColor: COLORS.backgroundGhost,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    animation: "message-enter 0.3s ease forwards",
  };

  const inputAreaStyle = {
    position: "relative",
    display: "flex",
    gap: "8px", // 减小间距
    padding: "10px 20%", // 减小上下padding
    paddingBottom: "20px",
    backgroundColor: COLORS.background,
    borderTop: "none", // 移除边框
  };

  const inputStyle = {
    flex: 1,
    height: "48px", // 减小高度
    padding: "12px 16px", // 减小内边距
    fontSize: "15px",
    lineHeight: "1.5",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    backgroundColor: COLORS.backgroundGhost,
    resize: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    color: COLORS.text,
  };
  const uploadButtonStyle = {
    width: "48px", // 减小尺寸
    height: "48px",
    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.background,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    color: COLORS.textSecondary,
    "&:hover": {
      backgroundColor: COLORS.backgroundGhost,
      borderColor: COLORS.primary,
      color: COLORS.primary,
      transform: "scale(1.02)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  };

  const sendButtonStyle = {
    padding: "0 24px", // 减小内边距
    height: "48px", // 减小高度
    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    color: COLORS.background,
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    gap: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: COLORS.primaryLight,
      transform: "scale(1.02)",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  };

  const dropZoneStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDragging ? COLORS.dropZoneActive : "transparent",
    border: isDragging ? `2px dashed ${COLORS.primary}` : "none",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    color: COLORS.primary,
    pointerEvents: isDragging ? "all" : "none",
    transition: "all 0.2s ease",
  };

  const filePreviewStyle = {
    position: "absolute",
    bottom: "100%",
    left: "20%",
    right: "20%",
    padding: "12px 16px",
    marginBottom: "8px",
    backgroundColor: COLORS.backgroundGhost,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    color: COLORS.text,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: `1px solid ${COLORS.border}`,
  };

  // Mock responses for testing
  const mockResponses = [
    "这是一段优化后的AI回复内容。为了展示更好的效果，这里添加了一些格式化的文本。",
    "让我们来看看不同样式：\n\n- 重点内容\n- 关键信息\n\n**加粗文字**\n\n正常段落文字",
    "```javascript\nconst greeting = 'Hello!';\nconsole.log(greeting);\n```",
  ];
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("文件大小不能超过10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = () => {
    if ((input.trim() || selectedFile) && !isLoading) {
      const userMessage = input.trim();
      setInput("");
      setIsLoading(true);

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          text: selectedFile
            ? `[文件: ${selectedFile.name}] ${userMessage}`
            : userMessage,
          type: "user",
          timestamp: new Date().getTime(),
        },
      ]);

      // Clear file after sending
      setSelectedFile(null);

      // Simulate AI response
      setTimeout(
        () => {
          const randomResponse =
            mockResponses[Math.floor(Math.random() * mockResponses.length)];
          setMessages((prev) => [
            ...prev,
            {
              text: randomResponse,
              type: "ai",
              timestamp: new Date().getTime(),
            },
          ]);
          setIsLoading(false);
        },
        1000 + Math.random() * 1000
      ); // Random delay between 1-2s
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 140);
    textarea.style.height = `${newHeight}px`;
    setInput(textarea.value);
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);
  return (
    <div style={chatContainerStyle}>
      <div id="message-container" style={messageContainerStyle}>
        {messages.map((msg, idx) => (
          <div
            key={msg.timestamp || idx}
            style={{
              ...messageStyle,
              marginLeft: msg.type === "user" ? "auto" : "0",
              backgroundColor:
                msg.type === "user" ? COLORS.primary : COLORS.backgroundGhost,
              color: msg.type === "user" ? COLORS.background : COLORS.text,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.text}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              ...messageStyle,
              color: COLORS.textSecondary,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>AI思考中</span>
            <span
              style={{
                animation: "typing 1.4s infinite",
                display: "inline-block",
              }}
            >
              ...
            </span>
          </div>
        )}
      </div>

      <div
        style={inputAreaStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div style={dropZoneStyle}>
            <UploadIcon size={24} />
            <span style={{ marginLeft: "8px" }}>释放鼠标上传文件</span>
          </div>
        )}

        {selectedFile && (
          <div style={filePreviewStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UploadIcon size={16} />
              <span>{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              style={{
                background: "none",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                color: COLORS.textSecondary,
                borderRadius: "4px",
                display: "flex",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: COLORS.border,
                },
              }}
            >
              <XIcon size={16} />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />

        <div
          style={uploadButtonStyle}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon size={20} />
        </div>

        <textarea
          value={input}
          onChange={adjustTextareaHeight}
          onKeyPress={handleKeyPress}
          style={inputStyle}
          placeholder={
            isDragging
              ? "释放鼠标上传文件"
              : "输入消息... (Shift + Enter 换行，拖拽文件上传)"
          }
          disabled={isLoading}
        />

        <button
          onClick={handleSend}
          style={{
            ...sendButtonStyle,
            opacity: isLoading || (!input.trim() && !selectedFile) ? 0.6 : 1,
            cursor:
              isLoading || (!input.trim() && !selectedFile)
                ? "not-allowed"
                : "pointer",
          }}
          disabled={isLoading || (!input.trim() && !selectedFile)}
        >
          <span>发送</span>
          <PaperAirplaneIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
