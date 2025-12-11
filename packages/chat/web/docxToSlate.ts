import PizZip from "pizzip";

// ====================== 类型定义 ======================

interface SlateTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface SlateElementNode {
  type: string;
  children: Array<SlateTextNode | SlateElementNode>;
  ordered?: boolean; // 用于列表
  url?: string; // 用于超链接和图片
  alt?: string; // 用于图片
  header?: boolean; // 用于表格单元格
}

export type SlateNode = SlateElementNode;

// ====================== 常量 & 工具 ======================

const WORD_MAIN_NS =
  "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const W_DRAWING_NS =
  "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
const A_DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";

type RelsMap = Record<string, string>;

// 将 Heading 编号转为英文（1 -> one ...）
function toLowerCaseNumber(num: string): string {
  const numbers = ["one", "two", "three", "four", "five", "six"];
  const index = parseInt(num, 10) - 1;
  return numbers[index] || "one";
}

// ====================== 关系文件解析 ======================

function parseRelsXml(relsXml: string): RelsMap {
  const relsMap: RelsMap = {};
  if (!relsXml) return relsMap;

  const relsParser = new DOMParser();
  const relsDoc = relsParser.parseFromString(relsXml, "text/xml");

  const relationships = relsDoc.getElementsByTagNameNS(REL_NS, "Relationship");

  for (let i = 0; i < relationships.length; i++) {
    const rel = relationships[i];
    const id = rel.getAttribute("Id") || "";
    const target = rel.getAttribute("Target") || "";
    if (id) {
      relsMap[id] = target;
    }
  }

  return relsMap;
}

// ====================== 文本 & 格式提取 ======================

function extractTextAndFormattingFromRun(
  run: Element,
  ns: string
): SlateTextNode[] {
  const isBold = run.getElementsByTagNameNS(ns, "b").length > 0;
  const isItalic = run.getElementsByTagNameNS(ns, "i").length > 0;
  const isUnderline = run.getElementsByTagNameNS(ns, "u").length > 0;

  const textElements = run.getElementsByTagNameNS(ns, "t");
  if (!textElements.length) return [];

  let runText = "";
  for (let i = 0; i < textElements.length; i++) {
    runText += textElements[i].textContent || "";
  }

  if (!runText) return [];

  return [
    {
      text: runText,
      ...(isBold && { bold: true }),
      ...(isItalic && { italic: true }),
      ...(isUnderline && { underline: true }),
    },
  ];
}

// 表格专用：提取单元格内部纯文本 + 基础样式
function extractTextAndFormattingForTableCell(
  element: Element,
  ns: string
): SlateTextNode[] {
  const runs = element.getElementsByTagNameNS(ns, "r");
  const result: SlateTextNode[] = [];

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    result.push(...extractTextAndFormattingFromRun(run, ns));
  }

  return result;
}

// ====================== 段落内容解析（含超链接 & 图片） ======================

interface ParagraphParseContext {
  ns: string;
  relsMap: RelsMap;
  // 用于在段落解析过程中直接向最终结果插入块级节点（例如图片、分页符）
  slateNodes: SlateNode[];
}

function handleImageInRun(run: Element, ctx: ParagraphParseContext): boolean {
  // 图片结构：<w:drawing><wp:inline>...<a:blip r:embed="rIdX" />...</wp:inline></w:drawing>
  const inline = run.getElementsByTagNameNS(W_DRAWING_NS, "inline")[0];
  if (!inline) return false;

  const blip = inline.getElementsByTagNameNS(A_DRAWING_NS, "blip")[0];
  if (!blip) return false;

  const relId =
    blip.getAttribute("r:embed") ||
    blip.getAttribute("r:id") ||
    blip.getAttribute("rId") ||
    "";
  if (!relId) return false;

  const url = ctx.relsMap[relId] || `image-${relId}`;

  const docPr = inline.getElementsByTagNameNS(A_DRAWING_NS, "docPr")[0];
  const alt = docPr?.getAttribute("descr") || "";

  ctx.slateNodes.push({
    type: "image",
    url,
    alt,
    children: [{ text: "" }],
  });

  return true;
}

function handlePageBreaksInParagraph(
  paragraph: Element,
  ns: string,
  ctx: ParagraphParseContext
) {
  const breaks = paragraph.getElementsByTagNameNS(ns, "br");
  for (let i = 0; i < breaks.length; i++) {
    const br = breaks[i];
    if (br.getAttribute("w:type") === "page") {
      ctx.slateNodes.push({
        type: "thematic-break",
        children: [{ text: "" }],
      });
    }
  }
}

