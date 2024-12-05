import React, { useState } from "react";
import { XIcon, PaperAirplaneIcon } from "@primer/octicons-react";
import { colors, animations, shadows } from "render/styles/theme";
import { createButtonStyle } from "render/styles/button";

interface EditChatProps {
  show: boolean;
  onClose: () => void;
}

export const EditChat = ({ show, onClose }: EditChatProps) => {
  const [inputValue, setInputValue] = useState("");

  if (!show) return null;

  const MessageBubble = ({
    isAI = false,
    content,
  }: {
    isAI?: boolean;
    content: string;
  }) => (
    <div
      style={{
        backgroundColor: isAI
          ? colors.background.lighter
          : colors.primary.light,
        color: isAI ? colors.text.primary : colors.primary.default,
        padding: "14px 18px",
        borderRadius: "16px",
        maxWidth: "85%",
        marginLeft: isAI ? 0 : "auto",
        marginBottom: "16px",
        fontSize: "14px",
        lineHeight: "1.6",
        boxShadow: shadows.subtle.default,
      }}
    >
      {content}
    </div>
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: colors.background.lighter,
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 12px",
            borderRadius: "8px",
            backgroundColor: colors.background.lighter,
            backdropFilter: "blur(8px)",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: colors.text.primary,
            }}
          >
            AI 助手
          </span>
        </div>
        <button onClick={onClose} style={createButtonStyle("default")}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <XIcon size={16} />
          </span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#fff",
        }}
      >
        <MessageBubble isAI={true} content="你可以让我帮你修改内容或调整设置" />
        <MessageBubble content="好的，我想调整段落的格式" />
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: colors.background.lighter,
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            position: "relative",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入内容..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              backgroundColor: colors.background.light,
              color: colors.text.primary,
              outline: "none",
              boxShadow: shadows.subtle.default,
              transition: `all ${animations.duration.fast} ${animations.spring}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.hover;
              e.currentTarget.style.boxShadow = shadows.primary.default;
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.light;
              e.currentTarget.style.boxShadow = shadows.subtle.default;
            }}
          />
          <button
            onClick={() => {
              if (inputValue.trim()) {
                setInputValue("");
              }
            }}
            style={{
              ...createButtonStyle(inputValue.trim() ? "primary" : "default"),
              minWidth: "86px",
              height: "42px",
              opacity: inputValue.trim() ? 1 : 0.7,
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PaperAirplaneIcon size={16} />
              发送
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
