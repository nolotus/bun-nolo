// /ai/tools/ecommerceScraperTool.ts

import { callApifyActor } from "./apifyActorClient";

export const ecommerceScraperFunctionSchema = {
  name: "ecommerceScraper",
  description:
    "使用 Apify E-commerce Scraping Tool 抓取电商网站的产品、评论、卖家等信息。",
  parameters: {
    type: "object",
    properties: {
      detailsUrls: {
        type: "array",
        description: "产品详情页 URL 列表，对应 detailsUrls。",
        items: { type: "string" },
      },
      listingUrls: {
        type: "array",
        description: "分类/列表页 URL 列表，对应 listingUrls。",
        items: { type: "string" },
      },
      keyword: {
        type: "string",
        description: "用于 marketplace 搜索的关键词。",
      },
      marketplaces: {
        type: "array",
        description: "指定在哪些电商站点搜索（见 Actor 文档枚举）。",
        items: { type: "string" },
      },
      maxProductResults: {
        type: "integer",
        minimum: 1,
        description: "总产品数量上限。",
      },
      // 你可以按需继续把 review / seller 的字段加进来，
      extraInput: {
        type: "object",
        description: "可选。直接透传给 Apify 的其他 input 字段。",
      },
    },
    required: [],
  },
};

export async function ecommerceScraperFunc(
  args: {
    detailsUrls?: string[];
    listingUrls?: string[];
    keyword?: string;
    marketplaces?: string[];
    maxProductResults?: number;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    detailsUrls,
    listingUrls,
    keyword,
    marketplaces,
    maxProductResults,
    extraInput = {},
  } = args;

  const input: any = {
    scrapeMode: "AUTO",
    ...extraInput,
  };

  if (detailsUrls?.length)
    input.detailsUrls = detailsUrls.map((url) => ({ url }));
  if (listingUrls?.length)
    input.listingUrls = listingUrls.map((url) => ({ url }));
  if (typeof keyword === "string" && keyword.trim()) input.keyword = keyword;
  if (marketplaces?.length) input.marketplaces = marketplaces;
  if (typeof maxProductResults === "number")
    input.maxProductResults = maxProductResults;

  return callApifyActor(thunkApi, {
    actorId: "apify~e-commerce-scraping-tool",
    input,
    resultType: "datasetItems",
    displayName: "E-commerce Scraping Tool",
  });
}
