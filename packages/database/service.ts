import { api } from 'app/services/api';

import { ResponseData, WriteHashDataType, WriteDataType } from './types';
export const dbApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEntry: builder.query({
      query: (entryId) => `/db/read/${entryId}`,
    }),
    getEntries: builder.query({
      query: ({ userId, options }) => {
        const url = `/db/query/${userId}`;
        const queryParams = new URLSearchParams({
          isObject: (options.isObject ?? false).toString(),
          isJSON: (options.isJSON ?? false).toString(),
          limit: options.limit?.toString() ?? '',
        });

        return {
          url: `${url}?${queryParams}`,
          method: 'POST',
          body: options.condition,
        };
      },
    }),
    write: builder.mutation<ResponseData, WriteDataType>({
      // 更改为 "write"
      query: ({ data, flags, customId, userId, host }) => {
        return {
          url: '/db/write',
          method: 'POST',
          body: {
            data,
            flags,
            customId,
            userId,
            host,
          },
        };
      },
    }),
    writeHash: builder.mutation<ResponseData, WriteHashDataType>({
      // 更改为 "writeHash"
      query: ({ data, flags, userId }) => {
        return {
          url: '/db/write',
          method: 'POST',
          body: {
            data,
            flags: { isHash: true, ...flags },
            userId,
          },
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
  useWriteHashMutation,
} = dbApi;
