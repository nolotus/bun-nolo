// pageSlice.js

import { createSlice } from '@reduxjs/toolkit';

export const pageSlice = createSlice({
  name: 'page',
  initialState: {
    content: '',
    title: '',
    hasVersion: false,
    slug: '',
    creator: '',
    createdTime: '',
  },
  reducers: {
    setContent: (state, action) => {
      state.content = action.payload;
    },
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setHasVersion: (state, action) => {
      state.hasVersion = action.payload;
    },
    setSlug: (state, action) => {
      state.slug = action.payload;
    },
    setCreator: (state, action) => {
      state.creator = action.payload;
    },
    setCreatedTime: (state) => {
      state.createdTime = new Date().toISOString();
    },
  },
});

export const {
  setContent,
  setTitle,
  setHasVersion,
  setSlug,
  setCreator,
  setCreatedTime,
} = pageSlice.actions;

export default pageSlice.reducer;
