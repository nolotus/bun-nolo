import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ScreenFullIcon,
} from "@primer/octicons-react";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";

const CodeBlockActions = ({
  language,
  showPreview,
  setShowPreview,
  isCopied,
  onCopy,
  isCollapsed,
  setIsCollapsed,
  showRightPreview,
  setShowRightPreview,
  codeBlockPadding, // 从 CodeBlock 传递过来的 padding 值，用于 gap
}) => {
  const theme = useTheme();

  // 提取 code-block-actions 的高度变量，调整为 30px
  const CODE_BLOCK_ACTIONS_HEIGHT = theme.space[8]; // 32px（接近 30px，theme.space 中最接近的值）

  return (
    <>
      <style>
        {`
          .code-block-actions {
            position: absolute;
            top: ${theme.space[1]}; /* 4px，接近计算的 5px，用于居中 */
            right: ${theme.space[2]}; /* 8px */
            display: flex;
            gap: ${codeBlockPadding}; /* 使用 code-block 的 padding-top 值作为 gap */
            align-items: center;
            height: ${CODE_BLOCK_ACTIONS_HEIGHT}; /* 使用提取的高度变量，32px */
            z-index: ${zIndex.codeBlockActions};
            background: ${theme.backgroundGhost};
            padding: 0 ${theme.space[2]}; /* 仅设置左右 padding 为 8px */
            border-radius: ${theme.space[2]}; /* 8px */
            backdrop-filter: blur(4px);
          }

          .language-tag {
            font-size: 12px;
            font-weight: 500;
            color: ${theme.textSecondary};
            padding: ${theme.space[1]} ${theme.space[2]}; /* 4px 8px */
            background: ${theme.primaryGhost};
            border-radius: ${theme.space[1]}; /* 4px */
            text-transform: uppercase;
          }

          .action-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: ${theme.space[2]}; /* 8px，增加 padding 以适应更大高度 */
            color: ${theme.textSecondary};
            border-radius: ${theme.space[1]}; /* 4px */
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
          className={`action-button ${showPreview ? "active" : ""}`}
          title={showPreview ? "显示代码" : "显示预览"}
        >
          {showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
        </button>

        <button
          onClick={onCopy}
          className="action-button"
          title={isCopied ? "已复制!" : "复制代码"}
        >
          {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`action-button ${isCollapsed ? "active" : ""}`}
          title={isCollapsed ? "展开代码" : "折叠代码"}
        >
          {isCollapsed ? (
            <ChevronUpIcon size={16} />
          ) : (
            <ChevronDownIcon size={16} />
          )}
        </button>

        <button
          onClick={() => setShowRightPreview(!showRightPreview)}
          className={`action-button ${showRightPreview ? "active" : ""}`}
          title={showRightPreview ? "关闭右侧预览" : "打开右侧预览"}
        >
          <ScreenFullIcon size={16} />
        </button>
      </div>
    </>
  );
};

export default CodeBlockActions;