function parseHyperlinkElement(
  hyperlinkEl: Element,
  ctx: ParagraphParseContext
): SlateElementNode | null {
  // 超链接一般在 w:hyperlink 元素上有 r:id / r:id
  const relId =
    hyperlinkEl.getAttribute("r:id") || hyperlinkEl.getAttribute("rId") || "";
  const url = (relId && ctx.relsMap[relId]) || (relId && `hyperlink-${relId}`);
  if (!url) return null;

  const runs = hyperlinkEl.getElementsByTagNameNS(ctx.ns, "r");
  const textChildren: SlateTextNode[] = [];

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];

    // 链接里的 run 同样可能包含图片，按需处理
    const hasImage = handleImageInRun(run, ctx);
    if (hasImage) continue;

    textChildren.push(...extractTextAndFormattingFromRun(run, ctx.ns));
  }

  if (!textChildren.length) return null;

  return {
    type: "link",
    url,
    children: textChildren,
  };
}

function parseParagraphChildren(
  paragraph: Element,
  ctx: ParagraphParseContext
): Array<SlateTextNode | SlateElementNode> {
  const { ns } = ctx;
  const children: Array<SlateTextNode | SlateElementNode> = [];

  const childNodes = Array.from(paragraph.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];

  for (const node of childNodes) {
    const localName = node.localName;

    if (localName === "hyperlink") {
      const linkNode = parseHyperlinkElement(node, ctx);
      if (linkNode) {
        children.push(linkNode);
      }
      continue;
    }

    if (localName === "r") {
      // run 内可能含图片
      const hasImage = handleImageInRun(node, ctx);
      if (hasImage) continue;

      const textNodes = extractTextAndFormattingFromRun(node, ns);
      children.push(...textNodes);
    }
  }

  return children;
}

// ====================== 段落 & 列表结构解析 ======================

interface ListStackItem {
  node: SlateNode; // list 节点
  level: number;
}

function getParagraphType(
  paragraph: Element,
  ns: string
): {
  nodeType: string;
  isListItem: boolean;
  level: number;
  isOrdered: boolean;
} {
  const pPr = paragraph.getElementsByTagNameNS(ns, "pPr")[0];
  let styleVal = "";
  let level = 0;
  let isOrdered = false;
  let isListItem = false;

  if (pPr) {
    const style = pPr.getElementsByTagNameNS(ns, "pStyle")[0];
    styleVal = style?.getAttribute("w:val") || "";

    const numPr = pPr.getElementsByTagNameNS(ns, "numPr")[0];
    if (numPr) {
      isListItem = true;

      const ilvl =
        numPr.getElementsByTagNameNS(ns, "ilvl")[0]?.getAttribute("w:val") ||
        "0";
      level = parseInt(ilvl, 10) || 0;

      const numId =
        numPr.getElementsByTagNameNS(ns, "numId")[0]?.getAttribute("w:val") ||
        "";

      // 简化：有 numId 且 level=0 视为有序列表
      isOrdered = !!numId && level === 0;
    }
  }

  let nodeType = "paragraph";
  if (styleVal && styleVal.toLowerCase().startsWith("heading")) {
    const headingLevel = styleVal.replace(/[^0-9]/g, "");
    const levelNum = parseInt(headingLevel, 10);
    if (levelNum >= 1 && levelNum <= 6) {
      nodeType = `heading-${toLowerCaseNumber(headingLevel)}`;
    }
  }

  return { nodeType, isListItem, level, isOrdered };
}

function handleListItemNode(
  itemNode: SlateNode,
  isOrdered: boolean,
  level: number,
  slateNodes: SlateNode[],
  listStack: ListStackItem[]
) {
  if (!listStack.length) {
    // 新建一个列表
    const newList: SlateNode = {
      type: "list",
      ordered: isOrdered,
      children: [itemNode],
    };
    slateNodes.push(newList);
    listStack.push({ node: newList, level });
    return;
  }

  const last = listStack[listStack.length - 1];

  if (last.level < level) {
    // 嵌套子列表
    const newList: SlateNode = {
      type: "list",
      ordered: isOrdered,
      children: [itemNode],
    };

    const parentList = last.node;
    const lastListItem = parentList.children[
      parentList.children.length - 1
    ] as SlateNode;

    lastListItem.children.push(newList);
    listStack.push({ node: newList, level });
  } else if (last.level > level) {
    // 回退到上级
    while (listStack.length && listStack[listStack.length - 1].level > level) {
      listStack.pop();
    }
    if (listStack.length) {
      listStack[listStack.length - 1].node.children.push(itemNode);
    } else {
      // 已经退到最外层，重新创建一个列表
      const newList: SlateNode = {
        type: "list",
        ordered: isOrdered,
        children: [itemNode],
      };
      slateNodes.push(newList);
      listStack.push({ node: newList, level });
    }
  } else {
    // 同一层级
    last.node.children.push(itemNode);
  }
}

