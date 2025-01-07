import { handleLogin } from "./login";
import { handleSignUp } from "./signup";
import { handleDeleteUser } from "./delete";
import { handleListUsers } from "./listusers";

export const authServerRoutes = (req, res) => {
  const { url, method } = req;

  switch (true) {
    // 认证相关
    case url.pathname.endsWith("/login") && method === "POST":
      return handleLogin(req, res);
    case url.pathname.endsWith("/signup") && method === "POST":
      return handleSignUp(req, res);

    // 用户管理
    case url.pathname.endsWith("/users") && method === "GET":
      return handleListUsers(req, res);
    case url.pathname.match(/\/users\/\w+$/) && method === "DELETE":
      return handleDeleteUser(req, res);

    default:
      return new Response("Not Found", { status: 404 });
  }
};
