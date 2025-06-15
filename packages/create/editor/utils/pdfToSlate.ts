import * as pdfjsLib from "pdfjs-dist";
import * as worker from "pdfjs-dist/build/pdf.worker.mjs";

console.log("worker", worker);
// 设置 pdf.js worker 路径（根据你的项目配置调整）
pdfjsLib.GlobalWorkerOptions.workerSrc = "/public/assets/pdf.worker.mjs";

// Slate.js 节点的基本类型定义（与 DOCX 代码一致）
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

// 辅助接口：存储书签信息
interface OutlineItem {
  title: string;
  level: number; // 书签嵌套级别，映射到标题级别
  pageNumber: number | null; // 跳转目标页面号
  dest: any; // 跳转目标详细信息（可能包含位置）
}

// 辅助接口：存储超链接注解信息
interface LinkAnnotation {
  url: string;
  rect: number[]; // 注解的矩形区域 [x1, y1, x2, y2]
}

// 转换 PDF 内容为 Slate.js 格式
export const convertPdfToSlate = async (file: File): Promise<SlateNode[]> => {
  try {
    // 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 使用 pdf.js 加载 PDF
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // 获取页面数量
    const numPages = pdf.numPages;
    const slateNodes: SlateNode[] = [];
    let listStack: { node: SlateNode; level: number }[] = []; // 用于处理可能的列表结构

    // 用于估计行间距分布和字体大小分布
    let lineHeightDiffs: number[] = [];
    let fontSizes: number[] = [];
    let avgLineHeight = 0;
    let baseFontSize = 0;

    // 获取文档大纲（书签）
    const outline = await pdf.getOutline();
    const outlineItems: OutlineItem[] = [];
    if (outline) {
      // 递归处理书签大纲，提取标题和级别
      const processOutline = async (items: any[], parentLevel: number = 0) => {
        for (const item of items) {
          const title = item.title || "";
          const level = parentLevel + 1; // 书签嵌套级别，从 1 开始
          let pageNumber = null;
          if (item.dest && typeof item.dest === "string") {
            const destRef = await pdf.getDestination(item.dest);
            if (
              destRef &&
              destRef.length > 0 &&
              typeof destRef[0] === "number"
            ) {
              pageNumber = (await pdf.getPageIndex(destRef[0])) + 1; // 页面号从 1 开始
            }
          } else if (
            item.dest &&
            item.dest.length > 0 &&
            typeof item.dest[0] === "number"
          ) {
            pageNumber = (await pdf.getPageIndex(item.dest[0])) + 1;
          }
          outlineItems.push({ title, level, pageNumber, dest: item.dest });
          if (item.items && item.items.length > 0) {
            await processOutline(item.items, level);
          }
        }
      };
      await processOutline(outline);
    }

    // 第一步：遍历所有页面，收集行间距和字体大小数据，但排除最后 1-2 页的字体大小
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let previousY = 0;

      textContent.items.forEach((item, index) => {
        if ("transform" in item) {
          const currentY = item.transform[5];
          const diff = Math.abs(currentY - previousY);
          if (index > 0 && diff > 0 && diff < 50) {
            // 假设行间距小于 50，排除异常值
            lineHeightDiffs.push(diff);
          }
          previousY = currentY;
        }
        if ("fontName" in item) {
          const fontSize = extractFontSize(item.fontName, item);
          // 仅将前 numPages-2 页的字体大小计入统计，避免最后 1-2 页的小字体影响基准值
          // 如果总页数少于 3 页，则全部计入
          if (numPages <= 3 || i <= numPages - 2) {
            fontSizes.push(fontSize);
          }
        }
      });
    }

    // 计算行间距基准：使用中位数，避免异常值干扰
    lineHeightDiffs.sort((a, b) => a - b);
    avgLineHeight =
      lineHeightDiffs.length > 0
        ? lineHeightDiffs[Math.floor(lineHeightDiffs.length / 2)]
        : 12; // 默认行高为 12

    // 计算正文字体大小基准：使用频率最高的字体大小（近似方法）
    baseFontSize = calculateBaseFontSize(fontSizes);

    // 第二步：处理内容并转换为 Slate.js 节点
    let titleCount = 0; // 统计标题数量
    let totalParagraphs = 0; // 统计总段落数量

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const annotations = await page.getAnnotations();

      // 获取当前页面的书签标题
      const pageOutlineItems = outlineItems.filter(
        (item) => item.pageNumber === i
      );

      // 获取当前页面的超链接注解
      const pageLinks: LinkAnnotation[] = annotations
        .filter((annot) => annot.subtype === "Link" && annot.url)
        .map((annot) => ({
          url: annot.url,
          rect: annot.rect, // 矩形区域 [x1, y1, x2, y2]
        }));

      // 用于存储当前行的文本和样式信息
      let currentLineText = "";
      let currentLineStyles: Array<{
        fontSize: number;
        bold: boolean;
        italic: boolean;
        text: string;
        x: number;
        y: number;
      }> = [];
      let currentParagraphText = "";
      let currentParagraphStyles: Array<{
        fontSize: number;
        bold: boolean;
        italic: boolean;
        text: string;
        x: number;
        y: number;
      }> = [];
      let previousY = 0; // 用于判断行间距，推断段落分隔
      let previousX = 0; // 用于判断水平位置，推断列表

      // 将文本内容按行和段落分组，判断标题
      textContent.items.forEach((item, index) => {
        if ("str" in item && item.str.trim()) {
          const fontSize = item.fontName
            ? extractFontSize(item.fontName, item)
            : 12;
          const currentY = item.transform ? item.transform[5] : 0; // Y 坐标，用于判断行间距
          const currentX = item.transform ? item.transform[4] : 0; // X 坐标，用于判断缩进或列表
          const isBold = item.fontName?.toLowerCase().includes("bold");
          const isItalic = item.fontName?.toLowerCase().includes("italic");

          // 判断是否为新行：基于行间距（普通换行）
          const isNewLine =
            index > 0 && Math.abs(currentY - previousY) > avgLineHeight * 0.5;

          // 判断是否为新段落：基于明显更大的行间距（段落间距）
          const isNewParagraph =
            index > 0 && Math.abs(currentY - previousY) > avgLineHeight * 1.8; // 1.8 倍作为段落分隔阈值

          // 如果是新行，处理前一行的内容
          if (isNewLine && currentLineText.trim()) {
            // 将当前行添加到段落中，但不触发新段落
            currentParagraphText += currentLineText + "\n";
            currentParagraphStyles.push(...currentLineStyles);
            // 重置当前行
            currentLineText = "";
            currentLineStyles = [];
          }

          // 如果是新段落，处理前一段落的内容
          if (isNewParagraph && currentParagraphText.trim()) {
            totalParagraphs++;
            // 判断是否为标题：整行字体大小都与基准值不同（都大于或都小于），或整行加粗，或匹配书签
            const isTitleCandidateBySize = isLineTitleBySize(
              currentParagraphStyles,
              baseFontSize
            );
            const isTitleCandidateByBold = isLineTitleByBold(
              currentParagraphStyles
            );
            const titleRatio = titleCount / (totalParagraphs || 1);
            // 标题长度限制：少于 15 个单词或 100 个字符
            const isTitleLengthValid =
              isTitleLengthAcceptable(currentParagraphText);
            // 检查是否匹配书签标题（优先级最高）
            const matchedOutlineItem = matchOutlineItem(
              currentParagraphText,
              pageOutlineItems
            );
            const isTitle =
              (matchedOutlineItem ||
                isTitleCandidateByBold ||
                (isTitleCandidateBySize && titleRatio < 0.3)) &&
              isTitleLengthValid; // 书签优先，或整行加粗，或字体大小条件且比例限制
            // 推断是否为列表项：基于 X 坐标缩进和文本开头是否为编号或符号
            const isListItem =
              index > 0 &&
              Math.abs(currentX - previousX) > 5 &&
              (currentParagraphText.trim().match(/^[0-9]+[\.\)]/) ||
                currentParagraphText.trim().match(/^[-•◦]/));
            let nodeType = "paragraph";
            let headingLevel = 0;

            if (isTitle) {
              titleCount++;
              const titleFontSize =
                currentParagraphStyles[0]?.fontSize || baseFontSize;
              if (matchedOutlineItem) {
                // 如果匹配书签，使用书签级别
                headingLevel = Math.min(matchedOutlineItem.level, 6);
              } else if (titleFontSize > baseFontSize) {
                // 否则基于字体大小差值计算级别
                headingLevel = Math.min(
                  Math.floor((titleFontSize - baseFontSize) / 2) + 1,
                  6
                ); // 标题级别 1-6，h1 到 h6
              } else {
                headingLevel = Math.min(
                  Math.floor((baseFontSize - titleFontSize) / 2) + 3,
                  6
                ); // 小于基准值，级别从 h3 开始
              }
              nodeType = `heading-${toLowerCaseNumber(headingLevel.toString())}`;
            } else if (isListItem) {
              nodeType = "list-item";
            }

            // 构建 Slate.js 节点，处理行内样式和超链接
            const itemNode = buildSlateNodeWithLinks(
              nodeType,
              currentParagraphText,
              currentParagraphStyles,
              pageLinks
            );

            if (isListItem && !isTitle) {
              const listLevel = Math.floor((currentX - previousX) / 20); // 粗略计算列表缩进级别
              const isOrdered =
                currentParagraphText.trim().match(/^[0-9]+[\.\)]/) !== null;
              handleListItem(
                itemNode,
                listStack,
                slateNodes,
                listLevel,
                isOrdered
              );
            } else {
              slateNodes.push(itemNode);
              listStack = []; // 重置列表栈
            }

            // 重置段落
            currentParagraphText = "";
            currentParagraphStyles = [];
          }

          // 累积当前文本到当前行
          currentLineText += item.str;
          currentLineStyles.push({
            fontSize,
            bold: isBold,
            italic: isItalic,
            text: item.str,
            x: currentX,
            y: currentY,
          });

          previousY = currentY;
          previousX = currentX;
        }
      });

      // 处理剩余行和段落
      if (currentLineText.trim()) {
        currentParagraphText += currentLineText + "\n";
        currentParagraphStyles.push(...currentLineStyles);
      }

      if (currentParagraphText.trim()) {
        totalParagraphs++;
        const isTitleCandidateBySize = isLineTitleBySize(
          currentParagraphStyles,
          baseFontSize
        );
        const isTitleCandidateByBold = isLineTitleByBold(
          currentParagraphStyles
        );
        const titleRatio = titleCount / (totalParagraphs || 1);
        const isTitleLengthValid =
          isTitleLengthAcceptable(currentParagraphText);
        const matchedOutlineItem = matchOutlineItem(
          currentParagraphText,
          pageOutlineItems
        );
        const isTitle =
          (matchedOutlineItem ||
            isTitleCandidateByBold ||
            (isTitleCandidateBySize && titleRatio < 0.3)) &&
          isTitleLengthValid;
        const isListItem =
          Math.abs(previousX) > 5 &&
          (currentParagraphText.trim().match(/^[0-9]+[\.\)]/) ||
            currentParagraphText.trim().match(/^[-•◦]/));
        let nodeType = "paragraph";
        let headingLevel = 0;

        if (isTitle) {
          titleCount++;
          const titleFontSize =
            currentParagraphStyles[0]?.fontSize || baseFontSize;
          if (matchedOutlineItem) {
            headingLevel = Math.min(matchedOutlineItem.level, 6);
          } else if (titleFontSize > baseFontSize) {
            headingLevel = Math.min(
              Math.floor((titleFontSize - baseFontSize) / 2) + 1,
              6
            );
          } else {
            headingLevel = Math.min(
              Math.floor((baseFontSize - titleFontSize) / 2) + 3,
              6
            );
          }
          nodeType = `heading-${toLowerCaseNumber(headingLevel.toString())}`;
        } else if (isListItem) {
          nodeType = "list-item";
        }

        const itemNode = buildSlateNodeWithLinks(
          nodeType,
          currentParagraphText,
          currentParagraphStyles,
          pageLinks
        );

        if (isListItem && !isTitle) {
          const listLevel = Math.floor(previousX / 20);
          const isOrdered =
            currentParagraphText.trim().match(/^[0-9]+[\.\)]/) !== null;
          handleListItem(itemNode, listStack, slateNodes, listLevel, isOrdered);
        } else {
          slateNodes.push(itemNode);
          listStack = [];
        }
      }

      // 处理图片占位符（通过注解或其他方式检测图片位置）
      // 由于 PDF.js 不直接提供图片内容，我们通过注解或其他间接方式添加占位符
      // 这里简化为在每页末尾检查是否有未处理的图片相关注解，实际中可以结合更复杂的位置匹配
      const imageAnnotations = annotations.filter(
        (annot) => annot.subtype === "Widget" || annot.subtype === "Stamp"
      );
      if (imageAnnotations.length > 0) {
        imageAnnotations.forEach(() => {
          slateNodes.push({
            type: "image",
            url: "", // 占位符，无具体图片信息
            alt: "Image Placeholder",
            children: [{ text: "" }],
          });
        });
      }

      // 可选：添加分页符节点
      if (i < numPages) {
        slateNodes.push({
          type: "thematic-break",
          children: [{ text: "" }],
        });
      }
    }

    // 如果没有内容，添加空段落
    if (slateNodes.length === 0) {
      slateNodes.push({
        type: "paragraph",
        children: [{ text: "（空 PDF 或无有效内容）" }],
      });
    }

    return slateNodes;
  } catch (error) {
    console.error("转换 PDF 到 Slate.js 格式失败：", error);
    throw error;
  }
};

