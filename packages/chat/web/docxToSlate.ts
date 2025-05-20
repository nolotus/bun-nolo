import JSZip from "jszip";

// Slate.js节点的基本类型定义
interface SlateNode {
  type: string;
  children: Array<
    | { text: string; bold?: boolean; italic?: boolean; underline?: boolean }
    | SlateNode
  >;
  ordered?: boolean; // 用于列表
  url?: string; // 用于超链接和图片
  alt?: string; // 用于图片
  header?: boolean; // 用于表格单元格
}

// 转换DOCX内容为Slate.js格式
export const convertDocxToSlate = async (file: File): Promise<SlateNode[]> => {
  try {
    // 使用FileReader读取文件为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 使用jszip解压DOCX文件
    const zip = new JSZip();
    const zipFile = await zip.loadAsync(arrayBuffer);

    // 获取word/document.xml内容
    const documentXml = await zipFile
      .file("word/document.xml")
      ?.async("string");
    if (!documentXml) {
      throw new Error("无法找到word/document.xml文件");
    }

    // 获取word/_rels/document.xml.rels内容以解析超链接URL
    const relsXml = await zipFile
      .file("word/_rels/document.xml.rels")
      ?.async("string");
    const relsMap: { [key: string]: string } = {};
    if (relsXml) {
      const relsParser = new DOMParser();
      const relsDoc = relsParser.parseFromString(relsXml, "text/xml");
      const relsNs =
        "http://schemas.openxmlformats.org/package/2006/relationships";
      const relationships = relsDoc.getElementsByTagNameNS(
        relsNs,
        "Relationship"
      );
      for (let i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        const id = rel.getAttribute("Id") || "";
        const target = rel.getAttribute("Target") || "";
        if (id) {
          relsMap[id] = target;
        }
      }
    }

    // 使用DOMParser解析XML内容
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");
    const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

    // 提取段落和表格内容
    const body = xmlDoc.getElementsByTagNameNS(ns, "body")[0];
    const bodyChildren = Array.from(body.childNodes);
    const slateNodes: SlateNode[] = [];
    let listStack: { node: SlateNode; level: number }[] = []; // 用于处理嵌套列表

    for (let i = 0; i < bodyChildren.length; i++) {
      const child = bodyChildren[i] as Element;
      if (!child.tagName) continue; // 跳过非元素节点（如文本节点）
      const tagName = child.tagName.split(":").pop(); // 去除命名空间前缀

      if (tagName === "p") {
        // 处理段落或列表项
        const style = child.getElementsByTagNameNS(ns, "pStyle")[0];
        const styleVal = style?.getAttribute("w:val") || "";
        const numPr = child.getElementsByTagNameNS(ns, "numPr")[0];
        const isListItem = !!numPr;
        const ilvl =
          numPr?.getElementsByTagNameNS(ns, "ilvl")[0]?.getAttribute("w:val") ||
          "0";
        const level = parseInt(ilvl, 10);
        const numId =
          numPr
            ?.getElementsByTagNameNS(ns, "numId")[0]
            ?.getAttribute("w:val") || "";
        // 简化判断：假设 numId 存在且 level=0 时为有序列表
        const isOrdered = numId && level === 0;

        // 确定节点类型（标题或普通段落）
        let nodeType = "paragraph";
        if (styleVal && styleVal.toLowerCase().startsWith("heading")) {
          const headingLevel = styleVal.replace(/[^0-9]/g, "");
          if (
            headingLevel &&
            parseInt(headingLevel) >= 1 &&
            parseInt(headingLevel) <= 6
          ) {
            nodeType = `heading-${toLowerCaseNumber(headingLevel)}`;
          }
        }

        // 提取文本内容和格式，处理超链接
        const runs = child.getElementsByTagNameNS(ns, "r");
        const children: Array<
          | {
              text: string;
              bold?: boolean;
              italic?: boolean;
              underline?: boolean;
            }
          | SlateNode
        > = [];

        let hasImage = false;
        for (let j = 0; j < runs.length; j++) {
          const run = runs[j];
          const isBold = run.getElementsByTagNameNS(ns, "b").length > 0;
          const isItalic = run.getElementsByTagNameNS(ns, "i").length > 0;
          const isUnderline = run.getElementsByTagNameNS(ns, "u").length > 0;
          const hyperlink = run.getElementsByTagNameNS(ns, "hyperlink")[0];

          // 检查是否存在图片，图片作为独立块处理
          const drawing = run.getElementsByTagNameNS(
            "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
            "inline"
          )[0];
          if (drawing) {
            hasImage = true;
            const blip = drawing.getElementsByTagNameNS(
              "http://schemas.openxmlformats.org/drawingml/2006/main",
              "blip"
            )[0];
            const relId = blip?.getAttribute("r:embed") || "";
            const url = relsMap[relId] || `image-${relId}`;
            const alt =
              drawing
                .getElementsByTagNameNS(
                  "http://schemas.openxmlformats.org/drawingml/2006/main",
                  "docPr"
                )[0]
                ?.getAttribute("descr") || "";

            // 图片作为独立节点添加到 slateNodes 中
            slateNodes.push({
              type: "image",
              url,
              alt,
              children: [{ text: "" }],
            });
            continue; // 跳过文本处理，因为图片已作为独立节点处理
          }

          // 提取文本内容
          const textElements = run.getElementsByTagNameNS(ns, "t");
          let runText = "";
          for (let k = 0; k < textElements.length; k++) {
            runText += textElements[k].textContent || "";
          }

          if (runText) {
            if (hyperlink) {
              // 如果有超链接，创建 link 节点
              const relId = hyperlink.getAttribute("r:id") || "";
              const url = relsMap[relId] || `hyperlink-${relId}`;
              children.push({
                type: "link",
                url,
                children: [
                  {
                    text: runText,
                    ...(isBold && { bold: true }),
                    ...(isItalic && { italic: true }),
                    ...(isUnderline && { underline: true }),
                  },
                ],
              });
            } else {
              // 普通文本节点
              children.push({
                text: runText,
                ...(isBold && { bold: true }),
                ...(isItalic && { italic: true }),
                ...(isUnderline && { underline: true }),
              });
            }
          }
        }

        // 检查是否存在分页符 <w:br type="page">
        const pageBreaks = child.getElementsByTagNameNS(ns, "br");
        for (let j = 0; j < pageBreaks.length; j++) {
          const br = pageBreaks[j];
          if (br.getAttribute("w:type") === "page") {
            slateNodes.push({
              type: "thematic-break",
              children: [{ text: "" }],
            });
          }
        }

        if (children.length > 0) {
          const itemNode: SlateNode = {
            type: isListItem ? "list-item" : nodeType,
            children,
          };

          if (isListItem) {
            // 处理嵌套列表
            if (listStack.length === 0) {
              // 创建新的列表
              const newList: SlateNode = {
                type: "list",
                ordered: isOrdered,
                children: [itemNode],
              };
              slateNodes.push(newList);
              listStack.push({ node: newList, level });
            } else if (listStack[listStack.length - 1].level < level) {
              // 创建嵌套子列表
              const newList: SlateNode = {
                type: "list",
                ordered: isOrdered,
                children: [itemNode],
              };
              // 将子列表添加到上一个列表项的 children 中
              const parentList = listStack[listStack.length - 1].node;
              const lastListItem = parentList.children[
                parentList.children.length - 1
              ] as SlateNode;
              lastListItem.children.push(newList);
              listStack.push({ node: newList, level });
            } else if (listStack[listStack.length - 1].level > level) {
              // 回退到上级列表
              while (
                listStack.length > 0 &&
                listStack[listStack.length - 1].level > level
              ) {
                listStack.pop();
              }
              if (listStack.length > 0) {
                listStack[listStack.length - 1].node.children.push(itemNode);
              } else {
                // 如果栈为空，创建新列表
                const newList: SlateNode = {
                  type: "list",
                  ordered: isOrdered,
                  children: [itemNode],
                };
                slateNodes.push(newList);
                listStack.push({ node: newList, level });
              }
            } else {
              // 同一级列表，添加到当前列表
              listStack[listStack.length - 1].node.children.push(itemNode);
            }
          } else {
            slateNodes.push(itemNode);
            listStack = []; // 重置列表栈
          }
        } else if (!hasImage) {
          // 如果段落没有内容且没有图片，添加空段落
          slateNodes.push({
            type: nodeType,
            children: [{ text: "" }],
          });
        }
      } else if (tagName === "tbl") {
        // 处理表格
        const tableRows = child.getElementsByTagNameNS(ns, "tr");
        const tableChildren: SlateNode[] = [];

        for (let r = 0; r < tableRows.length; r++) {
          const row = tableRows[r];
          const cells = row.getElementsByTagNameNS(ns, "tc");
          const rowChildren: SlateNode[] = [];

          for (let c = 0; c < cells.length; c++) {
            const cell = cells[c];
            const cellContent = extractTextAndFormatting(cell, ns);
            rowChildren.push({
              type: "table-cell",
              header: r === 0, // 假设第一行是表头
              children: cellContent.length > 0 ? cellContent : [{ text: "" }],
            });
          }

          tableChildren.push({
            type: "table-row",
            children: rowChildren,
          });
        }

        slateNodes.push({
          type: "table",
          children: tableChildren,
        });
        listStack = []; // 重置列表栈
      }
    }

    // 如果没有内容，添加一个空段落
    if (slateNodes.length === 0) {
      slateNodes.push({
        type: "paragraph",
        children: [{ text: "（空文档或无有效段落内容）" }],
      });
    }

    return slateNodes;
  } catch (error) {
    console.error("转换DOCX到Slate.js格式失败：", error);
    throw error;
  }
};

