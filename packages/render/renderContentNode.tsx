import React, { ReactNode } from "react";
import { isDevelopment } from "utils/env";

import Yaml from "./blocks/Yaml";

interface ContentNode {
  type: string;
  children?: ContentNode[];
  value?: string;
  className?: string;
  [key: string]: any;
}
interface RenderOptions {
  isDarkMode?: boolean;
  enableClassName?: boolean;
  debug?: boolean;
}

//这个函数会递归渲染 renderChild，如果传递了options 不二次传递会丢失
export const renderContentNode = (
  node: ContentNode,
  options?: RenderOptions,
): ReactNode => {
  const debug = options?.debug ? options.debug : isDevelopment;
  const enableClassName = options?.enableClassName
    ? options.enableClassName
    : isDevelopment;
  const classNames = enableClassName ? node.className : undefined;
  //所以这里需要传递options

  const renderChild = (child: ContentNode) => renderContentNode(child, options);

  switch (node.type) {
    case "yaml":
      return <Yaml value={node.value} />;
    // case 'json': {
    //   const str = `{${node.value}}`;
    //   const json = JSON.parse(str);
    //   return <div>{JSON.stringify(json)}</div>;
    // }

    default:
      if (typeof node === "string") {
        return node;
      } else if (Array.isArray(node)) {
        return <>{node.map(renderChild)}</>;
      } else if (typeof node === "object" && node !== null) {
        return (
          <div>
            {Object.keys(node).map((key) => (
              <div key={key}>
                <strong>{key}: </strong>
                {renderContentNode(node[key])}
              </div>
            ))}
          </div>
        );
      }
  }
};
