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
        // 假设DSL JSON已经存储在`value`变量中
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
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-teal-600 px-2 py-1">
        <span className="text-sm font-medium">
          {language?.toUpperCase() || "CODE"}
        </span>
        <button
          onClick={handleCopy}
          className={clsx(
            "rounded px-2 py-1 transition-all duration-200 ease-in-out",
            isCopied
              ? "bg-gray-700 text-green-400"
              : "text-gray-200 hover:bg-gray-700",
          )}
          disabled={!value}
          aria-label="复制代码"
        >
          {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </div>
      <button
        onClick={togglePreview} // 切换预览状态
        className="rounded px-2 py-1 text-gray-200 transition-all duration-200 ease-in-out hover:bg-gray-700"
        aria-label="切换预览"
      >
        {isPreview ? "源代码" : "预览"} {/* 根据状态显示不同文本 */}
      </button>
      {renderContent()}
    </div>
  );
};

export default Code;
