import { api } from "app/api";
import { selectCurrentUserId } from "auth/authSlice";

import { extractAndDecodePrefix, extractUserId } from "core";

import { API_ENDPOINTS } from "./config";
import { ResponseData, WriteDataType } from "./types";
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
  }),
});

export const { useWriteMutation, useUpdateEntryMutation } = dbApi;
