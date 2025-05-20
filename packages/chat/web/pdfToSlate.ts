import * as pdfjsLib from "pdfjs-dist";

// 设置 pdf.js worker 路径（根据你的项目配置调整）
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

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

    // 遍历每一页，提取内容
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // 将文本内容按段落分组（pdf.js 提供的 items 可能不是完整的段落）
      let currentParagraphText = "";
      textContent.items.forEach((item) => {
        if ("str" in item) {
          currentParagraphText += item.str;
          // 简单判断段落结束（可以根据换行或其他逻辑改进）
          if (item.str.trim().endsWith("\n") || item.hasEOL) {
            if (currentParagraphText.trim()) {
              slateNodes.push({
                type: "paragraph",
                children: [{ text: currentParagraphText.trim() }],
              });
              currentParagraphText = "";
            }
          }
        }
      });

      // 处理剩余文本
      if (currentParagraphText.trim()) {
        slateNodes.push({
          type: "paragraph",
          children: [{ text: currentParagraphText.trim() }],
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
