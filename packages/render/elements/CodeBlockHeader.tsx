import { useState, memo } from "react";
import {
  CommentDiscussionIcon,
  EyeIcon,
  FileIcon,
  CopyIcon,
  CheckIcon,
} from "@primer/octicons-react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

const createStyles = (theme: any) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: theme.codeBlock.headerBackground,
    borderRadius: "6px 6px 0 0",
  },

  button: {
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: theme.codeBlock.buttonColor,
    transition: "all 0.2s ease",
  },

  buttonHover: {
    background: theme.codeBlock.buttonHoverBackground,
    color: theme.codeBlock.buttonHoverColor,
  },

  buttonIcon: {
    color: theme.codeBlock.iconColor,
    transition: "color 0.2s ease",
  },

  buttonText: {
    width: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },

  buttonTextVisible: {
    width: "auto",
    marginLeft: "4px",
  },

  buttonCopied: {
    background: theme.codeBlock.copiedButtonBackground,
    color: theme.codeBlock.copiedButtonColor,
    padding: "8px 16px",
  },

  buttonCopiedHover: {
    background: theme.codeBlock.copiedButtonHoverBackground,
  },

  buttonsContainer: {
    display: "flex",
    gap: "8px",
  },

  languageLabel: {
    fontSize: "12px",
    color: theme.codeBlock.languageLabelColor,
    fontWeight: 500,
  },
});

export const CodeBlockHeader = memo(
  ({
    language,
    isCopied,
    isDarkMode,
    onChat,
    onPreview,
    onSave,
    onCopy,
  }: CodeBlockHeaderProps) => {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);
    const theme = useAppSelector(selectTheme);
    const styles = createStyles(theme);

    const getButtonStyle = (buttonId: string, isCopiedButton = false) => {
      const isHovered = hoveredButton === buttonId;
      return {
        ...styles.button,
        ...(isHovered && styles.buttonHover),
        ...(isCopiedButton && isCopied && styles.buttonCopied),
        ...(isCopiedButton &&
          isCopied &&
          isHovered &&
          styles.buttonCopiedHover),
      };
    };

    const getIconStyle = (buttonId: string) => ({
      ...styles.buttonIcon,
      ...(hoveredButton === buttonId && styles.buttonIconHover),
    });

    const getTextStyle = (buttonId: string) => ({
      ...styles.buttonText,
      ...(hoveredButton === buttonId && styles.buttonTextVisible),
    });

    return (
      <div style={styles.header}>
        <span style={styles.languageLabel}>{language}</span>
        <div style={styles.buttonsContainer}>
          <button
            onClick={onChat}
            style={getButtonStyle("chat")}
            onMouseEnter={() => setHoveredButton("chat")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <CommentDiscussionIcon size={16} style={getIconStyle("chat")} />
            <div style={getTextStyle("chat")}>Chat</div>
          </button>
          <button
            onClick={onPreview}
            style={getButtonStyle("preview")}
            onMouseEnter={() => setHoveredButton("preview")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <EyeIcon size={16} style={getIconStyle("preview")} />
            <div style={getTextStyle("preview")}>Preview</div>
          </button>

          <button
            onClick={onSave}
            style={getButtonStyle("save")}
            onMouseEnter={() => setHoveredButton("save")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <FileIcon size={16} style={getIconStyle("save")} />
            <div style={getTextStyle("save")}>Save</div>
          </button>

          <button
            onClick={onCopy}
            disabled={isCopied}
            style={getButtonStyle("copy", true)}
            onMouseEnter={() => setHoveredButton("copy")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {isCopied ? (
              <>
                <CheckIcon size={16} style={getIconStyle("copy")} />
                <div style={getTextStyle("copy")}>Copied!</div>
              </>
            ) : (
              <>
                <CopyIcon size={16} style={getIconStyle("copy")} />
                <div style={getTextStyle("copy")}>Copy</div>
              </>
            )}
          </button>
        </div>
      </div>
    );
  },
);

CodeBlockHeader.displayName = "CodeBlockHeader";
