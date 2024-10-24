import { noloToObject } from "core";
import { checkQuery, QueryConditions } from "../checkQuery";

export function handleObjectData(data: string, condition: QueryConditions) {
  const objectData = noloToObject(data);
  if (checkQuery(objectData, condition)) {
    return objectData;
  }
  return null;
}
