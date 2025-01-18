import Login from "auth/web/Login";
import Signup from "auth/web/Signup";
import InviteSignup from "./InviteSignup";
import UsersPage from "./UsersPage";

export enum RoutePaths {
  LOGIN = "/login",
  SIGNUP = "/signup",
  INVITE_SIGNUP = "/invite-signup",
}

export const authRoutes = [
  { path: RoutePaths.LOGIN.slice(1), element: <Login /> },
  { path: RoutePaths.SIGNUP.slice(1), element: <Signup /> },
  { path: RoutePaths.INVITE_SIGNUP.slice(1), element: <InviteSignup /> },
];
