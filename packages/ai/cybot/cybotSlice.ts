import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";

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
  }),
});

export const { runCybotId } = cybotSlice.actions;

export default cybotSlice.reducer;
