// pageSlice.js

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  markdownToMdast,
  mdastToMarkdown,
  getH1TextFromMdast,
} from 'render/MarkdownProcessor';

export const pageSlice = createSlice({
  name: 'page',
  initialState: {
    content: '',
    title: '',
    hasVersion: false,
    slug: '',
    creator: '',
    createdTime: '',
    mdast: { type: 'root', children: [] },
  },
  reducers: {
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

    saveContentAndMdast: (state, action: PayloadAction<string>) => {
      // Convert markdown text to mdast
      const mdast = markdownToMdast(action.payload);

      // Update the mdast state
      state.mdast.children = [...state.mdast.children, ...mdast.children];

      // Convert mdast back to markdown and set the content
      state.content = mdastToMarkdown(state.mdast);

      // Optionally, extract and set the title from mdast
      const newTitle = getH1TextFromMdast(mdast);
      if (newTitle) {
        state.title = newTitle;
      }
    },
  },
});

export const {
  setTitle,
  setHasVersion,
  setSlug,
  setCreator,
  setCreatedTime,
  saveContentAndMdast,
} = pageSlice.actions;

export default pageSlice.reducer;
