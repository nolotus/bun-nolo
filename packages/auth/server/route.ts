import { handleLogin } from "./login";
import { handleSignUp } from "./signup";
import { handleDeleteUser } from "./delete";
import { handleListUsers } from "./listusers";
import { API_ENDPOINTS } from "database/config";

export const authServerRoutes = (req, res) => {
  const { url, method } = req;
  const pathname = url.pathname;

  console.log({
    level: "debug",
    event: "route_matching",
    pathname,
    method,
    targetPath: API_ENDPOINTS.USERS,
  });

  switch (true) {
    // 认证相关
    case pathname.endsWith("/login") && method === "POST":
      return handleLogin(req, res);
    case pathname.endsWith("/signup") && method === "POST":
      return handleSignUp(req, res);

    // 用户管理
    case pathname.startsWith(API_ENDPOINTS.USERS) && method === "GET":
      return handleListUsers(req);
    case pathname.startsWith(API_ENDPOINTS.USERS) && method === "DELETE":
      return handleDeleteUser(req);

    default:
      console.log({
        level: "warn",
        event: "route_not_found",
        pathname,
        method,
      });
      return new Response("Not Found", { status: 404 });
  }
};
