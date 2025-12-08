// /ai/tools/youtubeScraperTool.ts

import { callApifyActor } from "./apifyActorClient";

export const youtubeScraperFunctionSchema = {
  name: "youtubeScraper",
  description:
    "使用 Apify 的 YouTube Scraper 抓取 YouTube 视频、频道、播放列表等信息。支持 Direct URLs 或搜索关键词。",
  parameters: {
    type: "object",
    properties: {
      directUrls: {
        type: "array",
        description:
          "可选。视频/频道/播放列表等 URL 列表，将映射到 startUrls。",
        items: { type: "string" },
      },
      searchQueries: {
        type: "array",
        description: "可选。搜索关键词数组，将映射到 searchQueries。",
        items: { type: "string" },
      },
      maxResults: { type: "integer", minimum: 0 },
      maxResultsShorts: { type: "integer", minimum: 0 },
      maxResultStreams: { type: "integer", minimum: 0 },
      downloadSubtitles: { type: "boolean" },
      subtitlesLanguage: {
        type: "string",
        enum: [
          "any",
          "en",
          "de",
          "es",
          "fr",
          "it",
          "ja",
          "ko",
          "nl",
          "pt",
          "ru",
        ],
      },
      subtitlesFormat: {
        type: "string",
        enum: ["srt", "vtt", "xml", "plaintext"],
      },
      extraInput: {
        type: "object",
        description: "可选。直接透传给 Apify 的额外 input 字段，方便扩展。",
      },
    },
    required: [],
  },
};

export async function youtubeScraperFunc(
  args: {
    directUrls?: string[];
    searchQueries?: string[];
    maxResults?: number;
    maxResultsShorts?: number;
    maxResultStreams?: number;
    downloadSubtitles?: boolean;
    subtitlesLanguage?: string;
    subtitlesFormat?: string;
    extraInput?: Record<string, any>;
  },
  thunkApi: any
) {
  const {
    directUrls,
    searchQueries,
    maxResults,
    maxResultsShorts,
    maxResultStreams,
    downloadSubtitles,
    subtitlesLanguage,
    subtitlesFormat,
    extraInput = {},
  } = args;

  if (
    (!directUrls || directUrls.length === 0) &&
    (!searchQueries || searchQueries.length === 0)
  ) {
    throw new Error(
      "YouTube 抓取：至少提供 directUrls 或 searchQueries 之一。"
    );
  }

  const input: any = {
    ...extraInput,
  };

  if (searchQueries?.length) input.searchQueries = searchQueries;
  if (directUrls?.length) input.startUrls = directUrls.map((url) => ({ url }));

  if (typeof maxResults === "number") input.maxResults = maxResults;
  if (typeof maxResultsShorts === "number")
    input.maxResultsShorts = maxResultsShorts;
  if (typeof maxResultStreams === "number")
    input.maxResultStreams = maxResultStreams;
  if (typeof downloadSubtitles === "boolean")
    input.downloadSubtitles = downloadSubtitles;
  if (typeof subtitlesLanguage === "string")
    input.subtitlesLanguage = subtitlesLanguage;
  if (typeof subtitlesFormat === "string")
    input.subtitlesFormat = subtitlesFormat;

  return callApifyActor(thunkApi, {
    actorId: "streamers~youtube-scraper",
    input,
    resultType: "datasetItems",
    displayName: "YouTube Scraper",
  });
}
