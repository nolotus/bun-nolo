import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";
import { generateRequestBody } from "./generateRequestBody";
import { buildReferenceContext } from "ai/context/buildReferenceContext";
import { requestHandlers } from "ai/llm/providers";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";

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
    runCybotId: create.asyncThunk(async ({ cybotId, userInput }, thunkApi) => {
      const state = thunkApi.getState();
      const dispatch = thunkApi.dispatch;
      const cybotConfig = await dispatch(read(cybotId)).unwrap();
      if (cybotConfig.type === DataType.CYBOT) {
        const api = getApiEndpoint(cybotConfig);
        const currentServer = selectCurrentServer(state);
        const messages = [
          {
            role: "system",
            content: cybotConfig.prompt,
          },
          { role: "user", content: userInput },
        ];
        const bodyData = { model: cybotConfig.model, messages, stream: false };
        const response = await performFetchRequest(
          cybotConfig,
          api,
          bodyData,
          currentServer
        );

        const result = await response.json();
        const content = result.choices[0].message.content;
        return content;
      }
    }, {}),
    streamCybotId: create.asyncThunk(
      async ({ cybotId, userInput }, thunkApi) => {
        const state = thunkApi.getState();
        const msgs = selectAllMsgs(state);
        console.log("msgs", msgs);
        const dispatch = thunkApi.dispatch;
        const cybotConfig = await dispatch(read(cybotId)).unwrap();
        const context = await buildReferenceContext(cybotConfig, dispatch);

        const bodyData = generateRequestBody(
          state,
          userInput,
          cybotConfig,
          context
        );
        const providerName = cybotConfig.provider.toLowerCase();
        const handler = requestHandlers[providerName];
        const dialogConfig = selectCurrentDialogConfig(state);
        const dialogKey = dialogConfig.dbKey;
        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });
      },
      {}
    ),
  }),
});

export const { runCybotId, streamCybotId } = cybotSlice.actions;

export default cybotSlice.reducer;
