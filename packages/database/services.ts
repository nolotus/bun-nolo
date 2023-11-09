import { api } from 'app/api';

import { API_ENDPOINTS } from './config';
import { ResponseData, WriteHashDataType, WriteDataType } from './types';

export type GetEntryType = {
  entryId: string,
  domain?: string,
};
type GetEntriesArgs = {
  userId: string,
  options: {
    isObject?: boolean,
    isJSON?: boolean,
    limit?: number,
    condition?: any,
  },
  domain?: string,
};
type DeleteEntryArgs = {
  entryId: string,
  domain?: string,
};
export const dbApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEntry: builder.query<ResponseData, GetEntryType>({
      query: ({ entryId, domain }) => {
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}read/${entryId}`
          : `${API_ENDPOINTS.DATABASE}read/${entryId}`;
        return url;
      },
    }),
    getEntries: builder.query<ResponseData, GetEntriesArgs>({
      query: ({ userId, options, domain }) => {
        const urlPath = `query/${userId}`;
        const queryParams = new URLSearchParams({
          isObject: (options.isObject ?? false).toString(),
          isJSON: (options.isJSON ?? false).toString(),
          limit: options.limit?.toString() ?? '',
        });

        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}${urlPath}?${queryParams}`
          : `${API_ENDPOINTS.DATABASE}${urlPath}?${queryParams}`;

        return {
          url,
          method: 'POST',
          body: options.condition,
        };
      },
    }),

    write: builder.mutation<ResponseData, WriteDataType>({
      query: ({ data, flags, customId, userId, domain }) => {
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}write`
          : `${API_ENDPOINTS.DATABASE}write`;

        return {
          url: url,
          method: 'POST',
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
    deleteEntry: builder.mutation<ResponseData, DeleteEntryArgs>({
      query: ({ entryId, domain }) => {
        const url = domain
          ? `${domain}${API_ENDPOINTS.DATABASE}delete/${entryId}`
          : `${API_ENDPOINTS.DATABASE}delete/${entryId}`;
        return {
          url,
          method: 'DELETE',
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
  useDeleteEntryMutation,
} = dbApi;
