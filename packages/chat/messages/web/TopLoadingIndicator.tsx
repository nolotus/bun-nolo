import React from "react";
import { useTheme } from "app/theme";

// --- Keyframes for Spinner Animation ---
const spinKeyframes = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

// --- Top Loading Indicator Component ---
const TopLoadingIndicator: React.FC = () => {
  const theme = useTheme();
  return (
    <>
      <style>{spinKeyframes}</style>
      <div className="chat-messages__loading-indicator-container">
        <div className="chat-messages__loading-indicator-spinner" />
      </div>
      <style href="TopLoadingIndicator" precedence="medium">{`
        .chat-messages__loading-indicator-container {
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }

        .chat-messages__loading-indicator-spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: ${theme.primary || "#09f"};
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default TopLoadingIndicator;
