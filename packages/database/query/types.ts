type ArithmeticOperators = {
  $gt?: {[key: string]: number};
  $lt?: {[key: string]: number};
  $eq?: {[key: string]: any};
  $ne?: {[key: string]: any};
  $in?: {[key: string]: any[]};
  $nin?: {[key: string]: any[]};
  $size?: {[key: string]: number};
};

type LogicalOperators = {
  $and?: QueryCondition[];
  $or?: QueryCondition[];
  $not?: QueryCondition;
  $nor?: QueryCondition[];
};

export type QueryCondition = ArithmeticOperators &
  LogicalOperators & {
    $all?: {[key: string]: any[]};
    $elemMatch?: {[key: string]: QueryCondition};
    $timeGt?: {[key: string]: Date | number};
    $timeLt?: {[key: string]: Date | number};
  };
export interface QueryOptions {
  userId?: string;
  isObject?: boolean;
  isJSON?: boolean;
  isList?: boolean;
  condition?: QueryCondition;
  skip?: number; // 分页开始的位置
  limit?: number; // 每页的数量
  sort?: {
    key: string; // 要排序的键
    order: 'asc' | 'desc'; // 排序顺序：升序或降序
  }; // 排序选项
}
