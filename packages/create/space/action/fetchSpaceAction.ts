import type { SpaceId, SpaceData } from "create/space/types";
import { createSpaceKey } from "create/space/spaceKeys";
import { read } from "database/dbSlice";

export const fetchSpaceAction = async (
  input: { spaceId: SpaceId },
  thunkAPI: any
): Promise<SpaceData> => {
  const { spaceId } = input;
  const { dispatch } = thunkAPI;
  const spaceKey = createSpaceKey.space(spaceId);

  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();
  if (!spaceData) {
    throw new Error("Space not found");
  }

  return spaceData;
};
