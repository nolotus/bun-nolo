import fetchReadAllData from 'database/client/readAll';
import React, { useState } from 'react';
import { deleteUser } from 'user/client/delete';

export const UserItem = ({ user, handleCheckboxChange, dataSource }) => {
  const [detailedData, setDetailedData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDetailClick = async (userId) => {
    const data = await fetchReadAllData(dataSource, userId);
    setDetailedData(data);
    setIsOpen(!isOpen);
  };

  const handleDeleteClick = (userId) => {
    deleteUser(userId);
  };

  return (
    <li className="border p-4 mb-2 rounded-md">
      <div className="flex items-center">
        <input
          type="checkbox"
          onChange={(e) => handleCheckboxChange(user, e.target.checked)}
          className="mr-4"
        />
        <span className="text-lg font-medium">
          id: {user.id}, userId: {user.userId}
        </span>
        <button
          onClick={() => handleDetailClick(user.userId)}
          className={`ml-auto bg-blue-500 text-white px-4 py-2 rounded ${
            isOpen ? 'bg-blue-700' : ''
          }`}
        >
          {isOpen ? '关闭详细信息' : '详细查询'}
        </button>
        <button
          onClick={() => handleDeleteClick(user.userId)}
          className="ml-2 bg-red-500 text-white px-4 py-2 rounded"
        >
          删除
        </button>
      </div>
      {isOpen && detailedData && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">详细查询结果：</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(detailedData, null, 2)}
          </pre>
        </div>
      )}
    </li>
  );
};

export const UserArrayComponent = ({
  userArray,
  handleCheckboxChange,
  dataSource,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-4">查询结果：</h3>
      <ul>
        {userArray.map((user, index) => (
          <UserItem
            key={index}
            user={user}
            handleCheckboxChange={handleCheckboxChange}
            dataSource={dataSource}
          />
        ))}
      </ul>
    </div>
  );
};
