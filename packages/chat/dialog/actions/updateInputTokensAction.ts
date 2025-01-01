import { DataType } from "create/types";
import { selectCurrentDialogConfig } from "../dialogSlice";
import { write } from "database/dbSlice";
import { nolotusId } from "core/init";

export const  updateInputTokensAction = 	async (tokenCount: number, thunkApi) => {
    const { dispatch } = thunkApi;
    const state = thunkApi.getState();
    const auth = state.auth;
    const config = selectCurrentDialogConfig(state);
    const model = config.model ? config.model : "xx";
    const staticData = {
        messageType: "send",
        model,
        tokenCount,
        userId: auth?.user?.userId,
        username: auth?.user?.username,
        date: new Date(),
    };

    await dispatch(
        write({
            data: {
                ...staticData,
                type: DataType.TokenStats,
            },
            flags: { isJSON: true },
            userId: nolotusId,
        }),
    );
    return tokenCount;
}