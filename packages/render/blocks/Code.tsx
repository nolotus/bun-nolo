import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeClosedIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import Gradients from "open-props/src/gradients";
import React, { Suspense, lazy, useCallback, useState, memo } from "react";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const CopyToClipboard = memo(({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = useCallback(async () => {
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // 复制状态持续2秒
      } catch (err) {
        console.error("无法复制:", err);
      }
    }
  }, [text]);

  return (
    <button
      onClick={copyText}
      className={clsx(
        "rounded px-2 py-1 transition-all duration-200 ease-in-out",
        isCopied
          ? "bg-gray-700 text-green-400"
          : "text-gray-200 hover:bg-gray-700",
      )}
      disabled={!text}
      aria-label="复制代码"
      style={{
        background: "transparent",
        border: "none",
      }}
    >
      {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </button>
  );
});

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  })),
);

// 加载显示组件
const Loader = () => <div>Loading...</div>;

const Code = ({ value, language }) => {
  const [isPreview, setIsPreview] = useState(false); // 新增预览状态

  const togglePreview = () => setIsPreview(!isPreview);

  function renderJson(jsonOrString) {
    let json;
    if (typeof jsonOrString === "string") {
      try {
        json = JSON.parse(jsonOrString);
      } catch (error) {
        console.error("JSON解析错误:", error);
        return <div>JSON解析错误，请检查。</div>;
      }
    } else {
      json = jsonOrString;
    }

    if (typeof json === "string") {
      return json;
    }

    let children = null;
    if (json.children) {
      children = Array.isArray(json.children)
        ? json.children.map(renderJson)
        : renderJson(json.children);
    }

    return React.createElement(json.type, json.props, children);
  }

  const renderContent = () => {
    if (isPreview) {
      try {
        return renderJson(value);
      } catch (error) {
        console.error("渲染错误:", error);
        return <div>代码渲染错误，请检查。</div>;
      }
    } else {
      return (
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
      );
    }
  };

  return (
    <div className="relative mx-auto my-6 overflow-hidden rounded-lg bg-gray-800 text-gray-100 shadow-md">
      <div
        className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-teal-600 px-2 py-1"
        style={{
          backgroundImage: Gradients["--gradient-23"],
        }}
      >
        <span className="text-sm font-medium">
          {language?.toUpperCase() || "CODE"}
        </span>
        <div className="flex items-center">
          <button
            onClick={togglePreview} // 切换预览状态
            className="rounded px-1 py-1 text-gray-200 transition-all duration-200 ease-in-out hover:bg-gray-700"
            aria-label="切换预览"
            style={{
              background: "transparent",
            }}
          >
            {isPreview ? <EyeClosedIcon size={16} /> : <EyeIcon size={16} />}{" "}
            {/*根据状态显示不同图标*/}
          </button>
          <CopyToClipboard text={value} />
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Code;