// ====================== 表格解析 ======================

function parseTableElement(tableEl: Element, ns: string): SlateNode {
  const rows = tableEl.getElementsByTagNameNS(ns, "tr");
  const tableChildren: SlateNode[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const cells = row.getElementsByTagNameNS(ns, "tc");
    const rowChildren: SlateNode[] = [];

    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      const cellContent = extractTextAndFormattingForTableCell(cell, ns);

      rowChildren.push({
        type: "table-cell",
        header: r === 0, // 简单假设首行为表头
        children: cellContent.length ? cellContent : [{ text: "" }],
      });
    }

    tableChildren.push({
      type: "table-row",
      children: rowChildren,
    });
  }

  return {
    type: "table",
    children: tableChildren,
  };
}

// ====================== 主体 body 解析 ======================

function parseBodyToSlateNodes(
  body: Element,
  ns: string,
  relsMap: RelsMap
): SlateNode[] {
  const slateNodes: SlateNode[] = [];
  let listStack: ListStackItem[] = [];

  const bodyChildren = Array.from(body.children) as Element[];

  for (const child of bodyChildren) {
    const localName = child.localName;

    if (localName === "p") {
      const { nodeType, isListItem, level, isOrdered } = getParagraphType(
        child,
        ns
      );

      const ctx: ParagraphParseContext = { ns, relsMap, slateNodes };

      // 先处理分页符（可能在 p 内部）
      handlePageBreaksInParagraph(child, ns, ctx);

      const inlineChildren = parseParagraphChildren(child, ctx);

      if (inlineChildren.length > 0) {
        const itemNode: SlateNode = {
          type: isListItem ? "list-item" : nodeType,
          children: inlineChildren,
        };

        if (isListItem) {
          handleListItemNode(itemNode, isOrdered, level, slateNodes, listStack);
        } else {
          slateNodes.push(itemNode);
          listStack = []; // 段落打断列表
        }
      } else {
        // 没有文本、没有图片（图片会直接作为块级插入），补一个空段落
        slateNodes.push({
          type: nodeType,
          children: [{ text: "" }],
        });
        listStack = [];
      }
    } else if (localName === "tbl") {
      const tableNode = parseTableElement(child, ns);
      slateNodes.push(tableNode);
      listStack = [];
    }
  }

  if (!slateNodes.length) {
    slateNodes.push({
      type: "paragraph",
      children: [{ text: "（空文档或无有效段落内容）" }],
    });
  }

  return slateNodes;
}

// ====================== 对外主函数 ======================

/**
 * 将 DOCX 文件转换为 Slate.js 节点数组
 * - 支持：段落、标题、列表（含嵌套）、表格、超链接、图片、分页符
 * - 使用 PizZip 解压 DOCX
 */
export const convertDocxToSlate = async (file: File): Promise<SlateNode[]> => {
  try {
    // 1. 读取文件
    const arrayBuffer = await file.arrayBuffer();

    // 2. 用 PizZip 解压 DOCX（同步）
    const zip = new PizZip(new Uint8Array(arrayBuffer));

    // 3. 主文档 XML
    const documentXml = zip.file("word/document.xml")?.asText();
    if (!documentXml) {
      throw new Error("无法找到 word/document.xml 文件");
    }

    // 4. 关系文件（用于解析超链接、图片等引用）
    const relsXml = zip.file("word/_rels/document.xml.rels")?.asText() || "";
    const relsMap = parseRelsXml(relsXml);

    // 5. 解析 XML -> DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");
    const body = xmlDoc.getElementsByTagNameNS(WORD_MAIN_NS, "body")[0];

    if (!body) {
      return [
        {
          type: "paragraph",
          children: [{ text: "（未找到文档主体 body）" }],
        },
      ];
    }

    // 6. 转为 Slate 节点
    return parseBodyToSlateNodes(body, WORD_MAIN_NS, relsMap);
  } catch (error) {
    console.error("转换 DOCX 到 Slate.js 格式失败：", error);
    throw error instanceof Error
      ? error
      : new Error("转换 DOCX 到 Slate.js 格式失败");
  }
};
