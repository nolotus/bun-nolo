import { makeAppointmentTool } from "ai/tools/appointment";

export const prepareTools = (toolNames) => {
  const tools = toolNames.map((toolName: string) => {
    if (toolName === "makeAppointment") {
      return makeAppointmentTool;
    }
  });
  return tools;
};
