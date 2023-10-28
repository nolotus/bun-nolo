import fetchReadAllData from 'database/client/readAll';
import React, { useState } from 'react';
import { UserArrayComponent } from 'user/blocks/UserItem';
import { queryUser } from 'user/client/query';
import { syncUserData } from 'user/client/sync';

import { useProfileData } from '../useProfileData';

const ServiceProviderSettings = () => {
  const { formData, setFormData, handleSaveClick } = useProfileData(
    'serviceProviderSettings',
  );
  const [userArray, setUserArray] = useState(null);
  const [error, setError] = useState(null);
  const [syncUserArray, setSyncUserArray] = useState([]);

  const handleCheckboxChange = (user, isChecked) => {
    if (isChecked) {
      setSyncUserArray([...syncUserArray, user]);
    } else {
      setSyncUserArray(syncUserArray.filter((item) => item.id !== user.id));
    }
  };

  const handleQueryClick = () => {
    handleSaveClick();
    queryUser(100, 0, formData?.dataSource)
      .then((data) => {
        setUserArray(data.results);
      })
      .catch((err) => {
        setError(err.message);
      });
  };
  // 获取所有用户数据
  const fetchAllUserData = async (syncUserArray, dataSource) => {
    const promises = syncUserArray.map(async (user) => {
      const { userId } = user;
      console.log(`Fetching data for user ID: ${userId}`);
      const userData = await fetchReadAllData(dataSource, userId);
      console.log(`Fetched data for user ID: ${userId}`);
      return [userId, userData];
    });

    const results = await Promise.all(promises);
    return Object.fromEntries(results);
  };

  // 执行数据同步
  const performDataSync = async (idDataMap, targetSource) => {
    try {
      console.log('Sending sync request...');
      const response = await syncUserData(idDataMap, targetSource);
      console.log('Server response:', response);
      console.log('Data synced successfully.');
    } catch (error) {
      console.log('Error occurred while syncing data:', error);
    }
  };
  const handleSyncClick = async () => {
    // 获取所有用户数据
    const idDataMap = await fetchAllUserData(
      syncUserArray,
      formData?.dataSource,
    );

    // 判断同步目标
    const targetSource =
      formData?.targetSource ||
      `${window.location.hostname}:${window.location.port}`;
    console.log(
      `Starting to sync to ${
        formData?.targetSource ? 'another' : 'current'
      } source...`,
    );

    // 执行数据同步
    await performDataSync(idDataMap, targetSource);
  };

  return (
    <div>
      Service Provider Settings
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
          Data Source:
        </label>
        <input
          type="text"
          value={formData?.dataSource || ''}
          onChange={(e) =>
            setFormData({ ...formData, dataSource: e.target.value })
          }
        />
        {/* 添加查询按钮 */}
        <button
          onClick={handleQueryClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 ml-2"
        >
          查询
        </button>
        <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
          Target Source:
        </label>
        <input
          type="text"
          value={formData?.targetSource || ''}
          onChange={(e) =>
            setFormData({ ...formData, targetSource: e.target.value })
          }
        />
        <button onClick={handleSyncClick} className="ml-2">
          {formData?.targetSource ? '同步到目标服务器' : '同步到当前'}
        </button>

        {userArray && (
          <UserArrayComponent
            userArray={userArray}
            handleCheckboxChange={handleCheckboxChange}
            dataSource={formData?.dataSource}
          />
        )}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default ServiceProviderSettings;
