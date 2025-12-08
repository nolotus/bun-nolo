// /ai/tools/amazonProductScraperTool.ts

import { callApifyActor } from "./apifyActorClient";

export const amazonProductScraperFunctionSchema = {
  name: "amazonProductScraper",
  description:
    "使用 Apify Amazon Product Scraper 抓取亚马逊产品数据（类目页或商品详情页 URL）。",
  parameters: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        description:
          "一个或多个 Amazon 类目或商品 URL，对应 categoryOrProductUrls。",
        items: { type: "string" },
      },
      maxItemsPerStartUrl: {
        type: "integer",
        minimum: 0,
        description: "每个起始 URL 最大产品数。",
      },
      language: {
        type: "string",
        description: "页面语言，如 en, de, fr 等。",
      },
      proxyCountry: {
        type: "string",
        description: "代理国家，默认 AUTO_SELECT_PROXY_COUNTRY。",
      },
      maxSearchPagesPerStartUrl: {
        type: "integer",
        minimum: 1,
      },
      extraInput: {
        type: "object",
        description: "可选。透传给 Apify 的其他 input 字段。",
      },
    },
    required: ["urls"],
  },
};

export async function amazonProductScraperFunc(
  args: {
    urls: string[];
    maxItemsPerStartUrl?: number;
    language?: string;
    proxyCountry?: string;
    maxSearchPagesPerStartUrl?: number;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    urls,
    maxItemsPerStartUrl,
    language,
    proxyCountry,
    maxSearchPagesPerStartUrl,
    extraInput = {},
  } = args;

  if (!urls || !urls.length) {
    throw new Error("Amazon Product Scraper：urls 不能为空。");
  }

  const input: any = {
    categoryOrProductUrls: urls.map((url) => ({ url })),
    ...extraInput,
  };

  if (typeof maxItemsPerStartUrl === "number")
    input.maxItemsPerStartUrl = maxItemsPerStartUrl;
  if (typeof language === "string") input.language = language;
  if (typeof proxyCountry === "string") input.proxyCountry = proxyCountry;
  if (typeof maxSearchPagesPerStartUrl === "number")
    input.maxSearchPagesPerStartUrl = maxSearchPagesPerStartUrl;

  return callApifyActor(thunkApi, {
    actorId: "junglee~Amazon-crawler",
    input,
    resultType: "datasetItems",
    displayName: "Amazon Product Scraper",
  });
}
