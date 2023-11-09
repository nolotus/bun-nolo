import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// Entity adapter
export const dbAdapter = createEntityAdapter();

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
  name: 'db',
  initialState,
  reducers: {
    updateData: (state, action) => {
      const updatedData = action.payload.data.map((item) => {
        const existingItem = state.entities[item.id];
        return {
          ...item,
          source: mergeSource(existingItem, action.payload.source),
        };
      });
      dbAdapter.upsertMany(state, updatedData);
    },
  },
});

export const { updateData } = dbSlice.actions;
export default dbSlice.reducer;
