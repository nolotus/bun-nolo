import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { nolotusDomain } from 'core/init';
import React, { useEffect } from 'react';
import { isDevelopment } from 'utils/env';
import { getLogger } from 'utils/logger';

import { AccountBalance } from './blocks/AccountBanlance';
import DataList from './blocks/DataList';
import TokenStatisticsBlock from './blocks/TokenStatisticsBlock';
import {
  setFilterType,
  setExcludeType,
  fetchLocalData,
  fetchNolotusData,
} from './lifeSlice';
import { selectTokenStatisticsData, selectCosts } from './selectors';
const lifeLogger = getLogger('life ');

const LifeAll = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const fetchData = (userId: string) => {
    const currentDomain = isDevelopment
      ? 'localhost'
      : window.location.port
      ? `${window.location.hostname}:${window.location.port}`
      : `${window.location.hostname}`;
    const mainDomain = nolotusDomain[0];
    const isMainHost = currentDomain === mainDomain;

    dispatch(fetchLocalData(userId));
    dispatch(fetchNolotusData(userId));
  };
  // const [data, setData] = useState(null);
  const { data, status, error, filterType, excludeType } = useAppSelector(
    (state) => state.life,
  );

  const tokenStatistics = useAppSelector(selectTokenStatisticsData);
  useEffect(() => {
    auth.user?.userId && fetchData(auth.user?.userId);
  }, [auth.user?.userId]);

  const costs = useAppSelector(selectCosts);
  const aiUsage = costs?.totalCost;

  const handleExcludeChange = (event) => {
    // 创建一个新的处理函数来处理反选类型的更改
    dispatch(setExcludeType(event.target.value));
  };

  const handleFilterChange = (event) => {
    // 创建一个新的处理函数来处理筛选条件的更改
    dispatch(setFilterType(event.target.value));
  };

  const filteredData = data?.filter((item) => {
    const meetsFilterCondition = filterType
      ? item.value?.type === filterType
      : true;
    const meetsExcludeCondition = excludeType
      ? item.value?.type !== excludeType
      : true;
    return meetsFilterCondition && meetsExcludeCondition;
  });
  console.log('filteredData', filteredData);
  return (
    <div className="p-4">
      <select value={filterType} onChange={handleFilterChange}>
        {/* 添加一个下拉菜单来选择筛选条件 */}
        <option value="">All</option>
        <option value="tokenStatistics">Token Statistics</option>
        <option value="page">page</option>

        {/* ...其他选项... */}
      </select>

      <select value={excludeType} onChange={handleExcludeChange}>
        {/* 添加一个下拉菜单来选择反选类型 */}
        <option value="">None</option>
        <option value="tokenStatistics">Token Statistics</option>
        {/* ...其他选项... */}
      </select>
      <AccountBalance aiUsage={aiUsage} />
      {tokenStatistics && <TokenStatisticsBlock />}

      <DataList data={filteredData} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
