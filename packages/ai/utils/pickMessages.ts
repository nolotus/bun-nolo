import { pick, map } from "rambda";
const messagePropertiesToPick = ["content", "role"];

export const pickMessages = map(pick(messagePropertiesToPick));
