import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { pick } from "rambda";
import {
	markdownToMdast,
	getH1TextFromMdast,
	getYamlValueFromMdast,
} from "render/MarkdownProcessor";
import { parse } from "yaml";

export const pageSlice = createSlice({
	name: "page",
	initialState: {
		content: "",
		hasVersion: false,
		createdTime: "",
		mdast: { type: "root", children: [] },
		showAsMarkdown: false,
		meta: {
			type: DataType.Page,
			creator: "",
			title: "",
			layout: "default",
			categories: [],
			tags: [],
		},
		saveAsTemplate: false,
	},
	reducers: {
		setHasVersion: (state, action) => {
			state.hasVersion = action.payload;
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
			state.content += state.content ? "\n\n" + action.payload : action.payload;
			// Optionally, extract and set the title from mdast
			const newTitle = getH1TextFromMdast(mdast);
			if (newTitle) {
				state.meta.title = newTitle;
			}
			console.log("state.meta", state.meta);
			const newYamlValue = getYamlValueFromMdast(mdast);
			console.log("newYamlValue", newYamlValue);

			if (newYamlValue) {
				try {
					const parsedYaml = parse(newYamlValue);
					console.log("parsedYaml", parsedYaml);
					// const meta = extractFrontMatter(parsedYaml);
					const meta = pick(
						["type", "lat", "lng", "title", "tags", "categories"],
						parsedYaml,
					);
					console.log("meta", meta);
					state.meta.type = meta.type;
				} catch (error) {
					console.error("parse函数出错：", error);
				}
			}
		},
		initPage: (state, action: PayloadAction<string>) => {
			// Update content with the incoming markdown
			state.saveAsTemplate = action.payload.is_template;
			state.content = action.payload.content;
			state.meta.type = action.payload.type;
			state.meta.title = action.payload.title;
			// Convert markdown to mdast
			const mdast = markdownToMdast(action.payload.content);
			// Update the mdast state
			state.mdast = mdast;
		},
		initPageFromTemplate: (state, action: PayloadAction<string>) => {
			// Update content with the incoming markdown
			state.content = action.payload.content;
			state.meta.type = action.payload.type;
			state.meta.title = action.payload.title;
			// Convert markdown to mdast
			const mdast = markdownToMdast(action.payload.content);
			// Update the mdast state
			state.mdast = mdast;
		},
		updateContent: (
			state,
			action: PayloadAction<{ content: string; metaUpdates: any; mdast?: any }>,
		) => {
			state.content = action.payload.content;

			// 从新的 content 解析更新 mdast
			if (action.payload.mdast) {
				state.mdast = action.payload.mdast;
			}

			// 从 mdast 中提取并更新 title
			const newTitle = getH1TextFromMdast(action.payload.mdast);
			if (newTitle) {
				state.meta.title = newTitle;
			}
			if (action.payload.metaUpdates) {
				state.meta = {
					...state.meta,
					...action.payload.metaUpdates,
				};
			}
		},
		setSaveAsTemplate(state, action: PayloadAction<boolean>) {
			state.saveAsTemplate = action.payload;
		},
	},
});

export const {
	setHasVersion,
	saveContentAndMdast,
	setShowAsMarkdown,
	initPage,
	initPageFromTemplate,
	updateContent,
	setSaveAsTemplate,
} = pageSlice.actions;

export default pageSlice.reducer;
