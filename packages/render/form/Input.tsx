import { defaultTheme } from "render/styles/colors";

export const Input = (props) => {
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
            border: 1px solid ${defaultTheme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${defaultTheme.text};
            background: ${defaultTheme.background};
            outline: none;
            transition: all 0.15s ease;
          }

          input:focus {
            border-color: ${defaultTheme.primary};
            box-shadow: 0 0 0 3.5px ${defaultTheme.focus};
          }

          input:hover {
            border-color: ${defaultTheme.hover};
          }

          input:disabled {
            background: ${defaultTheme.disabled};
            cursor: not-allowed;
          }

          input::placeholder {
            color: ${defaultTheme.placeholder};
          }
        `}
      </style>
      <div className="input-wrapper">
        <input {...props} />
      </div>
    </>
  );
};
