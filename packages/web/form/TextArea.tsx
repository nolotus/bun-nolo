import { useTheme } from "app/theme";
import type React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const TextArea = (props: TextAreaProps) => {
  const theme = useTheme();
  return (
    <>
      <style>
        {`
          .textarea-wrapper {
            position: relative;
            width: 100%;
          }

          .textarea {
            width: 100%;
            min-height: 100px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.background};
            resize: vertical;
            outline: none;
            transition: all 0.15s ease;
            font-family: inherit;
          }

          .textarea:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3.5px ${theme.focus};
          }

          .textarea:hover {
            border-color: ${theme.hover};
          }

          .textarea:disabled {
            background: ${theme.disabled};
            cursor: not-allowed;
          }

          .textarea::placeholder {
            color: ${theme.placeholder};
          }
        `}
      </style>

      <div className="textarea-wrapper">
        <textarea {...props} className="textarea" />
      </div>
    </>
  );
};

TextArea.displayName = "TextArea";

export default TextArea;
