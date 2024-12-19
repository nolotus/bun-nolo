import {
	type PayloadAction,
	asyncThunkCreator,
	buildCreateSlice,
} from "@reduxjs/toolkit";
import { makeAppointment } from "ai/tools/appointment";
import { prepareTools } from "ai/tools/prepareTools";
import { selectCurrentUserId } from "auth/authSlice";
import { read } from "database/dbSlice";
import { ollamaModelNames } from "integrations/ollama/models";
import { ollamaHandler } from "integrations/ollama/ollamaHandler";

const createSliceWithThunks = buildCreateSlice({
	creators: { asyncThunk: asyncThunkCreator },
});

const initialState = {
	// 初始化状态
};

export const cybotSlice = createSliceWithThunks({
	name: "cybot",
	initialState: initialState,
	reducers: (create) => ({
		runCybotId: create.asyncThunk(
			async ({ cybotId, prevMsgs, userInput }, thunkApi) => {
				console.log("runCybotId cybotID", cybotId);
				const state = thunkApi.getState();
				const dispatch = thunkApi.dispatch;
				const cybotConfig = await dispatch(read({ id: cybotId })).unwrap();
				console.log("runCybotId cybotConfig", cybotConfig);
				// const readLLMAction = await dispatch(read({ id: cybotConfig.llmId }));
				// const llmConfig = readLLMAction.payload;
				// console.log("runCybotId llmConfig", llmConfig);
				// if (ollamaModelNames.includes(llmConfig.model)) {
				//   const model = llmConfig.model;
				//   const prepareMsgConfig = {
				//     model,
				//     promotMessage: { role: "system", content: cybotConfig.prompt },
				//     prevMsgs,
				//     content: userInput,
				//   };
				//   const messages = ollamaHandler.prepareMsgs(prepareMsgConfig);
				//   const tools = prepareTools(cybotConfig.tools);
				//   const bodyData = {
				//     model: model,
				//     messages,
				//     tools,
				//     stream: false,
				//   };
				//   const body = JSON.stringify(bodyData);
				//   const { api, apiStyle } = llmConfig;
				//   const result = await fetch(api, {
				//     method: "POST",
				//     headers: {
				//       "Content-Type": "application/json",
				//     },
				//     body,
				//     // signal,
				//   });
				//   const json = await result.json();
				//   const message = json.message;
				//   const cybotTools = message.tool_calls;
				//   console.log("message", message);
				//   console.log("cybotTools", cybotTools);
				//   if (!cybotTools) {
				//     console.log("direct return");
				//     return message;
				//   } else {
				//     const tool = cybotTools[0].function;
				//     const toolName = tool.name;
				//     if (toolName === "make_appointment") {
				//       const currentUserId = selectCurrentUserId(state);
				//       console.log("handle tool currentUserId", currentUserId);
				//       const result = await makeAppointment(
				//         tool.arguments,
				//         thunkApi,
				//         currentUserId,
				//       );
				//       console.log("handle tool result", result);
				//       const message = { content: result };
				//       return message;
				//     }
				//   }
				// }
			},
			{},
		),
	}),
});

export const { runCybotId } = cybotSlice.actions;

export default cybotSlice.reducer;
