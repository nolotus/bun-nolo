// MoodNoteInput.js
import React, { useState } from "react";
import { TbMoodCheck } from "react-icons/tb";

interface MoodNoteInputProps {
  onSend: (content: string) => void;
}

const RecordButton = ({
  handleSend,
  style,
}: {
  handleSend: () => void;
  style?: React.CSSProperties;
}) => {
  return (
    <button
      onClick={handleSend}
      style={{
        width: "35px",
        height: "35px",
        backgroundColor: "#7AB892",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(122, 184, 146, 0.2)",
        transition: "all 0.3s ease",
        ...style,
      }}
      // Optional: Add visual feedback on hover/active
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5f9475")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7AB892")}
    >
      <TbMoodCheck size={20} />
    </button>
  );
};

const MoodNoteInput: React.FC<MoodNoteInputProps> = ({ onSend }) => {
  const [content, setContent] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSend = () => {
    if (content.trim()) {
      onSend(content);
      setContent("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "15px", // This gap might create empty space now
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      {/* Input field container */}
      <div
        style={{
          position: "relative",
          flex: 1, // Takes up available space
        }}
      >
        <input
          type="text"
          value={content}
          onChange={handleInputChange}
          placeholder="记录此刻心情..." // Placeholder text
          style={{
            height: "90px", // Original height
            padding: "0 60px 0 20px", // Padding (right side for button)
            fontSize: "16px", // Original font size
            border: "2px solid #7AB892",
            borderRadius: "25px", // Rounded corners
            backgroundColor: "#F8FBF9", // Background color
            boxShadow: "0 2px 8px rgba(122, 184, 146, 0.1)", // Shadow
            outline: "none", // Remove default outline
            transition: "all 0.3s ease", // Smooth transition
            width: "100%", // Full width of its container
            boxSizing: "border-box", // Include padding in width/height calculation
            lineHeight: "86px", // Attempt to vertically center text (adjust as needed)
          }}
          // Send on Enter key press
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // Check for Enter without Shift
              e.preventDefault(); // Prevent newline in input
              handleSend(); // Call the send handler
            }
          }}
        />
        {/* Send button positioned inside the input area */}
        <RecordButton
          handleSend={handleSend}
          style={{
            position: "absolute", // Position relative to the input container
            right: "10px", // Distance from the right edge
            top: "50%", // Position halfway down
            transform: "translateY(-50%)", // Adjust vertically to true center
          }}
        />
      </div>
      {/* The space previously occupied by the image button might still exist due to the outer div's gap */}
    </div>
  );
};

export default MoodNoteInput;
