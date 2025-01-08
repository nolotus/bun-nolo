import { noloQueryRequest } from "../client/queryRequest";
import { upsertMany } from "../dbSlice";

export const queryServerAction = async (queryConfig, thunkApi) => {
  const { dispatch } = thunkApi;
  try {
    const res = await noloQueryRequest(queryConfig);
    const data = await res.json();

    if (res.status === 200) {
      dispatch(upsertMany(data));
      return data;
    } else {
      const { error } = result;
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
