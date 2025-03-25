import { makeAppointmentTool } from "ai/tools/appointment";
import { runCybotTool } from "./runCybot";
import { generateTableTool } from "./generateTableTool";

export const prepareTools = (toolNames) => {
  const tools = toolNames.map((toolName: string) => {
    if (toolName === "makeAppointment") {
      return makeAppointmentTool;
    }
    if (toolName === "runCybot") {
      return runCybotTool;
    }
    if (toolName === "generateTable") {
      return generateTableTool;
    }
  });
  return tools;
};
