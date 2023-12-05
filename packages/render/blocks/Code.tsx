import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import clsx from "clsx";
import React, { Suspense, lazy, useCallback, useState } from "react";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const SyntaxHighlighter = lazy(() =>
	import("react-syntax-highlighter").then((module) => ({
		default: module.Prism,
	})),
);

// 加载显示组件
const Loader = () => <div>Loading...</div>;

// 复制代码到剪贴板的函数
const useCopyToClipboard = (text, duration = 2000) => {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		if (text && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(text);
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), duration);
			} catch (err) {
				console.error("无法复制:", err);
			}
		}
	}, [text, duration]);

	return [isCopied, handleCopy];
};

const Code = ({ value, language }) => {
	const [isCopied, handleCopy] = useCopyToClipboard(value);

	return (
		<div className="relative my-6 mx-auto overflow-hidden rounded-lg shadow-md bg-gray-800 text-gray-100">
			<div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-500 to-teal-600">
				<span className="text-sm font-medium">
					{language?.toUpperCase() || "CODE"}
				</span>
				<button
					onClick={handleCopy}
					className={clsx(
						"px-2 py-1 rounded transition-all duration-200 ease-in-out",
						isCopied
							? "text-green-400 bg-gray-700"
							: "text-gray-200 hover:bg-gray-700",
					)}
					disabled={!value}
					aria-label="复制代码"
				>
					{isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
				</button>
			</div>

			<Suspense fallback={<Loader />}>
				<SyntaxHighlighter
					language={language || "jsx"}
					style={dracula}
					customStyle={{
						background: "transparent",
						padding: "1em",
						margin: "0",
					}}
				>
					{value}
				</SyntaxHighlighter>
			</Suspense>
		</div>
	);
};

export default Code;
