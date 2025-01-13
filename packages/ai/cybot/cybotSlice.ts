import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { API_ENDPOINTS } from "database/config";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "../api/apiEndpoints";

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
        let response;
        if (!cybotConfig.useServerProxy) {
          response = await fetch(api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cybotConfig.apiKey}`,
            },
            body: JSON.stringify(bodyData),
          });
        } else {
          response = await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...bodyData,
              url: api,
              KEY: cybotConfig.apiKey,
            }),
          });
        }
        const result = await response.json();
        const content = result.choices[0].message.content;
        return content;
      }
    }, {}),
  }),
});

export const { runCybotId } = cybotSlice.actions;

export default cybotSlice.reducer;
