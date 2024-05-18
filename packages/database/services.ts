import { api } from "app/api";
import { selectCurrentUserId } from "auth/selectors";

import { extractAndDecodePrefix, extractUserId } from "core";

import { API_ENDPOINTS } from "./config";
import { ResponseData, WriteHashDataType, WriteDataType } from "./types";
import { updateOne } from "database/dbSlice";

export type GetEntryType = {
  entryId: string;
  domain?: string;
};
type GetEntriesArgs = {
  userId: string;
  options: {
    isObject?: boolean;
    isJSON?: boolean;
    limit?: number;
    condition?: any;
  };
  domain?: string;
};
type DeleteEntryArgs = {
  entryId: string;
  domain?: string;
};

type UpdateEntryArgs = {
  entryId: string;
  data: any; // 根据需要定义更准确的类型
  domain?: string;
};
export const dbApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEntry: builder.query<ResponseData, GetEntryType>({
      query: ({ entryId, domain }) => {
        let fullDomain = domain;
        if (domain) {
          const hasHttp = domain.startsWith("http://");
          const hasHttps = domain.startsWith("https://");
          if (!hasHttp && !hasHttps) {
            fullDomain = domain.startsWith("localhost")
              ? `http://${domain}`
              : `https://${domain}`;
          }
        }
        const url = fullDomain
          ? `${fullDomain}${API_ENDPOINTS.DATABASE}/read/${entryId}`
          : `${API_ENDPOINTS.DATABASE}/read/${entryId}`;
        return url;
      },
    }),
    getEntries: builder.query<ResponseData, GetEntriesArgs>({
      query: ({ userId, options, domain }) => {
        let fullDomain = domain;
        if (domain) {
          const hasHttp = domain.startsWith("http://");
          const hasHttps = domain.startsWith("https://");
          if (!hasHttp && !hasHttps) {
            fullDomain = domain.startsWith("localhost")
              ? `http://${domain}`
              : `https://${domain}`;
          }
        }
        const urlPath = `query/${userId}`;
        const queryParams = new URLSearchParams({
          isObject: (options.isObject ?? false).toString(),
          isJSON: (options.isJSON ?? false).toString(),
          limit: options.limit?.toString() ?? "",
        });

        const url = fullDomain
          ? `${fullDomain}${API_ENDPOINTS.DATABASE}/${urlPath}?${queryParams}`
          : `${API_ENDPOINTS.DATABASE}/${urlPath}?${queryParams}`;

        return {
          url,
          method: "POST",
          body: options.condition,
        };
      },
    }),

    write: builder.mutation<ResponseData, WriteDataType>({
      query: ({ data, flags, customId, userId, domain }) => {
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}/write`
          : `${API_ENDPOINTS.DATABASE}/write`;

        return {
          url: url,
          method: "POST",
          body: {
            data,
            flags,
            customId,
            userId,
          },
        };
      },
    }),
    writeHash: builder.mutation<ResponseData, WriteHashDataType>({
      query: ({ data, flags, userId, domain }) => {
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}/writeHash`
          : `${API_ENDPOINTS.DATABASE}/writeHash`;
        return {
          url,
          method: "POST",
          body: {
            data,
            flags: { isHash: true, ...flags },
            userId,
          },
        };
      },
    }),
    deleteEntry: builder.mutation<ResponseData, DeleteEntryArgs>({
      query: ({ entryId, domain }) => {
        let fullDomain = domain;
        if (domain) {
          const hasHttp = domain.startsWith("http://");
          const hasHttps = domain.startsWith("https://");
          if (!hasHttp && !hasHttps) {
            fullDomain = domain.startsWith("localhost")
              ? `http://${domain}`
              : `https://${domain}`;
          }
        }
        const url = fullDomain
          ? `${fullDomain}${API_ENDPOINTS.DATABASE}/delete/${entryId}`
          : `${API_ENDPOINTS.DATABASE}/delete/${entryId}`;
        console.log("url", url);

        return {
          url,
          method: "DELETE",
        };
      },
    }),
    updateEntry: builder.mutation<ResponseData, UpdateEntryArgs>({
      queryFn: async (
        { entryId, data, domain },
        { getState, dispatch },
        extraArg,
        baseQuery,
      ) => {
        // 直接访问状态
        const state = getState();
        const userId = selectCurrentUserId(state);

        if (!userId) {
          // 如果找不到用户ID，则返回错误
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "No user ID found in state.",
            },
          };
        }

        const dataUserId = extractUserId(entryId);
        const flags = extractAndDecodePrefix(entryId);

        if (
          !(
            dataUserId === userId ||
            (flags.isOthersWritable && data.writeableIds.includes(userId))
          )
        ) {
          // 如果用户没有更新权限，返回错误
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "You do not have permission to update this entry.",
            },
          };
        }

        // 构建URL和请求配置
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}/update/${entryId}`
          : `${API_ENDPOINTS.DATABASE}/update/${entryId}`;

        // 使用baseQuery执行请求
        const result = await baseQuery({
          url,
          method: "PUT",
          body: data,
        });
        dispatch(updateOne({ id: entryId, changes: data }));
        return result.data ? { data: result.data } : { error: result.error };
      },
    }),
    readAll: builder.query<ResponseData, { userId: string; domain?: string }>({
      query: ({ userId, domain }) => {
        // 确保domain具有正确的协议前缀
        let fullDomain = domain;
        if (domain) {
          const hasHttp = domain.startsWith("http://");
          const hasHttps = domain.startsWith("https://");
          if (!hasHttp && !hasHttps) {
            fullDomain = domain.startsWith("localhost")
              ? `http://${domain}`
              : `https://${domain}`;
          }
        }

        const endpoint = "/readAll";
        const url = fullDomain
          ? `${fullDomain}${API_ENDPOINTS.DATABASE}${endpoint}`
          : `${API_ENDPOINTS.DATABASE}${endpoint}`;

        return {
          url,
          method: "POST",
          body: { userId },
        };
      },
    }),
  }),
});

export const {
  useGetEntriesQuery,
  useGetEntryQuery,
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
  useWriteMutation,
  useDeleteEntryMutation,
  useUpdateEntryMutation,
  useLazyReadAllQuery,
} = dbApi;
