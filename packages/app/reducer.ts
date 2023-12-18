import authReducer from "auth/authSlice";
import chatReducer from "chat/chatSlice";
import messageSlice from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import pageReducer from "render/page/pageSlice";

import { api } from "./api";
import themeSliceReducer from "./theme/themeSlice";

export const reducer = {
	life: lifeReducer,
	chat: chatReducer,
	auth: authReducer,
	page: pageReducer,
	message: messageSlice,
	db: dbReducer,
	theme: themeSliceReducer,
	[api.reducerPath]: api.reducer,
};
