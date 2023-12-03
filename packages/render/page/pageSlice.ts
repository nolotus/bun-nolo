import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataType } from 'create/types';
import { pick } from 'rambda';
import {
  markdownToMdast,
  getH1TextFromMdast,
  getYamlValueFromMdast,
} from 'render/MarkdownProcessor';
import { parse } from 'yaml';
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
    showAsMarkdown: false,
    meta: {
      type: DataType.Page,
    },
  },
  reducers: {
    setHasVersion: (state, action) => {
      state.hasVersion = action.payload;
    },
    setSlug: (state, action) => {
      state.slug = action.payload;
    },
    setCreator: (state, action) => {
      state.creator = action.payload;
    },
    setShowAsMarkdown: (state, action: PayloadAction<boolean>) => {
      state.showAsMarkdown = action.payload;
    },

    saveContentAndMdast: (state, action: PayloadAction<string>) => {
      // Convert markdown text to mdast
      const mdast = markdownToMdast(action.payload);

      // Update the mdast state
      state.mdast.children = [...state.mdast.children, ...mdast.children];

      state.content += state.content ? '\n\n' + action.payload : action.payload;
      // Optionally, extract and set the title from mdast
      const newTitle = getH1TextFromMdast(mdast);
      if (newTitle) {
        state.title = newTitle;
      }
      const newYamlValue = getYamlValueFromMdast(mdast);
      console.log('newYamlValue', newYamlValue);

      if (newYamlValue) {
        try {
          const parsedYaml = parse(newYamlValue);
          console.log('parsedYaml', parsedYaml);
          // const meta = extractFrontMatter(parsedYaml);
          const meta = pick(['type', 'lat', 'lng'], parsedYaml);
          console.log('meta', meta);
          state.meta.type = meta.type;
        } catch (error) {
          console.error('parse函数出错：', error);
        }
      }
    },
    initPage: (state, action: PayloadAction<string>) => {
      // Update content with the incoming markdown
      state.content = action.payload.content;
      state.meta.type = action.payload.type;

      // Convert markdown to mdast
      const mdast = markdownToMdast(action.payload.content);

      // Update the mdast state
      state.mdast = mdast;

      // Extract and set the title from mdast
      let title;
      if (action.payload.title) {
        title = action.payload.title;
      } else {
        title = getH1TextFromMdast(mdast);
      }
      if (title) {
        state.title = title;
      }
    },
    updateContent: (state, action: PayloadAction<string>) => {
      // 直接更新 content
      state.content = action.payload;

      // 从新的 content 解析更新 mdast
      const mdast = markdownToMdast(state.content);
      state.mdast = mdast;

      // 从 mdast 中提取并更新 title
      const newTitle = getH1TextFromMdast(mdast);
      if (newTitle) {
        state.title = newTitle;
      }
      const newYamlValue = getYamlValueFromMdast(mdast);

      if (newYamlValue) {
        try {
          const parsedYaml = parse(newYamlValue);
          console.log('parsedYaml', parsedYaml);
          // const meta = extractFrontMatter(parsedYaml);
          const meta = pick(['type', 'lat', 'lng'], parsedYaml);
          console.log('meta', meta);
          state.meta = meta;
        } catch (error) {
          console.error('parse函数出错：', error);
        }
      }
    },
  },
});

export const {
  setHasVersion,
  setSlug,
  setCreator,
  saveContentAndMdast,
  setShowAsMarkdown,
  initPage,
  updateContent,
} = pageSlice.actions;

export default pageSlice.reducer;
