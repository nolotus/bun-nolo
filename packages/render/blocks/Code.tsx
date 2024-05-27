import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeClosedIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import Gradients from "open-props/src/gradients";
import React, { Suspense, lazy, useCallback, useState, memo } from "react";
import {
  dracula,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { copyToClipboard } from "utils/clipboard";
import Colors from "open-props/src/colors";
import Shadows from "open-props/src/shadows";

const CopyToClipboard = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = useCallback(async () => {
    try {
      await copyToClipboard(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 复制状态持续2秒
    } catch (err) {
      console.error("无法复制:", err);
    }
  }, [text]);

  return (
    <button
      onClick={copyText}
      className={clsx("border-0 bg-transparent px-3 py-1")}
      style={{
        boxShadow: Shadows["--shadow-1"],
        color: isCopied && Colors["--green-7"],
      }}
      disabled={!text}
      aria-label="复制代码"
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

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
            wrapLongLines={true}
            language={language || "jsx"}
            style={vscDarkPlus}
            customStyle={{
              borderRadius: "0",
              margin: "0",
            }}
          >
            {value}
          </SyntaxHighlighter>
        </Suspense>
      );
    }
  };
  const CodeHeader = () => {
    return (
      <div className="surface3 flex items-center  justify-between px-4 py-2">
        <span>{language?.toUpperCase() || "CODE"}</span>
        <div className="flex items-center">
          <button
            onClick={togglePreview} // 切换预览状态
            aria-label="切换预览"
            className="surface3 mr-2 border-0 px-3 py-1"
            style={{ boxShadow: Shadows["--shadow-1"] }}
          >
            {isPreview ? <EyeClosedIcon /> : <EyeIcon />}
          </button>
          <CopyToClipboard text={value} />
        </div>
      </div>
    );
  };
  return (
    <div className="relative my-6">
      <CodeHeader />
      {renderContent()}
    </div>
  );
};

export default Code;
