export function processInlineNodes(children: any[]): any[] {
  // 输入验证
  if (!Array.isArray(children)) {
    return [{ text: "" }];
  }

  let result = [];
  let currentHtmlContent = null;

  try {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // 跳过无效节点
      if (!child || typeof child !== "object") {
        continue;
      }

      switch (child.type) {
        case "delete":
          if (Array.isArray(child.children)) {
            const processedChildren = child.children.flatMap(
              (nestedChild: any) => {
                if (!nestedChild) return { strikethrough: true, text: "" };

                if (nestedChild.type === "strong") {
                  return {
                    strikethrough: true,
                    bold: true,
                    text: nestedChild.children?.[0]?.value || "",
                  };
                }
                if (nestedChild.type === "emphasis") {
                  return {
                    strikethrough: true,
                    italic: true,
                    text: nestedChild.children?.[0]?.value || "",
                  };
                }
                return {
                  strikethrough: true,
                  text: nestedChild.value || "",
                };
              },
            );
            result.push(...processedChildren);
          }
          break;

        case "strong":
          if (Array.isArray(child.children) && child.children.length > 0) {
            result.push({
              bold: true,
              text: child.children[0]?.value || "",
            });
          }
          break;

        case "emphasis":
          if (Array.isArray(child.children) && child.children.length > 0) {
            result.push({
              italic: true,
              text: child.children[0]?.value || "",
            });
          }
          break;

        case "link":
          result.push({
            type: "link",
            url: child.url || "",
            children: Array.isArray(child.children)
              ? processInlineNodes(child.children)
              : [{ text: "" }],
          });
          break;

        case "inlineCode":
          result.push({
            type: "code-inline",
            children: [{ text: child.value || "" }],
          });
          break;

        case "image":
          const imageNode: any = {
            type: "image",
            url: child.url || "",
            alt: child.alt || "",
            children: [{ text: "" }],
          };
          if (child.title) {
            imageNode.title = child.title;
          }
          result.push(imageNode);
          break;

        case "html":
          if (!child.value) {
            result.push({ text: "" });
            break;
          }

          // 处理自闭合标签
          if (child.value.includes("/>")) {
            result.push({
              type: "html-inline",
              html: child.value,
              children: [{ text: "" }],
            });
            break;
          }

          // 处理开始标签
          if (!child.value.startsWith("</")) {
            currentHtmlContent = {
              type: "html-inline",
              html: child.value,
              content: "",
            };
            break;
          }

          // 处理结束标签
          if (child.value.startsWith("</") && currentHtmlContent) {
            try {
              result.push({
                type: "html-inline",
                html: `${currentHtmlContent.html.slice(0, -1)}>${currentHtmlContent.content}${child.value}`,
                children: [{ text: currentHtmlContent.content }],
              });
            } catch (error) {
              console.warn("Error processing HTML:", error);
              result.push({ text: child.value });
            }
            currentHtmlContent = null;
            break;
          }
          // 如果没有匹配到任何HTML处理逻辑，作为普通文本处理
          result.push({ text: child.value });
          break;

        default:
          // 处理HTML标签之间的内容或普通文本
          if (currentHtmlContent) {
            currentHtmlContent.content += child.value || "";
          } else {
            result.push({
              text: child.value || "",
            });
          }
      }
    }

    // 处理未闭合的HTML内容
    if (currentHtmlContent) {
      result.push({
        type: "html-inline",
        html: currentHtmlContent.html,
        children: [{ text: currentHtmlContent.content }],
      });
    }
  } catch (error) {
    console.warn("Error in processInlineNodes:", error);
    return [{ text: "" }];
  }

  // 确保至少返回一个有效的文本节点
  return result.length > 0 ? result : [{ text: "" }];
}
