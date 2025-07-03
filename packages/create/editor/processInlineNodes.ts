// 文件: create/editor/processInlineNodes.ts

// 辅助类型定义
interface SlateTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
}
interface SlateElementNode {
  type: string;
  url?: string;
  alt?: string;
  title?: string;
  html?: string; // html-inline 或 html-block
  language?: string; // 代码块语言
  children: SlateChild[];
}
type SlateChild = SlateTextNode | SlateElementNode;
type SlateInlineChild = SlateChild;

// 提取 HTML 标签名，例如 "<span>" -> "span"
function getTagName(html: string): string | null {
  if (!html) return null;
  const match = html.match(/^<\/?([a-zA-Z0-9]+)/);
  return match ? match[1].toLowerCase() : null;
}

// 递归获取 mdast 节点的纯文本内容
function getRawTextFromNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((node) => {
      if (!node) return "";
      if (node.type === "text") return node.value || "";
      if (Array.isArray(node.children))
        return getRawTextFromNodes(node.children);
      if (node.value && typeof node.value === "string") return node.value;
      return "";
    })
    .join("");
}

/**
 * 将 mdast 内联节点转换为 Slate 内联节点列表，
 * 支持加粗、斜体、删除线和内联 HTML。
 */
export function processInlineNodes(mdastChildren: any[]): SlateInlineChild[] {
  if (!Array.isArray(mdastChildren)) return [{ text: "" }];
  const result: SlateInlineChild[] = [];
  // 当前打开的 HTML 标签状态
  let activeHtmlTag: {
    startTag: string;
    tagName: string;
    contentNodes: any[];
  } | null = null;

  try {
    for (const child of mdastChildren) {
      if (!child || typeof child !== "object") {
        if (activeHtmlTag && typeof child === "string") {
          activeHtmlTag.contentNodes.push({ type: "text", value: child });
        }
        continue;
      }

      // 处理 HTML 节点
      if (child.type === "html" && typeof child.value === "string") {
        const htmlValue = child.value;
        const tagName = getTagName(htmlValue);

        // 自闭合标签
        if (htmlValue.endsWith("/>") && tagName) {
          if (activeHtmlTag) activeHtmlTag.contentNodes.push(child);
          else
            result.push({
              type: "html-inline",
              html: htmlValue,
              children: [{ text: "" }],
            });
          continue;
        }
        // 结束标签
        if (htmlValue.startsWith("</") && tagName) {
          if (activeHtmlTag && activeHtmlTag.tagName === tagName) {
            const nodes = processInlineNodes(activeHtmlTag.contentNodes);
            const rawText = getRawTextFromNodes(activeHtmlTag.contentNodes);
            const children = nodes.length ? nodes : [{ text: "" }];
            result.push({
              type: "html-inline",
              html: activeHtmlTag.startTag + rawText + htmlValue,
              children,
            });
            activeHtmlTag = null;
          } else if (activeHtmlTag) {
            activeHtmlTag.contentNodes.push(child);
          } else {
            result.push({ text: htmlValue });
          }
          continue;
        }
        // 开始标签
        if (!htmlValue.startsWith("</") && tagName) {
          if (activeHtmlTag) activeHtmlTag.contentNodes.push(child);
          else
            activeHtmlTag = { startTag: htmlValue, tagName, contentNodes: [] };
          continue;
        }
        // 非标准 HTML
        if (activeHtmlTag) activeHtmlTag.contentNodes.push(child);
        else result.push({ text: htmlValue });
        continue;
      }

      // 在 HTML 标签内时收集内容
      if (activeHtmlTag) {
        activeHtmlTag.contentNodes.push(child);
        continue;
      }

      // 普通节点处理
      switch (child.type) {
        case "strong": {
          const nodes = processInlineNodes(child.children || []);
          nodes.forEach((n) => "text" in n && (n.bold = true));
          result.push(...nodes);
          break;
        }
        case "emphasis": {
          const nodes = processInlineNodes(child.children || []);
          nodes.forEach((n) => "text" in n && (n.italic = true));
          result.push(...nodes);
          break;
        }
        case "delete": {
          const nodes = processInlineNodes(child.children || []);
          nodes.forEach((n) => "text" in n && (n.strikethrough = true));
          result.push(...nodes);
          break;
        }
        case "link":
          result.push({
            type: "link",
            url: child.url || "",
            children: processInlineNodes(child.children || []),
          });
          break;
        case "inlineCode":
          result.push({
            type: "code-inline",
            children: [{ text: child.value || "" }],
          });
          break;
        case "image": {
          const img: SlateElementNode = {
            type: "image",
            url: child.url || "",
            alt: child.alt || "",
            children: [{ text: "" }],
          };
          if (child.title) img.title = child.title;
          result.push(img);
          break;
        }
        case "text":
          result.push({ text: child.value || "" });
          break;
        default:
          if (child.value && typeof child.value === "string") {
            result.push({ text: child.value });
          }
      }
    }

    // 处理未闭合的 HTML 标签
    if (activeHtmlTag) {
      result.push({
        type: "html-inline",
        html: activeHtmlTag.startTag,
        children: [{ text: "" }],
      });
      result.push(...processInlineNodes(activeHtmlTag.contentNodes));
    }
  } catch {
    return [{ text: "" }];
  }

  // 确保返回非空
  return result.length ? result : [{ text: "" }];
}
