import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { nolotusDomain } from 'core/init';
import { DataType } from 'create/types';
import React, { useEffect } from 'react';
import { isDevelopment } from 'utils/env';

import { AccountBalance } from './blocks/AccountBanlance';
import DataList from './blocks/DataList';
import TokenStatisticsBlock from './blocks/TokenStatisticsBlock';
import { fetchDataThunk, setFilterType } from './lifeSlice';
import { selectFilterType } from './selectors';
export const currentDomain = isDevelopment
  ? 'localhost'
  : window.location.port
  ? `${window.location.hostname}:${window.location.port}`
  : `${window.location.hostname}`;

const LifeAll = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const filterType = useAppSelector(selectFilterType);
  const fetchData = (userId: string) => {
    const domains = nolotusDomain.map((domain) => ({ domain, source: domain }));

    // 检查 currentDomain 是否已经包含在 domains 数组中
    const isCurrentDomainIncluded = domains.some(
      (item) => item.domain === currentDomain,
    );

    // 如果 currentDomain 不包含在 domains 数组中，则将其添加到数组中
    if (!isCurrentDomainIncluded) {
      domains.push({ domain: currentDomain, source: currentDomain });
    }

    // 遍历 domains 数组，为每个 domain 调用 fetchDataThunk 函数
    domains.forEach(({ domain, source }) => {
      dispatch(fetchDataThunk({ userId, domain, source }));
    });
  };

  useEffect(() => {
    auth.user?.userId && fetchData(auth.user?.userId);
  }, [auth.user?.userId]);

  const handleFilterTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    dispatch(setFilterType(event.target.value));
  };

  return (
    <div className="p-4">
      <AccountBalance />
      <TokenStatisticsBlock />
      <div className="my-4">
        <label htmlFor="filterType">Filter Type:</label>
        <select
          id="filterType"
          value={filterType}
          onChange={handleFilterTypeChange}
        >
          <option value="" disabled hidden>
            Select a filter type
          </option>{' '}
          {/* 新增的 option 元素 */}
          {Object.values(DataType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <DataList refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
