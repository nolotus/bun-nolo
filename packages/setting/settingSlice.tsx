import { createSlice } from "@reduxjs/toolkit";

const settingSlice = createSlice({
  name: "settings",
  initialState: {
    syncSetting: { currentServer: "http://localhost:80" },
  },
  reducers: {
    updateCurrentServer: (state, action) => {
      state.syncSetting.currentServer = action.payload;
    },
  },
});

export const { updateCurrentServer } = settingSlice.actions;
export default settingSlice.reducer;
