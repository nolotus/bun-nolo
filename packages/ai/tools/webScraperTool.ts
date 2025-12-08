// /ai/tools/webScraperTool.ts

import { callApifyActor } from "./apifyActorClient";

/**
 * Web Scraper schema：只暴露最关键的参数，其它通过 extraInput 透传。
 */
export const webScraperFunctionSchema = {
  name: "webScraper",
  description:
    "使用 Apify Web Scraper 抓取任意网站结构化数据。需要提供 startUrls 和 pageFunction（JS 字符串）。",
  parameters: {
    type: "object",
    properties: {
      startUrls: {
        type: "array",
        description: "起始 URL 列表，对应 inputSchema.startUrls。",
        items: { type: "string" },
      },
      pageFunction: {
        type: "string",
        description:
          "在浏览器中执行的 Page function（JS 源码字符串）。用于从页面提取字段。",
      },
      linkSelector: {
        type: "string",
        description:
          "可选。CSS 选择器，决定从页面上继续跟踪哪些链接，对应 linkSelector。",
      },
      maxPagesPerCrawl: {
        type: "integer",
        minimum: 0,
        description: "可选。最大页面数，防止跑飞。",
      },
      maxResultsPerCrawl: {
        type: "integer",
        minimum: 0,
        description: "可选。最大结果记录数。",
      },
      maxCrawlingDepth: {
        type: "integer",
        minimum: 0,
        description: "可选。最大抓取深度。",
      },
      extraInput: {
        type: "object",
        description:
          "可选。透传给 Apify Web Scraper 的其他 input 字段（如 globs、pseudoUrls 等）。",
      },
    },
    required: ["startUrls", "pageFunction"],
  },
};

export async function webScraperFunc(
  args: {
    startUrls: string[];
    pageFunction: string;
    linkSelector?: string;
    maxPagesPerCrawl?: number;
    maxResultsPerCrawl?: number;
    maxCrawlingDepth?: number;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    startUrls,
    pageFunction,
    linkSelector,
    maxPagesPerCrawl,
    maxResultsPerCrawl,
    maxCrawlingDepth,
    extraInput = {},
  } = args;

  if (!startUrls || !startUrls.length) {
    throw new Error("webScraper：startUrls 不能为空。");
  }
  if (!pageFunction || typeof pageFunction !== "string") {
    throw new Error("webScraper：必须提供 pageFunction（字符串）。");
  }

  const input: any = {
    runMode: "PRODUCTION",
    startUrls: startUrls.map((url) => ({ url })),
    pageFunction,
    proxyConfiguration: { useApifyProxy: true }, // 按 schema 要求给默认 proxy
    ...extraInput,
  };

  if (typeof linkSelector === "string") input.linkSelector = linkSelector;
  if (typeof maxPagesPerCrawl === "number")
    input.maxPagesPerCrawl = maxPagesPerCrawl;
  if (typeof maxResultsPerCrawl === "number")
    input.maxResultsPerCrawl = maxResultsPerCrawl;
  if (typeof maxCrawlingDepth === "number")
    input.maxCrawlingDepth = maxCrawlingDepth;

  return callApifyActor(thunkApi, {
    actorId: "apify~web-scraper",
    input,
    resultType: "datasetItems",
    displayName: "Web Scraper",
  });
}
