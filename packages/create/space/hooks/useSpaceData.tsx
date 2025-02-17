import { useAppDispatch } from "app/hooks";
import { createSpaceKey } from "create/space/spaceKeys";
import { useEffect, useState } from "react";
import { SpaceData } from "../types";
import { read } from "database/dbSlice";

export const useSpaceData = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const [spaceData, setSpaceData] = useState<SpaceData | null>(null);
  console.log("spaceData", spaceData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const spaceKey = createSpaceKey.space(spaceId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(read(spaceKey)).unwrap();
        setSpaceData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (spaceId) {
      fetchData();
    }
  }, [spaceId, dispatch]);

  return { spaceData, loading, error };
};
