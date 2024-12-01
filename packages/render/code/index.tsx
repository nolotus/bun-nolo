import React, { Suspense, useState } from "react";
import OpenProps from "open-props";

import SyntaxHighlighter from "./SyntaxHighlighter";

function renderJson(jsonOrString) {
  let json;
  if (typeof jsonOrString === "string") {
    try {
      json = JSON.parse(jsonOrString);
    } catch (error) {
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

const Code = ({ value, language, isDarkMode }) => {
  const [isPreview, setIsPreview] = useState(false); // 新增预览状态

  const renderContent = () => {
    return (
      <Suspense fallback={<div>{value}</div>}>
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              display: "block",
              width: `calc(100vw - ${OpenProps.size13 + OpenProps.size13 + OpenProps.size9})`,
            },
          }}
          wrapLongLines={true}
          language={language || "jsx"}
          customStyle={{
            borderRadius: "0",
            margin: "0",
            fontSize: OpenProps.fontSize1,
            padding: OpenProps["--size-fluid-2"],
          }}
        >
          {value}
        </SyntaxHighlighter>
      </Suspense>
    );
  };

  return <div className="relative my-6">{renderContent()}</div>;
};

export default Code;
