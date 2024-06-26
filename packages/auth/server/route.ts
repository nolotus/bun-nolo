import { handleLogin } from "./login";
import { handleSignUp } from "./signup";
import { handleDeleteUser } from "./delete";

export const authServerRoutes = (req, res) => {
  const { url, method } = req;

  switch (true) {
    case url.pathname.endsWith("/login"):
      return handleLogin(req, res);
    case url.pathname.endsWith("/signup"):
      return handleSignUp(req, res);
    case url.pathname.match(/\/users\/delete\/\w+$/) && method === "DELETE":
      // 注意，这里使用match方法和正则表达式来匹配路径，
      // \w+ 用于匹配用户ID，确保只有DELETE方法时才会执行删除操作
      return handleDeleteUser(req, res);
    default:
      return new Response("user");
  }
};
