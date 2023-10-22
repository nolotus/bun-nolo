import React, { useState, useEffect } from "react";
import { ChatBotBlock } from "./ChatBotBlock";

const ChatBotList = ({ data }) => {
  const [maxItems, setMaxItems] = useState(3);
  const [selectedSources, setSelectedSources] = useState([]);

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

  // useEffect(() => {
  //   refreshData();
  // }, [maxItems]);

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
            .map((item) => <ChatBotBlock item={item} key={item.key} />)
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

export default ChatBotList;
