import { fetchWithToken } from "app/request";
import { API_ENDPOINTS } from "database/config";
import React, { useState } from "react";
import { getLogger } from "utils/logger";

const writeLogger = getLogger("write");

const ImportSettings = () => {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState([]);
  const [importedItems, setImportedItems] = useState(new Set());
  //todo vs self data
  const fetchData = async () => {
    try {
      const fetchedData = await fetchWithToken(
        `${API_ENDPOINTS.DATABASE}/readAll`,
        {
          method: "POST",
          body: JSON.stringify({ userId }),
        },
      );
      setData(fetchedData);
      writeLogger.info({ fetchedData }, "Fetched data successfully");
    } catch (error) {
      writeLogger.error("Error fetching data:", error);
    }
  };

  const handleImport = async (item, index) => {
    try {
      // const responseData = await importData(item.key, item.value);
      writeLogger.info({ responseData }, "Data imported successfully");
      setImportedItems(new Set([...importedItems, index]));
    } catch (error) {
      writeLogger.error("Error importing data:", error);
    }
  };

  const truncateString = (str, num) =>
    str.length > num ? str.slice(0, num) + "..." : str;

  const renderValue = (value) =>
    typeof value === "object"
      ? JSON.stringify(value)
      : truncateString(value, 30);

  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      <h1 className="mb-4 text-2xl font-semibold">Import Settings</h1>
      <div className="mb-4">
        <label
          htmlFor="userId"
          className="block text-sm font-medium text-gray-600"
        >
          User ID:{" "}
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mt-1 w-full rounded-md border p-2"
        />
      </div>
      <button
        onClick={fetchData}
        className="rounded-md bg-blue-500 p-2 text-white"
      >
        Fetch Data
      </button>
      <ul className="mt-4">
        {data.map((item, index) => (
          <li key={index} className="mb-2">
            {item.key}:
            <span
              title={
                typeof item.value === "object"
                  ? JSON.stringify(item.value)
                  : item.value
              }
            >
              {renderValue(item.value)}
            </span>
            <button
              onClick={() => handleImport(item, index)}
              className="ml-2 rounded-md bg-green-500 p-1 text-white"
            >
              Import
            </button>
            {importedItems.has(index) && (
              <span className="ml-2 text-green-500">Imported</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImportSettings;