// 辅助函数：从 fontName 或 item 中提取字体大小（简化为示例）
function extractFontSize(fontName: string, item: any): number {
  if (item.transform) {
    return Math.round(item.transform[0] * 10); // 简化为基于变换矩阵的近似值
  }
  return 12; // 默认值
}

// 辅助函数：计算正文字体大小基准（基于频率最高的字体大小）
function calculateBaseFontSize(fontSizes: number[]): number {
  if (fontSizes.length === 0) return 12; // 默认值

  // 简单的频率统计，找到出现次数最多的字体大小
  const sizeCount: { [key: number]: number } = {};
  fontSizes.forEach((size) => {
    sizeCount[size] = (sizeCount[size] || 0) + 1;
  });

  let maxCount = 0;
  let baseSize = 12;
  for (const size in sizeCount) {
    if (sizeCount[size] > maxCount) {
      maxCount = sizeCount[size];
      baseSize = parseFloat(size);
    }
  }

  return baseSize;
}

// 辅助函数：判断是否为标题（基于字体大小，整行字体大小都与基准值不同）
function isLineTitleBySize(
  styles: Array<{ fontSize: number; bold: boolean }>,
  baseFontSize: number
): boolean {
  if (styles.length === 0) return false;

  // 检查是否所有文本字体大小都大于基准值
  const allLarger = styles.every((style) => style.fontSize > baseFontSize + 2); // 差值至少 2
  // 检查是否所有文本字体大小都小于基准值
  const allSmaller = styles.every((style) => style.fontSize < baseFontSize - 2); // 差值至少 2

  // 如果都大于或都小于基准值，且差值明显，则认为是标题
  return allLarger || allSmaller;
}

