import { listToArray } from "core/noloToOther";
import { QueryCondition } from "../types";

export function handleListData(data: string, condition: QueryCondition) {
  return listToArray(data);
}
