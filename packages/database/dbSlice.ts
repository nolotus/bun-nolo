import {
	asyncThunkCreator,
	buildCreateSlice,
	createEntityAdapter,
	createSelector,
	createSelectorCreator,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { selectCurrentServer } from "setting/settingSlice";

import { selectIsLoggedIn } from "auth/authSlice";
import { deleteAction } from "./action/delete";
import { addToListAction, removeFromListAction } from "./action/listAction";
import { queryServerAction } from "./action/queryServer";
import { readAction } from "./action/read";
import { writeAction } from "./action/write";
import { noloPatchRequest } from "./requests/patchRequest";
import { noloPutRequest } from "./requests/putRequest";
export const dbAdapter = createEntityAdapter();

export const { selectById, selectEntities, selectAll, selectIds, selectTotal } =
	dbAdapter.getSelectors((state: NoloRootState) => state.db);

export const makeSelectEntityById =
	(entityId: string) => (state: NoloRootState) =>
		selectById(state, entityId);

const initialState = dbAdapter.getInitialState({});

const createSliceWithThunks = buildCreateSlice({
	creators: { asyncThunk: asyncThunkCreator },
});

// Slice
const dbSlice = createSliceWithThunks({
	name: "db",
	initialState,
	reducers: (create) => ({
		queryServer: create.asyncThunk(queryServerAction, {
			fulfilled: (state, action) => {},
		}),
		read: create.asyncThunk(readAction, {
			rejected: (state, action) => {},
			fulfilled: (state, action) => {
				if (action.payload) {
					dbAdapter.upsertOne(state, action.payload);
				}
			},
		}),
		deleteData: create.asyncThunk(deleteAction, {
			fulfilled: (state, action) => {
				const ids = action.payload;
				dbAdapter.removeMany(state, ids);
			},
		}),
		write: create.asyncThunk(writeAction, {
			pending: (state, action) => {},
			fulfilled: (state, action) => {},
		}),
		// setData is a thunk that will update an entity in the database
	
		// upsertData is a thunk that will either create or update an entity in the database
		upsertData: create.asyncThunk(
			async (saveConfig, thunkApi) => {
				const dispatch = thunkApi.dispatch;
				const id = saveConfig.id;
				const readAction = await dispatch(read({ id }));
				if (readAction.error) {
					const { data } = saveConfig;
					const dataBelongUserId = extractUserId(saveConfig.id);
					const id = extractCustomId(saveConfig.id);
					const flags = extractAndDecodePrefix(saveConfig.id);
					const writeConfig = {
						userId: dataBelongUserId,
						data: { ...data },
						flags,
						id,
					};
					const writeRes = await dispatch(write(writeConfig));
				} else {
					const updateRes = await dispatch(setData({ ...saveConfig, id }));
					return updateRes.payload.data;
				}
			},
			{
				fulfilled: (state, action) => {
					dbAdapter.upsertOne(state, action);
				},
			},
		),
		upsertOne: create.reducer((state, action) => {
			dbAdapter.upsertOne(state, action.payload);
		}),
		mergeMany: create.reducer((state, action) => {
			const { data, server } = action.payload;
			const withSourceData = data.map((item) => {
				const exist = dbAdapter.selectId(item.id);
				if (exist) {
					const mergeBefore = {
						...item,
						source: [...exist.server, server],
					};
					return mergeBefore;
				}
				return { ...item, source: [server] };
			});
			dbAdapter.upsertMany(state, withSourceData);
		}),
		patchData: create.asyncThunk(
			async ({ id, changes }, thunkApi) => {
				const state = thunkApi.getState();
				const res = await noloPatchRequest(state, id, changes);
				const { data } = await res.json();
				return data;
			},
			{
				fulfilled: (state, action) => {
					const { payload } = action;
					const { id, ...changes } = payload;
					dbAdapter.updateOne(state, { id, changes });
				},
			},
		),

		addOne: dbAdapter.addOne,
		setOne: dbAdapter.setOne,
		addToList: create.asyncThunk(addToListAction, {}),
		removeFromList: create.asyncThunk(removeFromListAction, {}),
		query: create.asyncThunk(async (queryConfig, thunkAPI) => {
			const state = thunkAPI.getState();
			const currentServer = selectCurrentServer(state);
			const config = { server: currentServer, ...queryConfig };
			const isLoggedIn = selectIsLoggedIn(state);
			if (isLoggedIn) {
				const actionResult = await thunkAPI.dispatch(queryServer(config));
			}
		}, {}),
	}),
});
export const selectEntitiesByIds = createSelector(
	[(state) => state, (state, ids) => ids],
	(state, ids) => ids.map((id) => selectById(state, id)),
);
createSelectorCreator;
export const {
	upsertOne,
	setOne,
	mergeMany,
	deleteData,
	patchData,
	upsertData,
	read,
	syncQuery,
	write,
	addOne,
	addToList,
	removeFromList,
	queryServer,
	query,
} = dbSlice.actions;
export default dbSlice.reducer;
