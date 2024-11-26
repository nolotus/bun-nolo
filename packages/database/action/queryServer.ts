import { noloQueryRequest } from "../client/queryRequest";
import { mergeMany } from "../dbSlice";

export const queryServerAction = async (queryConfig, thunkApi) => {
  const { dispatch } = thunkApi;
  const { server } = queryConfig;
  try {
    const res = await noloQueryRequest(queryConfig);
    const data = await res.json();

    if (res.status === 200) {
      dispatch(mergeMany({ data, server }));
      return data;
    } else {
      const { error } = result;
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
