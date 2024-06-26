import React, { Suspense, useState } from "react";
import OpenProps from "open-props";

import {
  dracula,
  vscDarkPlus,
  vs,
  synthwave84,
  solarizedDarkAtom,
  shadesOfPurple,
  pojoaque,
  oneLight,
  oneDark,
  nord,
  nightOwl,
  materialOceanic,
  materialLight,
  materialDark,
  lucario,
  hopscotch,
  holiTheme,
  gruvboxLight,
  gruvboxDark,
  ghcolors,
  duotoneSpace,
  duotoneSea,
  duotoneLight,
  darcula,
  coyWithoutShadows,
  coldarkDark,
  coldarkCold,
  cb,
  base16AteliersulphurpoolLight,
  atomDark,
  a11yDark,
  prism,
  twilight,
  tomorrow,
  solarizedlight,
  okaidia,
  funky,
  dark,
  coy,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import SyntaxHighlighter from "./SyntaxHighlighter";
import CodeHeader from "./CodeHeader";

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

const Code = ({ value, language, isDarkMode }) => {
  const [isPreview, setIsPreview] = useState(false); // 新增预览状态
  const togglePreview = () => setIsPreview(!isPreview);

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
            style={isDarkMode ? atomDark : prism}
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
    }
  };

  return (
    <div className="relative my-6">
      <CodeHeader value={value} language={language} />
      {renderContent()}
    </div>
  );
};

export default Code;
