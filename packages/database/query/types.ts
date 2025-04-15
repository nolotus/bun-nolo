type ArithmeticOperators = {
  $gt?: { [key: string]: number };
  $lt?: { [key: string]: number };
  $eq?: { [key: string]: any };
  $ne?: { [key: string]: any };
  $in?: { [key: string]: any[] };
  $nin?: { [key: string]: any[] };
  $size?: { [key: string]: number };
};

type LogicalOperators = {
  $and?: QueryCondition[];
  $or?: QueryCondition[];
  $not?: QueryCondition;
  $nor?: QueryCondition[];
};

type FieldOperators = {
  $exists?: boolean;
};
export type QueryCondition = ArithmeticOperators &
  LogicalOperators &
  FieldOperators & {
    $all?: { [key: string]: any[] };
    $elemMatch?: { [key: string]: QueryCondition };
    $timeGt?: { [key: string]: Date | number };
    $timeLt?: { [key: string]: Date | number };
  };
