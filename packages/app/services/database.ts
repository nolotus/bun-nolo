import { api } from "./api";

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
          limit: options.limit?.toString() ?? "",
        });

        return {
          url: `${url}?${queryParams}`,
          method: "POST",
          body: options.condition,
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
} = dbApi;
