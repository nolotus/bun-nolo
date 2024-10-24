import { checkQuery, QueryConditions } from "../checkQuery";

export function handleJSONData(data: string, condition: QueryConditions) {
  try {
    const jsonData = JSON.parse(data);
    if (checkQuery(jsonData, condition)) {
      return jsonData;
    }
  } catch (error) {}
  return null;
}
