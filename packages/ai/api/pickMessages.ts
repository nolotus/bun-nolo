import { pick, map } from "rambda";
const messagePropertiesToPick = ["content", "role", "images"];

export const pickMessages = map(pick(messagePropertiesToPick));
