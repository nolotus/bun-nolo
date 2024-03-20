import { getDomains } from "app/domains";
import { useAppDispatch } from "app/hooks";
import { updateData } from "database/dbSlice";
import { useLazyReadAllQuery } from "database/services";
import { useMemo } from "react";
export const useFetchData = () => {
  const dispatch = useAppDispatch();
  const [trigger, { data, error, isLoading }] = useLazyReadAllQuery();
  const domains = useMemo(() => getDomains(), []);
  const fetchData = async (userId: string) => {
    domains.forEach(async ({ domain, source }) => {
      const result = await trigger({ userId, domain }).unwrap();
      dispatch(updateData({ data: result, source }));
    });
  };
  return { fetchData };
};
