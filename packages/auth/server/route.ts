// auth/server/route.ts
import { authRoutes, RouteParams, createPathMatcher } from "../routes";
import { handleLogin } from "./login";
import { handleSignUp } from "./signup";
import { handleDeleteUser } from "./delete";
import { handleListUsers } from "./listusers";
import { handleGetUser } from "./getUser";
import { handleTransferUser } from "./transfer";
import { handleDisableUser } from "./disable"; // 新增导入

const routeHandlers = [
  {
    ...authRoutes.login,
    match: (path: string) => path === authRoutes.login.path,
    handler: (req) => handleLogin(req),
  },
  {
    ...authRoutes.signup,
    match: (path: string) => path === authRoutes.signup.path,
    handler: (req) => handleSignUp(req),
  },
  {
    ...authRoutes.users.list,
    match: (path: string) => path === authRoutes.users.list.path,
    handler: (req) => handleListUsers(req),
  },
  {
    ...authRoutes.users.transfer,
    match: (path: string) => {
      const matcher = createPathMatcher(authRoutes.users.transfer.path);
      const match = path.match(matcher);
      return match ? { userId: match[1] } : false;
    },
    handler: (req, params: RouteParams) =>
      handleTransferUser(req, params.userId!),
  },
  {
    ...authRoutes.users.detail,
    match: (path: string) => {
      const matcher = createPathMatcher(authRoutes.users.detail.path);
      const match = path.match(matcher);
      return match && match[1] !== "users" ? { userId: match[1] } : false;
    },
    handler: (req, params: RouteParams) => handleGetUser(req, params.userId!),
  },
  {
    ...authRoutes.users.delete,
    match: (path: string) => {
      const matcher = createPathMatcher(authRoutes.users.delete.path);
      const match = path.match(matcher);
      return match ? { userId: match[1] } : false;
    },
    handler: (req, params: RouteParams) =>
      handleDeleteUser(req, params.userId!),
  },
  {
    ...authRoutes.users.disable,
    match: (path: string) => {
      const matcher = createPathMatcher(authRoutes.users.disable.path);
      const match = path.match(matcher);
      return match ? { userId: match[1] } : false;
    },
    handler: (req, params: RouteParams) =>
      handleDisableUser(req, params.userId!),
  },
];

export const authServerRoutes = (req: Request) => {
  const { url, method } = req;
  const pathname = new URL(url).pathname; // Corrected URL parsing

  const route = routeHandlers.find((route) => {
    const matchResult = route.match(pathname);
    return matchResult && route.method === method;
  });

  if (route) {
    const params = route.match(pathname);
    return route.handler(req, params);
  }

  return new Response("Not Found", { status: 404 });
};
