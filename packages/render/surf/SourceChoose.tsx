import React from 'react';

export const SourceChoose = ({ onChange }) => {
  return (
    <>
      模式
      <div className="flex justify-around p-4 bg-gray-200">
        <button
          onClick={() => onChange('sg')}
          className="py-2 px-4 bg-white rounded hover:bg-gray-100"
        >
          自动
        </button>
        <button
          onClick={() => onChange('noaa')}
          className="py-2 px-4 bg-white rounded hover:bg-gray-100"
        >
          GFS
        </button>
        <button
          onClick={() => onChange('meteo')}
          className="py-2 px-4 bg-white rounded hover:bg-gray-100"
        >
          Meteo
        </button>
        <button
          onClick={() => onChange('icon')}
          className="py-2 px-4 bg-white rounded hover:bg-gray-100"
        >
          ICON
        </button>
      </div>
    </>
  );
};
