import { API_ENDPOINTS } from "../config";
import { handleQuery } from "./query";

import { handleWrite } from "./write";
import { handlePatch } from "./patch";

export const databaseRequest = async (req, res, url) => {
  const pathname = url.pathname;
  const getIdFromPath = (prefix) => {
    const start = pathname.indexOf(prefix) + prefix.length;
    const end =
      pathname.indexOf("/", start) !== -1
        ? pathname.indexOf("/", start)
        : undefined;
    return pathname.slice(start, end);
  };
  if (pathname.startsWith(API_ENDPOINTS.DATABASE)) {
    const operation = pathname
      .substr(API_ENDPOINTS.DATABASE.length)
      .split("/")[1];

    switch (operation) {
      case "write":
        return handleWrite(req, res);
      case "patch":
        req.params = { id: getIdFromPath("/api/v1/db/patch/") };
        return handlePatch(req, res);
      case "query":
        req.params = { userId: getIdFromPath("/api/v1/db/query/") };
        return handleQuery(req, res);
      default:
        return new Response("database");
    }
  }
};
