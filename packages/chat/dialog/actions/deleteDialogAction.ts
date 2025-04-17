import { remove, read } from "database/dbSlice";

export const deleteDialogAction = async (dialogKey, thunkApi) => {
  const { dispatch, getState } = thunkApi;
  const state = getState();

  try {
    const dialogConfig = await dispatch(read(dialogKey)).unwrap();
    if (dialogConfig?.messageListId) {
      const body = { ids: state.message.ids };
      const deleteMessageListAction = await dispatch(
        remove({
          id: dialogConfig.messageListId,
          body,
        })
      );
    }
  } catch (error) {
    console.error("Error reading dialog:", error);
  } finally {
    dispatch(remove(dialogKey));
  }
};
