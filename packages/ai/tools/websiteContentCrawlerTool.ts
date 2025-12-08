// /ai/tools/websiteContentCrawlerTool.ts

import { callApifyActor } from "./apifyActorClient";

export const websiteContentCrawlerFunctionSchema = {
  name: "websiteContentCrawler",
  description:
    "使用 Apify Website Content Crawler 抓取站点内容（Markdown/文本）以供知识库与 RAG 使用。",
  parameters: {
    type: "object",
    properties: {
      startUrls: {
        type: "array",
        description: "起始 URL 列表，对应 inputSchema.startUrls。",
        items: { type: "string" },
      },
      maxCrawlDepth: {
        type: "integer",
        minimum: 0,
        description: "最大爬取深度，0 仅爬 startUrls。",
      },
      maxCrawlPages: {
        type: "integer",
        minimum: 0,
        description: "最大页面数，防止跑飞。",
      },
      maxResults: {
        type: "integer",
        minimum: 0,
        description: "最大输出结果数。",
      },
      saveMarkdown: {
        type: "boolean",
        description: "是否保存 Markdown（默认 true）。",
      },
      saveFiles: {
        type: "boolean",
        description: "是否下载 PDF/Excel 等文件。",
      },
      crawlerType: {
        type: "string",
        enum: [
          "playwright:adaptive",
          "playwright:firefox",
          "cheerio",
          "jsdom",
          "playwright:chrome",
        ],
        description: "爬虫类型，默认 playwright:firefox。",
      },
      extraInput: {
        type: "object",
        description: "可选。直接透传给 Apify 的其他 input 字段。",
      },
    },
    required: ["startUrls"],
  },
};

export async function websiteContentCrawlerFunc(
  args: {
    startUrls: string[];
    maxCrawlDepth?: number;
    maxCrawlPages?: number;
    maxResults?: number;
    saveMarkdown?: boolean;
    saveFiles?: boolean;
    crawlerType?: string;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    startUrls,
    maxCrawlDepth,
    maxCrawlPages,
    maxResults,
    saveMarkdown,
    saveFiles,
    crawlerType,
    extraInput = {},
  } = args;

  if (!startUrls || startUrls.length === 0) {
    throw new Error("Website Content Crawler：startUrls 不能为空。");
  }

  const input: any = {
    startUrls: startUrls.map((url) => ({ url })),
    proxyConfiguration: { useApifyProxy: true }, // 必填字段，给默认值
    ...extraInput,
  };

  if (typeof maxCrawlDepth === "number") input.maxCrawlDepth = maxCrawlDepth;
  if (typeof maxCrawlPages === "number") input.maxCrawlPages = maxCrawlPages;
  if (typeof maxResults === "number") input.maxResults = maxResults;
  if (typeof saveMarkdown === "boolean") input.saveMarkdown = saveMarkdown;
  if (typeof saveFiles === "boolean") input.saveFiles = saveFiles;
  if (typeof crawlerType === "string") input.crawlerType = crawlerType;

  return callApifyActor(thunkApi, {
    actorId: "apify~website-content-crawler",
    input,
    resultType: "datasetItems",
    displayName: "Website Content Crawler",
  });
}
