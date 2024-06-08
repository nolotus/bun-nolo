import { format, fromUnixTime } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { truncateContent } from "utils/truncate";
const TokenStatisticsItem = ({ id, content }) => {
  let formattedDate = "";

  if (content.chatCreated) {
    formattedDate = format(
      fromUnixTime(content.chatCreated),
      "yyyy-MM-dd HH:mm:ss",
    );
  }

  return (
    <Link to={`/${id}`} key={id} className="w-full p-2 sm:w-1/2 lg:w-1/3">
      <h3 className="text-md font-semibold text-gray-700">{id}</h3>
      <p className="mt-2 text-sm text-gray-500">
        {content.chatCreated && (
          <>
            chatCreated: {formattedDate}
            <br />
          </>
        )}
        {truncateContent(JSON.stringify(content))}
      </p>
    </Link>
  );
};

export default TokenStatisticsItem;
