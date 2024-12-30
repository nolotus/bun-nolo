import { CheckIcon, CodeIcon, CopyIcon, EyeIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";


const CodeBlockActions = ({
  language,
  showPreview,
  setShowPreview,
  isCopied,
  onCopy
}) => {
  const theme = useTheme();


  return (
    <>
      <style>
        {`
          .code-block-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 8px;
            align-items: center;
            z-index: ${zIndex.codeBlockActions};
            background: ${theme.backgroundGhost};
            padding: 4px 8px;
            border-radius: 6px;
            backdrop-filter: blur(4px);
          }


          .language-tag {
            font-size: 12px;
            font-weight: 500;
            color: ${theme.textSecondary};
            padding: 4px 8px;
            background: ${theme.primaryGhost};
            border-radius: 4px;
            text-transform: uppercase;
          }


          .action-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 6px;
            color: ${theme.textSecondary};
            border-radius: 4px;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
          }


          .action-button:hover {
            background: ${theme.primaryGhost};
            color: ${theme.text};
          }


          .action-button.active {
            background: ${theme.primaryGhost};
            color: ${theme.text};
          }
        `}
      </style>


      <div className="code-block-actions">
        <span className="language-tag">{language}</span>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`action-button ${showPreview ? 'active' : ''}`}
          title={showPreview ? "Show Code" : "Show Preview"}
        >
          {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
        </button>


        <button
          onClick={onCopy}
          className="action-button"
          title={isCopied ? "Copied!" : "Copy code"}
        >
          {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </div>
    </>
  );
};


export default CodeBlockActions;
