import React from "react";
import { defaultTheme } from "render/styles/colors";

export const TextArea = React.forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
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
            border: 1px solid ${defaultTheme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${defaultTheme.text};
            background: ${defaultTheme.background};
            resize: vertical;
            outline: none;
            transition: all 0.15s ease;
            font-family: inherit;
          }

          .textarea:focus {
            border-color: ${defaultTheme.primary};
            box-shadow: 0 0 0 3.5px ${defaultTheme.focus};
          }

          .textarea:hover {
            border-color: ${defaultTheme.hover};
          }

          .textarea:disabled {
            background: ${defaultTheme.disabled};
            cursor: not-allowed;
          }

          .textarea::placeholder {
            color: ${defaultTheme.placeholder};
          }
        `}
			</style>

			<div className="textarea-wrapper">
				<textarea {...props} ref={ref} className="textarea" />
			</div>
		</>
	);
});

TextArea.displayName = "TextArea";

export default TextArea;