// 辅助函数：判断是否为标题（基于加粗，整行字体都加粗）
function isLineTitleByBold(
  styles: Array<{ fontSize: number; bold: boolean }>
): boolean {
  if (styles.length === 0) return false;

  // 检查是否所有文本都加粗
  const allBold = styles.every((style) => style.bold);

  return allBold;
}

// 辅助函数：判断标题长度是否符合要求（不宜过长）
function isTitleLengthAcceptable(text: string): boolean {
  const trimmedText = text.trim();
  const wordCount = trimmedText.split(/\s+/).length;
  const charCount = trimmedText.length;
  // 标题长度限制：少于 15 个单词且少于 100 个字符
  return wordCount < 15 && charCount < 100;
}

// 辅助函数：匹配书签标题
function matchOutlineItem(
  text: string,
  outlineItems: OutlineItem[]
): OutlineItem | null {
  const trimmedText = text.trim().toLowerCase();
  for (const item of outlineItems) {
    const outlineTitle = item.title.toLowerCase();
    // 简单匹配：如果文本包含书签标题或书签标题包含文本，则认为匹配
    if (
      trimmedText.includes(outlineTitle) ||
      outlineTitle.includes(trimmedText)
    ) {
      return item;
    }
  }
  return null;
}

// 辅助函数：构建 Slate.js 节点，处理行内样式和超链接
function buildSlateNodeWithLinks(
  type: string,
  text: string,
  styles: Array<{
    fontSize: number;
    bold: boolean;
    italic: boolean;
    text: string;
    x: number;
    y: number;
  }>,
  links: LinkAnnotation[]
): SlateNode {
  // 如果没有样式差异，简化处理
  const allSameStyle = styles.every(
    (s) => s.bold === styles[0].bold && s.italic === styles[0].italic
  );
  const trimmedText = text.trim();

  if (allSameStyle && styles.length > 0) {
    // 检查是否有超链接匹配
    const link = findMatchingLink(styles, links);
    if (link) {
      return {
        type: "link",
        url: link.url,
        children: [
          {
            text: trimmedText,
            ...(styles[0].bold && { bold: true }),
            ...(styles[0].italic && { italic: true }),
          },
        ],
      };
    }
    return {
      type,
      children: [
        {
          text: trimmedText,
          ...(styles[0].bold && { bold: true }),
          ...(styles[0].italic && { italic: true }),
        },
      ],
    };
  }

  // 如果有样式差异，按部分构建 children，并处理超链接
  const children: Array<
    { text: string; bold?: boolean; italic?: boolean } | SlateNode
  > = [];
  let currentText = "";
  let currentStyle = styles[0];
  let startIndex = 0;

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    if (
      i > 0 &&
      (style.bold !== currentStyle.bold || style.italic !== currentStyle.italic)
    ) {
      // 样式变化，处理前一段文本
      if (currentText) {
        const subStyles = styles.slice(startIndex, i);
        const link = findMatchingLink(subStyles, links);
        if (link) {
          children.push({
            type: "link",
            url: link.url,
            children: [
              {
                text: currentText,
                ...(currentStyle.bold && { bold: true }),
                ...(currentStyle.italic && { italic: true }),
              },
            ],
          });
        } else {
          children.push({
            text: currentText,
            ...(currentStyle.bold && { bold: true }),
            ...(currentStyle.italic && { italic: true }),
          });
        }
        currentText = "";
      }
      startIndex = i;
      currentStyle = style;
    }
    currentText += style.text;
  }

  // 处理最后一段文本
  if (currentText) {
    const subStyles = styles.slice(startIndex);
    const link = findMatchingLink(subStyles, links);
    if (link) {
      children.push({
        type: "link",
        url: link.url,
        children: [
          {
            text: currentText,
            ...(currentStyle.bold && { bold: true }),
            ...(currentStyle.italic && { italic: true }),
          },
        ],
      });
    } else {
      children.push({
        text: currentText,
        ...(currentStyle.bold && { bold: true }),
        ...(currentStyle.italic && { italic: true }),
      });
    }
  }

  return {
    type,
    children,
  };
}