// 提取文本和格式的辅助函数
function extractTextAndFormatting(
  element: Element,
  ns: string
): Array<{
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}> {
  const runs = element.getElementsByTagNameNS(ns, "r");
  const children: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  }> = [];

  for (let j = 0; j < runs.length; j++) {
    const run = runs[j];
    const isBold = run.getElementsByTagNameNS(ns, "b").length > 0;
    const isItalic = run.getElementsByTagNameNS(ns, "i").length > 0;
    const isUnderline = run.getElementsByTagNameNS(ns, "u").length > 0;

    const textElements = run.getElementsByTagNameNS(ns, "t");
    let runText = "";
    for (let k = 0; k < textElements.length; k++) {
      runText += textElements[k].textContent || "";
    }

    if (runText) {
      children.push({
        text: runText,
        ...(isBold && { bold: true }),
        ...(isItalic && { italic: true }),
        ...(isUnderline && { underline: true }),
      });
    }
  }

  return children;
}

// 辅助函数：将数字转换为小写英文形式（1 -> one, 2 -> two, ...）
function toLowerCaseNumber(num: string): string {
  const numbers = ["one", "two", "three", "four", "five", "six"];
  const index = parseInt(num) - 1;
  return numbers[index] || "one";
}

/*
 * 未实现的 DOCX 元素转换功能注释
 * 以下是尚未实现的 DOCX 到 Slate.js 转换功能，基于优先级表中的内容。
 * 可根据需求后续扩展实现。
 *
 * 1. 脚注/尾注 (Footnote/Endnote, 优先级 13)
 *    - 对应 DOCX 标签：脚注和尾注内容
 *    - 目标 Slate.js 格式：type: "footnote"
 *    - 说明：需提取脚注内容并转换为自定义节点，可能需要 Slate 插件支持。
 *
 * 2. 文本对齐 (Alignment, 优先级 14)
 *    - 对应 DOCX 标签：<w:jc>
 *    - 目标 Slate.js 格式：align: "center" 等
 *    - 说明：需提取段落的对齐方式（如居中、左对齐）并映射到 Slate 节点的样式属性。
 *
 * 3. 字体和大小 (Font, Size, 优先级 15)
 *    - 对应 DOCX 标签：<w:rFonts>, <w:sz>
 *    - 目标 Slate.js 格式：fontFamily, fontSize
 *    - 说明：需提取字体和大小信息并应用到 Slate 文本节点的样式，可能需要 Slate 自定义渲染。
 *
 * 4. 颜色和背景 (Color, Highlight, 优先级 16)
 *    - 对应 DOCX 标签：<w:color>, <w:highlight>
 *    - 目标 Slate.js 格式：color, backgroundColor
 *    - 说明：需提取文本颜色和背景高亮并映射到 Slate 文本节点的样式属性。
 *
 * 5. 分节符 (Section Break, 优先级 17)
 *    - 对应 DOCX 标签：分节符相关标签
 *    - 目标 Slate.js 格式：type: "section-break"
 *    - 说明：需转换为 Slate 中的自定义分节节点，可能需要 Slate 插件支持。
 *
 * 6. 页眉/页脚 (Header/Footer, 优先级 18)
 *    - 对应 DOCX 标签：页眉和页脚内容
 *    - 目标 Slate.js 格式：type: "header" / type: "footer"
 *    - 说明：需提取页眉页脚内容并转换为 Slate 自定义节点，实现较复杂，可视需求决定是否支持。
 *
 * 7. 复杂样式和主题 (Styles, Themes, 优先级 19)
 *    - 对应 DOCX 标签：文档样式和主题信息
 *    - 目标 Slate.js 格式：自定义样式属性
 *    - 说明：需提取文档的样式和主题信息并映射到 Slate 节点，实现难度高，可选功能。
 */
