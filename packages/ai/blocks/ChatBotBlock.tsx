import { Link } from "react-router-dom";
import { syncDataFromNolotus } from "database/client/sync";
const OMIT_NAME_MAX_LENGTH = 60;

const omitName = (content) => {
  const { name, ...otherProps } = content;
  let jsonString = JSON.stringify(otherProps);
  if (jsonString.length > OMIT_NAME_MAX_LENGTH) {
    jsonString = jsonString.substr(0, OMIT_NAME_MAX_LENGTH) + "...";
  }
  return jsonString;
};
export const ChatBotBlock = (props) => {
  const { refreshData, item } = props;
  const { value, source, key } = item;

  const sync = async () => {
    await syncDataFromNolotus(key, value);
    console.log("Data synced from nolotus successfully");
    refreshData();
  };
  return (
    <div className="flex flex-col bg-white hover:bg-gray-100 rounded-lg shadow p-4 transition-colors duration-200 cursor-pointer">
      <div className="pb-4 flex justify-between items-center">
        <div className="font-bold text-lg">{value.name}</div>
        <div className="text-purple-600 font-medium bg-purple-100 rounded p-1">
          {source}
        </div>
        {source === "nolotus" && (
          <button
            onClick={sync}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Sync from Nolotus
          </button>
        )}
      </div>
      <div className="flex">
        <Link to={`/chat?id=${key}`}>
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
        <p>{omitName(value)}</p>
      </div>
    </div>
  );
};
