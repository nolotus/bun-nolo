import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { RootState } from "app/store";

// Entity adapter
export const dbAdapter = createEntityAdapter();
export const { selectById } = dbAdapter.getSelectors(
  (state: RootState) => state.db,
);
export const makeSelectEntityById = (entityId: string) => (state: RootState) =>
  selectById(state, entityId);

// Initial state
const initialState = dbAdapter.getInitialState({});

function mergeSource(existingItem, newSource) {
  if (existingItem) {
    const sourceSet = new Set(existingItem.source);
    sourceSet.add(newSource);
    return Array.from(sourceSet);
  } else {
    return [newSource];
  }
}

// Slice
const dbSlice = createSlice({
  name: "db",
  initialState,

  reducers: (create) => ({
    updateData: create.reducer((state, action) => {
      const updatedData = action.payload.data.map((item) => {
        const existingItem = state.entities[item.id];
        return {
          ...item,
          source: mergeSource(existingItem, action.payload.source),
        };
      });
      dbAdapter.upsertMany(state, updatedData);
    }),

    deleteData: create.reducer((state, action) => {
      dbAdapter.removeOne(state, action.payload);
    }),
    upsertMany: create.reducer((state, action) => {
      dbAdapter.upsertMany(state, action.payload);
    }),
    upsertOne: create.reducer((state, action) => {
      // windows.localstorage
      dbAdapter.upsertOne(state, action.payload.value);
    }),
    removeOne: create.reducer((state, action) => {
      dbAdapter.removeOne(state, action.payload);
    }),
    updateOne: create.reducer((state, action) => {
      dbAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes,
      });
    }),
  }),
});

export const {
  updateData,
  deleteData,
  upsertMany,
  upsertOne,
  removeOne,
  updateOne,
} = dbSlice.actions;
export default dbSlice.reducer;