// 辅助函数：查找匹配的超链接
function findMatchingLink(
  styles: Array<{ x: number; y: number }>,
  links: LinkAnnotation[]
): LinkAnnotation | null {
  if (styles.length === 0 || links.length === 0) return null;

  // 简单匹配：检查文本位置是否在某个超链接的矩形区域内
  // 由于 PDF.js 坐标系可能需要转换，这里仅使用近似匹配
  const xMin = Math.min(...styles.map((s) => s.x));
  const xMax = Math.max(...styles.map((s) => s.x));
  const yMin = Math.min(...styles.map((s) => s.y));
  const yMax = Math.max(...styles.map((s) => s.y));

  for (const link of links) {
    const [linkX1, linkY1, linkX2, linkY2] = link.rect;
    // 检查文本区域是否与链接区域重叠（宽松匹配）
    if (xMax > linkX1 && xMin < linkX2 && yMax > linkY1 && yMin < linkY2) {
      return link;
    }
  }
  return null;
}

// 辅助函数：将数字转换为小写英文形式（1 -> one, 2 -> two, ...）
function toLowerCaseNumber(num: string): string {
  const numbers = ["one", "two", "three", "four", "five", "six"];
  const index = parseInt(num) - 1;
  return numbers[index] || "one";
}

// 辅助函数：处理列表项逻辑
function handleListItem(
  itemNode: SlateNode,
  listStack: { node: SlateNode; level: number }[],
  slateNodes: SlateNode[],
  listLevel: number,
  isOrdered: boolean
) {
  if (listStack.length === 0) {
    const newList: SlateNode = {
      type: "list",
      ordered: isOrdered,
      children: [itemNode],
    };
    slateNodes.push(newList);
    listStack.push({ node: newList, level: listLevel });
  } else if (listStack[listStack.length - 1].level < listLevel) {
    const newList: SlateNode = {
      type: "list",
      ordered: isOrdered,
      children: [itemNode],
    };
    const parentList = listStack[listStack.length - 1].node;
    const lastListItem = parentList.children[
      parentList.children.length - 1
    ] as SlateNode;
    lastListItem.children.push(newList);
    listStack.push({ node: newList, level: listLevel });
  } else if (listStack[listStack.length - 1].level > listLevel) {
    while (
      listStack.length > 0 &&
      listStack[listStack.length - 1].level > listLevel
    ) {
      listStack.pop();
    }
    if (listStack.length > 0) {
      listStack[listStack.length - 1].node.children.push(itemNode);
    } else {
      const newList: SlateNode = {
        type: "list",
        ordered: isOrdered,
        children: [itemNode],
      };
      slateNodes.push(newList);
      listStack.push({ node: newList, level: listLevel });
    }
  } else {
    listStack[listStack.length - 1].node.children.push(itemNode);
  }
}
