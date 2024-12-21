import { map, pick } from "rambda";
const messagePropertiesToPick = ["content", "role", "images"];

export const pickMessages = map(pick(messagePropertiesToPick));
