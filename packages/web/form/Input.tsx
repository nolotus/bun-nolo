import { useTheme } from "app/theme";

export const Input = (props) => {
  const theme = useTheme();
  return (
    <>
      <style>
        {`
          .input-wrapper {
            position: relative;
            width: 100%;
          }

          input {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.background};
            outline: none;
            transition: all 0.15s ease;
          }

          input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3.5px ${theme.focus};
          }

          input:hover {
            border-color: ${theme.hover};
          }

          input:disabled {
            background: ${theme.disabled};
            cursor: not-allowed;
          }

          input::placeholder {
            color: ${theme.placeholder};
          }
        `}
      </style>
      <div className="input-wrapper">
        <input {...props} />
      </div>
    </>
  );
};
