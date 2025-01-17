import { API_ENDPOINTS } from "database/config";
import { handleLogin } from "./login";
import { handleSignUp } from "./signup";
import { handleDeleteUser } from "./delete";
import { handleListUsers } from "./listusers";
import { handleGetUser } from "./getUser";

export const authServerRoutes = (req, res) => {
  const { url, method } = req;
  const pathname = url.pathname;

  switch (true) {
    // 认证相关
    case pathname.endsWith("/login") && method === "POST":
      return handleLogin(req, res);
    case pathname.endsWith("/signup") && method === "POST":
      return handleSignUp(req, res);

    // 用户管理
    case pathname === API_ENDPOINTS.USERS && method === "GET":
      // 精确匹配用户列表路由
      return handleListUsers(req);

    case pathname.startsWith(API_ENDPOINTS.USERS) && method === "GET": {
      // 获取单个用户的请求
      const userIdMatch = pathname.match(
        new RegExp(`${API_ENDPOINTS.USERS}/([^/]+)$`)
      );
      if (userIdMatch && userIdMatch[1]) {
        // 确保不会匹配到 users/users 这样的路径
        if (userIdMatch[1] === "users") {
          return new Response("Not Found", { status: 404 });
        }
        return handleGetUser(req, userIdMatch[1]);
      }
      return new Response("Not Found", { status: 404 });
    }

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
