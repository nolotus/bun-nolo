import { useAuth } from 'app/hooks';
import { nolotusDomain } from 'core/init';
import fetchReadAllData from 'database/client/readAll';
import React, { useEffect, useState } from 'react';
import { getLogger } from 'utils/logger';

import { AccountBalance } from './blocks/AccountBanlance';
import DataList from './blocks/DataList';
import TokenStatisticsBlock from './blocks/TokenStatisticsBlock';

const lifeLogger = getLogger('life');

const LifeAll = () => {
  const [data, setData] = useState(null);

  const [aiUsage, setAiUsage] = useState(0);
  const [tokenStatistics, setTokenStatistics] = useState(null);

  const auth = useAuth();

  const fetchData = async () => {
    const currentDomain = window.location.port
      ? `${window.location.hostname}:${window.location.port}`
      : `${window.location.hostname}`;
    const mainDomain = nolotusDomain[0];
    const isMainHost = currentDomain === mainDomain;

    if (isMainHost) {
      const res = await fetchReadAllData(mainDomain, auth.user?.userId);
      if (res) {
        setData(res.map((item) => ({ ...item, source: 'both' })));
      } else {
        lifeLogger.error('Failed to fetch data from nolotus.com');
      }
    } else {
      const [localData, nolotusData] = await Promise.all([
        fetchReadAllData(currentDomain, auth.user?.userId),
        fetchReadAllData(mainDomain, auth.user?.userId),
      ]);
      if (!localData && !nolotusData) {
        lifeLogger.error('Both requests failed');
        return;
      }

      let mergedData = [];

      if (localData) {
        const nolotusKeys = nolotusData
          ? new Set(nolotusData.map((item) => item.key))
          : new Set();
        mergedData = localData.map((item) => ({
          ...item,
          source: nolotusKeys.has(item.key) ? 'both' : 'local',
        }));
      }

      if (nolotusData) {
        nolotusData.forEach((item) => {
          if (!mergedData.some((localItem) => localItem.key === item.key)) {
            mergedData.push({ ...item, source: 'nolotus' });
          }
        });
      }

      const tokenStatisticsData = mergedData.filter(
        (item) => item.value && item.value.type === 'tokenStatistics',
      );

      setTokenStatistics(tokenStatisticsData);
      setData(mergedData);
    }
  };

  useEffect(() => {
    auth.user?.userId && fetchData();
  }, [auth.user?.userId]);

  return (
    <div className="p-4">
      <AccountBalance aiUsage={aiUsage} />
      {tokenStatistics && (
        <TokenStatisticsBlock
          data={tokenStatistics}
          onCostCalculated={setAiUsage}
        />
      )}

      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
