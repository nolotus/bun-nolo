import { z } from "zod";

const QueryCondition = z.lazy(() =>
  z.union([
    z.record(z.any()),
    z.object({
      $and: z.array(QueryCondition).optional(),
      $or: z.array(QueryCondition).optional(),
      $not: QueryCondition.optional(),
      $gt: z.record(z.number()).optional(),
      $lt: z.record(z.number()).optional(),
      $startsWith: z.record(z.string()).optional(),
      $endsWith: z.record(z.string()).optional(),
      $contains: z.record(z.union([z.string(), z.array(z.any())])).optional(),
      $all: z.record(z.array(z.any())).optional(),
      $elemMatch: z.record(QueryCondition).optional(),
      $add: z.record(z.number()).optional(),
      $subtract: z.record(z.number()).optional(),
    }),
  ]),
);

// 定义 QueryOptions 类型
const QueryOptionsSchema = z.object({
  userId: z.string().optional(),
  isObject: z.boolean().optional(),
  condition: QueryCondition.optional(),
});

export const validateQueryOptions = (options: unknown) => {
  return QueryOptionsSchema.safeParse(options);
};
