import React from "react";
import { useTheme } from "app/theme"; // Import useTheme

interface InlineEditInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  // Spread the rest of the props from useInlineEdit's inputProps
  [key: string]: any; // Allow spreading other standard input attributes
}

const InlineEditInput: React.FC<InlineEditInputProps> = ({
  inputRef,
  ...inputProps // Includes value, onChange, onKeyDown, onBlur, placeholder, aria-label
}) => {
  const theme = useTheme(); // Get theme object

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        className="inline-edit-input" // Use a dedicated class name
        {...inputProps}
      />
      {/* CSS Styles embedded within the component */}
      <style>
        {`
          .inline-edit-input {
            flex-grow: 1; /* Take available space like the original span */
            font-size: 14px;
            font-weight: 600;
            color: ${theme?.text || "#333"};
            line-height: 1.4;
            letter-spacing: -0.01em;
            padding: 1px 4px; /* Adjust padding to match span visually */
            margin: 0; /* Remove default margin */
            border: 1px solid transparent; /* No border by default */
            background-color: transparent; /* Transparent background */
            outline: none;
            box-shadow: none;
            border-radius: 4px; /* Subtle rounding */
            min-width: 50px; /* Prevent collapsing too small */
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
            height: 24px; /* Match button height for alignment */
            box-sizing: border-box;
          }

          .inline-edit-input:focus {
            border-color: ${theme?.primary || "#1677ff"};
            background-color: ${theme?.background || "#fff"}; /* White background on focus */
            box-shadow: 0 0 0 2px ${theme?.primary ? `${theme.primary}33` : "rgba(22, 119, 255, 0.2)"};
          }
        `}
      </style>
    </>
  );
};

export default InlineEditInput;
