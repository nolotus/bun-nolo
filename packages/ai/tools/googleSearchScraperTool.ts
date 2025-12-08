// /ai/tools/googleSearchScraperTool.ts

import { callApifyActor } from "./apifyActorClient";

export const googleSearchScraperFunctionSchema = {
  name: "googleSearchScraper",
  description:
    "使用 Apify Google Search Results Scraper 抓取 Google SERP，用于发现文章/政策/新闻等 URL。",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "搜索词，或完整的 Google 搜索 URL，对应 inputSchema.queries。",
      },
      resultsPerPage: { type: "integer", minimum: 1, maximum: 100 },
      maxPagesPerQuery: { type: "integer", minimum: 1 },
      countryCode: {
        type: "string",
        description: "国家代码，如 us, gb, de 等。",
      },
      searchLanguage: {
        type: "string",
        description: "搜索结果语言，如 en, zh-CN 等。",
      },
      afterDate: {
        type: "string",
        description: "过滤：只要此日期之后的结果。",
      },
      beforeDate: {
        type: "string",
        description: "过滤：只要此日期之前的结果。",
      },
      extraInput: {
        type: "object",
        description: "可选。透传给 Apify 的其他过滤字段（wordsInTitle 等）。",
      },
    },
    required: ["query"],
  },
};

export async function googleSearchScraperFunc(
  args: {
    query: string;
    resultsPerPage?: number;
    maxPagesPerQuery?: number;
    countryCode?: string;
    searchLanguage?: string;
    afterDate?: string;
    beforeDate?: string;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    query,
    resultsPerPage,
    maxPagesPerQuery,
    countryCode,
    searchLanguage,
    afterDate,
    beforeDate,
    extraInput = {},
  } = args;

  const input: any = {
    queries: query, // OpenAPI 是 string
    ...extraInput,
  };

  if (typeof resultsPerPage === "number") input.resultsPerPage = resultsPerPage;
  if (typeof maxPagesPerQuery === "number")
    input.maxPagesPerQuery = maxPagesPerQuery;
  if (typeof countryCode === "string") input.countryCode = countryCode;
  if (typeof searchLanguage === "string") input.searchLanguage = searchLanguage;
  if (typeof afterDate === "string") input.afterDate = afterDate;
  if (typeof beforeDate === "string") input.beforeDate = beforeDate;

  return callApifyActor(thunkApi, {
    actorId: "apify~google-search-scraper",
    input,
    resultType: "datasetItems",
    displayName: "Google Search Scraper",
  });
}
