import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ChatBotBlock = ({ data, refreshData }) => {
  const [maxItems, setMaxItems] = useState(3);
  const [selectedSources, setSelectedSources] = useState([]);

  const OMIT_NAME_MAX_LENGTH = 60;

  const omitName = (content) => {
    const { name, ...otherProps } = content;
    let jsonString = JSON.stringify(otherProps);
    if (jsonString.length > OMIT_NAME_MAX_LENGTH) {
      jsonString = jsonString.substr(0, OMIT_NAME_MAX_LENGTH) + "...";
    }
    return jsonString;
  };

  const handleMoreClick = () => {
    setMaxItems(maxItems + 3);
  };

  const handleSourceClick = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((item) => item !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [maxItems]);

  return (
    <>
      <h2 className="text-xl font-bold pb-4">ChatBotBlock</h2>
      <div className="flex flex-wrap mb-4">
        {Array.from(new Set(data.map((item) => item.source))).map((source) => (
          <button
            key={source}
            className={`m-1 py-1 px-2 rounded ${
              selectedSources.includes(source)
                ? "bg-blue-500 text-white"
                : "bg-white border-2 border-blue-500 text-blue-500"
            }`}
            onClick={() => handleSourceClick(source)}
          >
            {source}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data ? (
          data
            .filter(
              (item) =>
                !selectedSources.length || selectedSources.includes(item.source)
            )
            .slice(0, maxItems)
            .map((item) => (
              <div
                key={item.key}
                className="flex flex-col bg-white hover:bg-gray-100 rounded-lg shadow p-4 transition-colors duration-200 cursor-pointer"
              >
                <div className="pb-4 flex justify-between items-center">
                  <div className="font-bold text-lg">{item.value.name}</div>
                  <div className="text-purple-600 font-medium bg-purple-100 rounded p-1">
                    {item.source}
                  </div>
                </div>
                <div className="flex">
                  <Link to={`/chat?id=${item.key}`}>
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2">
                      对话
                    </button>
                  </Link>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">
                    编辑
                  </button>
                  <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    删除
                  </button>
                </div>
                <div>
                  <p>{omitName(item.value)}</p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>
      {data && data.length > maxItems && (
        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleMoreClick}
          >
            更多
          </button>
        </div>
      )}
    </>
  );
};

export default ChatBotBlock;
