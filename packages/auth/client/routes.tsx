import Login from "auth/pages/Login";
import Signup from "auth/pages/Signup";

export enum RoutePaths {
  LOGIN = "/login",
  SIGNUP = "/signup",
}
export const authRoutes = [
  { path: RoutePaths.LOGIN.slice(1), element: <Login /> },
  { path: RoutePaths.SIGNUP.slice(1), element: <Signup /> },
];
