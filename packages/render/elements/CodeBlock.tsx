import { CheckIcon, CodeIcon, CopyIcon, EyeIcon } from "@primer/octicons-react";
import mermaid from "mermaid";
import { useEffect, useState } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import { useTheme } from "app/theme";
import copyToClipboard from "utils/clipboard";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-mermaid";
import { zIndex } from "../styles/zIndex";

// Mermaid 配置
mermaid.initialize({
	startOnLoad: true,
	securityLevel: "loose",
	theme: "default",
});

const CodeBlock = ({ attributes, children, element }) => {
	const theme = useTheme();
	const [isCopied, setIsCopied] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	const styles = {
		codeBlock: {
			position: "relative",
			fontFamily: "'Fira Code', monospace",
			background: theme.backgroundSecondary,
			padding: "1.5rem",
			borderRadius: "8px",
			margin: "16px 0",
			border: `1px solid ${theme.border}`,
			boxShadow: `0 2px 4px ${theme.shadowLight}`,
			transition: "all 0.3s ease",
		},
		previewMode: {
			background: theme.background,
			padding: "2rem",
		},
		actions: {
			position: "absolute",
			top: "10px",
			right: "10px",
			display: "flex",
			gap: "8px",
			alignItems: "center",
			zIndex: zIndex.codeBlockActions,
			background: theme.backgroundGhost,
			padding: "4px 8px",
			borderRadius: "6px",
			backdropFilter: "blur(4px)",
		},
		button: {
			background: "transparent",
			border: "none",
			cursor: "pointer",
			padding: "6px",
			color: theme.textSecondary,
			borderRadius: "4px",
			display: "flex",
			alignItems: "center",
			transition: "all 0.2s ease",
			"&:hover": {
				background: theme.primaryGhost,
				color: theme.text,
			},
		},
		activeButton: {
			background: theme.primaryGhost,
			color: theme.text,
		},
		languageTag: {
			fontSize: "12px",
			fontWeight: "500",
			color: theme.textSecondary,
			padding: "4px 8px",
			background: theme.primaryGhost,
			borderRadius: "4px",
			textTransform: "uppercase",
		},
		pre: {
			margin: 0,
			whiteSpace: "pre-wrap",
			wordBreak: "break-word",
			fontSize: "14px",
			lineHeight: 1.6,
			color: theme.text,
		},
	};

	// content memo logic...

	const handleCopy = () => {
		copyToClipboard(content, {
			onSuccess: () => {
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), 2000);
			},
		});
	};

	const ActionButtons = (
		<div style={styles.actions}>
			<span style={styles.languageTag}>{element.language}</span>
			<button
				onClick={() => setShowPreview(!showPreview)}
				style={{
					...styles.button,
					...(showPreview ? styles.activeButton : {}),
				}}
				title={showPreview ? "Show Code" : "Show Preview"}
			>
				{showPreview ? <CodeIcon size={16} /> : <EyeIcon size={16} />}
			</button>
			<button
				onClick={handleCopy}
				style={styles.button}
				title={isCopied ? "Copied!" : "Copy code"}
			>
				{isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
			</button>
		</div>
	);

	// JSON View render...
	if (element.language === "json" && content) {
		try {
			const jsonData = JSON.parse(content);
			return (
				<div
					{...attributes}
					style={{
						...styles.codeBlock,
						...(showPreview ? styles.previewMode : {}),
					}}
				>
					{ActionButtons}
					{showPreview ? (
						<JsonView
							data={jsonData}
							shouldExpandNode={allExpanded}
							style={{
								...defaultStyles,
								container: {
									...defaultStyles.container,
									backgroundColor: "transparent",
								},
							}}
						/>
					) : (
						<pre style={styles.pre}>{content}</pre>
					)}
				</div>
			);
		} catch (e) {
			console.error("JSON parse error:", e);
		}
	}

	// Mermaid View render...
	if (element.language === "mermaid") {
		useEffect(() => {
			if (showPreview) {
				mermaid.contentLoaded();
			}
		}, [showPreview]);

		return (
			<div
				{...attributes}
				style={{
					...styles.codeBlock,
					...(showPreview ? styles.previewMode : {}),
				}}
			>
				{ActionButtons}
				{showPreview ? (
					<div className="mermaid">{content}</div>
				) : (
					<pre style={styles.pre}>{content}</pre>
				)}
			</div>
		);
	}

	// Default Code Block
	return (
		<div {...attributes} style={styles.codeBlock}>
			{ActionButtons}
			<pre style={styles.pre}>{children}</pre>
		</div>
	);
};

export default CodeBlock;
