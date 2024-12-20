import { makeAppointmentTool } from "ai/tools/appointment";
import { runCybotTool } from "./runCybot";

export const prepareTools = (toolNames) => {
	const tools = toolNames.map((toolName: string) => {
		if (toolName === "makeAppointment") {
			return makeAppointmentTool;
		}
		if (toolName === "runCybot") {
			return runCybotTool;
		}
	});
	return tools;
};
