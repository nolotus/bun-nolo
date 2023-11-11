import { getDomains } from 'app/domains';
import { useAppDispatch, useAuth } from 'app/hooks';
import { updateData } from 'database/dbSlice';
import { useLazyReadAllQuery } from 'database/services';
import React, { useEffect, useMemo } from 'react';

import { AccountBalance } from './blocks/AccountBanlance';
import DataList from './blocks/DataList';
import { FilterPanel } from './blocks/FilterPanel';
import TokenStatisticsBlock from './blocks/TokenStatisticsBlock';

export const LifeAll = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const [trigger, { data, error, isLoading }] = useLazyReadAllQuery();

  const domains = useMemo(() => getDomains(), []);

  const fetchData = async (userId: string) => {
    domains.forEach(async ({ domain, source }) => {
      const result = await trigger({ userId, domain }).unwrap();
      console.log('result', result);
      dispatch(updateData({ data: result, source }));
    });
  };

  useEffect(() => {
    auth.user?.userId && fetchData(auth.user?.userId);
  }, [auth.user?.userId]);

  return (
    <div className="p-4">
      <AccountBalance />
      <TokenStatisticsBlock />

      <FilterPanel />
      <DataList refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
